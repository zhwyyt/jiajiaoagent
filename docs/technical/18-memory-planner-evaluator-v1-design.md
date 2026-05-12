# Memory Planner Evaluator V1 Design

## Purpose

This document defines the V1 design for three backend modules:

1. `memory-update-engine`
2. `learning-planner`
3. `progress-evaluator`

It turns earlier brainstorming into a more implementation-ready contract.

This document should be read together with:

- `docs/technical/03-system-architecture.md`
- `docs/technical/06-hermes-orchestration-modules.md`
- `docs/technical/17-stage-goal-and-session-goal-mechanism.md`

## 1. V1 Design Goal

The V1 goal is not to build a perfect education engine.

The V1 goal is to make the system able to:

- remember high-value learning signals;
- set a stable stage goal;
- derive a practical weekly focus;
- produce a lightweight session goal;
- judge whether the child is improving enough to keep or change direction.

## 2. Module Relationship

Suggested order:

1. each turn produces raw conversation signals
2. `memory-update-engine` extracts structured learning memory
3. `progress-evaluator` reviews recent memory and trend
4. `learning-planner` decides:
   - current stage goal
   - weekly focus
   - session goal

In short:

**memory extracts, evaluator judges, planner decides.**

## 3. Shared V1 Objects

### 3.1 Turn Observation

V1 turn observation should capture:

- `sessionId`
- `childId`
- `topicId`
- `turnIndex`
- `childUtteranceText`
- `agentReplyText`
- `wasChildSilentOrRefusing`
- `usedChineseBridge`
- `usedSentenceStarter`
- `neededEitherOrPrompt`
- `neededRetryPrompt`
- `correctionGiven`
- `correctionAccepted`
- `answerLengthBucket`
- `fullSentenceLikely`
- `addedDetailLikely`
- `reasoningLikely`

This object does not need perfect NLP precision in V1.

It only needs enough signal to support planning.

### 3.2 Session Summary V1

Recommended fields:

- `sessionId`
- `childId`
- `topicId`
- `startedAt`
- `endedAt`
- `turnCount`
- `engagementLevel`
- `mainStageSignal`
- `bestSentence`
- `mainBottleneck`
- `mainStrength`
- `usedChineseBridgeCount`
- `fullSentenceCount`
- `detailAnswerCount`
- `reasonAnswerCount`
- `retryAcceptedCount`
- `sessionGoal`
- `sessionGoalAchieved`
- `nextStepTarget`

### 3.3 Learning Snapshot V1

This is the recent roll-up view used by evaluator and planner.

Recommended fields:

- `childId`
- `currentStageGoal`
- `currentWeeklyFocus`
- `lastStageReviewedAt`
- `recentSessionsCount`
- `recentFullSentenceRate`
- `recentDetailRate`
- `recentReasonRate`
- `recentChineseBridgeRate`
- `recentRetryAcceptanceRate`
- `recentSilenceRate`
- `topBottlenecks`
- `topStrengths`
- `preferredTopics`
- `supportLevel`

## 4. Memory Update Engine

### 4.1 Responsibility

The memory engine should:

- convert raw turns into structured learning memory
- update session summary
- update bottleneck / strength tags
- update rolling learning signals

It should not decide long-term teaching direction by itself.

### 4.2 Inputs

V1 inputs:

- recent turn messages
- turn observations
- topic context
- current session goal
- current child profile snapshot

### 4.3 Outputs

V1 outputs:

1. `session-summary-update`
2. `bottleneck-tags-update`
3. `strength-tags-update`
4. `rolling-signal-update`

### 4.4 Suggested Bottleneck Tags

Keep V1 small and practical.

Recommended:

- `afraid_to_speak`
- `output_too_short`
- `needs_sentence_starter`
- `needs_cn_bridge`
- `cannot_extend_answer`
- `weak_reason_expression`
- `low_retry_willingness`

### 4.5 Suggested Strength Tags

Recommended:

- `willing_to_speak`
- `accepts_retry`
- `can_answer_in_full_sentence`
- `can_add_detail`
- `can_give_simple_reason`
- `responds_well_to_choice_prompt`
- `likes_topic_family`
- `likes_topic_food`

### 4.6 Update Strategy

V1 should prefer:

- repeated signal over one-off noise

Examples:

- one silent turn should not immediately create `afraid_to_speak`
- repeated fragment answers across sessions can strengthen `output_too_short`

### 4.7 V1 Implementation Style

Recommended:

- rule-first extraction
- optional LLM summary assist later

Why:

- easier to debug
- easier to explain
- lower risk of over-interpreting child behavior

## 5. Progress Evaluator

### 5.1 Responsibility

The evaluator should answer:

- is the child improving?
- is the current stage goal still appropriate?
- should the planner keep, advance, or temporarily step back?

It should not directly generate child-facing conversation.

### 5.2 Inputs

V1 inputs:

- last `3 to 5` session summaries
- current learning snapshot
- current stage goal
- active bottlenecks
- active strengths

### 5.3 Outputs

V1 outputs:

- `stageGoalReviewResult`
- `progressSignals`
- `recommendedStageAction`

Recommended `recommendedStageAction` values:

- `keep`
- `advance`
- `fallback`
- `watch`

### 5.4 Suggested Evaluation Dimensions

V1 should mainly look at:

1. confidence
   - silence / refusal trend
   - willingness to retry

2. sentence completeness
   - fragment to full-sentence progress

3. answer expansion
   - whether child adds one more detail

4. simple reasoning
   - whether child can answer `why / because`

5. support dependence
   - whether child still needs heavy scaffolds every turn

### 5.5 Example Evaluator Rules

#### Keep Current Goal

Use when:

- the current bottleneck is still clearly present
- progress exists but is not yet stable

#### Advance

Use when:

- current goal indicators improved across several sessions
- next-stage indicators are beginning to appear

Example:

- full-sentence rate is now stable
- but detail rate remains low
- then move from `full-sentence-building` to `add-one-more-detail`

#### Fallback

Use when:

- confidence drops sharply
- silence / refusal rises
- child seems overloaded

Example:

- planner can temporarily move back to `opening-confidence`

#### Watch

Use when:

- evidence is mixed
- not enough recent sessions
- one bad session may be noise

### 5.6 V1 Decision Model

Recommended:

- explicit rules first
- simple thresholds
- no fully autonomous stage invention

## 6. Learning Planner

### 6.1 Responsibility

The planner should decide:

- current stage goal
- weekly focus
- support level
- topic rotation
- session goal

This module is the main owner of educational direction.

### 6.2 Inputs

V1 inputs:

- current learning snapshot
- evaluator result
- recent session summaries
- preferred / overused topics
- current topic availability

### 6.3 Outputs

V1 outputs:

#### Planner Output Object

- `stageGoal`
- `weeklyFocus`
- `supportLevel`
- `correctionMode`
- `topicRotationRecommendation`
- `sessionGoal`
- `parentFacingNoteSeed`

### 6.4 Support Level

V1 suggested values:

- `high-support`
- `medium-support`
- `light-support`

#### High Support

Use when:

- child is shy
- child needs sentence starters often
- Chinese bridge is frequent

#### Medium Support

Use when:

- child can speak but still needs structured follow-up

#### Light Support

Use when:

- child can usually respond independently

### 6.5 Correction Mode

V1 suggested values:

- `minimal`
- `gentle`
- `focused`

#### Minimal

- confidence first
- mostly keep conversation flowing

#### Gentle

- correct lightly when useful

#### Focused

- still only one correction point at a time
- but more consistent around a chosen pattern

### 6.6 Weekly Focus Rules

V1 rules:

- keep only `1 to 3` items
- prefer behavior + expression goals over abstract grammar labels

Good examples:

- answer in full sentences
- add one more detail
- try one short because sentence

Bad examples:

- master present tense usage
- improve syntax production quality

### 6.7 Topic Rotation Recommendation

Planner should recommend:

- `repeat-safe-topic`
- `mix-safe-and-growth-topic`
- `introduce-next-topic`

Examples:

#### For `opening-confidence`

- repeat highly familiar topics

#### For `full-sentence-building`

- use familiar topics where sentence starters work well

#### For `simple-reasoning`

- use preference-heavy topics like food, hobbies, weather choices

### 6.8 Session Goal Derivation

Planner must follow:

- one small goal only
- emotionally safe
- linked to current stage

#### Example Mapping

If `stageGoal = opening-confidence`

- `sessionGoal = answer 4 easy questions`

If `stageGoal = full-sentence-building`

- `sessionGoal = say 3 full sentences about family`

If `stageGoal = add-one-more-detail`

- `sessionGoal = add one more detail after two answers`

If `stageGoal = simple-reasoning`

- `sessionGoal = say one because sentence`

## 7. Parent Summary Generator Seed

Planner does not need to write the final parent note in V1.

But it should output seed information:

- current focus
- recent improvement
- current bottleneck
- one suggested parent support action

This lets a later formatter produce the final parent-facing text.

## 8. Recommended Storage Boundary

V1 storage should separate:

### Long-term

- child profile
- stable bottlenecks / strengths
- stage-goal history

### Medium-term

- recent session summaries
- weekly focus
- recent evaluation snapshot

### Short-term

- active session goal
- current support level
- current topic rotation state

## 9. V1 Non-Goals

This design does not try to do:

- detailed curriculum sequencing
- phonics / pronunciation teaching plan
- exam-prep pathing
- homework assignment engine
- precise level scoring

## 10. Recommended Build Order

Implementation should follow this order:

1. implement `memory-update-engine` minimal fields
2. implement `progress-evaluator` with rule-based review
3. implement `learning-planner` with stage-goal + session-goal output
4. connect planner output back into prompt / turn strategy
5. later add parent-summary formatting

## 11. Summary

For V1:

- memory should be small but actionable
- evaluator should be stable, not clever
- planner should be simple, explicit, and child-safe

The desired system behavior is:

**observe -> summarize -> evaluate -> plan -> feed back into conversation**
