# zajuka · 数字手记

zajuka 的个人网站，使用 Astro + Markdown 构建，面向 GitHub Pages 部署。

设计采用浅蓝背景、深蓝强调色、紧凑的个人档案和分栏内容区。首页版式参考 [Arthals’ ink](https://arthals.ink/)，头像使用本站原创文字标记。内容结构参考 [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure)，未复制其主题源代码或素材。

## 本地运行

需要 Node.js 22.23.4+，推荐 Node.js 24 LTS（`.nvmrc` 已配置）。

```sh
npm ci
npm run dev
```

默认打开 http://localhost:4321 。

```sh
npm run check
npm run build
npm run preview
```

`dist/` 为完整静态产物，无服务器、数据库或密钥依赖。字体文件随站点托管，无需访问 Google Fonts。中文字体包含首版文字的子集；新增字形缺失时会回退到本机系统字体。字体许可证在 `public/fonts/`。

## 修改内容

- `src/data/site.ts`：个人资料、社交链接、项目。
- `src/data/friends.ts`：友链的名称、简介和网址；初始为空。
- `src/data/repositories.ts`：公开 GitHub 仓库快照，保留仓库名、简介、语言和 Fork 标记；不包含私有仓库。
- `src/content/notes/*.md`：Markdown 手记。
- `src/styles/global.css`：颜色、排版、响应式样式。
- `src/components/Introduction.astro`：首页问候语。
- `src/components/Education.astro`：教育经历。
- `src/components/RepositoryList.astro`：首页与项目页共用的公开仓库列表。
- `src/components/GardenArt.astro`、`ProjectArt.astro`：原创 SVG 插画。

新增手记示例：

```yaml
---
title: '文章标题'
description: '文章简介'
date: 2026-10-28
category: '计算机系统'
tags: ['学习笔记']
featured: false
order: 4
---
```

文件名就是文章 URL；`order` 越大排序越靠前。正文使用 Markdown。分类按钮、搜索索引、RSS 和 Sitemap 随构建自动更新。

手记初始为空，仅发布本人提供的文章；项目引用已有公开仓库。

## GitHub Pages

目标仓库：`zajuak/zajuak.github.io`；目标地址：`https://zajuak.github.io/`。

在仓库 Settings → Pages → Build and deployment 中选择 **GitHub Actions**，推送到 `main` 后 `.github/workflows/deploy.yml` 会执行依赖安装、类型检查、静态构建与部署。

如果改用项目仓库，例如 `personal-site`，构建时设置：

```sh
SITE_URL=https://zajuak.github.io BASE_PATH=/personal-site npm run build
```

同时在 Actions 构建步骤中添加对应环境变量，并调整 `public/robots.txt` 中的 Sitemap 地址。若使用自定义域名，更新 `SITE_URL`、robots.txt 和 Pages 的域名设置。

## 功能

- 赛果图编辑器：`/tools/match-editor/`，也可从首页或项目卡片进入。

- 首页、手记列表、文章、项目、友链、404。旧 `/about/` 地址跳转至 `/links/`。
- 建站说明统一显示在每个页面的页脚小字中。
- 文章分类、全文搜索（`⌘ K` / `Ctrl K` / `/`）、阅读时间和文章目录。
- 可持久化的深浅主题、移动导航、阅读进度。
- RSS、Sitemap、Canonical、Open Graph、跳转正文、键盘访问和减少动态效果支持。

## 足球赛果图编辑器

页面源文件是 `src/pages/tools/match-editor.astro`；交互、数据处理与图标在 `public/tools/match-editor/`。均为静态资源，可随现有 GitHub Pages 工作流发布。无需服务器、数据库或外部 CDN。

1. 页面自动加载官方名单。当前 `2026年新生杯男子足球赛` 为 18 支球队、486 名球员；`2026-27北大杯女子足球赛` 为 8 支球队、135 名球员。女足赛事不录入或展示首发阵容，也无需指定首发守门员；从报名名单选择事件球员，在“本场号码”填写参与事件的球员号码，可沿用历史号码。选择赛事后，主客队列表仅显示该赛事球队。
2. 在“首发与本场号码”填写号码、勾选首发，双方各从本队首发中选择一名守门员。赛果图中双方守门员各排在本队首发第一位，姓名显示为“姓名(GK)”，其余球员保留勾选顺序。守门员号码可留空，无号码时号码位置显示 GK；守门员参与事件时同样无需号码。其他球员仍需号码，有号码的守门员仍受同队号码唯一性检查。球员旁显示上一次号码，可点击“沿用”。新比赛需重新指定守门员，本场号码为空，本场修改不会覆盖上次参考。
3. “自定义比赛”支持填写双方队名及首发，每行使用“号码 姓名”或纯姓名。输入球员全部成为首发，应用后才进入事件名单；重新应用会清空当前事件。未应用的修改会阻止添加事件和导出，避免导出旧内容。官方名单加载失败时，自定义比赛仍可保存和导出。
4. 添加事件直接选择球员；换人可成对添加，批量输入支持姓名或本场号码。同一时间的事件可拖动或用 ↑ ↓ 调序。改号码后事件与首发仍关联同一球员。
5. 比分根据事件计算；乌龙球选择造成乌龙的球员所属球队，给对方加分。时间 `点` 表示点球大战，比分单列。
6. 导出 PNG（通常为 1600px 宽）或自包含 SVG，图标题居中显示。导出前必须为双方各指定一名首发守门员，并补齐图中非守门员的号码。自定义比赛先应用首发，再选择守门员。取消守门员的首发资格或清空首发，会同步清除对应守门员选择。特别长的图片会降低 PNG 倍率，可优先使用 SVG。

比赛草稿与历史号码保存在当前浏览器 localStorage，不上传服务器，没有跨设备同步。官方名单以发布的数据为准，旧手工名单不会自动恢复；仍在官方名单中的球员、首发、事件和号码会保留，已经移除的记录会清理。

### 更新官方名单

原始 Word 报名表可能含手机号和备注，不能直接放入公开站点。发布版本只包含球队和球员姓名。使用本地原始报名表生成公开数据：

```sh
python3 scripts/prepare-match-rosters.py ../赛果图编辑器/data/manifest.json public/tools/match-editor/data
```

脚本从每份 DOCX 的“球队：”字段及左右双栏“姓名”列提取数据，检查空名单、重复球队、同名球员和姓名列中的长数字。输出仅有 `team`、`name` 两个字段，原始 DOCX、手机号、球员身份、备注及文档元数据均留在本地。增删报名表时先更新本地 manifest，再重新生成并提交公开 JSON；GitHub Actions 使用已经生成的数据，不需要原始文档。

运行 `npm run test:match-editor` 验证官方名单的完整性、双栏表格解析、自定义首发、本场号码与历史提示、草稿清理，以及计分和赛果图功能。Actions 在构建前会执行检查。球队或人数变动时，需同步更新完整性测试的预期数量。

独立本地版本可用 [fflate 0.8.3](https://github.com/101arrowz/fflate) 解析 DOCX，许可证在工具的 `vendor/` 中；线上版本直接加载精简 JSON。赛果事件图标沿用原编辑器本地素材，没有打包旧版页面所附的统计与广告脚本。

## 设计来源

- 信息结构灵感：[Astro Theme Pure](https://github.com/cworld1/astro-theme-pure)。
- 构建：[Astro](https://astro.build/)。
- 字体：DM Sans 与 Noto Serif SC（Google Fonts，SIL Open Font License）。
- SVG 视觉、页面与样式为本项目独立编写。
