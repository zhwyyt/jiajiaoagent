# Learner Profile V1 Design

## Purpose

This document defines the V1 design for the child's continuously updated learner profile.

The goal is to make Hermes do more than store raw tags.

It should help the system answer:

- what kind of child is this right now?
- what support style fits this child better?
- what is changing recently?
- how should the next conversation adapt?

In short:

**the system should not only remember turns; it should remember the learner.**

## 1. Core Principle

The learner profile should be:

1. continuous
2. cautious
3. actionable
4. readable

That means:

- it updates across many sessions
- it should not overreact to one noisy turn
- it must influence planning and prompting
- it should be understandable by humans, not only by code

## 2. Three Layers

V1 learner profile should have three layers.

### 2.1 Stable Traits

These change slowly.

Examples:

- opening willingness tendency
- pressure sensitivity
- preferred entry style
- preferred support style
- likely confidence pattern

These should require repeated evidence before changing.

### 2.2 Current Stage

This is the current training position.

Examples:

- opening-confidence
- full-sentence-building
- add-one-more-detail
- simple-reasoning
- more-independent-speaking

This layer connects the profile to planner decisions.

### 2.3 Recent Signals

These capture what is happening lately.

Examples:

- more willing to ask questions
- still stops at short answers
- recently needs more Chinese support
- recently sounds more relaxed
- recently handles follow-up better

This layer should be easier to update than stable traits.

## 3. V1 Profile Questions

Hermes should gradually build answers to questions like:

1. Does this child usually open the conversation willingly?
2. Does this child do better with free chat first?
3. Does this child freeze when the interaction feels like a task?
4. Does this child need Chinese support often, sometimes, or rarely?
5. Is the main difficulty confidence, full-sentence output, detail expansion, or reasoning?
6. What kind of follow-up keeps this child talking?

## 4. Suggested V1 Profile Object

Recommended V1 fields:

- `childId`
- `profileVersion`
- `lastUpdatedAt`
- `stableTraits`
- `currentStage`
- `recentSignals`
- `activeSupports`
- `currentHypothesis`

### 4.1 stableTraits

Recommended fields:

- `openingWillingness`
  - `low | medium | high`
- `pressureSensitivity`
  - `low | medium | high`
- `preferredEntryStyle`
  - `free-chat-first | mixed | direct-practice-ok`
- `cnSupportNeed`
  - `rare | occasional | frequent`
- `preferredScaffold`
  - `choice | sentence-starter | open-prompt | mixed`

### 4.2 currentStage

Recommended fields:

- `stageGoal`
- `stageConfidence`
  - `low | medium | high`
- `mainGrowthTarget`

### 4.3 recentSignals

Recommended fields:

- `recentStrengths`
- `recentBottlenecks`
- `recentShiftSummary`
- `recentConversationStyle`
- `recentComprehensionPattern`

### 4.4 activeSupports

These are the supports currently worth using.

Examples:

- `start with natural chat`
- `keep correction minimal`
- `allow short Chinese bridge`
- `push only one more sentence`
- `prefer one follow-up only`

### 4.5 currentHypothesis

This is a concise natural-language internal summary.

Example:

- willing to interact, but becomes tense when the exchange feels like a speaking task
- better with relaxed chat before structured expansion
- currently moving from confidence support toward fuller sentence building

## 5. Evidence Sources

V1 profile updates should use:

1. turn observations
2. session summaries
3. rolling learning snapshot
4. recent planner / evaluator outputs

The profile should not be rewritten from one turn alone unless the signal is very strong and repeated.

## 6. Update Strategy

V1 should prefer:

- slow updates for stable traits
- medium-speed updates for current stage
- fast updates for recent signals

### 6.1 Stable Trait Update Rule

Only update when:

- the same pattern appears across multiple sessions

Examples:

- if several sessions show the child opens with casual questions and reacts badly to scripted prompts,
  strengthen `preferredEntryStyle = free-chat-first`

### 6.2 Recent Signal Update Rule

Update more quickly when:

- the pattern appears in the latest `1 to 3` sessions

Examples:

- recent increase in Chinese support need
- recent improvement in asking questions

## 7. V1 Output Style

The profile should exist in both forms:

### 7.1 Structured Form

Used by code and planner.

### 7.2 Human-readable Summary

Used by developers, parents later, and internal debugging.

Example:

- this child is willing to chat, but becomes less natural when the system sounds instructional
- casual conversation is a stronger entry point than direct drill
- current next step is to turn one-sentence chat into two-sentence expression

## 8. How The Profile Should Affect Conversation

V1 profile must influence at least:

1. opening style
2. support mode switching
3. follow-up difficulty
4. correction intensity
5. prompt wording pressure
6. session goal style

Example:

If profile says:

- `preferredEntryStyle = free-chat-first`
- `pressureSensitivity = high`

Then next session should:

- open with natural chat
- avoid early explicit task-like prompts
- delay structured expansion slightly

## 9. How The Profile Differs From Snapshot

The existing `LearningSnapshot` is mainly:

- trend-oriented
- planner-oriented
- numeric and tag-heavy

The new learner profile should be:

- more child-readable in logic
- more support-style aware
- more explicit about interaction preference

In short:

- `LearningSnapshot` answers: what is trending?
- `LearnerProfile` answers: who is this learner becoming?

## 10. V1 Non-Goals

V1 should not try to:

- psychoanalyze the child
- claim precise personality conclusions
- infer family or clinical conditions
- generate overconfident long-term labels

The profile must stay educational and interaction-focused.

## 11. Example From Current Trial Pattern

Example profile summary:

- opening willingness: medium-high
- preferred entry style: free-chat-first
- pressure sensitivity: medium-high
- cn support need: occasional
- current stage: transition from opening-confidence to full-sentence-building
- main growth target: move from natural short chat into slightly fuller expression

## 12. Recommended Build Order

1. define profile object and storage boundary
2. generate human-readable profile summary from existing memory signals
3. inject profile into planner and prompt
4. later refine stable-trait update rules

## 13. Summary

The learner profile V1 should help Hermes move from:

- remembering signals

to:

- understanding usable patterns about the child

The desired behavior is:

**observe repeatedly -> form a cautious learner profile -> adapt the next session**
