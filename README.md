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
- `src/content/notes/*.md`：Markdown 手记。
- `src/styles/global.css`：颜色、排版、响应式样式。
- `src/components/Introduction.astro`：首页自我介绍。
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

1. 点击“导入 / 管理”，选择 Word `.docx`、Excel `.xlsx/.xls`、CSV、TSV，或直接粘贴表格。
2. 推荐表头为 `赛事,球队,姓名`，号码不需要导入。也可只保留“姓名”列，在导入窗口填写赛事与球队。字段顺序可调整，支持“赛事名称、队伍、球员姓名”等别名。Word 只读取表格；旧版 `.doc`、扫描件、图片不支持，复杂的横向合并表格可能需要按模板整理。Excel 可选择工作表。
3. 预览无误后导入。以“赛事＋球队＋姓名”识别同一球员；重复导入不会覆盖本场和历史号码，同队同名球员请在姓名中添加区分。
4. 选择赛事、主队和客队，在“首发与本场号码”逐场填写号码、勾选首发。球员旁显示上一次比赛号码，可点击“沿用”。新比赛本场号码为空，历史参考保留；本场修改不覆盖上次参考。号码为 0–999，同队本场不能重复。首发按勾选顺序展示，开关控制是否出现在赛果图上。
5. 添加事件时直接选择球员身份，改号码后事件与首发仍关联同一人。换人可成对添加；批量输入支持姓名或本场已填写的号码。同一时间的事件可拖动或用 ↑ ↓ 调序。导出前需补齐出现在图上的首发和事件球员号码。
6. 比分根据事件计算；乌龙球选择造成乌龙的球员所属球队，给对方加分。时间 `点` 表示点球大战，比分单列。
7. 导出 PNG（通常为 1600px 宽）或自包含 SVG。特别长的图片会降低 PNG 倍率以适应浏览器限制，可优先使用 SVG。

名单、比赛草稿与历史号码保存在当前浏览器的 localStorage，不上传服务器；换浏览器或清除站点数据后不会自动恢复。名单管理内可导出含号码记录的 JSON 备份并重新导入。历史参考按赛事、球队和球员隔离。旧版草稿会迁移为球员身份关联，保留已有号码、首发和事件。比赛事件与首发草稿尚无跨设备同步。

`public/tools/match-editor/报名表模板.csv` 为无号码列的示例模板，可用 Excel、WPS 打开，替换示例后导入。Word 使用同样的三列表格，或单列“姓名”表格并补充赛事、球队即可。旧模板中的号码列仍可读取，但不会自动作为新比赛号码。

运行 `npm run test:match-editor` 验证无号码名单导入、本场号码校验、上次号码提示、球员关联、旧草稿迁移、备份恢复，以及原有计分和赛果图功能。Actions 在构建前会执行这项检查。

Excel 解析使用本地固定版本 [SheetJS CE 0.20.3](https://docs.sheetjs.com/docs/getting-started/installation/standalone/)，Word ZIP 解压使用 [fflate 0.8.3](https://github.com/101arrowz/fflate)。许可证位于工具的 `vendor/` 目录。赛果事件图标沿用原编辑器本地素材；没有打包旧版页面所附的统计与广告脚本。

## 设计来源

- 信息结构灵感：[Astro Theme Pure](https://github.com/cworld1/astro-theme-pure)。
- 构建：[Astro](https://astro.build/)。
- 字体：DM Sans 与 Noto Serif SC（Google Fonts，SIL Open Font License）。
- SVG 视觉、页面与样式为本项目独立编写。
