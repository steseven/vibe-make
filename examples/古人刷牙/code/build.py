"""《古人怎么刷牙》合成构建（文案.md 26 屏 / plan.json 89.8 秒 / 分镜.md v1，竖屏 1080×1920）
python build.py            -> 全片 index.html（89.8 秒）
python build.py --until N  -> 只到第 N 屏结束（自查用）；渲染完再跑一次默认恢复全片
结构：字幕断言、画面文字集中定义、字体子集化 + 缺字检查。
画面脚本 = lib.js（剪影工具，沿用 11）+ timeline.js（本片通用画法：手、树枝、碗、牙刷、展柜）+ scenes.js（逐屏场景、时间线），拼进同一个 IIFE。
"""
import json, os, re, subprocess, sys

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(HERE, *a)
NS = 26
FONT_SERIF = r"C:\Windows\Fonts\NotoSerifSC-VF.ttf"
FONT_TITLE = r"C:\Windows\Fonts\STXINWEI.TTF"

# ---------- 输入 ----------
PLAN = json.load(open(P("plan.json"), encoding="utf-8"))
SCREENS = PLAN["screens"]
DUR = PLAN["duration"]                                   # 89.8，不改
assert len(SCREENS) == NS and abs(DUR - 89.8) < 1e-6
assert [s["n"] for s in SCREENS] == list(range(1, NS + 1))
assert SCREENS[0]["t"] == 0
for a_, b_ in zip(SCREENS, SCREENS[1:]):                  # 屏与屏首尾相接
    assert abs(a_["t"] + a_["dur"] - b_["t"]) < 0.002, (a_["n"], a_["t"], a_["dur"], b_["t"])
assert abs(SCREENS[-1]["t"] + SCREENS[-1]["dur"] - DUR) < 0.002


def table_rows(path):
    rows = []
    for ln in open(path, encoding="utf-8").read().splitlines():
        m = re.match(r"^\|\s*(\d+)\s*\|(.*)\|\s*$", ln)
        if m: rows.append([m.group(1)] + [c.strip() for c in m.group(2).split("|")])
    return rows


WENAN = {int(r[0]): r[1] for r in table_rows(P("文案.md"))}
assert sorted(WENAN) == list(range(1, NS + 1)), sorted(WENAN)
for s_ in SCREENS:
    assert s_["text"] == WENAN[s_["n"]], (s_["n"], s_["text"], WENAN[s_["n"]])
JB = {int(r[0]): r for r in table_rows(P("脚本.md"))}
assert sorted(JB) == list(range(1, NS + 1))
for n, r in JB.items():                                  # 脚本.md 的字幕栏（去掉加粗）也必须与文案一致；开始/时长与 plan 一致
    assert r[3].replace("**", "") == WENAN[n], (n, r[3])
    assert abs(float(r[1]) - SCREENS[n - 1]["t"]) < 0.006, (n, r[1])
FJ = {int(r[0]): r for r in table_rows(P("分镜.md"))}
FENJING = {n: r[1] for n, r in FJ.items()}
assert sorted(FENJING) == list(range(1, NS + 1)), sorted(FENJING)
for n, cell in FENJING.items():                          # 分镜.md 字幕栏去掉加粗后逐字等于文案.md
    assert cell.replace("**", "") == WENAN[n], (n, cell, WENAN[n])

# ---------- 出处卡片：取 脚本.md "出处卡片"一栏，与 分镜.md、plan.json 的 source 三方一致 ----------
CARD = {n: JB[n][4] for n in JB}
for n in CARD:
    assert CARD[n] == FJ[n][2] == SCREENS[n - 1]["source"], (n, CARD[n], FJ[n][2], SCREENS[n - 1]["source"])
CARD_RUNS = []                                           # 同一张卡片连续几屏只出一次：[首屏, 末屏, 文字]
for n in range(1, NS + 1):
    if not CARD[n]: continue
    if CARD_RUNS and CARD_RUNS[-1][1] == n - 1 and CARD_RUNS[-1][2] == CARD[n]: CARD_RUNS[-1][1] = n
    else: CARD_RUNS.append([n, n, CARD[n]])

# ---------- 画面（canvas）上的文字：全部集中在这里，timeline.js 只按键名取 ----------
TXT = dict(
    title="《古人怎么刷牙》",          # 第 2 屏片名（华文新魏）
    year="1223",                       # 第 10 屏淡金大字
    shop="刷牙铺",                     # 第 14 屏布招
    span="约 400 年",                  # 第 15 屏括号上
    v19="早起不可用刷牙子",            # 第 19 屏竖排古籍字
    v24a="清旦刷牙", v24b="不如夜刷牙",  # 第 24 屏竖排两列（第 26 屏镜中残影用 v24b）
)
ENDTAG = "本视频由 AI 辅助生成"
assert TXT["year"] in WENAN[10] and TXT["shop"] in WENAN[14] and TXT["span"] in WENAN[15]
assert f"“{TXT['v19']}”" == WENAN[19] and f"“{TXT['v24a']}，{TXT['v24b']}”" == WENAN[24]
assert "古人" in WENAN[2] and "刷" in WENAN[2]
ALL_SUB = "".join(WENAN.values())
CARD_TXT = "".join(r[2] for r in CARD_RUNS)
CANVAS_TXT = "".join(TXT.values()) + CARD_TXT
VISIBLE = ALL_SUB + CANVAS_TXT + ENDTAG
# 画面上不出现字幕里没有的数字：画面文字里的数字只允许 1223 和"约 400 年"；出处卡片不写年份
digits_on_canvas = re.findall(r"\d+", CANVAS_TXT + ENDTAG)
assert sorted(digits_on_canvas) == ["1223", "400"], digits_on_canvas
assert sorted(re.findall(r"\d+", ALL_SUB)) == ["1223", "400"]
assert "@" not in VISIBLE
for f in ("timeline.js", "lib.js", "scenes.js", "style.css"):
    src = open(P(f), encoding="utf-8").read().replace("@font-face", "")   # CSS 规则名不算
    assert "@" not in src, (f, "@")

# ---------- 字幕：金色关键词取 分镜.md 的加粗；超过 13 字在最靠中间的标点后断成两行 ----------
MAXCH = 13                                                # 60px 一字，840px 行宽最多 14 字，留一字余量


def sub_lines(cell):
    plain, gold = "", []
    for i, part in enumerate(re.split(r"\*\*", cell)):
        plain += part; gold += [i % 2 == 1] * len(part)
    assert plain == re.sub(r"\*\*", "", cell)
    if len(plain) <= MAXCH:
        cuts = [len(plain)]
    else:
        cand = [i + 1 for i, c in enumerate(plain[:-1]) if c in "，、：；？"]
        cand = [c for c in cand if c <= MAXCH and len(plain) - c <= MAXCH]
        assert cand, ("找不到断行点", plain)
        cut = min(cand, key=lambda c: abs(c - len(plain) / 2))
        cuts = [cut, len(plain)]
    lines, a = [], 0
    for b in cuts:
        seg, html, i = plain[a:b], "", a
        while i < b:
            j = i
            while j < b and gold[j] == gold[i]: j += 1
            html += f'<b class="g">{plain[i:j]}</b>' if gold[i] else plain[i:j]
            i = j
        lines.append((seg, html)); a = b
    assert "".join(s for s, _ in lines) == plain
    return lines


SUBS = {n: sub_lines(FENJING[n]) for n in FENJING}
for n, ls in SUBS.items():
    assert "".join(s for s, _ in ls) == WENAN[n]
    assert len(ls) <= 2 and all(len(s) <= MAXCH for s, _ in ls), (n, ls)


def build(dur, title):
    clips = []
    for s in SCREENS:
        n, t, d = s["n"], s["t"], s["dur"]
        if t >= dur - 0.01: continue
        d = round(min(d, dur - t), 3)
        lines = "".join(f'<div class="ln">{h}</div>' for _, h in SUBS[n])
        clips.append(f'<div class="clip sub" id="s{n}" data-start="{t}" data-duration="{d}" data-track-index="3">'
                     f'<div class="st">{lines}</div></div>')
    data = dict(screens=[dict(n=s["n"], t=s["t"], dur=s["dur"], tx=s["text"]) for s in SCREENS],
                DUR=dur, FULL=DUR, txt=TXT, cards=CARD_RUNS)
    css = open(P("style.css"), encoding="utf-8").read()
    js = "\n".join(open(P(f), encoding="utf-8").read() for f in ("lib.js", "timeline.js", "scenes.js"))
    endtag = f'  <div class="endtag" id="endtag">{ENDTAG}</div>\n' if dur >= DUR - 0.01 else ""
    html = f"""<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>{title}</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>{css}</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-fps="30" data-duration="{dur}">
  <canvas id="stage" width="1080" height="1920"></canvas>
  <audio id="mix" src="audio/mix.m4a" data-start="0" data-duration="{dur}" data-track-index="9" data-volume="1"></audio>
{chr(10).join('  ' + c for c in clips)}
{endtag}</div>
<script>const D = {json.dumps(data, ensure_ascii=False, separators=(",", ":"))};
(function () {{
{js}
}})();</script>
</body></html>"""
    ids = re.findall(r'id="([^"]+)"', html)
    assert len(ids) == len(set(ids)), "duplicate ids"
    # "@" 只允许出现在 CDN 地址（gsap@版本号）和 CSS 的 @font-face 里
    assert "@" not in html.replace("gsap@3.14.2", "").replace("@font-face", ""), "@ in page"
    open(P("index.html"), "w", encoding="utf-8").write(html)
    return html


full = build(DUR, "古人怎么刷牙")
if "--until" in sys.argv:
    n = int(sys.argv[sys.argv.index("--until") + 1])
    build(round(SCREENS[n]["t"], 3) if n < NS else DUR, f"古人怎么刷牙 · 第 1–{n} 屏")

# ---------- 字体子集 + 缺字检查（含“”引号、"蔵"字）----------
os.makedirs(P("assets"), exist_ok=True)
serif_txt = re.sub(r"<[^>]+>", "", full) + ALL_SUB + CANVAS_TXT + ENDTAG
title_txt = TXT["title"]
for src, dst, txt in [(FONT_SERIF, "serif.ttf", serif_txt), (FONT_TITLE, "title.ttf", title_txt)]:
    cf = P("assets", "_chars_" + dst.replace(".ttf", ".txt"))
    open(cf, "w", encoding="utf-8").write("".join(sorted(set(txt))))
    subprocess.run([sys.executable, "-m", "fontTools.subset", src, "--text-file=" + cf, "--output-file=" + P("assets", dst),
                    "--layout-features=*"], check=True)
from fontTools.ttLib import TTFont
need_serif = set(ALL_SUB + CANVAS_TXT + ENDTAG)
assert {"“", "”", "蔵"} <= need_serif
for f, need in [("serif.ttf", need_serif), ("title.ttf", set(title_txt))]:
    cmap = TTFont(P("assets", f)).getBestCmap()
    miss = [c for c in sorted(need) if not c.isspace() and ord(c) not in cmap]
    assert not miss, (f, "".join(miss))
    print(f, "covers all", len(need), "chars")
print("cards", CARD_RUNS)
print("ok", DUR, len(SCREENS), "screens")
