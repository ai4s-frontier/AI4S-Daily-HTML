# AI4S-Daily-HTML

AI4S 每日/每周研判报告的公开网页版 —— 纯静态站点，托管于 GitHub Pages。

数据为 `public/reports/` 下的报告 Markdown 文件（`push-*.md`），前端在浏览器中直接解析渲染，无需后端。

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build    # 自动生成 reports/index.json 并打包到 dist/
npm run preview  # 本地预览构建产物
```

## 更新报告内容

1. 将新的 `push-*.md` 报告文件放入 `public/reports/`（或从主项目同步：`npm run sync`，默认从 `../news-data/` 复制）
2. `npm run build`（prebuild 钩子会自动重建 `reports/index.json`）
3. 提交并推送，GitHub Actions 自动部署到 Pages

## 与完整版的差异

公开版仅保留栏目流、日报/周报归档与报告详情；完整版中的「当前工作维护」与「设置」栏目（依赖后端写操作）在本版本中不存在。报告内容与完整版完全一致。
