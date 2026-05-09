# Project Status

## Project

小学生英语口语陪练 Agent（Android 原型 + QQBot/Hermes V1）

## Current Stage

当前处于：`implementation` 持续推进中，主试用链路已从 Android 原型和微信 bot 试验，收敛到 `QQBot + Hermes + jiajiaoagent backend bridge`。

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
- `docs/technical/07-wechat-bot-v1-direction.md`
- `docs/technical/08-hermes-tutor-bridge-skeleton.md`
- `docs/technical/09-hermes-switch-over-notes.md`
- `docs/technical/10-hermes-runtime-switch-runbook.md`
- `docs/technical/11-weixin-hermes-simple-start.md`
- `docs/technical/12-weixin-voice-output-silk-plan.md`

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

31. 已在 backend 内落首版 Hermes 可调用 tutor bridge 骨架
   - 已新增 `backend/src/bridge/hermesTutorBridge.ts`
   - 已新增 `backend/scripts/invoke-hermes-tutor-bridge.ps1`
   - 已验证 bridge 可按 `senderId` 维持最小会话连续性

32. 已为 `I:\hermes` 的 Weixin / QQ 适配器补充可切换开关
   - 已补丁 `I:\hermes\weixin.py`
   - 已补丁 `I:\hermes\hermes-edit\qqbot.py`
   - 已确认通过环境变量可将 Hermes fast-path 指向 `jiajiaoagent`

33. 已确认旧 Hermes / NapCat 运行入口的实际来源
   - 已定位旧 `node src\qq-bot-napcat.js` 对应目录为 `I:\autoweb\autoribao`
   - 已确认其启动脚本为 `I:\autoweb\autoribao\start-qq-bot-napcat.bat`
   - 已确认当前切换应围绕 `autoribao` NapCat 入口进行

34. 已补充 Hermes 切换运行脚本与 runbook
   - 已新增 `scripts\Test-HermesTutorBridge.ps1`
   - 已新增 `scripts\Start-HermesJiajiaoAgentNapCat.ps1`
   - 已新增 `docs/technical/10-hermes-runtime-switch-runbook.md`

35. 已完成新的本地 bridge 自检
   - 已从仓库根目录成功执行 `scripts\Test-HermesTutorBridge.ps1`
   - 已修复 `backend/scripts/invoke-hermes-tutor-bridge.ps1` 对调用目录的隐式依赖
   - 已确认 bridge 包装脚本现在可稳定输出 tutor JSON

36. 已完成旧 NapCat 运行时的替换启动
   - 已停止旧的 Node 进程 `21128`
   - 已通过 `scripts/Start-HermesJiajiaoAgentNapCat.ps1` 拉起新的后台运行实例
   - 已确认新 Node 进程命令行为 `src\qq-bot-napcat.js`

37. 已确认真实首版入口应切换为微信 bot 而非 QQ/NapCat
   - 已验证用户实际测试消息未进入 `jiajiaoagent` tutor bridge
   - 已确认前一轮替换的 `autoribao` NapCat 入口不是目标链路
   - 已确认用户指定目标为运行在 WSL 中的 Hermes Weixin 环境

38. 已初步定位当前 WSL / Ubuntu 恢复问题
   - `wsl -l -v` 曾显示 `Ubuntu` 与 `docker-desktop`，但当前用户态下无法正常进入
   - 当前用户注册表 `HKCU:\Software\Microsoft\Windows\CurrentVersion\Lxss` 下未读到有效发行版注册信息
   - 当前已确认 `C:\Users\Administrator\AppData\Local\wsl` 中仍存在 WSL 数据目录，需要继续判断是否可恢复原 Ubuntu/Hermes 环境

39. 已补充微信 Hermes 的简化启动脚本骨架
   - 已新增 `scripts/Check-WeixinHermes.ps1`
   - 已新增 `scripts/Start-WeixinHermes.ps1`
   - 已新增 `docs/technical/11-weixin-hermes-simple-start.md`
   - 目标是在 Ubuntu 恢复后将启动动作收敛为单条 PowerShell 命令

40. 已完成首版“语音指令切换语速”能力
   - 当前 bridge 已支持按会话维持 `slow / normal / fast` 三档语速
   - 已支持文本或语音转写后的控制指令，如 `改成正常`、`说快一点`、`slow`
   - 当前实现位置为 `backend/src/bridge/hermesTutorBridge.ts`
   - 本地逻辑已通，仍需继续验证 QQ live 运行态是否已加载最新代码

41. 已修正首版语速控制的默认体验问题
   - 发现默认全局语速原先配置为 `slow`
   - 因此用户说“语速慢一点”时，命令虽然识别成功，但体感上不会继续变慢
   - 已将默认档位调整为 `normal`
   - 已将三档差距从 `-2 / 0 / 2` 拉大为 `-5 / 0 / 4`，提高实际听感可分辨性

## Current Focus

当前关注点：

1. 把 `语音指令切换语速` 在 QQ live 链路上彻底验证稳定
2. 确认 QQ 侧没有旧进程、旧缓存或旧 bridge 导致的表现漂移
3. 基于真实试用继续微调儿童口语陪练的回复节奏和语气

40. 已根据真实 Ubuntu 环境校准微信 Hermes 启动脚本
   - 已确认 `HOME=/home/zhwyyt`
   - 已确认 Hermes 入口位于 `/home/zhwyyt/.hermes/hermes-agent/hermes_cli/main.py`
   - 已确认 Weixin adapter 位于 `/home/zhwyyt/.hermes/hermes-agent/gateway/platforms/weixin.py`
   - 已将简化脚本从默认猜测改为贴合当前机器实际路径

41. 已完成微信文本 fast-path 的真实联通验证
   - 已确认 `hello` / `I have one sister.` 等文本消息可从微信进入 `jiajiaoagent`
   - 已确认 tutor 回复已能回到微信聊天窗口
   - 已识别出语音消息当前未走 fast-path，而是回落到旧 Hermes agent 路径

42. 已为 live `weixin.py` 补充首版语音 STT 尝试逻辑
   - 已让无 `voice_item.text` 的语音消息先尝试下载并转写
   - 已支持优先直传音频到 OpenAI-compatible STT 接口，失败后再尝试 `ffmpeg` 转 `wav`
   - 已在转写失败时返回明确提示，避免再次回落到旧 `fire` 路径

43. 已修正 WSL 一键启动与修复脚本
   - 已让 `Start-WeixinHermes.ps1` 在启动前自动探测 Ubuntu 可用性
   - 若探测失败，脚本会尝试修复 `D:\WSL\Ubuntu` 的 ownership 和 ACL
   - 已新增 `Start-WeixinHermes.cmd` / `Check-WeixinHermes.cmd` 供双击启动
   - 已新增 `Repair-WslUbuntuAccess.ps1` 作为单独的 WSL 修复入口

44. 已修正 WSL 发行版列表的空字符解析问题
   - 已确认当前机器上 `wsl.exe --list --quiet` 返回带 `NUL` 字符的文本
   - 已在 `Start-WeixinHermes.ps1` / `Check-WeixinHermes.ps1` 中增加清洗逻辑
   - 目标是恢复双击脚本对 `Ubuntu` 发行版的正确识别

45. 已定位当前 Codex 执行环境与用户真实 WSL 账户不一致
   - 当前 Codex 进程运行在 `Administrator` 上下文
   - 当前上下文下 `wsl.exe -d Ubuntu` 返回 `WSL_E_DISTRO_NOT_FOUND`
   - 已确认这会导致仓库内脚本在当前上下文无法代替用户实测其本人账户下的 Ubuntu
   - 已将该限制和对应提示补入脚本与启动文档

46. 已修正启动脚本中 PowerShell 抢先解析 Bash 变量的问题
   - 已定位 `$(cat ...)` 与 `$ACTIVE_PROFILE` 被 PowerShell here-string 提前插值
   - 已将 `Start-WeixinHermes.ps1` / `Check-WeixinHermes.ps1` 改为模板替换写法
   - 目标是恢复 `active_profile` 探测与启动命令拼接的稳定性

47. 已确认一键检查主链路可用，剩余为 `active_profile` 读取毛刺
   - 用户侧 `Check-WeixinHermes.cmd` 已出现 `DISTRO_OK`、`HERMES_ROOT_OK`、`WEIXIN_ADAPTER_OK`
   - 说明 Ubuntu、Hermes 根目录与 Weixin adapter 均已被脚本正确识别
   - 当前仅剩 `cat /home/zhwyyt/.hermes/active_profile` 在文件不存在时产生噪音输出

48. 已确认微信 bot 不再作为首版主链路
   - 已完成较深度的微信语音输出排查
   - 已确认即便 `send_voice` 成功调用，客户端仍不稳定显示可播放语音
   - 当前将微信 bot 定位为已探索但不继续作为 V1 主入口

49. 已打通 QQBot 的真实语音回复闭环
   - 已确认 QQ 文本消息可进入 `jiajiaoagent` tutor bridge
   - 已确认 bridge 可生成 `.silk` 并通过 QQBot 原生 `send_voice()` 发回
   - 已确认用户侧收到的 QQ 语音消息已有正常可听声音

50. 已定位并修复 QQ 语音“有气泡但几乎无声”的根因
   - 已确认根因是 `22050 Hz` 的 TTS WAV 直接喂给 `silk-wasm` 后幅度异常衰减
   - 已在 `backend/src/bridge/hermesTutorBridge.ts` 中加入重采样到 `24000 Hz`
   - 已完成本地 round-trip 验证，修复后 `.silk` 解码幅度恢复正常

51. 已确认当前主问题不再是“能不能回复语音”，而是“如何稳定分流和试用”
   - 需要明确 QQ 试用账号、目标联系人/群、以及与其他项目的边界
   - 需要定义按 `user_id` / `group_id` 的路由策略，而不是依赖 QQ 客户端联系人分组
   - 需要避免干扰现有 `autoribao` / NapCat 运行链路

52. 已完成一轮 tutor reply 与 session wrap-up 的体验增强
   - 已增强短回答场景下的句型引导
   - 已增强围绕家庭成员、活动、描述词的追问逻辑
   - 已补上 session 完成态文案、简短复盘和下一次开口提示
   - 已通过本地 bridge 顺序回合测试验证完成态可正常返回

53. 已完成首版主题包与口语训练方法设计
   - 已明确偏西方式的表达训练方向：先表达，再逐步修正
   - 已确定首版围绕日常生活场景做 6 个核心主题
   - 已写入 `docs/technical/14-speaking-topic-pack-design.md`
   - 已明确下一步应将静态主题包接入 `topicRepository`

54. 已补上中英混杂输入的首版容错规则与最小实现
   - 已明确允许孩子在卡词时少量使用中文做表达救援
   - 已要求 agent 将混杂输入重组成可复说的英文句子
   - 已在当前回复策略中加入中英混杂识别与家庭主题常见词映射
   - 已通过本地 bridge 验证 `我喜欢和 my brother 踢足球`、`我妈妈很善良` 等输入可得到合理英文引导

55. 已将静态首版主题包接入 backend
   - 已新增静态 `topicPack`，覆盖 6 个首版主题
   - 已扩展 `TopicContext`，加入 opening、follow-up、wrap-up 等主题配置字段
   - 已让 session opening message 按 topic 配置变化
   - 已让通用 follow-up 与 wrap-up hints 开始基于 topic config 变化
   - 已通过本地 bridge 验证 `my-school-day`、`my-favorite-food`、`my-family` 三个主题回包差异

56. 已将主题包中的部分 speaking moves / scaffolds 映射到 turn strategy
   - 已为主题配置加入 `speakingMoves` 与 `sentenceStarters`
   - 已让 `turnStrategy` 按主题回合选择命名、选择、描述、细节、原因等教学动作
   - 已让 food 主题优先使用二选一支架，让 school 主题更偏完整句描述
   - 已通过本地 bridge 验证不同主题开始出现不同教学动作

57. 已补充首版儿童试用脚本
   - 已写入 `docs/technical/15-child-trial-script-v1.md`
   - 已明确试用前准备、成人引导词、8 到 12 分钟试用流程、观察模板和试后决策规则
   - 当前已具备按同一脚本重复验证真实孩子试用反馈的条件

58. 已确定共享 NapCat 入口下的首版 QQ 白名单路由规则
   - 已确认 `1647127576`、`794618446` 应走 `autoribao`
   - 已确认 `584201119`、`963028199` 应走 `jiajiaoagent`
   - 已写入 `config/napcat-routing.json`
   - 已写入 `docs/technical/16-napcat-whitelist-routing.md`
   - 当前仓库内已经有明确 source of truth，但 live NapCat 入口尚未完成实际读取该配置

59. 已将白名单路由补丁打入 live NapCat 入口代码
   - 已补丁 `I:\\autoweb\\autoribao\\src\\qq-bot-napcat.js`
   - 已让 live 入口读取 `I:\\jiajiaoagent\\config\\napcat-routing.json`
   - 已让 `jiajiaoagent` 白名单用户改走家教 bridge
   - 已让语音类回包支持 `voice` -> `CQ:record`
   - 已通过 `node --check` 验证 patched entrypoint 语法正常
   - 已确认当前 `I:\\autoweb\\autoribao\\config\\qq-bot.json` 中 `authorizedUsers` 为空，不会额外拦住这 4 个 QQ

60. 已补上 NapCat 对 `jiajiaoagent` WSL 语音路径的转换修复
   - 已补丁 live `sendResultFileToUser(...)`，支持将 `/mnt/i/...` 转成 `I:\\...`
   - 已消除当前截图里“未找到生成文件：/mnt/i/...silk”的直接根因
   - 此修复仍需要在重启 live NapCat 进程后再次实际验证

61. 已清理重复旧 NapCat 进程
   - 已停止旧的 `14:14` NapCat `node src\\qq-bot-napcat.js` 进程（PID `16024`）
   - 当前确认仅剩一个 live NapCat 进程（PID `19984`）
   - 现在可以重新验证是否还存在“双回复”和语音文件路径报错

62. 已补上高频开场/求助意图的快速响应层
   - 已新增 `backend/src/hermes/quickIntentResponder.ts`
   - 已让 `who are you`、`what can you do`、`hello`、`bye`、`thank you`、`I don't know`、`I can't say it` 不再误落到主题模板
   - 已通过本地 bridge 验证 `who are you` 和 `what can you do` 的回复已更像正常陪练

63. 已接入首版 TTS 语速档位
   - 已新增 `config/tts-voice.json`
   - 已支持 `slow / normal / fast` 三档固定语速
   - 当前默认设为 `slow`，更适合孩子试用
   - 已验证 backend type check 通过，bridge 语音文件仍可正常生成

## Work In Progress

当前正在推进：

1. 将主线从“通路打通”切回“家教产品能力打磨”
2. 把 `QQBot` 正式固化为当前首版试用主路径
3. 围绕口语陪练体验继续把主题包落到代码和试用脚本里

## Current Risks

当前风险：

1. `STATUS.md` 之外的部分旧文档仍保留“微信主线”表述，需要逐步校准
2. 当前中英混杂容错已可用，但词汇映射仍是首版小词表，范围还比较窄
3. 当前 TTS 已支持三档语速，但 live QQ 侧仍需重载后再听感验证哪一档最合适

## Next Steps

下一步建议：

1. 固化 `QQBot` 作为当前正式主路径的文档结论
2. 重启当前 live NapCat / jiajiaoagent 链路后，重新验证高频入口句与语速体验
3. 进行一次按试用脚本执行的真实儿童试用并记录观察
   - 已改为 `read` 方式读取，避免继续出现无意义报错

48. 已继续修正一键启动脚本的 Bash 传参与变量展开问题
   - 已定位 `bash -lc` 直接接多行字符串时存在换行与收尾不稳定问题
   - 已改为 PowerShell 先将启动脚本转为 base64，再由 WSL 内解码执行
   - 已移除启动脚本中多余的反斜杠，恢复 Bash 变量正常展开

49. 已确认微信 Hermes 一键启动链路可用
   - 用户侧 `Start-WeixinHermes.cmd` 已成功打印真实环境变量
   - 已进入 `Hermes Gateway Starting...` 常驻运行态
   - 说明当前 `Ubuntu -> Hermes gateway -> jiajiaoagent bridge` 的启动路径已打通

50. 已在仓库内补上首版微信语音输出骨架
   - 已让 `backend/src/bridge/hermesTutorBridge.ts` 在 `shouldPlayTts=true` 时尝试生成本地 `.wav`
   - 已将音频文件路径通过 `files` 字段回包给 Hermes
   - 已将输出目录固定为 `backend/.bridge-audio/`
   - 当前待验证的是 Hermes Weixin adapter 是否会按预期把该 `.wav` 作为语音消息发回微信

51. 已完成本地 bridge 语音回包自检
   - `npm run check` 已通过
   - `invoke-hermes-tutor-bridge.ps1` 已返回带 `files` 的 JSON
   - `backend/.bridge-audio/` 已成功生成 `.wav` 文件
   - 说明 repo 内从 tutor reply 到本地音频产物的链路已经可用

52. 已定位微信侧仍只回文字的直接原因
   - 已对照 `I:\hermes\weixin.py` 确认其读取的是 `payload["files"][].path`
   - 已发现 bridge 先前返回的是字符串数组，而非对象数组
   - 已将 bridge 回包改为 `{ path, kind }` 结构，以匹配现有 Weixin adapter 的消费方式

53. 已继续定位到微信语音仍未发出的第二个直接原因
   - 用户真实微信消息已拿到新的 `{ path, kind }` 结构
   - 但 bridge 返回的是 Windows 路径 `I:\...`，而 live `weixin.py` 运行在 WSL 中
   - `weixin.py` 在发送前会用 `os.path.isfile(path)` 校验，该校验对 Windows 路径会直接失败
   - 已将 bridge 语音文件路径改为 `/mnt/<drive>/...` 形式，供 WSL 直接读取

54. 已为 live Hermes Weixin adapter 补充语音发送诊断日志
   - 已在 `I:\hermes\weixin.py` 的 fast-path 媒体发送分支补充日志
   - 已在 `send_voice()` 中补充开始、成功、失败日志
   - 已将补丁后的 `weixin.py` 同步到 WSL live 路径 `/home/zhwyyt/.hermes/hermes-agent/gateway/platforms/weixin.py`
   - 下一步需要重启 Hermes gateway 后再发消息，读取新日志判断是发送失败还是平台不接受音频

55. 已确认当前微信语音输出问题不在 bridge 或调用失败
   - live Hermes 日志已出现 `autoribao fast path sending media`
   - live Hermes 日志已出现 `send_voice start` 与 `send_voice ok`
   - 说明 `.wav` 文件已被读取，发送请求也已被 Weixin adapter 成功提交
   - 当前更高概率结论是：该通道不将当前 `.wav` 语音以可见语音气泡形式展示
   - 后续若继续做微信语音输出，应转向更接近微信原生的语音格式链路，而不是继续打磨 `.wav`

56. 已确定微信语音输出的下一阶段技术路线
   - 已参考腾讯官方 `openclaw-weixin` 能力信号，确认 `voice_item` 更偏向 SILK 语音格式
   - 已将下一阶段路线定为 `TTS -> WAV -> SILK -> Weixin voice_item`
   - 已明确当前 WeChat MVP 边界应先接受 `语音输入 + 文字输出`
   - 已写入 `docs/technical/12-weixin-voice-output-silk-plan.md`

57. 已完成本地 `.wav -> .silk` 原型接入
   - 已在 `backend` 安装 `silk-wasm`
   - 已让 bridge 从本地 `.wav` 继续转换为 `.silk`
   - 已让 bridge 回包返回 `.silk` 路径与 `playtimeSeconds`
   - 已完成本地自检，确认 `.silk` 文件可生成

58. 已补齐 live Weixin adapter 对语音时长元数据的消费
   - 已让 fast-path 媒体发送把 `file_info` 元数据继续传给 `send_voice()`
   - 已让 `_send_file()` 优先读取 `playtimeSeconds`
   - 已同步到 WSL live `weixin.py`
   - 已完成 Python 语法校验，等待重新启动 Hermes gateway 做真实微信验证

59. 已确认应放弃当前 Weixin bot 作为首版语音输出主路径
   - 已完成 `.wav` 与 `.silk` 两轮真实发送验证
   - live Hermes 日志已确认语音媒体发送请求成功
   - 微信客户端仍不展示语音气泡
   - 已判断继续深挖将进入协议级黑箱问题，当前不适合作为首版主路径

60. 已确认 QQBot 更适合作为下一条语音闭环验证路径
   - 本机 `I:\hermes\hermes-edit\qqbot.py` 已存在原生 `send_voice()`
   - QQ 适配器 `send_voice()` 直接走 `_send_media(..., MEDIA_TYPE_VOICE, \"voice\", ...)`
   - 说明 QQBot 侧语音回复不是拼装兼容路径，而是明确支持的 native media path
   - 下一步应将验证重点切回 QQBot + `jiajiaoagent` bridge

61. 已定位 QQ fast-path 还未真正调用原生语音发送
   - 当前 `qqbot.py` 的 fast-path 对图片之外的文件统一走 `send_document()`
   - 这意味着即使 bridge 返回音频文件，QQ 当前也只会把它按普通文件发出
   - 下一步需要先让 QQ fast-path 对音频后缀改走 `send_voice()`

62. 已将 QQ 音频 fast-path 同步到 live WSL `qqbot.py`
   - 已确认本机 `I:\hermes\hermes-edit\qqbot.py` 的音频分支已改走原生 `send_voice()`
   - 已同步到 `/home/zhwyyt/.hermes/hermes-agent/gateway/platforms/qqbot.py`
   - 已完成 Python 语法校验
   - 当前已具备使用 live QQBot 路线做真实语音回包验证的条件

63. 已补充面向 QQBot 的明确启动入口
   - 已新增 `scripts/Start-HermesQQBot.ps1`
   - 已新增 `scripts/Start-HermesQQBot.cmd`
   - 目的不是启动 NapCat，而是显式说明当前测试目标为 live Hermes gateway 中的 QQBot 路线

64. 已修正 `.silk` 静音问题的本地根因
   - 已确认 Windows TTS 输出的 WAV 为 `22050 Hz / mono / 16-bit`
   - 已定位 `silk-wasm` 直接吃 `22050 Hz` WAV 会产出近似静音的 `.silk`
   - 已让 bridge 在编码前先将 PCM 重采样到 `24000 Hz`
   - 本地 round-trip 验证已通过：新 `.silk` 解回后的振幅已接近原始 `.wav`

## In Progress

当前进行中：

- 保留 Android 原型作为已验证的文本联调基线
- 准备切换首版交互入口到微信 bot + Hermes
- 准备重新定义 V1 的语音输入输出链路
- 已确认本机存在可复用 Hermes 安装：`I:\hermes`
- 已确认本机仍有旧 bot 进程在运行，且高概率来自 `I:\autoweb\autoribao`
- 已确认新的本地 bridge 自检已通过，已具备切换前置条件
- 已确认微信 bot 才是目标链路，当前正在转向 WSL Hermes 恢复
- 已将后续目标收敛为“一键检查 + 一键启动”
- 已完成脚本的首轮实路径校准，下一步进入实际启动验证
- 已确认当前下一优先级应转为微信语音输入链路补齐
- 已完成 live 微信适配器的首轮 STT 补丁，下一步进入实测
- 已将 Ubuntu 一键启动的恢复动作并入脚本，后续优先走单脚本启动
- 当前正在验证修正后的双击脚本是否已可稳定识别并拉起 `Ubuntu` + Hermes gateway
- 当前已确认后续实测必须在拥有 Ubuntu 注册的那个 Windows 账户下进行
- 当前已修正脚本内 Bash 变量转义问题，等待用户在真实 Ubuntu 账户下复测
- 当前一键检查主链路已基本打通，正在消除 `active_profile` 的最后一处噪音报错
- 当前已转向稳定一键启动的脚本执行方式，等待用户再次实测 `Start-WeixinHermes.cmd`
- 当前一键检查与一键启动都已通过，下一步回到微信消息实测与语音输出推进
- 当前已补上 repo 内的语音输出回包骨架，下一步进入本地桥接自检与微信实测
- 当前 repo 内语音回包自检已通过，下一步只剩 Weixin adapter 侧的真实发送验证
- 当前已修正 bridge 与 Weixin adapter 的 `files` 数据结构不一致问题，等待重新实测微信语音回包
- 当前已继续修正 `files[].path` 的运行时路径格式，等待重新实测微信语音回包
- 当前已把语音发送诊断补进 live WSL adapter，等待重启 gateway 后抓下一轮日志
- 当前已确认微信语音发送请求成功但客户端仍不展示，下一步需要决定是否切换到原生语音格式方案
- 当前已决定切向 SILK 原生语音方案，并将微信首版边界收敛为 `语音输入 + 文字输出`
- 当前 `.silk` 本地原型与 live adapter 元数据链路都已补上，下一步进入真实微信回归测试
- 当前已决定结束 Weixin 语音输出攻坚，切回 QQBot 原生语音闭环验证
- 当前已确认 QQ 方向的首个关键改动点是 fast-path 文件路由，需要先切到 `send_voice()`
- 当前 QQ live adapter 与专用启动入口都已就位，下一步进入真实 QQ 消息验证
- 当前 QQ 语音文件源头静音问题已修复，下一步可重新做真实 QQ 语音回包验证

## Next Step

下一步：
- 实测 `scripts\Check-WeixinHermes.cmd` / `scripts\Start-WeixinHermes.cmd`，确认一键链路恢复正常
- 在真实微信对话里验证 gateway 常驻时的文本与语音消息行为
- 在启动稳定后继续处理微信语音回复回包
- 验证 bridge 返回的 `files` 是否会被 Weixin adapter 发送为语音
- 如仍只回文字，则继续排查 live `weixin.py` 对 `files` 的消费逻辑
- 进入 SILK 转换路线的技术选型与落地计划
- 重启 gateway 并验证 `.silk + playtimeSeconds` 是否终于能显示为微信语音气泡
- 启动 QQBot 运行链路并验证 `文本输入 -> 语音回复` 是否可直接走通

1. 恢复或重建 WSL 中的 Ubuntu / Hermes Weixin 运行环境
2. 将 Weixin gateway 的 fast-path 指向 `jiajiaoagent` tutor bridge
3. 验证真实微信消息是否能进入 tutor bridge 并返回
4. 明确当前 bot 通道的语音消息输入输出能力与限制
5. 决定 bridge sender-session 状态是否并入 Redis

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
14. `I:\hermes` 的外部补丁当前不在 `jiajiaoagent` Git 仓库中，需要靠切换说明文档进行追踪
15. 旧 NapCat 进程当前尚未完成无损切换验证，真正断开前仍需做一次实机消息回路确认
16. 当前 WSL 里的 Ubuntu / Hermes Weixin 环境存在注册或可启动性异常，微信 bot 切换受阻
17. 当前 `Start-WeixinHermes.ps1` 仍基于 `~/.hermes/hermes-agent` + `python main.py` 的默认假设，待 Ubuntu 恢复后再做实机校准
18. 虽然 Ubuntu 已可手动打开，但 Codex 工具侧的 `wsl.exe -d Ubuntu` 调用仍不稳定，实际启动验证需要优先以用户本机终端结果为准
19. 当前微信语音输入仍会绕回旧 Hermes agent 流，导致出现 `fire` 等旧依赖报错
20. 当前微信语音输出仍未实现真实音频回包，现阶段只有文字回复稳定
21. 当前语音 STT 是否能真实出字，仍取决于 WSL 内可用的 STT 凭据与 `ffmpeg` 能力
22. WSL2 仍对外部磁盘上的 `ext4.vhdx` 较敏感，若权限或安全策略变化，仍可能再次需要修复

## Last Updated

当前状态最后更新于本次会话。
