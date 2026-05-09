# Superpower Workflow Status

## Project

小学生英语口语陪练 Agent（Android 原型 + QQBot/Hermes MVP）

## Workflow Stages

### 1. Brainstorming

Status: completed

Output:
- `docs/superpower/01-brainstorming.md`
- `docs/superpower/01a-github-conventions.md`

Summary:
- 明确产品定位为面向小学生的英语口语陪练 Agent
- 核心用户为孩子本人
- 第一版必须支持语音输入与语音对话
- 第一版重点是口语陪练、轻纠错、成长画像、训练计划
- 第一版暂不包含作业拍照识别与试卷分析
- 最早交付形态优先为 Android App
- 当前已将首版试用主路径收敛到 `QQBot + Hermes + jiajiaoagent backend bridge`
- 当前目标仍是验证可行性与儿童试用体验
- 已补充仓库 GitHub 协作规范，作为进入开发计划前的基础约束

### 2. Writing Plans

Status: completed

Output:
- `docs/superpower/02-mvp-development-plan.md`

Scope to define:
- MVP 功能清单
- 用户流程
- 页面结构
- Agent 能力拆分
- 技术方案
- 迭代里程碑
- 验证指标与风险

Summary:
- 已明确 MVP 范围与非范围
- 已拆出主用户流程与核心功能模块
- 已给出 Android 客户端与 Agent 服务的职责边界
- 已定义实施里程碑、核心风险与验证指标
- 下一步进入 implementation-prep，先做任务拆解与技术选型

### 3. Implementation Prep

Status: completed

Output:
- 任务级拆解
- 技术栈决策
- 项目结构初始化方案

Files:
- `docs/superpower/03-implementation-prep.md`

Summary:
- 已将 MVP 拆成 foundation、client、voice、conversation、profile、trial 六条任务线
- 已给出 Android、存储、STT、TTS、Agent 服务的首版技术建议
- 已给出仓库结构建议与核心数据结构草案
- 下一步进入 implementation，先完成项目结构初始化，再根据实际可行性收敛试用入口

### 4. Implementation

Status: in progress

Planned output:
- 项目脚手架
- Android 客户端
- Agent 对话与记忆模块
- 基础评估与训练计划逻辑

Current progress:
- 已完成技术栈决策
- 已完成项目目录骨架初始化
- 已完成首版 API 与数据结构对齐文档
- 已完成 Android 原型与 backend 的基础联调
- 已完成 Hermes tutor bridge 骨架
- 已确认微信 bot 不适合作为当前首版语音输出主路径
- 已打通 `QQBot -> Hermes -> jiajiaoagent -> QQ 语音回复` 的可用闭环
- 当前主线已回到“围绕口语陪练能力本身继续打磨”

Related files:
- `docs/technical/01-tech-stack-decision.md`
- `docs/technical/02-api-and-data-shapes.md`
- `docs/technical/13-qqbot-v1-mainline.md`
- `README.md`

### 5. Verification

Status: in progress

Planned output:
- 可运行试用版本
- 功能验证记录
- MVP 试用反馈记录

Current direction:
- 以 QQBot 作为当前最低摩擦试用入口
- 用真实语音对话验证孩子是否愿意持续开口
- 在可用链路稳定后，再决定是否重启 Android 主入口路线

## Notes

从本文件开始，后续每个阶段都应在仓库内留下明确产出文件，而不是只停留在对话中。
