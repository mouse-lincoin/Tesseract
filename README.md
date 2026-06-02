# Tesseract

> "Noise is the enemy of truth."

研究员的**观察名单**：把公司列入清单，准备好后再**开始深入调查**。

- 产品需求：[PRD.md](./PRD.md)  
- 深入调查设计（Loop / 证据 / 信源库）：[docs/RESEARCH_DESIGN.md](./docs/RESEARCH_DESIGN.md)  
- Agent 约定：[AGENTS.md](./AGENTS.md)

---

## 当前功能

- 加入观察名单（公司名称）
- **开始深入调查** → 状态变为「调查中」
- 公司详情页：占位（待设计）

---

## 本地运行

```bash
cd tesseract
npm install
npm run dev
```

---

## 在线预览

https://mouse-lincoin.github.io/Tesseract/

（`main` 推送后由 GitHub Actions 构建并更新站点）

---

## 仓库结构

```
├── PRD.md
├── README.md
└── tesseract/          # Vue 3 前端
    └── src/
        ├── views/      # 观察名单、公司占位页
        ├── services/   # 名单 CRUD
        └── db/         # IndexedDB
```

---

## 免责声明

本产品不构成投资建议。研究结论由使用者自行负责。
