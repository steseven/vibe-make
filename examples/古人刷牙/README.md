# 示例：《古人怎么刷牙》

竖屏 1080×1920，89.8 秒，26 屏，配乐 Kevin MacLeod "Eastern Thought"（CC BY 4.0）。成片样子见 `成片拼板_1.jpg`、`成片拼板_2.jpg`（每屏中间一帧），封面见 `封面.jpg`。

注：这条每屏的时间是做的时候另外定的，没有用 `timing.py` 排，所以没附 `beats.json`。新片按 `references/配乐和节奏.md` 排。

按流程对照：

| 步骤 | 文件 |
|---|---|
| 0. 立项 | `prompts/brief.md` |
| 1. 研究稿 | `prompts/research.md`（研究稿本身 article.md 没有附，太长） |
| 2. 文案 | `文案_v1.md`（交审版，末尾有自检和改动记录）→ `文案.md`（定稿，排时间用） |
| 3. 配乐和脚本 | `脚本.md`，`credits.md` 里写了配乐的处理参数 |
| 4. 分镜 | `分镜.md`：设计原则、竖屏版面、固定元素、逐屏画面 |
| 5–6. 合成 | `prompts/composition.md`，合成代码在 `code/` |
| 7. 封面和发布 | `code/cover/`、`发布文案.md` |

## code/ 怎么用

这是成片用的 HyperFrames 工程，**当先例参考**，让合成子任务照它的结构做新片：

- `build.py`：读 plan.json、文案.md、脚本.md、分镜.md，逐字断言字幕一致、检查画面上的数字、字体子集化和缺字检查，拼出 `index.html`。
- `lib.js`：剪影工具（带锥度的四肢、两段 IK、贝塞尔躯干、手）。新片可以直接搬。
- `timeline.js`：本片通用画法（手、树枝、碗、牙刷、展柜）。
- `scenes.js`：逐屏场景和时间线。
- `style.css`、`hyperframes.json`、`package.json`：版面和渲染命令。

没有附带字体（`assets/`）和配乐，所以不能直接渲染。字体路径是 Windows 的（`C:\Windows\Fonts\NotoSerifSC-VF.ttf`、`STXINWEI.TTF`），换成你自己的字体文件；片名字体建议换成 OFL 授权的书法字体（比如 Ma Shan Zheng）。

## 这条做下来的教训

- 审片时退回改了两处：手画得像手套或木板；竖排古籍字在换屏时留下残影。
- 还剩的小问题：第 4 屏树冠边缘偏硬，第 8 屏袖子偏粗。
