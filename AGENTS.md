# Agent 协作约定（Tesseract）

本文件供 Cursor Cloud Agent 及后续自动化处理时读取。**请优先遵守以下约定。**

## Git / PR

1. **默认直接合并到 `main`**  
   功能或修复在分支上完成、构建通过后，**由 Agent 自行创建 PR 并合并**，无需等待用户手动点合并。

2. **合并方式**  
   - 优先：`gh pr merge <number> --repo mouse-lincoin/Tesseract --squash --admin`  
   - 若 PR 为 Draft：先 `gh pr ready <number> --repo mouse-lincoin/Tesseract`  
   - 若合并冲突：rebase `origin/main` 后 force push，再合并

3. **分支命名**  
   - 格式：`cursor/<简短描述>-a290`  
   - 示例：`cursor/simplify-watchlist-a290`

4. **推送**  
   - `git push -u origin <branch-name>`

5. **部署**  
   - 合并到 `main` 后，`Deploy to GitHub Pages` workflow 会自动跑（改 `tesseract/**` 时）  
   - 无需用户额外操作；若 deploy 失败，Agent 应排查并修 workflow 后再次合并

## 产品范围

- **当前 MVP（已实现）**：观察名单（公司名称）→「开始深入调查」→ 状态中「调查中」；详情页占位  
- **Phase 2（已写 PRD，未实现前勿擅自做全量）**：见 `PRD.md` v0.7 与 **`docs/RESEARCH_DESIGN.md`**（五阶段 Tab + 调研 Loop + 证据卡片 + 信源库）  
- 实现 Phase 2 时按 `RESEARCH_DESIGN.md` 分期（2a→2d），优先证据/引用/信源库，再接入 AI Loop  
- **勿恢复**（除非用户明确要求）：旧版一次性推演、无引用的全自动结论

## 技术栈

- 前端：`tesseract/`（Vue 3 + TS + Vite + Element Plus + IndexedDB）  
- 需求文档：`PRD.md`  
- 在线预览：https://mouse-lincoin.github.io/Tesseract/

## 沟通

- 对用户使用**简体中文**回复。
