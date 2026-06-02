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

1. **Settings → Pages：** Source = **Deploy from a branch** → **main** → **/ (root)**  
2. 推送 `tesseract/` 源码变更后 Actions 会构建并把产物提交到 **main 根目录**（`index.html`、`assets/` 等）。

预览地址：**https://mouse-lincoin.github.io/Tesseract/**

## 页面

| 路由 | 功能 |
|------|------|
| `/` | **观察名单**：列入标的，进入分阶段研究 |
| `/research/:id` | **研究工作区**：六阶段 + 人机讨论 + 本质总结 |
| `/rules` | 公理库规则管理 |
| `/data` | 指标录入、AI 配置、JSON 导入导出 |

研究流程：列入观察 → 业务厘清 → 提出假设 → 核对证据 → 人机讨论 → 本质总结。AI 在「数据」页配置（OpenAI 兼容 API），讨论时**不讨好、不编造数据**。

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
