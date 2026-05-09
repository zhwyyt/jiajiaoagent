# GitHub Conventions

## Purpose

本文件用于在项目早期统一 GitHub 协作规范，避免后续在分支命名、提交格式、目录组织、PR 范围和文档同步上反复返工。

本规范适用于当前项目：

- 小学生英语口语陪练 Agent
- Android MVP

## 1. Branch Strategy

默认分支：
- `main`

开发分支策略：
- 每个独立任务使用单独分支
- 从 `main` 拉出功能分支

分支命名规范：
- `feature/<short-name>`
- `fix/<short-name>`
- `docs/<short-name>`
- `refactor/<short-name>`
- `chore/<short-name>`

示例：
- `feature/android-app-shell`
- `feature/voice-conversation-flow`
- `feature/training-plan-engine`
- `docs/mvp-development-plan`

## 2. Commit Convention

提交信息采用简化的 Conventional Commits：

- `feat:`
- `fix:`
- `docs:`
- `refactor:`
- `test:`
- `chore:`

格式：

`type: short summary`

示例：
- `feat: add android app home screen shell`
- `feat: implement theme-based voice session flow`
- `docs: add brainstorming and workflow status docs`
- `fix: handle empty voice transcript state`

约束：
- 一次提交尽量只做一类事情
- 不把大范围无关改动混进同一个提交
- 文档更新应和对应设计或实现同步提交

## 3. Pull Request Scope

每个 PR 应尽量聚焦于一个明确目标，例如：

- 建立 Android 项目脚手架
- 完成首页与训练计划页面
- 接入语音输入链路
- 接入 Agent 对话 API
- 完成成长画像基础模型

PR 不应混合以下内容：
- 新功能实现
- 大规模重构
- 无关样式清理
- 不相关文档重写

## 4. Definition of Done

一个任务在合并前至少满足以下条件：

1. 代码可运行
2. 功能与任务目标一致
3. 无明显阻断性错误
4. 相关文档已同步
5. 如有 UI，主流程可走通
6. 如有接口，输入输出约定明确

## 5. Documentation Rules

文档必须和工作流阶段同步沉淀，不允许只停留在聊天记录中。

建议文档目录：

- `docs/superpower/`
- `docs/product/`
- `docs/technical/`

当前工作流文档约定：

- `docs/superpower/00-workflow-status.md`
- `docs/superpower/01-brainstorming.md`
- `docs/superpower/01a-github-conventions.md`
- `docs/superpower/02-mvp-development-plan.md`

规则：
- 每进入一个新的工作流阶段，要留下明确产出文件
- 功能边界变化时，要同步更新开发计划或相关设计文档
- 重大实现决策要写入技术文档，而不是只留在提交信息中

## 6. Repository Structure

在实现阶段建议逐步形成如下结构：

- `app/` Android 客户端代码
- `docs/` 产品、技术与工作流文档
- `assets/` 静态资源
- `scripts/` 开发辅助脚本
- `tests/` 测试或验证脚本（按实际技术栈调整）

当前阶段允许结构保持轻量，但新文件应尽量向上述结构靠拢。

## 7. Issue and Task Granularity

任务粒度建议控制在“1 次 PR 可完成”的大小。

好的任务示例：
- 搭建 Android 工程与基础导航
- 完成首页、训练计划页和成长页静态 UI
- 接入语音识别输入链路
- 实现单轮主题对话状态机
- 实现会话结束后的训练计划生成

过大的任务示例：
- 做完整个 App
- 完成全部 AI 功能
- 一次性做完 MVP

## 8. MVP Labeling Suggestion

如果后续使用 GitHub Issues，建议至少使用这些标签：

- `mvp`
- `product`
- `android`
- `ai-agent`
- `voice`
- `ui`
- `backend`
- `docs`
- `blocked`

## 9. Decision Log Rule

以下决策建议写入文档：

- 技术栈选择
- 语音方案选择
- Agent 架构调整
- 记忆结构调整
- 训练计划生成逻辑变更
- MVP 范围增减

如果某个决定会影响后续多个任务，就不应只写在对话或 commit 中。

## 10. Current Decision

当前项目在进入 `writing-plans` 前，已确认采用上述 GitHub 规范。

下一步应基于：
- 已完成的 brainstorming 文档
- 已确认的 GitHub 规范

继续产出：
- `docs/superpower/02-mvp-development-plan.md`
