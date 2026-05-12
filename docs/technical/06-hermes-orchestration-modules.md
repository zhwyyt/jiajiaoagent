# Hermes Orchestration Modules

## Project

小学生英语口语陪练 Agent（LLM-first 对话架构 + 教学规划层）

## 1. Goal

重新定义 Hermes 在项目中的职责边界：

- Hermes 负责治理，不负责大部分具体话术
- LLM 负责主回复
- Hermes 负责记忆、策略、状态和护栏
- 教学规划层负责周度 / 月度训练目标与阶段评估

## 2. Guiding Principle

新的原则是：

**Hermes decides the conversation policy. LLM writes the actual reply.**

在更完整的教育视角下，还要再补一句：

**Planning decides the learning direction.**

也就是：

- Hermes 决定当前回合该温柔一点、难一点、要不要纠错、要不要引导
- LLM 决定这一轮自然地怎么说出来

## 3. Core Hermes Modules

### 3.1 Session Router

职责：

- 判断当前是新会话、普通回合、命令回合还是收尾回合
- 识别 sender 级重置、restart 等会话控制信号

输入：

- sender id
- request type
- current session state

输出：

- route decision

### 3.2 Profile Context Loader

职责：

- 读取 child profile
- 读取常见问题、表达卡点、近期 focus areas
- 生成可注入给 LLM 的精简画像摘要

输出：

- normalized child context
- llm-ready memory summary

### 3.3 Topic Context Loader

职责：

- 提供“软主题”而不是硬脚本
- 维护 topic goal、follow-up examples、可选引导方向

重点：

主题上下文应作为 **soft guide**，而不是固定问答模板。

### 3.4 Turn Strategy Engine

职责：

- 决定这一轮的治理策略
- 给出 pacing / correction / steering / wrap-up 倾向

输入：

- child context
- topic context
- recent turns
- active session state

输出：

- `reply_mode`
- `correction_enabled`
- `correction_focus`
- `difficulty_step`
- `emotion_priority`
- `steering_strength`
- `wrapup_allowed`

### 3.5 Prompt Builder

职责：

- 把画像、策略、主题软引导、最近上下文拼成 LLM 输入
- 不负责直接写死最终回复文本

输出：

- LLM prompt payload

### 3.6 LLM Responder Adapter

职责：

- 调用 OpenAI-compatible / provider-specific 模型接口
- 解析流式或非流式返回
- 记录成功 / 失败日志

说明：

这层是 Hermes conversation loop 的一部分，但属于“模型接入适配器”，不是教学策略模块。

### 3.7 Response Evaluator

职责：

- 对 LLM 输出做轻量归一化
- 检查是否超长、是否出戏、是否偏离儿童口语陪练边界
- 产出可发送回复

### 3.8 Session Wrap-up Engine

职责：

- 决定是否应总结
- 生成 summary、next hints、plan trigger
- 避免在孩子表达真实情绪或仍在核心表达阶段时过早打断

### 3.9 Memory Update Engine

职责：

- 从本轮对话中抽取可持续记录的信息
- 例如：
  - 害怕开口
  - 背过单词但输出困难
  - 偏好中文桥接
  - 喜欢某类主题

输出：

- profile updates
- issue tags
- short memory summary updates

### 3.10 Learning Planner

职责：

- 把多次 session 的结果整理成近期 training focus
- 生成周度 / 月度优先训练项
- 决定下一阶段优先强化什么，而不是只看当前这一轮

输入：

- recent session summaries
- issue tags
- strengths
- recent topic coverage
- current profile snapshot

输出：

- active learning priorities
- recommended topic rotation
- correction intensity suggestion
- weekly / monthly focus

### 3.11 Progress Evaluator

职责：

- 判断孩子是否真的在进步
- 检查哪些问题正在改善，哪些问题反复出现
- 给 planner 提供“是否该换重点”的依据

建议观察指标：

- 平均句长是否变长
- 中文桥接依赖是否下降
- 自发开口是否增加
- 某类句型是否更稳定
- 焦虑 / 不敢开口是否减轻

## 4. Suggested Internal Split

当前与下一阶段建议保留或强化的模块：

1. `session-router`
2. `profile-context-loader`
3. `topic-context-loader`
4. `turn-strategy-engine`
5. `prompt-builder`
6. `llm-tutor-responder`
7. `response-evaluator`
8. `session-wrapup-engine`
9. `memory-update-engine`
10. `learning-planner`（下一步建议补上）
11. `progress-evaluator`（下一步建议补上）

## 5. What Hermes Should Own

Hermes 应负责：

- 会话治理
- 记忆注入
- 教学策略
- 难度和节奏控制
- 总结与训练计划触发
- 可观察性日志
- 为规划层提供稳定的结构化输入

## 6. What Hermes Should Not Own

Hermes 不应继续大量承担：

- 固定主回复话术模板
- 大量 if/else 场景式回复分支
- 客户端语音细节
- 数据库底层连接细节
- 最终长期教学目标的独立制定

## 7. Rule Scope

规则层继续保留，但范围应严格限制在：

- quick intent
- command parsing
- safety
- session lifecycle
- memory tagging
- output constraints

而不再继续扩展为主要对话生成层。

## 8. Relationship Between Hermes And Planning

建议把职责分成三层：

1. `Conversation layer`
   - LLM 负责每轮主回复

2. `Governance layer`
   - Hermes 负责当下这一轮怎么控节奏、控边界、控策略

3. `Planning layer`
   - planner / evaluator 负责未来一周、一个月主要练什么

也就是说：

- Hermes 更像“回合教练”
- planner 更像“阶段教练”

## 9. Future Expansion

后续如果扩到更完整教育系统，可继续在 Hermes 内增加：

- homework analysis orchestration
- monthly review orchestration
- parent report orchestration
- training plan generation orchestration

但它们仍应遵循：

**Hermes orchestrates, LLM composes.**

同时补上：

**Planner prioritizes. Evaluator measures.**

## 10. Next Step

下一步建议：

1. 定义 memory update engine 的输入输出
2. 定义 LLM prompt contract
3. 定义 governance boundary
4. 定义 learning planner 的输入输出
5. 定义 progress evaluator 的核心指标
6. 定义训练计划生成与画像更新的数据管道
