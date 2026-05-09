# System Architecture

## Project

小学生英语口语陪练 Agent（Android MVP）

## 1. Architecture Goal

在保持第一版实现可控的前提下，采用适合后续扩展的架构：

- 前端专注孩子端体验
- 后端专注业务接口
- Hermes 专注 agent orchestration
- PostgreSQL 负责长期学习数据
- Redis 负责短期会话态与协调

第一版重点仍然是本项目当前定义的 Android 口语陪练 MVP，而不是一次性把全部教育能力做全。

## 2. High-Level Components

### Android App

负责：
- 首页、对话页、成长页、训练计划页
- 录音、语音播放
- 首版 STT / TTS provider 封装
- 会话消息展示
- 训练计划与成长结果展示

## Voice IO Decision

MVP 语音方案定为：

- STT: Android `SpeechRecognizer`
  - 优先 on-device
  - 无 on-device 时回退系统默认 recognizer
- TTS: Android `TextToSpeech`
  - 优先英语 voice / locale
  - 失败时回退到可用英文配置

原因：
- 第一版先验证孩子是否愿意持续口语对话
- 避免过早引入云端语音服务、音频上传链路和额外成本
- 保持 Android 端可以独立完成语音输入输出闭环

### Backend API Service

负责：
- 对外提供 HTTP API
- 校验请求
- 组织 Hermes 调用
- 读取和写入 PostgreSQL / Redis
- 返回客户端可消费的数据结构

### Hermes Orchestration Layer

负责：
- 会话路由
- 教学状态控制
- 记忆注入
- 主题与难度控制
- 轻纠错策略执行
- 会话结束后的摘要与训练计划触发

### PostgreSQL

负责持久化：
- child profile
- topic definitions
- session summaries
- growth profile snapshots
- training plans

### Redis

负责短期状态：
- active session context
- transient turn state
- short-lived orchestration memory
- retry / idempotency assistance
- optional queue or async coordination in later phases

## 3. Hermes Role in MVP

虽然上午的讨论里提过多 Agent 结构，但当前项目第一版应收敛为“主链路优先”。

第一版建议 Hermes 主要承载以下逻辑：

1. `Conversation flow`
   - 主题进入
   - 回合推进
   - 追问选择
   - 会话收束

2. `Memory injection`
   - 注入孩子当前 level
   - 注入最近常错点
   - 注入当前训练重点

3. `Correction strategy`
   - 控制每轮是否纠错
   - 只突出 1 个重点
   - 决定是否改为提示支架

4. `Session wrap-up`
   - 生成 session summary
   - 更新 growth profile
   - 触发 training plan refresh

## 4. Agent Boundary for MVP

第一版不建议过早把所有能力拆成很多独立可部署 Agent。

建议先在 Hermes 内部按逻辑模块划分：

- `conversation agent logic`
- `memory agent logic`
- `planner agent logic`

暂不把以下能力做成 MVP 主链路：
- homework agent
- assessment agent
- parent report agent

它们可以作为后续扩展目标保留，但不应分散第一版实现重点。

## 5. Request Flow

### Conversation Turn Flow

1. Android 发送会话轮次请求到 backend
2. backend 从 Redis 读取 active session context
3. backend 读取 PostgreSQL 中的 child profile / topic config
4. backend 调用 Hermes orchestration
5. Hermes 生成回复策略、纠错策略和下一步动作
6. backend 将 turn result 返回 Android
7. 会话结束时写入 session summary，并更新 profile / plan

## 6. Data Ownership

### Durable Data in PostgreSQL

- child profile
- topic configuration
- session summaries
- growth profile snapshots
- generated training plans

### Ephemeral Data in Redis

- active session
- current turn counters
- temporary orchestration context
- partial turn memory

### Local Android State

- UI state
- recent display cache
- local settings
- optional lightweight progress cache

## 7. Why Database and Redis Matter Now

即使第一版目标是快速验证，也不建议把这些完全留空。

原因：
- 孩子端学习需要跨会话连续性
- 画像和训练计划依赖历史数据
- Hermes orchestration 需要短期 session state
- 后续语音、作业、周报能力都会建立在现有数据模型上

所以在 implementation 初期就先定：
- PostgreSQL 做长期数据
- Redis 做短期状态

这样实现时不会来回改边界。

## 8. MVP Non-Goals at Architecture Level

第一版暂不追求：
- 微服务拆分
- 复杂事件总线
- 复杂权限系统
- 多租户
- 高并发优化

优先级仍然是：
- 快速开发
- 主链路稳定
- 孩子试用反馈有效

## 9. Next Architecture Step

下一步建议补两类内容：

1. PostgreSQL schema draft
2. Hermes orchestration module draft
