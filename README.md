# Tesseract

> "Cut the noise. Find the bottleneck. Verify the truth."
> 剔除噪音，寻找瓶颈，验证真相。

Tesseract 是一个极简主义的商业分析验证引擎。它抛弃了传统大而全的多维财务打分模型，转而基于**第一性原理**运作。它认为：每个商业模式都有且仅有一个**“关键限制因素（生死线）”**。Tesseract 的目标是锁定这个限制，并通过数据狙击，反复验证目标公司是否突破了该限制。

## 🧠 The Core Philosophy (核心哲学)

传统金融工具给你 100 个指标让你迷失。Tesseract 只问三个问题：
1. **The Limit:** 这个行业的物理极限/生死劫是什么？
2. **The Proxy:** 哪些数据/替代指标能证明这个极限？
3. **The Verdict:** 这家公司突破限制了吗？

## 🏗️ Architecture (极简架构)

系统仅由三个极简微服务组成：

- `Axiom_RuleBase/` (公理库)：存储不同商业模式的“限制字典”。(例如：SaaS -> NDR留存；制造业 -> 核心良率/毛利剪刀差)。
- `Data_Sniper/` (数据狙击手)：根据公理库下发的任务，精准抓取目标公司对应的财报片段、招股书特定字段或全网代理指标。**绝不抓取多余数据**。
- `Verification_Core/` (验证内核)：处理时序数据，跑出趋势线，判断是否完成“破壁 (Wall-Breaking)”。

## 🚀 Quick Start (快速开始)
