# vibe-make

一个给 AI 编程助手（Claude Code、Codex 等）用的 skill：从一个题目做出一条"Vibe知识大赏"风格的知识短视频。屏幕字幕 + 代码画的动画 + 配乐，没有旁白，竖屏，70–90 秒，用 HyperFrames 渲染。

它管的是**执行流程**：研究稿 → 文案 → 配乐和时间轴 → 分镜和样帧 → 样片 → 成片 → 封面和发布文案。每一步都停下来等你审，审过才往下走；画面、节奏、结尾这些设计决定，参考一份从 200 多条同类视频里拆出来的规律手册。

完整例子：`examples/古人刷牙/`。题目是"古人怎么刷牙"，89.8 秒，26 屏。从简报、研究稿提示词、文案、脚本、分镜到合成代码、封面都在里面。

## 需要什么

| | 必须 | 说明 |
|---|---|---|
| AI 编程助手 | ✅ | Claude Code、Codex 都行，能读 skill 就行 |
| HyperFrames | ✅ | 画面合成和渲染。装它的 skill：`npx skills add heygen-com/hyperframes`（或按 https://github.com/heygen-com/hyperframes 的说明） |
| Node.js、Python 3.10+、numpy、ffmpeg | ✅ | |
| 配乐 | ✅ | CC BY 或更宽松授权的曲子，比如 Kevin MacLeod（incompetech.com） |

## 安装

把整个 `vibe-make` 文件夹放进 skill 目录：
- Claude Code：`~/.claude/skills/vibe-make/`
- Codex：`~/.codex/skills/vibe-make/`

然后对助手说"用 vibe-make 做一条讲 XX 的知识视频"。

## 保管好 API key

用 DeepSeek 这类第三方模型接 Claude Code 或 Codex 时，key 很容易漏出去：

- **不要把 key 贴进对话**。对话记录会存在本地，助手转述、写进文件、截图时都可能带出来。
- key 放在用户级配置或系统环境变量里（比如 `~/.claude/settings.json` 的 `env`，或 Codex 自己的配置），**不要放进视频项目文件夹**。
- 项目里确实要用 `.env` 时，在项目的 `.claude/settings.json` 里禁止助手读它：

```json
{
  "permissions": {
    "deny": ["Read(./.env)", "Read(./.env.*)"]
  }
}
```

- 发教程截图前，检查终端、配置文件、设置页里有没有露出 key。万一露了，马上去平台作废并换一个新的。

## 里面有什么

```
SKILL.md                    流程本身（助手读这个）
references/方法手册.md        规律和依据：文案、时长画幅、画面、包装、转发，以及被推翻过的结论
references/配乐和节奏.md      选曲、按节拍排时间、响度和音效
references/画面质感.md        成片质感层、材料处理、运镜、开头 0.5 秒；哪些别处的规矩在这个赛道不成立
references/踩坑.md            HyperFrames 渲染、字体、声音、截图的坑，以及看样片时的检查点
references/封面和发布.md
templates/                  简报、研究稿、分镜、合成模板
tools/                      脚本，见 tools/README.md
examples/古人刷牙/           完整示例
```

## 说明

- 规律来自 2026 年 10 月抖音"Vibe知识大赏"话题下的 202 条视频，样本量写在每条后面。规律会变，用了一段时间后，用你自己的数据改写手册。
- 这套流程保证的是**做得完、做得对、少返工**，不保证爆。
- 示例代码里的字体路径是 Windows 的（`C:\Windows\Fonts\`），其他系统改成你自己的字体文件。示例没有附带字体和音频文件。

## 致谢和许可

- `tools/` 里的 `beats.py`、`timing.py`、`cut_music.py`、`music_loops.py`、`qa.py` 来自 [knowledge-video](https://github.com/Win-Hao/knowledge-video)（Copyright (c) 2026 Win-Hao，MIT），`references/` 里标【KV】的条目整理自它的文档（10-12 版）。
- 画面渲染：[HyperFrames](https://github.com/heygen-com/hyperframes)（HeyGen）。
- 画面质感的思路（材料处理、成片质感层、运镜当标点、自动门禁）参考了 [huashu-art-motion](https://github.com/alchaincyf/huashu-art-motion)（alchaincyf，MIT）；`tools/fx/vibe-fx.js` 和 `tools/qa_gate.py` 是重写的，阈值用 Vibe 爆款重新校准过。
- 其余部分的许可见 `LICENSE`。
