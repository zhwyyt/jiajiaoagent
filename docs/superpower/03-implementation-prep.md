# Implementation Prep

## Project

小学生英语口语陪练 Agent（Android MVP）

## 1. Goal

本阶段目标是在正式编码前，把 MVP 开发计划进一步收敛为：

1. 可执行的任务拆解
2. 首版技术栈建议
3. 模块边界与数据结构草案
4. 初始化项目结构建议

本阶段结束标准：
- 开发任务可以按里程碑逐项推进
- Android 客户端技术路线明确
- 语音链路与 Agent 接入思路明确
- 仓库结构可以开始初始化

## 2. Task Breakdown

### Track A: Project Foundation

1. 初始化仓库目录结构
2. 初始化 Android 项目
3. 建立基础文档入口与 README
4. 建立环境配置方案
5. 确认 Hermes、PostgreSQL、Redis 的系统边界

### Track B: Android Client Shell

1. 搭建 Android App 基础工程
2. 建立主导航结构
3. 完成首页基础 UI
4. 完成对话页基础 UI
5. 完成长页基础 UI
6. 完成训练计划页基础 UI

### Track C: Voice Session Loop

1. 接入录音入口
2. 接入语音转文本
3. 接入 Agent 文本回复
4. 接入 TTS 播报
5. 建立单轮会话状态流转
6. 展示基本会话消息流

### Track D: Guided Conversation

1. 设计主题配置结构
2. 实现主题选择或推荐逻辑
3. 实现回合推进逻辑
4. 实现轻纠错策略
5. 实现卡壳提示支架
6. 实现会话结束判断

### Track D2: Hermes Orchestration

1. 定义 Hermes 调度边界
2. 定义会话状态注入结构
3. 定义记忆注入结构
4. 定义训练计划触发时机
5. 定义 MVP 阶段的 agent 逻辑拆分

### Track E: Profile and Planning

1. 设计会话摘要结构
2. 设计成长画像结构
3. 实现基础画像更新逻辑
4. 实现训练计划生成输入结构
5. 实现训练计划输出结构
6. 在客户端展示训练计划与成长状态

### Track F: Trial and Verification

1. 准备试用主题内容
2. 准备测试账号或测试模式
3. 验证主流程稳定性
4. 收集试用反馈
5. 记录下一轮迭代输入

## 3. Recommended Tech Stack

## 3.1 Android Client

建议：
- Kotlin
- Jetpack Compose
- Navigation Compose
- ViewModel
- Kotlin Coroutines

理由：
- 适合快速搭建 Android MVP
- UI 搭建效率高
- 状态管理和页面结构更清晰
- 方便后续迭代和组件复用

## 3.2 Local Storage

建议：
- DataStore 用于轻量设置和偏好
- Room 视需求用于本地会话摘要缓存

第一版建议：
- 能轻则轻
- 如果首版只需轻量缓存，可先用内存状态 + DataStore
- 若要保留最近会话和画像快照，再加 Room

## 3.3 Voice Input / Speech-to-Text

第一版建议路线：

优先采用平台能力或成熟云服务，不要在 MVP 阶段自研语音识别。

可选方向：
- Android 平台语音识别能力
- 云端语音识别服务

选择标准：
- 儿童语音容错
- 英语识别效果
- Android 集成复杂度
- 成本和可试用性

建议策略：
- 第一版先选“最容易打通链路”的方案
- 重点验证孩子是否愿意说、系统是否能大致听懂

## 3.4 Text-to-Speech

建议：
- Android 原生 TTS 作为首版起点

理由：
- 接入快
- 成本低
- 足够支撑 MVP 体验验证

后续若体验不足，再替换更自然的语音服务。

## 3.5 Agent Service

建议：
- 采用独立 Agent 服务层
- 由服务层负责主题编排、回复生成、纠错建议、画像更新和训练计划生成
- Hermes 作为 agent orchestration 层

第一版可以接受：
- 轻量 API 服务
- 单服务承担对外 API 与数据处理
- Hermes 负责内部调度与逻辑编排

## 3.6 Persistence and Coordination

建议：
- PostgreSQL 作为主数据库
- Redis 作为短期状态与协调层

职责建议：
- PostgreSQL：学生档案、主题配置、会话摘要、成长画像、训练计划
- Redis：活跃会话态、临时上下文、短期缓存、幂等与后续可扩展协调能力

## 3.7 Backend Language

建议优先级：

1. 选择团队最熟悉、能最快交付的语言
2. 保证接 AI 能力和数据结构方便
3. 保持首版实现简单

在未限定团队栈的情况下，建议候选：
- Node.js / TypeScript
- Python

如果目标是尽快做出 Agent 编排与接口原型，二者都合适。

## 4. Proposed Repository Structure

建议初始化为：

- `app/` Android 客户端
- `docs/` 文档
- `backend/` Agent 服务
- `assets/` 静态资源
- `scripts/` 开发辅助脚本

后续可按需要补充：
- `tests/`
- `tools/`

## 5. Data Structure Draft

## 5.1 Topic Definition

每个主题至少包含：
- topic id
- title
- target age range
- target level range
- learning goals
- key vocabulary
- key sentence patterns
- starter questions
- follow-up questions
- common mistakes
- completion signals

## 5.2 Session Summary

建议字段：
- session id
- child id
- topic id
- started at
- ended at
- turn count
- child utterance count
- average child response length
- highlighted correction points
- topic completion result
- next practice hints

## 5.3 Growth Profile

建议字段：
- child id
- current speaking level
- recent topic history
- recent strengths
- common mistake patterns
- response length trend
- practice frequency
- current focus areas
- latest generated plan summary

## 5.4 Training Plan

建议字段：
- plan id
- child id
- generated at
- period type
- goals
- focus topics
- focus sentence patterns
- practice suggestions
- encouragement note

## 6. Suggested Development Order

建议先按“能跑通主链路”的优先级推进：

1. Android 工程初始化
2. 基础页面与导航
3. 语音输入和 TTS
4. Agent 基础对话接口
5. 会话消息流
6. 主题对话控制
7. 会话摘要
8. 训练计划展示
9. 画像更新

## 7. Decisions To Make Next

接下来最需要尽快拍板的决定：

1. Android 客户端是否采用 Kotlin + Jetpack Compose
2. 首版 STT 使用平台能力还是云服务
3. 首版 STT 使用平台能力还是云服务
4. 第一批主题是否固定为 8 到 10 个
5. 首版本地存储是否只做轻缓存

## 8. Output of This Stage

本阶段产出：

1. `docs/superpower/03-implementation-prep.md`
2. 更新 `STATUS.md`
3. 更新 `TASKLIST.md`

## 9. Next Step

下一步优先进入：

1. 项目结构初始化
2. Android 技术栈确认
3. Android 基础工程搭建
4. Agent 服务技术路线确认
