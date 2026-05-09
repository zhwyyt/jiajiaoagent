# Redis Session State Draft

## Project

小学生英语口语陪练 Agent（Android MVP）

## 1. Goal

定义 MVP 阶段 Redis 的职责与 key 设计，用于承载：

- active session context
- short-lived orchestration state
- transient turn progress

Redis 在本项目中不承担长期学习数据存储职责。

## 2. Redis Responsibilities

第一版 Redis 建议承担：

1. 活跃会话状态
2. 当前轮次上下文
3. Hermes 编排过程中的短期记忆
4. 短时缓存
5. 幂等辅助

## 3. Key Naming Convention

建议采用：

`jiajiao:{domain}:{id}`

示例：

- `jiajiao:session:sess_001`
- `jiajiao:session_turn:sess_001`
- `jiajiao:idempotency:req_001`

## 4. Key Drafts

## 4.1 Active Session Context

Key:
- `jiajiao:session:{session_id}`

Type:
- HASH or JSON string

Suggested fields:
- `session_id`
- `child_id`
- `topic_id`
- `current_turn_index`
- `current_state`
- `current_level`
- `last_agent_reply`
- `last_child_text`
- `started_at`

TTL:
- 2 hours

用途：
- 支撑单次会话中的状态推进

## 4.2 Session Turn Buffer

Key:
- `jiajiao:session_turn:{session_id}`

Type:
- LIST or JSON array

Suggested item content:
- speaker
- text
- timestamp

TTL:
- 2 hours

用途：
- 提供最近几轮上下文给 Hermes

## 4.3 Orchestration Context

Key:
- `jiajiao:orchestration:{session_id}`

Type:
- HASH or JSON string

Suggested fields:
- `active_focus_area`
- `recent_correction_focus`
- `hint_mode`
- `fallback_mode`
- `difficulty_step`

TTL:
- 2 hours

用途：
- 支撑会话中的编排决策，不必每轮都回写数据库

## 4.4 Idempotency Guard

Key:
- `jiajiao:idempotency:{request_id}`

Type:
- STRING

Value:
- processed marker or response snapshot id

TTL:
- 10 minutes

用途：
- 防止客户端重试导致重复处理

## 4.5 Short Cache for Topic Payload

Key:
- `jiajiao:topic:{topic_id}`

Type:
- STRING or JSON

TTL:
- 30 minutes to 2 hours

用途：
- 缓存高频 topic 配置，减少数据库读取

## 5. Session State Suggestions

建议 `current_state` 枚举：

- `started`
- `awaiting_child_input`
- `processing_child_input`
- `awaiting_repeat`
- `wrapping_up`
- `completed`

## 6. What Should Not Stay in Redis Only

以下内容不能只存在 Redis：

- child profile
- session summary
- growth profile
- training plan

这些必须最终回写 PostgreSQL。

## 7. MVP Notes

第一版 Redis 不必一开始就承载：

- 复杂队列系统
- 大规模异步任务调度
- 复杂排行榜或统计系统

保持会话态和短期协调职责就够了。

## 8. Next Step

下一步可进一步输出：

1. Redis key access helper design
2. Session lifecycle diagram
3. Backend session manager module draft
