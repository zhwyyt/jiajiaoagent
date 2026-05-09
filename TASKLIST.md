# Task List

## Working Rules

- 本文件记录接下来具体干什么
- 已完成任务应移动到完成区，避免主列表失焦
- 新增任务应尽量对应一个可独立推进的产出
- 任务范围应尽量控制在一次 PR 或一个明显阶段内

## Now

- [ ] 设计微信 bot + Hermes 的首版消息流与语音流
- [ ] 明确微信 bot 首版依赖的接入方式与运行边界
- [ ] 规划 bot bridge / Hermes / tutor logic 的模块拆分
- [ ] 记录 Android 原型当前可复用资产与暂停点
- [ ] 继续增强 backend tutor reply 逻辑
- [ ] 给 session 增加完成态提示与简短复盘
- [ ] 继续细化 Hermes orchestration 模块

## Upcoming

- [ ] 完成首页、成长页、训练计划页基础结构细化
- [ ] 打磨对话页消息流视觉层次与交互细节
- [ ] 设计主题配置结构
- [ ] 设计训练计划生成输入输出格式
- [ ] 初始化数据库迁移或 schema 管理方式

## Later

- [ ] 实现主题式语音对话主流程
- [ ] 实现轻纠错与复说引导机制
- [ ] 实现基础成长画像数据结构
- [ ] 实现训练计划生成逻辑
- [ ] 完成 MVP 试用版联调
- [ ] 记录试用反馈并整理下一轮迭代方向

## Done

- [x] 完成产品方向 brainstorming
- [x] 明确第一版产品定位与边界
- [x] 写入 `docs/superpower/01-brainstorming.md`
- [x] 写入 `docs/superpower/01a-github-conventions.md`
- [x] 写入 `docs/superpower/00-workflow-status.md`
- [x] 确定使用 `STATUS.md` 和 `TASKLIST.md` 记录项目实时进展
- [x] 写入 `docs/superpower/02-mvp-development-plan.md`
- [x] 写入 `docs/superpower/03-implementation-prep.md`
- [x] 写入 `docs/technical/01-tech-stack-decision.md`
- [x] 写入 `docs/technical/02-api-and-data-shapes.md`
- [x] 初始化项目目录骨架与根 `README.md`
- [x] 写入 `docs/technical/03-system-architecture.md`
- [x] 写入 `docs/technical/04-postgresql-schema-draft.md`
- [x] 写入 `docs/technical/05-redis-session-state-draft.md`
- [x] 写入 `docs/technical/06-hermes-orchestration-modules.md`
- [x] 搭建 backend TypeScript 服务骨架
- [x] 搭建 Android Compose 工程最小结构
- [x] 完成 Android 首批页面与导航结构
- [x] 完成 backend 首批会话接口占位
- [x] 写入 backend 首版 SQL migration 草案
- [x] 确定首版 STT / TTS 技术方案
- [x] 在 Android 侧落 `SpeechRecognizer` / `TextToSpeech` 基础封装
- [x] 在 Android 对话页接入 backend `start/turn` 会话骨架
- [x] 接入 backend PostgreSQL / Redis 真实存储骨架
- [x] 安装并通过 backend TypeScript 依赖与类型检查
- [x] 启动并验证 backend mock 模式基础接口
- [x] 抽离 Android conversation repository 并补充基础加载态
- [x] 识别出 Android 本地构建环境缺口并补充 wrapper 配置占位
- [x] 补齐 Android Gradle wrapper 与本地构建环境
- [x] 成功执行 Android `:app:assembleDebug`
- [x] 启动本机 backend mock 服务并验证健康检查
- [x] 验证 Android 与 backend 的实际联通
- [x] 将 Android 页面接入真实会话状态流
- [x] 细化 backend 首批会话接口到可试用对话水平
- [x] 打通手机通过 Tailscale 访问本机 backend 的测试链路
