# Tesseract（前端 MVP）

> "Noise is the enemy of truth."

纯前端 C 端工具：推导公司的**关键限制因素**，并基于本地时序数据预测其解决前景。

## 技术栈

- Vue 3 + TypeScript + Vite 8
- Element Plus（深色主题）
- Pinia + Vue Router
- ECharts（`vue-echarts`）
- IndexedDB（`idb` 封装，仓储模式）

## 快速开始

```bash
cd tesseract
npm install
npm run dev
```

浏览器打开开发服务器地址，默认可用示例：**金蝶国际** 或 **0268.HK**。

### 在线预览（GitHub Pages）

推送至 `main` 后由 Actions 自动部署，或于仓库 **Actions → Deploy to GitHub Pages → Run workflow** 手动触发。

预览地址：**https://mouse-lincoin.github.io/Tesseract/**

## 页面

| 路由 | 功能 |
|------|------|
| `/` | 分析：输入公司 → 关键限制因素 + 趋势图 + 预测 |
| `/rules` | 公理库规则管理 |
| `/data` | 公司/指标录入、JSON 导入导出 |

## 脚本

```bash
npm run dev      # 开发
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

## 数据

- 首次启动自动写入 SaaS 规则与金蝶国际 NDR 示例数据（IndexedDB）
- 业务层仅通过 `src/db/repositories` 访问存储，禁止在组件中直接调用 IndexedDB API

完整需求见仓库根目录 [PRD.md](../PRD.md)。
