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
- `src/data/friends.ts`：友链的名称、简介、网址和可选头像 `image`。
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

- 赛果图编辑器：[独立站点](https://zajuak.github.io/match-editor/)，首页和项目卡片直达；`/tools/match-editor/` 保留跳转。

- 首页、手记列表、文章、项目、友链、404。旧 `/about/` 地址跳转至 `/links/`。
- 建站说明统一显示在每个页面的页脚小字中。
- 文章分类、全文搜索（`⌘ K` / `Ctrl K` / `/`）、阅读时间和文章目录。
- 可持久化的深浅主题、移动导航、阅读进度。
- RSS、Sitemap、Canonical、Open Graph、跳转正文、键盘访问和减少动态效果支持。

## 足球赛果图编辑器

编辑器已独立到 [zajuak/match-editor](https://github.com/zajuak/match-editor)，线上地址是 [zajuak.github.io/match-editor/](https://zajuak.github.io/match-editor/)。功能开发、名单更新、测试与发布均在独立仓库进行。

此仓库只保留首页/项目入口，以及 `src/pages/tools/match-editor.astro` 中的旧地址跳转。新旧页面同属 `https://zajuak.github.io`，继续使用原来的浏览器草稿和历史号码。

本地独立仓库位于 `../match-editor/`，开发与更新名单的方法见该仓库 README。原始 Word 报名表仍留在 `../赛果图编辑器/data/`，不进入公开仓库。

## 设计来源

- 信息结构灵感：[Astro Theme Pure](https://github.com/cworld1/astro-theme-pure)。
- 构建：[Astro](https://astro.build/)。
- 字体：DM Sans 与 Noto Serif SC（Google Fonts，SIL Open Font License）。
- SVG 视觉、页面与样式为本项目独立编写。
