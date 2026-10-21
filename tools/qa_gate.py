#!/usr/bin/env python3
"""成片门禁：把明显做坏的片子拦下来（红灯，退出码 1），其余的给黄灯提醒，并和爆款的范围对比。

用法：
  python qa_gate.py final.mp4 [plan.json] [--stage 上,下] [--fps 10] [--strict] [--dump]

qa.py 出拼板给人看；这个脚本负责自动挡住"开头是黑的、中间长时间空着、主体小得看不见"这类问题。
有 plan.json 时按屏报告，没有就按每 3 秒一段。

阈值怎么来的：用《古人怎么刷牙》的三个版本（Opus 做的、DeepSeek 照 Opus 分镜做的、DeepSeek 自己设计的）
和 8 条 5 万–25 万赞的 Vibe 爆款校准。**红灯只放 8 条爆款全部能通过的项目**：
爆款可以很静、很素、主体很小、一片蓝紫，这些都不是红灯。数字见 tools/README.md。

红灯（必须改）
  - 开头是黑的：第 0.5 秒舞台区几乎没有亮的东西。
  - 长时间空画面：片中（去掉首尾各 1 秒）连续 3 秒以上舞台区几乎全黑。爆款最长 2.5 秒（转场黑场）。
  - 主体太小：各屏轮廓外框占舞台的中位数低于 25%。爆款 33%–49%。
黄灯（提醒，自己判断）
  - 开头动得少：前 0.5 秒最大帧差低于 1.0。一半的爆款开头在 4 以上，是一个物件马上动起来。
  - 整片偏素：细节密度（轮廓像素占比）中位低于 0.04。爆款多在 0.08–0.13。
  - 静止屏多：一半以上的屏几乎不动。
  - 单屏问题：几乎不动、主体很小、偏暗的屏，列出来供审片时重点看。

舞台区（字幕区以上那块）：竖屏默认 y 160–1100（按 1920 高），横屏默认 y 0–880（按 1080 高），按实际分辨率换算；
用 --stage 上,下 改，单位是视频本身的像素。需要 ffmpeg、numpy。
"""
import argparse, json, subprocess, sys
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("video"); ap.add_argument("plan", nargs="?")
ap.add_argument("--stage")
ap.add_argument("--fps", type=int, default=10)
ap.add_argument("--strict", action="store_true", help="黄灯也算不合格")
ap.add_argument("--dump", action="store_true", help="打印每屏的原始指标")
a = ap.parse_args()

# ---- 阈值（校准数据见 tools/README.md）----
LUMA_LIT = 40          # 0–255：比这个亮才算"有东西"
EMPTY_LIT = 0.004      # 舞台区亮像素占比低于此 = 这一帧是空的
OPEN_SEC = 0.5
OPEN_EMPTY = 0.02      # 第 0.5 秒亮像素占比低于此 = 开头是黑的。爆款最低 0.061，DS 自己设计 0.000
EMPTY_RED = 3.0        # 秒。爆款最长 2.5，DS 自己设计 8.7
EDGE = 18              # 亮度梯度高于此算"轮廓"
BOX_RED = 0.25         # 主体外框中位。爆款 0.33–0.49，Opus 0.58，DS 自己设计 0.20
OPEN_MOTION = 1.0      # 开头最大帧差。爆款 0.16–47（一半 ≥ 4），Opus 0.90
DETAIL_YELLOW = 0.04   # 细节密度中位。爆款 0.017–0.133（多数 ≥ 0.08），Opus 0.076，DS 自己设计 0.026
STILL_P90 = 0.8        # 一屏里动得最多的 10% 时刻帧差还低于此 = 这一屏几乎不动
STILL_SHARE = 0.5      # 几乎不动的屏占比。爆款 0–0.77，DS 自己设计 0.89
SCREEN_BOX = 0.15      # 单屏主体外框
DARK_MEAN = 12         # 单屏舞台平均亮度

# ---- 读帧：统一缩小到 135×240（竖）或 240×135（横），指标不受分辨率影响 ----
pr = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                     "-of", "csv=p=0", a.video], capture_output=True, text=True, check=True)
W0, H0 = map(int, pr.stdout.strip().split(",")[:2])
w, h = (135, 240) if H0 >= W0 else (240, 135)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", a.video, "-vf", f"fps={a.fps},scale={w}:{h}:flags=area",
                      "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True, check=True).stdout
Yall = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
N = len(Yall); dur = N / a.fps
if a.stage:
    s0, s1 = (int(v) * h / H0 for v in a.stage.split(","))
elif H0 >= W0:
    s0, s1 = 160 / 1920 * h, 1100 / 1920 * h
else:
    s0, s1 = 0, 880 / 1080 * h
Y = Yall[:, int(s0):int(s1)]
lit_share = (Y > LUMA_LIT).mean(axis=(1, 2))
motion = np.r_[0, np.abs(np.diff(Y, axis=0)).mean(axis=(1, 2))]
mean_y = Y.mean(axis=(1, 2))


def edges(i):
    y = Y[i]
    gx = np.abs(np.diff(y, axis=1))[:-1, :]; gy = np.abs(np.diff(y, axis=0))[:, :-1]
    return np.hypot(gx, gy) > EDGE


def box_share(e):
    ys, xs = np.where(e)
    if len(ys) < 5: return 0.0
    y0, y1 = np.percentile(ys, [5, 95]); x0, x1 = np.percentile(xs, [5, 95])   # 去掉零星的浮尘、星星
    return float((y1 - y0) * (x1 - x0) / e.size)


# ---- 按屏 ----
if a.plan:
    segs = []
    for s in json.load(open(a.plan, encoding="utf-8"))["screens"]:
        t0 = s["t"] if "t" in s else s["start"]
        segs.append((s["n"], t0, t0 + s["dur"] if "dur" in s else s["end"], s.get("text", "")))
else:
    segs = [(i + 1, i * 3.0, min(dur, (i + 1) * 3.0), "") for i in range(int(np.ceil(dur / 3.0)))]
rows = []
for n, t0, t1, text in segs:
    i0, i1 = int(t0 * a.fps) + 1, min(N, int(t1 * a.fps))
    if i1 - i0 < 2: continue
    e = edges((i0 + i1) // 2)
    rows.append(dict(n=n, t=t0, text=text[:20], p90=float(np.percentile(motion[i0:i1], 90)),
                     box=box_share(e), detail=float(e.mean()), y=float(mean_y[i0:i1].mean())))

# ---- 整片指标 ----
k = max(1, int(OPEN_SEC * a.fps))
lo, hi = a.fps, N - a.fps
longest, run, run_end = 0, 0, 0
for i in range(lo, hi):
    run = run + 1 if lit_share[i] < EMPTY_LIT else 0
    if run > longest: longest, run_end = run, i
S = dict(open_lit=float(lit_share[min(k, N - 1)]), open_motion=float(motion[1:k + 1].max()),
         longest_empty=longest / a.fps,
         box_median=float(np.median([r["box"] for r in rows])),
         detail_median=float(np.median([r["detail"] for r in rows])),
         still_share=float(np.mean([r["p90"] < STILL_P90 for r in rows])))

red, yellow = [], []
if S["open_lit"] < OPEN_EMPTY:
    red.append(f"开头是黑的：第 {OPEN_SEC} 秒舞台区亮像素只有 {S['open_lit']:.1%}")
if S["longest_empty"] >= EMPTY_RED:
    red.append(f"长时间空画面：{(run_end - longest + 1) / a.fps:.1f}–{(run_end + 1) / a.fps:.1f} 秒舞台区几乎全黑（{S['longest_empty']:.1f} 秒）")
if S["box_median"] < BOX_RED:
    red.append(f"主体太小：轮廓外框中位只占舞台 {S['box_median']:.0%}（爆款 33%–49%）")
if S["open_motion"] < OPEN_MOTION:
    yellow.append(f"开头动得少：前 {OPEN_SEC} 秒最大帧差 {S['open_motion']:.2f}（一半的爆款在 4 以上）")
if S["detail_median"] < DETAIL_YELLOW:
    yellow.append(f"整片偏素：细节密度中位 {S['detail_median']:.3f}（爆款多在 0.08 以上）")
if S["still_share"] > STILL_SHARE:
    yellow.append(f"静止屏多：{S['still_share']:.0%} 的屏几乎不动")
bad_screens = []
for r in rows:
    why = [x for x, c in (("几乎不动", r["p90"] < STILL_P90), ("主体很小", r["box"] < SCREEN_BOX), ("偏暗", r["y"] < DARK_MEAN)) if c]
    if why: bad_screens.append(f"第 {r['n']} 屏（{r['t']:.1f}s）{'、'.join(why)}  {r['text']}")

if a.dump:
    print("  屏   开始   帧差p90  主体外框  细节密度  平均亮度")
    for r in rows:
        print(f"  {r['n']:>2} {r['t']:7.2f}   {r['p90']:6.2f}   {r['box']:6.0%}    {r['detail']:6.3f}   {r['y']:6.1f}   {r['text']}")
print(f"== {a.video}（{W0}×{H0}，{dur:.1f} 秒，{len(rows)} 屏）")
print(f"  开头亮像素 {S['open_lit']:.1%}  开头帧差 {S['open_motion']:.2f}  最长空画面 {S['longest_empty']:.1f}s  "
      f"主体外框中位 {S['box_median']:.0%}  细节密度中位 {S['detail_median']:.3f}  静止屏 {S['still_share']:.0%}")
for x in red: print("  红灯 " + x)
for x in yellow: print("  黄灯 " + x)
if bad_screens:
    print(f"  审片时重点看这 {len(bad_screens)} 屏：")
    for x in bad_screens[:15]: print("    " + x)
    if len(bad_screens) > 15: print(f"    ……另外 {len(bad_screens) - 15} 屏")
bad = bool(red) or (a.strict and bool(yellow))
print(f"  结果：{'不合格' if bad else '通过'}（红灯 {len(red)}，黄灯 {len(yellow)}）")
sys.exit(1 if bad else 0)
