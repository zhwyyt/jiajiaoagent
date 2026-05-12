# Superpower Workflow Status

## Project

小学生英语口语陪练 Agent（QQBot 主试用链路 + Android 原型保留）

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
- 最早交付形态最初优先为 Android App
- 后续结合真实工程可行性，主试用路径收敛到 `QQBot + Hermes + jiajiaoagent backend bridge`

### 2. Writing Plans

Status: completed

Output:

- `docs/superpower/02-mvp-development-plan.md`

Summary:

- 已明确 MVP 范围与非范围
- 已拆出主用户流程与核心功能模块
- 已定义实施里程碑、风险与验证指标
- 已为早期实现阶段建立基本方向

### 3. Implementation Prep

Status: completed

Output:

- `docs/superpower/03-implementation-prep.md`

Summary:

- 已把当前主路径正式校准为 `QQBot + NapCat + backend bridge + Hermes governance + LLM reply`
- 已明确当前正式架构为 “LLM 主回复，Hermes 做治理层”
- 已明确下一阶段重点不再是 transport 试错，而是 prompt、治理、记忆和试用闭环
- 已把 Android 从“当前主线”调整为“保留原型资产”

### 4. Implementation

Status: in progress

Planned output:

- 可用的儿童口语陪练主链路
- LLM 驱动的自然对话能力
- Hermes 治理、会话控制、记忆更新能力
- 基础试用和观察记录

Current progress:

- 已完成技术栈决策与项目骨架初始化
- 已完成 Android 原型与 backend 的基础联调
- 已验证微信 bot 路线不适合作为当前主语音输出路径
- 已打通 `QQBot -> Hermes -> jiajiaoagent -> QQ 语音回复` 闭环
- 已将主回复链路切到真实 LLM 调用
- 已修正 `CPA1 + gpt-5.4` 非流式返回正文为空的问题，改为读取流式正文
- 已新增 `llm_succeeded / llm_failed / llm_skipped` 可观察性日志
- 已补上 `重新开始聊天` 等会话控制能力
- 当前实现方向正式转为：让 LLM 负责“怎么说”，让 Hermes 负责“怎么管”

Related files:

- `docs/technical/03-system-architecture.md`
- `docs/technical/06-hermes-orchestration-modules.md`
- `docs/technical/13-qqbot-v1-mainline.md`
- `STATUS.md`
- `TASKLIST.md`

### 5. Verification

Status: in progress

Planned output:

- 可持续试用的 V1 版本
- 真实聊天质量反馈
- 基于试用结果的 prompt / governance 迭代输入

Current direction:

- 以 QQBot 作为当前最低摩擦试用入口
- 优先验证孩子是否愿意持续说、系统是否能自然接话
- 先修“出戏感”“脚本味”“节奏不自然”等关键体验问题
- 通过真实试用结果决定下一轮治理边界和训练计划深度

## Notes

从本文件开始，后续每个阶段都应在仓库内留下明确产出文件，而不是只停留在对话中。
