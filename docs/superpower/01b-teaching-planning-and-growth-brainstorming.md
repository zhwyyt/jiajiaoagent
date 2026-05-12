# Brainstorming - 教学规划与成长记录

## 1. Purpose

本文件用于补充当前项目在“教学规划”和“成长记录”上的产品设计脑暴结论。

目标不是把系统做成学校式教务平台，而是让这个口语陪练产品具备：

- 长期训练方向
- 可持续的成长判断
- 能落到下一次对话中的教学决策

一句话说：

不能只会聊天，还要知道孩子接下来该怎么练。

## 2. Core Design Question

要回答的不是只有：

- 这一句怎么回？

还要回答：

- 这次对话主要在练什么？
- 这一周主要该练什么？
- 这个孩子现在最卡的地方是什么？
- 哪些问题先放一放，哪些问题必须反复练？
- 怎么判断孩子是真的进步了，而不是只是聊得开心？

## 3. Product Positioning

教学规划层不应该让产品变成：

- 硬邦邦的作业系统
- 像学校打卡
- 每天给孩子很多任务
- 每轮都强行纠错

它更适合成为：

- 后台的轻量教学大脑
- 帮陪练 agent 决定训练优先级
- 帮家长看懂孩子最近在提升什么

## 4. Three Time Scales

教学规划和成长记录必须同时覆盖三个时间尺度。

### 4.1 Turn Level

关注：

- 这一句怎么接
- 这一轮要不要纠错
- 这一轮要不要追问
- 孩子现在是卡词、害怕，还是只是不想说

### 4.2 Session Level

关注：

- 这一次对话主要练什么
- 这一场更偏自由表达，还是偏句型强化
- 这次结束后最值得带走的一个改进点是什么

### 4.3 Week / Month Level

关注：

- 当前阶段最该优先提升什么
- 这一周要多练哪些 topic / sentence patterns / speaking moves
- 这个孩子最近是在“敢开口”阶段，还是“扩句”阶段，还是“减少中文桥接”阶段

## 5. Teaching Planning Principles

### 5.1 Confidence First

首要目标仍然是：

- 让孩子愿意继续开口

所以教学规划不能把系统推向“每次都像上课”。

### 5.2 One Main Focus At A Time

同一阶段最好只抓 1 到 2 个主重点。

例如：

- 本周重点是“完整句回答”
- 下周重点是“说完一句再补一个细节”

而不是同时抓：

- 语法
- 发音
- 词汇
- 时态
- 逻辑展开

### 5.3 Planning Must Affect Conversation

如果规划只是写在后台，但下一次对话里完全感觉不到，那这个规划就是空的。

所以训练重点必须能回注入：

- topic 选择
- prompt 策略
- follow-up 方式
- 纠错强度
- wrap-up 提示

### 5.4 Growth Record Must Be Actionable

成长记录不应只存“好看”的统计。

应该优先存：

- 能影响下一次训练决策的信息

## 6. What The System Should Plan

第一版教学规划建议至少包含 5 类内容。

### 6.1 Current Main Stage

用于判断孩子当前处于哪个训练阶段。

建议首版阶段：

1. `opening-confidence`
   - 重点是敢开口

2. `full-sentence-building`
   - 重点是从单词 / 短语到完整句

3. `add-one-more-detail`
   - 重点是能多说一点

4. `simple-reasoning`
   - 重点是能回答 `why / because`

5. `more-independent-speaking`
   - 重点是减少过多支架依赖

### 6.2 Weekly Focus

每周只保留 1 到 3 个重点。

示例：

- 用完整句回答
- 多说一个细节
- 遇到卡词时先继续表达，不要立刻沉默

### 6.3 Topic Rotation

规划层需要决定：

- 哪些 topic 该继续复练
- 哪些 topic 可以先放一放
- 哪些 topic 更适合当前阶段

比如：

- 害怕开口的孩子先多用 `my-family` / `favorite-food`
- 能说一些了，再慢慢加 `school-day` / `friends`

### 6.4 Correction Strategy

规划层要决定当前更适合：

- 基本不纠错
- 轻纠错
- 只盯一个固定错误

### 6.5 Parent-Facing Suggestion

第一版不做长报告，但可以生成极简建议：

- 最近主要在练什么
- 家长在旁边怎么配合
- 下次可以鼓励孩子怎么说

## 7. What Should Be Recorded In Growth Memory

成长记录建议分为 4 层。

### 7.1 Stable Profile

变化较慢的信息：

- child id
- age range
- current speaking stage
- preferred encouragement style
- common confidence pattern

### 7.2 Ongoing Learning Signals

会逐步变化的信息：

- average answer length trend
- full-sentence rate
- follow-up success rate
- Chinese-bridge reliance
- retry willingness
- self-initiated speaking rate

### 7.3 Bottlenecks And Strengths

最有价值的结构化记录：

#### bottlenecks

- afraid_to_speak
- output_too_short
- needs_sentence_starter
- needs_cn_bridge
- cannot_extend_answer
- weak_reason_expression

#### strengths

- willing_to_retry
- responds_to_choice_prompts
- likes_family_topics
- can_give_simple_reasons
- accepts_correction_well

### 7.4 Session Summaries

每次 session 结束后至少记录：

- main topic
- best sentence
- main bottleneck
- one success
- one next-step target
- whether the child stayed engaged

## 8. What Should Be Visible To Parents

第一版家长可见信息要非常克制。

建议只显示：

1. 本周练了几次
2. 当前阶段重点
3. 最近做得好的地方
4. 最近最该帮孩子的一件事

不建议第一版就显示：

- 很多图表
- 复杂分数
- 类似考试排名的东西

## 9. How Planning Should Feed Back Into Conversation

规划层产物必须能直接影响下一次会话。

建议至少影响以下 6 个点：

1. opening 风格
2. topic 推荐顺序
3. follow-up 难度
4. 是否优先扩句还是优先说理由
5. 纠错频率
6. wrap-up 时强调什么

示例：

如果系统判断孩子最近主要问题是：

- `output_too_short`

那么下一次 session 更应倾向：

- 多用 sentence starter
- 多用 `tell me one more thing`
- 少做语法纠错

如果系统判断孩子主要问题是：

- `afraid_to_speak`

那么下一次 session 更应倾向：

- 更熟悉的 topic
- 更柔和的 opening
- 更多 either/or prompts
- 少追问，先保住节奏

## 10. Suggested V1 Outputs

第一版建议先做 4 类输出。

### 10.1 Child-Facing Session Feedback

- 你今天哪里说得好
- 下次只练一个小目标

### 10.2 Parent-Facing Weekly Note

- 这周孩子主要在练什么
- 最近更顺的点
- 最近最卡的点
- 家长怎么配合一句话

### 10.3 Internal Teaching Focus

只给系统内部使用：

- active priorities
- topic rotation
- correction mode
- support level

### 10.4 Progress Evaluation Snapshot

用于判断是否升级阶段：

- confidence improving?
- answer length improving?
- detail adding improving?
- Chinese dependence reducing?

## 11. V1 Scope Boundary

第一版教学规划和成长记录不追求：

- 精确语言能力测评
- 严格 CEFR 对标
- 发音打分体系
- 复杂老师式周报
- 自动生成很多家庭作业
- 太细的知识点树

第一版追求的是：

- 能判断方向
- 能抓住重点
- 能影响下一次陪练

## 12. Main Risks

### 12.1 Over-Planned Experience

如果规划感太强，孩子会觉得像上课，不像聊天。

### 12.2 Useless Data Collection

如果记录很多字段，但不会反过来影响教学策略，就会越做越重。

### 12.3 False Precision

第一版不要假装能非常准确地评估语言能力。

更适合使用：

- 趋势
- 阶段
- 高价值标签

而不是大量伪精确分数。

## 13. Suggested V1 Functional Modules

围绕教学规划和成长记录，第一版建议拆成 4 个后台模块：

1. `memory-update-engine`
   - 抽取 bottleneck / strength / session summary

2. `learning-planner`
   - 生成周重点、topic rotation、support level

3. `progress-evaluator`
   - 判断有没有从一个阶段进入下一个阶段

4. `parent-summary-generator`
   - 输出简短家长可读说明

## 14. Open Questions For Next Step

下一步需要进一步拍板的问题：

1. 当前 speaking stage 最多保留几档最合适
2. weekly focus 最多显示几项不会过重
3. parent-facing 输出是按周生成，还是按最近 3 次 session 生成
4. progress evaluator 第一版到底用规则判断，还是 LLM + 规则混合判断
5. planner 是否要区分“表达能力目标”和“情绪 / 信心目标”

## 15. Conclusion

当前项目下一阶段不应只做“更会聊天”。

还应明确补上：

- 教学规划
- 成长记录
- 阶段评估
- 训练重点回注

最终形态不是：

- `chatbot + summary`

而更接近：

- `speaking companion + teaching planner + growth memory`
