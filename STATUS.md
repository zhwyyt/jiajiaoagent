# Project Status

## Project

小学生英语口语陪练 Agent（Android MVP）

## Current Stage

当前处于：`implementation` 已启动，已完成技术选型定稿与项目目录骨架初始化。

对应工作流文档：
- `docs/superpower/00-workflow-status.md`
- `docs/superpower/01-brainstorming.md`
- `docs/superpower/01a-github-conventions.md`
- `docs/superpower/02-mvp-development-plan.md`
- `docs/superpower/03-implementation-prep.md`
- `docs/technical/01-tech-stack-decision.md`
- `docs/technical/02-api-and-data-shapes.md`
- `docs/technical/03-system-architecture.md`
- `docs/technical/04-postgresql-schema-draft.md`
- `docs/technical/05-redis-session-state-draft.md`
- `docs/technical/06-hermes-orchestration-modules.md`

## What Is Done

已完成：

1. 明确了产品方向
   - 聚焦小学生英语口语陪练
   - 主要用户为孩子
   - 第一版必须支持语音输入与语音对话
   - 第一版优先验证可行性和简单试用

2. 明确了 MVP 边界
   - 第一版重点是主题式口语对话
   - 包含轻纠错、成长画像、训练计划
   - 暂不包含作业拍照识别和试卷分析

3. 已沉淀 brainstorming 结果
   - 已写入 `docs/superpower/01-brainstorming.md`

4. 已确定 GitHub 协作规范
   - 已写入 `docs/superpower/01a-github-conventions.md`

5. 已建立工作流阶段跟踪文件
   - 已写入 `docs/superpower/00-workflow-status.md`

6. 已确定项目推进记录方式
   - `STATUS.md` 用于记录现在实际干到哪
   - `TASKLIST.md` 用于记录接下来具体干什么

7. 已完成 MVP 开发计划
   - 已写入 `docs/superpower/02-mvp-development-plan.md`
   - 已明确范围、流程、模块、里程碑、风险和验证指标

8. 已完成 implementation-prep
   - 已写入 `docs/superpower/03-implementation-prep.md`
   - 已完成任务级拆解、技术建议、仓库结构建议与数据结构草案

9. 已完成首版技术选型定稿
   - 已写入 `docs/technical/01-tech-stack-decision.md`
   - 已确认 Android 采用 Kotlin + Jetpack Compose
   - 已确认后端优先采用 Node.js + TypeScript

10. 已完成项目目录骨架初始化
   - 已创建 `app/`、`backend/`、`assets/`、`scripts/`
   - 已补充仓库根 `README.md`

11. 已完成首版 API 与数据结构对齐文档
   - 已写入 `docs/technical/02-api-and-data-shapes.md`

12. 已补充系统架构关键决策
   - 已确认 Hermes 作为 agent orchestration 层
   - 已确认 PostgreSQL 负责长期持久化
   - 已确认 Redis 负责短期会话态与协调
   - 已写入 `docs/technical/03-system-architecture.md`

13. 已补充实现级基础设计
   - 已写入 PostgreSQL schema 草案
   - 已写入 Redis session state 草案
   - 已写入 Hermes orchestration 模块边界文档

14. 已完成首版工程骨架初始化
   - 已创建 backend TypeScript 服务骨架
   - 已创建 Android Compose 工程最小结构
   - 已补充多页面导航与核心页面占位

15. 已继续推进实现骨架
   - 已补充 backend 首版 SQL migration 草案
   - 已补充 Android ViewModel 与基础状态层
   - 已补充 Redis key 与 session state manager 骨架

16. 已确定首版 STT / TTS 方案
   - STT 采用 Android `SpeechRecognizer`
   - 优先 on-device，失败时回退系统默认 recognizer
   - TTS 采用 Android `TextToSpeech`
   - 相关决定已写回技术文档

17. 已落首版 Android 语音封装骨架
   - 已添加 `SpeechRecognizer` 输入管理器
   - 已添加 `TextToSpeech` 播放管理器
   - 已将对话页接入基础语音状态与按钮交互

18. 已将 Android 对话页接入 backend 会话骨架
   - 已添加 `start session` / `turn` 请求模型
   - 已添加基础 `BackendClient`
   - 已将对话页接入启动会话与发送 turn 的流程

19. 已将 backend 推进到真实存储接入骨架
   - 已加入 PostgreSQL / Redis 依赖定义
   - 已加入 `.env.example` 与环境配置读取
   - 已加入 Postgres repository、Redis session store、container 初始化骨架

20. 已补充 backend mock storage 启动路径
   - 支持 `MOCK_STORAGE=true` 时使用内存实现启动
   - 方便在未准备 PostgreSQL / Redis 时先联调 Android 和 backend

21. 已验证 backend mock 模式可运行
   - `/health` 已返回正常
   - `/api/sessions/start` 已返回 session 数据
   - `/api/sessions/turn` 已返回 agent reply 数据

22. 已继续完善 Android 联调结构
   - 已将 backend 地址抽为 BuildConfig 配置
   - 已新增 `ConversationRepository`
   - 已补充启动会话和发送 turn 的加载状态与权限错误处理

23. 已确认 Android 本地编译环境当前不完整
   - `app/` 目录中尚无 `gradlew`
   - 当前系统环境中未发现 `gradle`
   - 当前系统环境中未发现 `adb`
   - 已补充基础 `gradle-wrapper.properties` 占位

24. 已补齐 Android 本地构建链路
   - 已定位 Android Studio、JBR 和 SDK 路径
   - 已补齐 `gradlew` / `gradlew.bat` / `gradle-wrapper.jar`
   - 已完成 Android 环境变量与 adb 可用性验证

25. 已完成 Android Debug 构建验证
   - 已修复 BuildConfig、Compose plugin、主题资源和 Kotlin 源码问题
   - 已成功执行 `:app:assembleDebug`
   - 已产出调试包 `app/app/build/outputs/apk/debug/app-debug.apk`

26. 已启动本机 backend mock 服务
    - 已新增一键启动与健康检查脚本
    - backend 当前可在 `http://127.0.0.1:8787/health` 返回正常

27. 已完成 Android 与 backend 的最小真实联调
    - 模拟器内已可启动 session
    - 已可发送文本 turn 并收到 backend 返回
    - 当前可在无麦克风场景下用文本输入验证主流程

28. 已将 Android 对话页推进为真实消息流
    - 已将开场白、孩子发言、Tutor 回复统一进入消息列表
    - 已将对话页改为滚动聊天记录而非单条占位卡片
    - 已保留语音输入与文本输入双通道

29. 已将 backend 回复逻辑推进到首版 tutor 风格
    - 已根据回答长短判断是否要求完整句
    - 已加入句式起手提示与家庭主题词汇引导
    - 已让开场白与追问更接近儿童英语口语陪练

30. 已打通真机经 Tailscale 访问本地 backend 的测试链路
    - 已完成电脑端与手机端 Tailscale 登录与连接
    - 已确认手机可访问 `http://100.101.3.116:8787/health`
    - 已将 Android debug 包 backend 地址切换到 Tailscale IP
    - 已重新构建可用于真机测试的 `app-debug.apk`

## In Progress

当前进行中：

- 保留 Android 原型作为已验证的文本联调基线
- 准备切换首版交互入口到微信 bot + Hermes
- 准备重新定义 V1 的语音输入输出链路
- 已确认本机存在可复用 Hermes 安装：`I:\hermes`
- 已确认本机仍有旧 bot 进程在运行，后续切换前需要安全断开
- 已在 `backend/` 内落首版 Hermes 可调用 tutor bridge 骨架
- 已验证 bridge 可按 `senderId` 维持最小会话连续性

## Next Step

下一步：

1. 优化首轮对话策略，让 Tutor 能做更稳定的追问、鼓励和轻纠错
2. 设计微信 bot 作为首版交互入口的消息流与语音流
3. 规划 Hermes 与微信 bot 的桥接模块边界，并明确复用 `I:\hermes` 的方式
4. 将 Hermes 现有 bridge 从旧业务切换到 `jiajiaoagent` tutor bridge
5. 补充 session 完成态、复盘提示与训练计划入口衔接

## Current Risks

当前已知风险：

1. 儿童英语语音识别效果存在不确定性
2. 第一版对话体验需要在“鼓励开口”和“纠错有效”之间取得平衡
3. 数据持久化与会话状态仍主要停留在接口和占位实现
4. Android 平台 STT 对儿童英语识别精度仍有试用风险
5. 当前录音权限申请流程还未补完整
6. 当前 tutor 回复逻辑仍以规则驱动为主，距离更自然的陪练体验还有空间
7. 真实 PostgreSQL / Redis 模式还未启动验证
8. 当前真机调试依赖电脑的 Tailscale IP，若电脑重新入网或 tailnet 状态变化，地址可能需要重新确认
9. Android 构建当前可成功通过，但存在 `compileSdk = 36` 与 AGP 8.7.3 的兼容性警告，后续建议升级
10. 一加 9 真机上的系统语音输入与 TTS 初始化兼容性存在明显不确定性
11. 若切换微信 bot 作为 V1 入口，需要重新明确语音消息转写、回放和账号侧约束
12. 本机 Hermes 当前可能仍指向旧业务桥接逻辑，切换时需要避免影响原流程
13. 当前 tutor bridge 仍使用本地文件维护 sender-session 映射，后续需再决定是否并入 Redis

## Last Updated

当前状态最后更新于本次会话。
