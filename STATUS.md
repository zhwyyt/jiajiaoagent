# Project Status

## Project

小学生英语口语陪练 Agent（QQBot 主试用链路 + Android 原型保留）

## Current Stage

当前处于：`implementation` 持续推进中。

当前正式主线已经收敛为：

`QQBot + NapCat + jiajiaoagent backend bridge + Hermes governance + LLM reply`

当前正式架构方向已经明确为：

**LLM 主回复，Hermes 做治理层，并补上教学规划层。**

对应工作流文档：

- `docs/superpower/00-workflow-status.md`
- `docs/superpower/01-brainstorming.md`
- `docs/superpower/01b-teaching-planning-and-growth-brainstorming.md`
- `docs/superpower/01a-github-conventions.md`
- `docs/superpower/02-mvp-development-plan.md`
- `docs/superpower/03-implementation-prep.md`
- `docs/technical/03-system-architecture.md`
- `docs/technical/06-hermes-orchestration-modules.md`
- `docs/technical/13-qqbot-v1-mainline.md`
- `docs/technical/17-stage-goal-and-session-goal-mechanism.md`
- `docs/technical/18-memory-planner-evaluator-v1-design.md`
- `docs/technical/19-llm-prompt-contract-v1.md`
- `docs/technical/20-hermes-governance-boundary-v1.md`
- `docs/technical/21-learner-profile-v1-design.md`
- `docs/technical/22-hidden-training-projection-v1.md`
- `docs/technical/23-parent-report-v1-design.md`
- `docs/technical/24-v1-completion-checklist.md`

## What Is Done

已完成的关键里程碑：

1. 已明确产品方向
   - 聚焦小学生英语口语陪练
   - 主要用户是孩子本人
   - 第一版优先验证可行性和低摩擦试用体验

2. 已完成工作流和 GitHub 规范落档
   - 已写入 brainstorming、GitHub conventions、MVP plan、implementation prep
   - 已建立 `STATUS.md` 与 `TASKLIST.md` 作为项目持续记忆层

3. 已完成基础技术选型和工程骨架
   - backend 采用 Node.js + TypeScript
   - Android 原型采用 Kotlin + Jetpack Compose
   - 已完成 backend / app / docs / scripts 基础结构初始化

4. 已完成 Android 原型第一阶段验证
   - 已打通基础页面、会话接口、文本联调、语音封装骨架
   - 已成功构建 `app-debug.apk`
   - 已确认 Android 当前作为后续资产保留，而不是当前主试用入口

5. 已完成微信路线探索并明确降级结论
   - 已较深度尝试微信文本、语音输入、语音输出链路
   - 已确认微信 bot 不适合作为当前 V1 主语音输出路径
   - 相关经验已保留在技术文档中

6. 已打通 QQBot 可用闭环
   - 已完成 `QQBot -> Hermes -> jiajiaoagent -> QQ 语音回复`
   - 已验证 QQ 可收到带声音的语音回复
   - 已完成 NapCat 白名单路由和当前业务切分

7. 已完成首版儿童陪练基础行为
   - 已补上 topic pack、turn strategy、opening / follow-up 基础逻辑
   - 已补上中英混杂输入的最小容错
   - 已补上高频 quick intent 和基础语速控制
   - 已补上 `重新开始聊天`，解决 QQ 单窗口会话重置问题

8. 已开始修正“像脚本、不像真人聊天”的体验问题
   - 已将前两轮改为先自然接话、后轻引主题
   - 已修正 quick intent 误匹配 `white -> hi` 的问题
   - 已补上情绪类输入优先共情、先降难度的行为

9. 已将主回复链路切到真实大模型生成
   - backend 已接入 OpenAI-compatible LLM 调用层
   - 当前 `sessionService` 优先请求 LLM，失败才 fallback
   - 已查清 `CPA1 + gpt-5.4` 非流式 200 但 `content` 为空的问题
   - 已改为读取流式 SSE `delta.content`

10. 已补上可观察性，能够判断 live 回复是否来自大模型
   - 已新增 `llm_succeeded / llm_failed / llm_skipped`
   - `turn_reply` 已带 `source: llm | fallback | quick-intent | wrap-up`
   - 已验证 live QQ sender 在 `重新开始聊天` 后可以进入新的 LLM 驱动会话

11. 已明确当前架构收口方向
   - LLM 负责“怎么说”
   - Hermes / backend 负责 quick intent、command、session lifecycle、memory tagging、wrap-up gating、output constraints
   - 项目不再继续沿“规则主导主回复”的方向扩展

12. 已将核心技术文档切到新方向
   - 已更新 `docs/technical/03-system-architecture.md`
   - 已更新 `docs/technical/06-hermes-orchestration-modules.md`
   - 已明确 `Hermes orchestrates, LLM composes`

13. 已识别出当前架构若只停留在“聊天 + 总结”会缺少完整教育规划
   - 已确认需要补上独立的教学规划层
   - 该层负责周目标、月目标、训练优先级、阶段评估
   - 已明确产品最终不应只是陪练 agent，而应是“陪练内核 + 教学规划 + 成长记录”

14. 已完成“教学规划 + 成长记录”功能层的 brainstorming 收口
   - 已新增 `docs/superpower/01b-teaching-planning-and-growth-brainstorming.md`
   - 已明确三层时间尺度：turn / session / week-month
   - 已明确首版应补上 `learning-planner`、`progress-evaluator`、`parent-summary-generator`
   - 已明确成长记录应优先存可影响下一次训练决策的信息，而不是堆统计

15. 已完成“阶段目标 + session 目标”机制设计初稿
   - 已新增 `docs/technical/17-stage-goal-and-session-goal-mechanism.md`
   - 已明确阶段目标不能只靠单次聊天临时决定
   - 已明确应由 `conversation signals + history + planning rules` 共同决定
   - 已明确 `stage goal -> weekly focus -> session goal` 的三层目标结构

16. 已完成 `memory-update-engine / learning-planner / progress-evaluator` 的 V1 设计初稿
   - 已新增 `docs/technical/18-memory-planner-evaluator-v1-design.md`
   - 已明确三个模块的输入输出边界
   - 已把 `stage goal / weekly focus / session goal` 机制正式并入 planner 设计
   - 已明确 V1 采用 `rules first` 的稳定路线，而不是一开始就完全交给模型自由判断

17. 已完成 `memory-update-engine` 的最小实现接入
   - 已新增 `backend/src/hermes/memoryUpdateEngine.ts`
   - 已新增 `backend/src/storage/learningMemoryRepository.ts`
   - 已扩展 `backend/src/types/session.ts`，补充 turn observation / session summary / learning snapshot 基础类型
   - 已将 memory update 钩入 `backend/src/services/sessionService.ts`
   - 当前已可在每轮对话后更新最小版 learning memory
   - 已通过 `npm run check`

18. 已完成 `progress-evaluator / learning-planner` 的最小运行时接入
   - 已新增 `backend/src/hermes/progressEvaluator.ts`
   - 已新增 `backend/src/hermes/learningPlanner.ts`
   - 已将 evaluator / planner 接入 `backend/src/services/sessionService.ts`
   - 已将 planner 输出注入 `turnStrategyEngine`、`promptBuilder`、`llmTutorResponder`
   - 当前已可在回合内生成 `stage goal / weekly focus / session goal` 并影响回复策略
   - 已通过 `npm run check`
   - 已通过本地 bridge smoke test，包括 quick-intent 与非 quick-intent 两条路径

19. 已完成 `LLM prompt contract / Hermes governance boundary` 文档收口
   - 已新增 `docs/technical/19-llm-prompt-contract-v1.md`
   - 已新增 `docs/technical/20-hermes-governance-boundary-v1.md`
   - 已明确 planner 输出如何软注入 LLM，而不是变成生硬教学脚本
   - 已明确哪些能力应留在 Hermes，哪些应留给 LLM

20. 已完成当前一轮“自然度优先”的运行时收紧
   - 已将 `quick intent` 收紧为更保守的独立短句匹配，减少误吃正常聊天
   - 已为 `wrap-up` 补上显式 gating，避免仅因 turn index 到线就强行收尾
   - 已将 planner 的 `weekly focus / session goal` 改成更像内部引导语，而不是任务指令
   - 已在 LLM prompt 中补上“不要把内部目标说成课堂指令”的约束

21. 已完成首版“理解难度自适应”接入
   - 已明确三种支持模式：`english-only`、`english-with-chinese-support`、`chinese-bridge-to-english`
   - 已将该模式接入 `turn strategy -> LLM prompt -> fallback -> memory observation`
   - 已让系统在孩子卡壳、求助、中文混输时自动降级支持强度
   - 已将该能力写入 prompt contract 和 governance boundary 文档

22. 已完成“持续孩子画像系统 V1”设计初稿
   - 已新增 `docs/technical/21-learner-profile-v1-design.md`
   - 已明确 learner profile 应分为 `stable traits / current stage / recent signals` 三层
   - 已明确 learner profile 不应只存工程标签，还应表达“更适合怎样被带着聊”
   - 已明确该画像后续应回注 opening style、support mode、follow-up 难度、纠错强度和 session goal 风格

23. 已完成首版 runtime learner profile 生成器接入
   - 已新增 `backend/src/hermes/learnerProfileEngine.ts`
   - 已扩展 `LearningMemoryRepository`，支持读写 `LearnerProfile`
   - 已在 `memoryUpdateEngine` 中基于 `LearningSnapshot + recent session summaries` 自动生成首版画像
   - 当前画像已可同时产出结构化字段与 human-readable `currentHypothesis`
   - 已通过 `npm run check`

24. 已将 learner profile 软回注到运行时决策链路
   - `learningPlanner` 已可读取 learner profile，软调整 support level、weekly focus 和 session goal
   - `turnStrategyEngine` 已可读取 learner profile，影响 `open-chat / expand-answer` 倾向和压力控制
   - `llmTutorResponder` 已可向大模型注入 `currentHypothesis / preferredEntryStyle / pressureSensitivity / activeSupports`
   - 已通过 `npm run check`
   - 已通过一轮本地 smoke，焦虑句仍表现为“先接住情绪，再给很小的开口台阶”

25. 已补上 stable traits 的首版慢更新规则
   - learner profile 现已先生成 `candidate stable traits`，再与 `previousProfile` 做保守合并
   - `openingWillingness / pressureSensitivity / cnSupportNeed` 已采用分级慢更新，避免单次会话直接跳档
   - `preferredEntryStyle / preferredScaffold` 已要求更多 session 证据后才允许切换
   - 当前 stable traits 在 recent evidence 不足时会优先保持旧值，而不是被一次聊天带偏
   - 已通过 `npm run check`

26. 已完成“训练计划如何隐性投射到对话行为” V1 映射文档
   - 已新增 `docs/technical/22-hidden-training-projection-v1.md`
   - 已明确 `stageGoal / weeklyFocus / sessionGoal` 应如何投射到 opening、follow-up、scaffold、correction、wrap-up
   - 已明确“训练目标决定练什么，learner profile 决定怎么练”
   - 已明确 child-facing 体验应是自然聊天，而不是显性课堂指令

27. 已完成 V1 家长报告结构设计
   - 已新增 `docs/technical/23-parent-report-v1-design.md`
   - 已明确 V1 家长报告应回答“最近在练什么、做得好的地方、当前卡点、孩子画像、下一步小目标、家长怎么配合”
   - 已明确 V1 先基于最近 `3` 次 session 汇总，不做重评测和复杂图表
   - 已明确该报告应由 `session summaries + learner profile + learning plan` 共同生成

28. 已完成首版 parent report generator
   - 已新增 `backend/src/hermes/parentReportGenerator.ts`
   - 已新增 `ParentReport` 类型
   - 已可基于 `LearnerProfile + LearningPlan + LearningSnapshot + recent SessionSummaries` 生成结构化家长报告对象
   - 当前输出已包含：`currentFocus / recentStrengths / currentBottleneck / childSnapshot / nextSmallGoal / parentSupportSuggestions`
   - 已通过 `npm run check`

29. 已支持 QQ 指令触发家长报告文字返回
   - 已支持在桥接层识别 `家长报告 / 学习报告 / 成长报告 / report` 等指令
   - 指令触发后会直接返回中文报告文字，不走 TTS
   - 已补上 mock 模式下的本地文件持久化 `learning memory` 与 `session state`，避免多进程桥接下画像丢失
   - 已通过 `npm run check`
   - 已通过本地 smoke，QQ 指令可返回真实家长报告文字

30. 已启动 PostgreSQL 正式持久化接入
   - 已新增 `PostgresLearningMemoryRepository`，正式模式下 `SessionSummary / LearningSnapshot / LearnerProfile` 不再走内存
   - 已新增 `db:migrate` 脚本与 `schema_migrations` 机制
   - 已新增 `backend/db/migrations/002_learning_memory.sql`
   - 已将 `001_init.sql` 中 `children.id / child_id` 相关字段从 `UUID` 调整为 `TEXT`，对齐当前系统使用的字符串 child id
   - 已更新 PostgreSQL README，明确当前 PG / Redis 分工
   - 已通过 `npm run check`

31. 已修正 bridge CLI 在正式存储模式下的资源收尾问题
   - 已为 `AppContainer` 增加 `shutdown()`
   - 已为 PostgreSQL / Redis 单例补上关闭接口
   - 已在 `hermesTutorBridge.ts` 中为本次调用创建的 container 增加 `finally` 资源回收
   - 已恢复 QQ live 文本主链路稳定返回
   - 已通过 live QQ 重新验证文本回复闭环

32. 已形成 V1 阶段性完成度清单
   - 已新增 `docs/technical/24-v1-completion-checklist.md`
   - 已明确当前可表述为“V1 主链路基本完成，可进入阶段性试用”

## Current Focus

当前关注点：

1. 把“LLM 主回复、Hermes 做治理层”的方向彻底固化进工作流文档和下一步计划
2. 把“教育规划层”正式补进架构和任务拆解
3. 基于当前 planner 输出继续微调真实回复，让“教学规划感”存在但不僵硬
4. 收紧 `quick intent` 和 `wrap-up` 的边界
5. 观察 `stage goal / weekly focus / session goal` 注入后，QQ 侧真实回复是否更稳定、更自然
6. 观察“理解难度自适应”在真实孩子测试里是否切换得自然
7. 把 learner profile 从设计稿推进到 runtime 可读、可更新、可回注
8. 继续进行真实试用，观察 learner profile 注入后回复是否更像“越来越懂这个孩子”
9. 继续进行真实试用，并用试用反馈反推 prompt、wrap-up、记忆和规划策略
10. 基于 `22-hidden-training-projection-v1` 继续微调 runtime 行为映射
11. 基于 `23-parent-report-v1-design` 实现首版 parent report generator
12. 继续基于真实试聊微调家长报告措辞与信息密度
13. 接通真实 PostgreSQL 环境并执行 migration，验证正式存储链路
14. 设计并补齐 children / topics 的初始化或 seed 策略
## Next Step

下一步建议：

1. 基于当前 runtime 接入结果继续做试用与调优
2. 收紧 `quick intent` 边界，避免误吃正常聊天
3. 设计并实现更明确的 `wrap-up gating rules`
4. 微调 prompt 中 `stage goal / weekly focus / session goal` 的表达强度
5. 继续进行真实试用，并用试用反馈反推 prompt、wrap-up、记忆和规划策略
6. 观察 `english-only / 英文主+中文托底 / 中文搭桥` 三种模式的实际体感
7. 基于现有 memory signals 生成首版 human-readable learner profile
8. 观察 learner profile 注入后的 live QQ 体感，必要时继续收紧注入强度

## Current Risks

当前已知风险：

1. 当前虽然已经补齐 prompt / governance 文档，但运行时注入强度仍需继续调优，否则回复可能变僵
2. 当前已完成 memory / evaluator / planner 的最小运行时接入，但 planner 输出仍需继续微调，避免回复变得“有规划但更僵”
3. 当前虽已收紧 quick intent 并补上 wrap-up gating，但 live QQ 侧仍需继续观察边界是否稳定
4. 当前中英混杂容错已可用，但词汇映射仍是首版小词表，范围还比较窄
5. 当前 TTS 已支持三档语速，但 live QQ 侧仍需继续验证哪一档最自然
6. 当前“理解难度自适应”已接入，但切换阈值仍是规则首版，后续还需根据真实试用调参
7. 当前 learner profile 已形成首版闭环，但 stable trait 慢更新阈值仍是 V1 规则，后续还需继续调优
8. 当前 sender-session 仍主要依赖本地状态文件，后续仍需决定是否并入 Redis
9. 真实 PostgreSQL / Redis 模式还未启动验证，长期画像闭环仍未真正落地
10. Android 原型可运行，但当前不应与 QQ 主试用链路抢优先级，否则容易再次分散实现重心

## Last Updated

当前状态最后更新于本次会话。
