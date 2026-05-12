# Implementation Prep

## Project

小学生英语口语陪练 Agent（QQBot 主试用链路 + Android 原型保留）

## 1. Goal

本阶段目标是在正式持续实现前，把项目从“能跑通”收敛为“知道接下来该怎么稳定推进”。

当前 implementation-prep 的正式基线为：

1. 明确当前主试用入口
2. 明确 LLM、Hermes、数据层的职责边界
3. 明确接下来应优先实现的治理、记忆与试用闭环
4. 保证仓库内的计划和真实实现一致

本阶段结束标准：

- 主路径不再模糊
- 架构职责边界明确
- 下一阶段任务可以按模块逐步落地
- 重要决策已写入仓库文件，而不是只留在聊天里

## 2. Current Mainline

当前首版正式主路径为：

`QQBot + NapCat + jiajiaoagent backend bridge + Hermes governance + LLM reply`

说明：

- QQBot 是当前最低摩擦试用入口
- Android 原型仍保留，作为后续独立 App 方向的资产
- 微信 bot 路线保留为历史探索记录，不是当前主线

## 3. Architecture Baseline

当前项目正式按以下原则推进：

### 3.1 LLM Owns The Main Reply

LLM 应负责：

- 理解孩子真实意思
- 自然接话
- 接住情绪和卡壳
- 支持中英混输
- 在真实聊天里柔和引导表达训练

### 3.2 Hermes Owns Governance

Hermes / backend 应负责：

- quick intent
- command parsing
- session lifecycle
- restart / reset
- memory tagging
- profile injection
- topic soft guidance
- wrap-up gating
- output constraints

### 3.3 Data Layer Owns Continuity

- PostgreSQL：长期画像、训练记录、问题标签、训练计划
- Redis：短期会话态、当前策略态、turn 级上下文

## 4. Updated Task Breakdown

### Track A: Runtime Mainline Stability

1. 固化 QQBot 主试用链路
2. 保持可重启、可观察、可定位问题
3. 继续验证语音输入输出体验
4. 保留 Android 原型资产和暂停点说明

### Track B: LLM Conversation Quality

1. 定义 LLM prompt contract
2. 优化 system prompt 与 user prompt 结构
3. 保证前几轮先自然聊天
4. 控制回复长度、追问密度和儿童口语感
5. 支持中英混杂输入后的自然承接

### Track C: Hermes Governance Layer

1. 固化 quick intent 边界
2. 固化 command 解析边界
3. 设计 turn strategy 的最小治理输入输出
4. 设计 wrap-up 允许 / 禁止条件
5. 设计 restart 后新会话的最小状态清理

### Track D: Memory And Learning Signals

1. 定义 child profile 可持续字段
2. 定义 issue tags
3. 定义每轮对话的 memory extraction 规则
4. 定义 session summary 何时生成
5. 定义训练重点如何回注入后续回合

### Track E: Trial Loop

1. 准备真实试用脚本
2. 记录孩子是否愿意持续开口
3. 记录哪些回复让人出戏
4. 记录哪些追问能引出更多表达
5. 用试用结果反推 prompt / governance 调整

## 5. Recommended Technical Focus

## 5.1 Conversation Runtime

建议继续保持：

- Node.js / TypeScript backend
- QQBot / NapCat 作为当前 transport mainline
- OpenAI-compatible LLM 接口

理由：

- 当前已经跑通
- 修改成本低
- 最适合继续验证对话质量本身

## 5.2 Hermes Role

Hermes 当前不再继续扩展为“主回复模板引擎”。

建议重点投入在：

- session routing
- strategy injection
- memory coordination
- wrap-up / summary trigger
- observability

## 5.3 Android Role

Android 当前作为：

- 已验证过的产品原型
- 后续专属 App 的设计和交互资产
- 不阻塞当前试用主线

所以本阶段不建议再把主要精力放回 Android 基础链路问题上。

## 6. Suggested Repository Focus

当前建议重点维护：

- `backend/` 当前主逻辑
- `docs/technical/` 架构与实现边界
- `docs/superpower/` 工作流状态与阶段产物
- `STATUS.md`
- `TASKLIST.md`

Android 工程继续保留，但暂不作为当前第一优先级。

## 7. Data Structure Prep Focus

本阶段最值得尽快定下来的，不是再加 transport，而是以下结构：

### 7.1 Memory Tag

建议至少支持：

- afraid_to_speak
- shy_in_class
- needs_cn_bridge
- output_block_after_vocab
- prefers_free_chat
- favorite_topics

### 7.2 Session Summary

建议至少记录：

- session id
- child id / sender id
- main emotional state
- main speaking bottleneck
- useful successful prompt
- whether child expanded naturally
- next practice hint

### 7.3 Prompt Contract

建议明确：

- system prompt 固定职责
- strategy 注入字段
- topic soft-guide 注入字段
- memory summary 注入字段
- output JSON contract

## 8. Suggested Development Order

建议按以下顺序推进：

1. 固化 LLM prompt contract
2. 固化 Hermes rule boundary
3. 增加 memory update engine
4. 增加 session summary / issue tagging
5. 做真实儿童试用并记录反馈
6. 再根据结果决定是否回头加强 Android 主入口

## 9. Decisions To Make Next

接下来最值得单独讨论并拍板的决定：

1. quick intent 该保留到什么范围
2. wrap-up 什么时候允许触发
3. memory tag 的首版字段集合
4. monthly training plan 在首版里做到什么深度
5. 家长可见输出是否先只做简版摘要

## 10. Output Of This Stage

本阶段产出应包括：

1. 更新 `docs/superpower/03-implementation-prep.md`
2. 更新 `docs/superpower/00-workflow-status.md`
3. 更新 `STATUS.md`
4. 更新 `TASKLIST.md`
5. 与技术架构文档保持一致

## 11. Next Step

下一步建议进入：

1. LLM prompt contract planning
2. Hermes governance boundary planning
3. memory update engine planning
4. child trial feedback loop planning
