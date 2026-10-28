# JUN KAI · 数字手记

赵俊凯的个人网站，使用 Astro + Markdown 构建，面向 GitHub Pages 部署。

设计采用浅蓝背景、深蓝强调色、衬线标题和原创程序化 SVG 插画。内容结构参考 [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure)，未复制其主题源代码或素材。

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

- 首页、手记列表、文章、项目、友链、404。旧 `/about/` 地址跳转至 `/links/`。
- 建站说明统一显示在每个页面的页脚小字中。
- 文章分类、全文搜索（`⌘ K` / `Ctrl K` / `/`）、阅读时间和文章目录。
- 可持久化的深浅主题、移动导航、阅读进度。
- RSS、Sitemap、Canonical、Open Graph、跳转正文、键盘访问和减少动态效果支持。

## 设计来源

- 信息结构灵感：[Astro Theme Pure](https://github.com/cworld1/astro-theme-pure)。
- 构建：[Astro](https://astro.build/)。
- 字体：DM Sans 与 Noto Serif SC（Google Fonts，SIL Open Font License）。
- SVG 视觉、页面与样式为本项目独立编写。
