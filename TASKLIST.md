# Task List

## Working Rules

- 本文件记录接下来具体干什么
- 已完成任务应移动到完成区，避免主列表失焦
- 新增任务应尽量对应一个可独立推进的产出
- 任务范围应尽量控制在一次 PR 或一个明显阶段内

## Now

- [ ] 验证 `1647127576`、`794618446` 是否稳定走 `autoribao`
- [ ] 验证 `584201119`、`963028199` 是否稳定走 `jiajiaoagent`
- [ ] 重新验证 `who are you`、`what can you do` 在 QQ 侧是否正常
- [ ] 验证 `改成正常`、`说慢一点`、`说快一点` 这类语音控制指令在 QQ 侧是否稳定生效
- [ ] 重新验证 `slow / normal / fast` 三档语速在 QQ 侧的实际听感
- [ ] 重启 live NapCat 进程并验证新的默认 `normal` + 更大语速档位差是否生效
- [ ] 记录 Android 原型当前可复用资产与暂停点
- [ ] 扩充中英混杂容错的小词表与句型映射
- [ ] 基于真实试用继续微调 tutor reply 的语气、追问密度和回合节奏
- [ ] 基于真实试用继续细化 topic-specific turn strategy
- [ ] 进行一次按试用脚本执行的真实儿童试用并记录观察

## Upcoming

- [ ] 为 unmatched QQ 用户定义提示或静默忽略策略
- [ ] 把技术文档中的“微信主线”表述逐步校准为“QQBot 主试用链路”
- [ ] 记录 QQBot 相比微信 bot 的实现/维护差异
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
- [x] 在 backend 内落首版 Hermes 可调用 tutor bridge 骨架
- [x] 为本机 `I:\hermes` 适配器补充可切换到 `jiajiaoagent` 的开关
- [x] 定位旧 `node src\qq-bot-napcat.js` 的高概率运行目录为 `I:\autoweb\autoribao`
- [x] 补充 Hermes runtime 切换脚本和 runbook
- [x] 用 `scripts/Test-HermesTutorBridge.ps1` 完成一次本地 bridge 自检
- [x] 停掉旧 `autoribao` NapCat 运行实例并切到 `scripts/Start-HermesJiajiaoAgentNapCat.ps1`
- [x] 确认首版真实目标入口应为 WSL 中的 Hermes 微信 bot
- [x] 补充微信 Hermes 的一键检查 / 一键启动脚本骨架
- [x] 校准 WSL 中 Hermes 的真实启动命令与目录
- [x] 验证微信文本消息已可进入 `jiajiaoagent` tutor bridge
- [x] 为 live `weixin.py` 补充首版微信语音 STT 尝试逻辑
- [x] 将 WSL Ubuntu 修复逻辑并入一键启动脚本
- [x] 定位到 `wsl.exe --list --quiet` 返回空字符文本导致 `Ubuntu` 比对失败
- [x] 定位到当前 Codex 运行账户与用户真实 WSL 注册账户不一致
- [x] 修正启动脚本里 Bash 变量被 PowerShell 提前解析的问题
- [x] 确认 `Check-WeixinHermes.cmd` 已能识别 Ubuntu / Hermes / Weixin adapter 主链路
- [x] 确认 `Start-WeixinHermes.cmd` 已可拉起 Hermes gateway 常驻运行
- [x] 在 repo 内补上首版 bridge `.wav` 语音输出骨架
- [x] 本地验证 bridge 已可生成 `.wav` 并在 JSON 中返回 `files`
- [x] 定位到 bridge `files` 结构与 Weixin adapter 预期不一致
- [x] 定位到 bridge 语音文件返回 Windows 路径导致 WSL `os.path.isfile(...)` 失败
- [x] 将语音发送诊断日志补进 live WSL `weixin.py`
- [x] 确认 `send_voice` 已成功调用但微信客户端仍不显示当前 `.wav` 语音输出
- [x] 明确当前微信 MVP 边界先接受 `语音输入 + 文字输出`
- [x] 写入微信语音输出 `.silk` 路线技术计划
- [x] 在 backend 接入 `silk-wasm` 并完成本地 `.wav -> .silk` 原型
- [x] 让 live Weixin adapter 消费 `playtimeSeconds` 元数据
- [x] 确认当前 Weixin bot 路线不适合作为首版语音输出主路径
- [x] 确认本机 QQBot 适配器存在原生 `send_voice()` 媒体发送链路
- [x] 定位到 QQ fast-path 当前仍把音频文件按普通文档发送
- [x] 将 QQ 音频 fast-path 补丁同步到 live WSL `qqbot.py`
- [x] 修正 `22050 Hz` WAV 直接编码导致的 `.silk` 近似静音问题
- [x] 验证 QQBot 已可向用户回发带声音的真实语音消息
- [x] 增强 backend tutor reply 逻辑，让回复更像小学生口语陪练
- [x] 给 session 增加完成态提示、简短复盘和下一步开口引导
- [x] 设计首版日常口语主题包结构，并明确偏西方式表达训练方向
- [x] 补上中英混杂输入的首版容错规则与最小实现
- [x] 将 topicRepository 升级为静态首版主题包定义
- [x] 让 opening message / follow-up 基于 topic config 变化
- [x] 将主题包中的 speaking moves / scaffolds 映射到 turn strategy
- [x] 整理一份可重复执行的儿童试用脚本
- [x] 写下 NapCat 白名单路由规则与当前 4 个 QQ 的目标映射
- [x] 将白名单路由补丁打入 live NapCat 入口代码
- [x] 补上 NapCat 对 `jiajiaoagent` WSL 语音路径的转换修复
- [x] 清理重复旧 NapCat 进程，只保留当前 live 实例
- [x] 补上高频开场/求助意图的快速响应层
- [x] 接入首版 TTS 三档语速配置
- [x] 在 bridge 中接入首版语音/文本控制指令，用于切换 `slow / normal / fast` 语速
- [x] 识别并修正默认语速已是 `slow` 导致“慢一点”体感无变化的问题
