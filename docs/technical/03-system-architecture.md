# System Architecture

## Project

小学生英语口语陪练 Agent（QQBot / Android 原型 / Hermes V1）

## 1. Architecture Direction

当前项目正式切换到：

**LLM 主回复 + Hermes 治理层 + 教学规划层 + 持续画像与训练记录**

这意味着：

- 大模型负责每一轮“怎么说”
- Hermes / backend 负责“该不该这样说”
- 教学规划层负责“接下来一段时间该练什么”
- PostgreSQL 负责长期记忆
- Redis 负责短期会话态
- 客户端 / QQBot 负责交互入口和语音体验

本项目不再继续沿“规则主导回复、模型只做少量补充”的方向扩展。

## 2. Core Architecture Principle

### 2.1 What LLM Should Own

LLM 应负责：

- 理解孩子当前这句话真正想表达什么
- 生成自然、像人、符合孩子年龄段的回复
- 接住情绪、卡壳、紧张、尴尬、好奇、闲聊
- 支持中英混输理解
- 在正常聊天里柔和地引导到练习主题

### 2.2 What Hermes / Rules Should Own

Hermes 和规则层应负责：

- quick intent 与命令类处理
- 会话生命周期控制
- session reset / restart
- 画像更新
- 训练重点注入
- 输出风格边界
- 安全与儿童适配边界
- 训练计划和总结触发

### 2.3 What Education Planning Should Own

教育规划层应负责：

- 周目标 / 月目标定义
- 当前阶段最该优先解决的问题排序
- topic、句型、表达能力的训练优先级
- 哪些错误先放过，哪些错误要反复打
- 训练强度、纠错强度、推进节奏
- 阶段性进步评估

一句话说：

**LLM 决定这一句怎么说，规划层决定这一阶段该练什么。**

一句话说：

**LLM 是对话大脑，Hermes 是编排、记忆和护栏。**

## 3. High-Level Components

### Client / Transport Layer

当前包括：

- QQBot / NapCat 主试用入口
- Android 原型入口（保留）

负责：

- 文本和语音收发
- STT / TTS 接入
- 消息展示与播放
- 基础交互控件

### Backend API / Bridge Layer

负责：

- 对外 HTTP / bridge 入口
- sender 级 session 维护
- 命令识别（如语速、重新开始聊天）
- 调用 Hermes orchestration
- 调用 LLM
- 返回最终可发送结果

### Hermes Governance Layer

负责：

- route / session 决策
- child profile 注入
- topic context 注入
- correction / difficulty / pacing 策略
- wrap-up 与 plan trigger

Hermes 不再作为“主要嘴替”，而是作为：

- conversation governance
- memory coordination
- learning-state control

### Education Planning Layer

负责：

- 根据近期 session summary 和 issue tags 生成训练重点
- 维护周度 / 月度 focus areas
- 决定下一阶段优先练哪些 topic、句型、表达动作
- 决定当前孩子更需要自由开口、复说强化，还是轻纠错提升
- 给 Hermes 提供可执行的 teaching focus

它不是前台聊天者，而是后台的“小型教学大脑”。

### LLM Reply Layer

负责：

- 生成主回复
- 在上下文中自然接话
- 根据策略做轻引导
- 尽量避免脚本味、考试味和模板味

### Memory Layer

#### PostgreSQL

负责长期数据：

- child profile
- topic definitions
- session summaries
- growth profile snapshots
- training plans
- issue history / speaking bottlenecks

#### Redis

负责短期状态：

- active session context
- current turn counters
- temporary orchestration state
- current difficulty / pacing state
- transient restart / wrap-up control

## 4. Educational Time Scales

这个项目不能只按“每句怎么回”来设计，而应同时覆盖三个时间尺度：

### 4.1 Turn-Level Conversation

负责：

- 这一句怎么接
- 是否先共情
- 是否轻纠错
- 是否追问

### 4.2 Session-Level Teaching

负责：

- 这一整次对话主要练什么
- 这次应该偏自然聊天还是偏结构化引导
- 本次最值得重复强化的句型或表达动作是什么

### 4.3 Week / Month-Level Planning

负责：

- 这一阶段孩子最该提升什么
- 当前优先解决“不开口”“句子太短”“不会展开”“依赖中文桥接”中的哪一个
- 下一周或本月应多出现哪些话题和表达模式

## 5. Conversation Request Flow

### Turn Flow

1. QQ / Android 把新消息发到 backend bridge
2. bridge 识别命令类输入（如 `重新开始聊天`、语速切换）
3. backend 读取 Redis 会话态
4. backend 读取 PostgreSQL 中的画像和主题上下文
5. backend 读取当前阶段 teaching focus / active plan
6. Hermes 决定当前回合治理策略
7. backend 调用 LLM 生成主回复
8. Hermes / backend 对回复做边界控制与必要后处理
9. backend 返回文本、语音和日志信息
10. 必要时更新画像、session summary、训练建议

## 6. Planning Flow

### Planning Flow

1. session 结束或达到阶段触发条件
2. system 生成或更新 session summary
3. memory layer 抽取 issue tags、strengths、bottlenecks
4. planner 生成当前周度 / 月度 focus
5. planner 输出 teaching priorities 给后续 session 使用
6. Hermes 在后续回合中注入这些 focus，但不把对话变成生硬脚本

## 7. Rule Boundary

规则层继续保留，但只保留以下几类：

1. `Command rules`
   - 重新开始聊天
   - 语速切换
   - 只说英文 / 中文解释（后续可加）

2. `Safety rules`
   - 儿童内容边界
   - 明显不合适内容兜底

3. `Session rules`
   - 会话重置
   - wrap-up 触发
   - turn count / session age

4. `Memory rules`
   - 焦虑、卡壳、开不了口等标签记录
   - 训练重点和常见问题更新

5. `Output constraints`
   - 回复不宜过长
   - 一次最多一个简单追问
   - 不要太像考试

项目不再继续扩展大量“如果用户说 A，就固定回复 B”的主回复模板。

## 8. Why This Direction Fits the Product

这是一个儿童长期英语陪练产品，不是流程机器人。

这个场景最重要的是：

- 自然接话
- 真实理解
- 情绪承接
- 长期个性化
- 柔和引导

这些能力主要依赖 LLM；而跨会话连续性、训练结构化和阶段性教学规划，则更适合由 Hermes、规划层和数据层承担。

## 9. Near-Term Non-Goals

当前仍不追求：

- 微服务拆分
- 复杂多 agent 互相博弈
- 复杂事件总线
- 高并发优化
- 过重的规则系统

优先级仍然是：

- 主回复自然
- 语音体验稳定
- 画像记录有效
- 教学规划可落地
- 孩子真实试用不出戏

## 10. Next Architecture Step

下一阶段建议围绕以下内容展开：

1. 明确 LLM prompt contract
2. 明确 Hermes 策略输入输出边界
3. 设计 child profile / issue memory 更新规则
4. 设计教育规划层的输入输出
5. 设计 wrap-up / weekly focus / monthly plan 的协同方式
