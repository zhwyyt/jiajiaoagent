# MVP Development Plan

## Project

小学生英语口语陪练 Agent（Android MVP）

## 1. Goal

本阶段目标是规划一个可快速验证的 Android MVP，用于验证以下核心假设：

1. 小学生是否愿意持续与 AI 进行英语语音对话
2. 主题式语音陪练是否能帮助孩子提升开口意愿与基础表达能力
3. 基于会话表现生成训练重点，是否能形成持续练习闭环

本阶段不追求完整英语家教系统，而是优先实现一个最小但完整的“口语陪练闭环”。

## 2. MVP Scope

### In Scope

1. Android App 基础壳与主页面
2. 主题式英语语音对话
3. Agent 英语文本与语音回应
4. 轻量纠错与复说引导
5. 基础会话记录
6. 简化成长画像
7. 每日/每周训练重点生成
8. 基础成长展示页面

### Out of Scope

1. 作业拍照识别
2. 试卷分析
3. 高精度发音评分
4. 复杂月报
5. 家长端独立系统
6. 完全自由聊天
7. 多学科扩展

## 3. Product Principles

第一版必须遵守以下产品原则：

1. 先保证孩子敢开口，再追求纠错覆盖率
2. 先保证对话顺畅，再追求复杂能力评估
3. 先做主题式半开放对话，不做无限制自由聊天
4. 先做轻量训练计划，不做复杂学习管理系统
5. 先验证可用性与持续使用意愿，再扩展功能边界

## 4. User Flow

### Primary Flow

1. 孩子打开 App
2. 进入首页
3. 点击开始今天练习
4. 选择或进入推荐主题
5. 开始语音对话
6. Agent 回应、追问、轻纠错
7. 完成一轮会话
8. 展示本次反馈
9. 更新成长画像
10. 生成下一轮训练重点

### Supporting Flow

1. 孩子查看训练计划
2. 孩子查看成长记录
3. 家长或陪伴者查看练习频率和近期训练重点

## 5. Feature Breakdown

### 5.1 App Shell

目标：
- 提供 Android MVP 的基础页面结构与导航

内容：
- 首页
- 对话页
- 会话反馈页
- 成长页
- 训练计划页

### 5.2 Voice Conversation

目标：
- 支持孩子通过语音与 Agent 进行英语主题对话

能力：
- 语音输入
- 语音转文本
- 文本消息展示
- Agent 文本回复
- Agent 语音播报

第一版约束：
- 以按钮触发录音或简化连续对话为主
- 首版优先保证稳定性，不强求复杂实时打断式对话

### 5.3 Conversation Orchestration

目标：
- 管理单次会话中的主题、轮次、提示和纠错逻辑

能力：
- 当前主题控制
- 回合推进
- 追问策略
- 卡壳时提示支架
- 单轮纠错控制

### 5.4 Gentle Correction

目标：
- 在不打断表达积极性的前提下进行有效纠错

建议策略：
- 先肯定
- 再修正
- 再复说
- 再继续

实现要求：
- 每轮最多突出 1 个纠错点
- 支持“只回应不纠错”的情况

### 5.5 Session Memory

目标：
- 保留单次会话中的关键数据，供后续画像与训练计划使用

建议记录：
- 主题
- 会话时间
- 总轮次
- 孩子回答文本
- 纠错点
- 关键词命中
- 是否完成主题目标

### 5.6 Growth Profile

目标：
- 为每个孩子维护一个可持续更新的轻量成长画像

建议字段：
- 当前口语等级
- 最近主题表现
- 常见错误类型
- 回答长度趋势
- 最近练习频率
- 当前训练重点

### 5.7 Training Plan Engine

目标：
- 根据近几次会话结果生成短周期训练重点

输出内容：
- 今日目标
- 本周重点
- 建议复练主题
- 重点句型或表达

原则：
- 简短
- 可执行
- 偏孩子视角

## 6. Content Design

第一版内容建议采用固定主题包。

### Recommended Topics

1. Greetings
2. My name and age
3. My family
4. My school
5. My friends
6. My favorite food
7. My toys
8. My day
9. Animals
10. Weather

### Per-Topic Structure

每个主题建议包含：
- 学习目标
- 核心词汇
- 核心句型
- 基础问题
- 扩展问题
- 常见错误提示
- 会话结束目标判断

## 7. Suggested Technical Architecture

第一版建议采用“Android 客户端 + 轻量后端/Agent 服务”的结构。

### Android Client Responsibilities

- 页面展示
- 录音与播放
- 会话交互体验
- 本地轻量状态缓存
- 成长页与训练计划展示

### Backend / Agent Service Responsibilities

- Agent 对话生成
- 主题控制与回合编排
- 纠错建议生成
- 成长画像更新
- 训练计划生成

### Storage

第一版可采用轻量持久化：
- 本地缓存最近会话与展示数据
- 服务端或云端保存核心会话摘要与画像信息

## 8. Suggested Implementation Order

### Milestone 1: Product and Technical Foundation

目标：
- 完成开发计划
- 确定技术栈
- 确定项目结构
- 初始化仓库

交付：
- 本文档
- 任务拆解
- 项目脚手架方案

### Milestone 2: Android App Shell

目标：
- 搭建 Android 基础工程与主导航

交付：
- 首页
- 对话页基础结构
- 成长页基础结构
- 训练计划页基础结构

### Milestone 3: Voice Session Loop

目标：
- 打通语音输入到 Agent 回复的最小链路

交付：
- 录音
- 语音转文本
- Agent 文本回复
- TTS 播报
- 会话轮次推进

### Milestone 4: Guided Conversation and Correction

目标：
- 加入主题控制、追问和轻纠错

交付：
- 主题会话配置
- 支架式提示
- 单轮纠错策略
- 会话完成判断

### Milestone 5: Profile and Training Plan

目标：
- 形成“会话 -> 画像 -> 训练计划”的闭环

交付：
- 基础画像结构
- 近期表现汇总
- 每日/每周训练重点展示

### Milestone 6: MVP Trial Readiness

目标：
- 准备可给孩子试用的版本

交付：
- 主流程可跑通
- 核心主题可体验
- 已知风险列表
- 试用反馈记录模板

## 9. Task Decomposition Directions

后续任务应至少拆成以下几类：

1. 产品与内容
2. Android 客户端
3. 语音链路
4. Agent 对话编排
5. 成长画像与训练计划
6. 验证与试用

## 10. Success Metrics

第一版建议重点关注：

1. 单次练习时长
2. 连续使用天数
3. 平均回答长度
4. 主题完成率
5. 纠错后复说成功率
6. 家长主观反馈
7. 孩子是否愿意再次使用

## 11. Risks and Mitigations

### Risk 1: Child Speech Recognition Quality

风险：
- 儿童英语语音识别效果波动大

缓解方向：
- 允许重复
- 支持简化录音交互
- 允许文本展示与确认
- 降低对逐词高精度识别的依赖

### Risk 2: Over-Correction

风险：
- 纠错太多会降低孩子开口积极性

缓解方向：
- 每轮最多 1 个重点纠错
- 保持正向反馈优先

### Risk 3: Conversation Drift

风险：
- 对话容易偏题或难度漂移

缓解方向：
- 使用主题模板与回合控制
- 设置会话目标与收尾条件

### Risk 4: Plan Feels Like Homework

风险：
- 训练计划过重，会降低孩子接受度

缓解方向：
- 输出短、轻、可执行的训练目标
- 孩子端呈现采用轻指令风格

## 12. Deliverables of Writing-Plans Stage

本阶段至少应产出：

1. `docs/superpower/02-mvp-development-plan.md`
2. 更新后的 `STATUS.md`
3. 更新后的 `TASKLIST.md`

## 13. Next Step

下一步进入：

`implementation-prep`

优先动作：

1. 将本开发计划拆成具体任务清单
2. 确定 Android 技术栈
3. 确定语音与 Agent 的技术接入方案
4. 初始化项目结构
