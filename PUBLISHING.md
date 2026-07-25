# Quartz 发布分类与公开范围

本文件定义哪些工作区内容进入 Quartz 最终产物，哪些只保留在 Git 工作区中。

## 当前发布策略

当前采用三层机制：

1. `explicit-publish`：只有 frontmatter 含 `publish: true` 的 Markdown 页面才生成。
2. `configuration.ignorePatterns`：整类排除内部目录、旧版静态资源和非公开附件；这些文件不参与解析，也不会复制到 `public/`。
3. `remove-draft`：已发布页面可以用 `draft: true` 暂时撤下。

新增 Markdown 默认不公开。只有明确加入 `publish: true` 才进入最终页面；非 Markdown 资源仍由 `ignorePatterns` 控制。

## 文件分类

### A. 公开知识层：生成页面

| 路径 | 公开用途 | 规则 |
|---|---|---|
| `content/index.md` | 研究花园入口 | 公开 |
| `content/MOC/**` | 主题地图和阅读导航 | 公开 |
| `content/cards/**` | 概念、人物、事件、文献、论点和专题卡片 | 公开；单页可用 `draft: true` 暂停 |
| `content/研究笔记/**` | 阅读笔记、研究摘要和比较研究 | 已逐页标记 `publish: true` |
| `content/翻译文本/**` | 连续阅读用译文 | 已逐页标记 `publish: true`；涉及授权或版本问题的文件应改为 `draft: true` |
| `content/revealjs-after-the-machines-plain.md` | v6 幻灯片公开入口 | 公开 |
| `content/砸机器之后_主讲人逐页讲稿_v6.md` | v6 主讲人逐页讲稿 | 公开 |

### B. 工作区内部层：不生成页面

| 路径 | 原因 |
|---|---|
| `content/AGENT_NAVIGATION_INDEX.md` | 面向 Agent 的导航，不是观众页面 |
| `content/讲稿与大纲/**`（除 v6 主讲稿外） | 讲稿、草稿、事实核查、材料地图和交接文档属于生产过程 |
| `content/素材提取文本/**`（未列入公开清单者） | 有翻译、研究笔记或章节摘要等上位替代，或仍属中间文本 |
| `content/assets/**` | 工作区素材库；未确认用途和授权，不直接公开 |
| `content/revealjs-after-machines.md` | 旧版 58 页幻灯片入口，避免与 v6 并列 |
| `content/revealjs-demo.md` | 旧版 AI/卢德主义演示入口 |
| `content/ignored_source/**` | 原始来源存档 |
| `content/tmp/**` | 临时文件 |

公开的最新版讲稿已提升到 `content/砸机器之后_主讲人逐页讲稿_v6.md` 并标记 `publish: true`。素材提取区当前公开 20 份没有现成上位替代的材料；这些文件也逐页标记 `publish: true`，新增材料默认不公开，必须重新判断。

### C. 静态公开层：只保留最终演示及其依赖

保留：

- `quartz/static/revealjs/**`：Reveal.js 运行时；
- `quartz/static/slides/after-the-machines-plain-v6.html`；
- `quartz/static/slides/after-the-machines-plain-v6.md`；
- `quartz/static/slides/assets/after-machines-plain/**`：v6 使用的图片和地图；
- `quartz/static/giscus/**`、站点图标和通用静态资源。

不生成：

- `after-the-machines-plain-v2/v3/v4/v5.*`；
- `after-the-machines-plain.html`、`after-the-machines.html`；
- `luddism-ai.html`、`template.html`；
- `after-the-machines-content.js`；
- `after-the-machines-theme.css`、`luddism-ai-theme.css`；
- `slides/assets/after-machines/**`、`slides/assets/luddism-ai/**` 旧版资源。

这些文件仍可在 Git 历史中保留，但不应出现在部署后的 `public/static/` 中。

### D. 工作区外部文件：不由 Quartz 生成

根目录的 `quartz/**` 源码、`scripts/**`、`docs/**`、`outputs/**`、`*.pptx`、`*.pdf`、`*.txt`、`__pycache__/**`、配置文件和锁文件，不属于 Quartz 的 Markdown 页面或静态公开资源。它们可参与开发、构建和研究，但不会因位于仓库中而自动成为网页。

## 公开范围的维护规则

- 新增研究页面时，先判断它属于公开知识层还是内部生产层。
- 临时不公开的公开层页面使用 `draft: true`，不要把它移动到随机目录。
- 只对已经核实、需要被页面引用的图片开放静态路径；其他附件加入 `ignorePatterns`。
- 页面被过滤并不等于源文件安全。如果仓库本身公开，内部材料仍需在 Git 层面单独处理。
- 每次修改发布规则后，都要检查 `public/` 中的页面数量、静态旧版文件和 `contentIndex.json`、RSS、sitemap 是否符合预期。

## 当前工作区盘点（2026-07-26）

`content/` 当前共有 558 个文件：483 个 Markdown、36 个 PDF、8 个 EPUB、18 个 JPG/JPEG、7 个 JSON、2 个 PNG、1 个 SVG、1 个 DJVU、1 个 TXT。按一级路径归类如下：

| 一级路径 | 文件数 | 当前处理 |
|---|---:|---|
| `cards/` | 116 | 公开 |
| `MOC/` | 4 | 公开 |
| `研究笔记/` | 17 | 公开 |
| `翻译文本/` | 77 | 公开（先核授权） |
| `讲稿与大纲/` | 175 | 内部；v6 主讲稿已移至公开层 |
| `素材提取文本/` | 77 | 20 份公开，其余内部 |
| `ignored_source/` | 58 | 内部，不生成 |
| `assets/` | 24 | 内部，不生成 |
| 根目录页面与配置 | 9 | 按文件名规则处理 |

`quartz/static/` 当前共有 109 个文件；运行时、通用站点资源和 v6 幻灯片依赖保留，旧版幻灯片及其资源按上表排除。

## 预期构建结果

发布规则生效后，Quartz 应当：

- 生成公开知识层页面和 v6 幻灯片入口；
- 不生成讲稿生产区、事实核查区、全文提取区和 Agent 导航页面；
- 不复制旧版幻灯片、旧版主题和未使用的旧版图片目录；
- 保留 v6 运行所需的 Reveal.js、地图、图片和卡片资源。

验证命令：

```powershell
rtk node --max-old-space-size=8192 quartz/bootstrap-cli.mjs build --concurrency=1
```

检查重点：

```powershell
rtk rg --files public | rtk rg "讲稿与大纲|素材提取文本|after-the-machines-plain-v5|luddism-ai|why-did-the-luddites-protest"
rtk rg --files public | rtk rg "after-the-machines-plain-v6|revealjs-after-the-machines-plain|cards|MOC"
```
