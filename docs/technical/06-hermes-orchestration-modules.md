# Hermes Orchestration Modules

## Project

小学生英语口语陪练 Agent（Android MVP）

## 1. Goal

定义 Hermes 在 MVP 中的模块边界与职责，确保：

- 第一版集中在口语陪练主链路
- 多 Agent 思路被保留
- 实现时不过早做重

## 2. MVP Principle

虽然项目长期方向可以扩展为多 Agent 教育系统，但第一版实现应收敛为：

**以口语陪练主链路为核心，在 Hermes 内部做模块化 orchestration，而不是一开始拆成很多独立复杂 agent。**

## 3. Core Hermes Modules

## 3.1 Session Router

职责：
- 接收当前请求类型
- 判断是开始会话、推进回合还是结束会话
- 将请求路由到相应编排模块

输入：
- request type
- session id
- child id
- topic id

输出：
- route decision

## 3.2 Profile Context Loader

职责：
- 读取 child profile
- 读取 growth profile
- 注入当前 level、偏好、近期 focus areas

输入：
- child id

输出：
- normalized child context

## 3.3 Topic Context Loader

职责：
- 读取主题目标、核心句型、提示语和完成信号

输入：
- topic id

输出：
- normalized topic context

## 3.4 Turn Strategy Engine

职责：
- 决定当前轮次要做什么
- 选择追问、支架、示范或纠错
- 控制难度和节奏

输入：
- child context
- topic context
- recent turns
- active session state

输出：
- turn strategy

输出内容示例：
- `reply_mode`
- `correction_enabled`
- `correction_focus`
- `hint_mode`
- `difficulty_step`

## 3.5 Prompt Builder

职责：
- 将教学规则、孩子上下文、主题上下文、当前回合策略拼装成最终模型输入

输入：
- child context
- topic context
- turn strategy
- recent turns

输出：
- model prompt payload

## 3.6 Response Evaluator

职责：
- 对模型输出进行结构化整理
- 检查是否偏离儿童适配规则
- 提取纠错点、结束信号和下一步动作

输入：
- raw model output

输出：
- normalized turn response

## 3.7 Session Wrap-up Engine

职责：
- 在会话结束时生成 summary
- 更新 growth profile
- 触发 training plan refresh

输入：
- session data
- recent turns
- correction summary

输出：
- session summary
- growth updates
- plan trigger payload

## 4. Suggested Internal Logic Split

第一版建议至少拆成以下逻辑文件或模块：

1. `session-router`
2. `profile-context-loader`
3. `topic-context-loader`
4. `turn-strategy-engine`
5. `prompt-builder`
6. `response-evaluator`
7. `session-wrapup-engine`

## 5. What Hermes Should Own

Hermes 应负责：

- 教学编排
- 状态推进
- 记忆注入
- 轻纠错策略
- 会话收束

## 6. What Hermes Should Not Own

Hermes 不应直接负责：

- Android 页面逻辑
- 录音和播放
- 数据库底层连接细节
- 复杂的基础设施部署逻辑

这些应由客户端、backend service 和 infrastructure layer 负责。

## 7. Future Expansion

后续如果扩到更完整教育系统，可在 Hermes 里增加：

- homework coach logic
- assessment logic
- parent report logic
- monthly planner logic

但这些不应阻塞第一版。

## 8. Next Step

下一步建议：

1. 定义 backend service 与 Hermes 的调用边界
2. 定义 start session / turn / finish session 接口
3. 输出 Hermes module skeleton
