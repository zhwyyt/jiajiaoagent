# Parent Report V1 Design

## Purpose

This document defines the V1 parent-facing report for the speaking companion system.

The V1 goal is not to create a school-style report card.

The V1 goal is to help parents understand:

1. what the child is currently practicing
2. what is going better
3. what is still hard
4. how to help simply at home

In short:

**the report should make the learning direction visible without pretending to be a formal assessment.**

## 1. Product Role

The parent report should answer a practical trust question:

- is the child just chatting, or actually growing?

So the report needs to show:

- clear direction
- real observed patterns
- small next steps

It should avoid:

- fake precision
- exam-style scoring
- too many charts
- long educational jargon

## 2. V1 Scope

The V1 parent report should be:

- short
- readable
- actionable
- based on recent evidence

Recommended aggregation window:

- recent `3` sessions

or later:

- current week

V1 should prefer recent `3` sessions because it is easier to explain and debug.

## 3. V1 Report Sections

The V1 report should contain six sections.

### 3.1 Current Focus

Explain what the child is mainly practicing right now.

Sources:

- `LearningPlan.stageGoal`
- `LearningPlan.weeklyFocus`
- `LearnerProfile.currentStage.mainGrowthTarget`

Example:

- Right now the main focus is helping the child move from short replies toward fuller sentences.

### 3.2 Recent Strengths

Show what the child is doing better recently.

Sources:

- recent `SessionSummary.mainStrength`
- `LearnerProfile.recentSignals.recentStrengths`
- recent engagement pattern

Example:

- The child is willing to keep interacting.
- The child is starting to answer in more complete sentences.

### 3.3 Current Bottleneck

Name the main thing that still blocks progress.

Sources:

- recent `SessionSummary.mainBottleneck`
- `LearningSnapshot.topBottlenecks`
- `LearnerProfile.recentSignals.recentBottlenecks`

Example:

- The child can start chatting, but answers still stop too quickly when speaking becomes more formal.

### 3.4 Child Snapshot

A one-paragraph parent-readable learner image.

Sources:

- `LearnerProfile.currentHypothesis`
- `LearnerProfile.stableTraits`

This section is important because it explains not just what the child can do, but how the child tends to participate.

Example:

- Your child is willing to interact and can enter conversation naturally, but becomes less steady when speaking feels like a task. A relaxed chat opening works better than pushing practice too early.

### 3.5 Next Small Goal

Give one small next-step target only.

Sources:

- `LearningPlan.sessionGoal`
- `LearnerProfile.currentStage.mainGrowthTarget`

Example:

- Next, we want the child to answer with one full sentence and then add one small extra detail.

### 3.6 Parent Support Suggestion

Give one or two concrete home support suggestions.

Sources:

- `LearningPlan.parentFacingNoteSeed.suggestedParentSupport`
- learner profile support style

Example:

- After your child answers, ask only one small follow-up instead of correcting right away.
- If your child gets stuck, allow Chinese first, then help turn the idea into one short English sentence.

## 4. Suggested V1 Data Object

Recommended object:

- `childId`
- `generatedAt`
- `basedOnSessionIds`
- `currentFocus`
- `recentStrengths`
- `currentBottleneck`
- `childSnapshot`
- `nextSmallGoal`
- `parentSupportSuggestions`

## 5. Source Mapping

Recommended source mapping:

### `currentFocus`

Use:

- `LearningPlan.weeklyFocus[0]`
- fallback to `LearnerProfile.currentStage.mainGrowthTarget`

### `recentStrengths`

Use:

- top `1 to 3` items from `LearnerProfile.recentSignals.recentStrengths`
- optionally reinforce with recent `SessionSummary.mainStrength`

### `currentBottleneck`

Use:

- `LearningSnapshot.topBottlenecks[0]`
- convert internal tags into parent-readable language

### `childSnapshot`

Use:

- `LearnerProfile.currentHypothesis`
- optionally soften tone for parent readability

### `nextSmallGoal`

Use:

- `LearningPlan.sessionGoal`
- if too internal, rewrite in parent-readable form

### `parentSupportSuggestions`

Use:

- `LearningPlan.parentFacingNoteSeed.suggestedParentSupport`
- add one learner-profile-aware suggestion if useful

## 6. Translation Rules

Internal signals should not be exposed raw.

Example conversions:

- `output_too_short`
  -> `answers still stop too quickly`

- `needs_sentence_starter`
  -> `the child often needs a little help to begin a full sentence`

- `needs_cn_bridge`
  -> `the child still benefits from Chinese support before finishing the idea in English`

- `afraid_to_speak`
  -> `confidence drops when speaking feels more difficult`

The report should read like a thoughtful teacher note, not like debug output.

## 7. Tone Rules

The parent report tone should be:

- calm
- clear
- non-alarming
- specific

Avoid:

- overpraise
- harsh diagnosis
- fixed labels
- language that sounds clinical or final

Good style:

- right now
- recently
- tends to
- benefits from
- next we want to help the child ...

Bad style:

- your child is weak at ...
- your child cannot ...
- your child has a problem with ...

## 8. Example V1 Report

Example:

- Current focus:
  - Right now the main focus is helping the child move from short replies toward fuller sentences.

- Recent strengths:
  - Your child is willing to keep interacting.
  - Your child can enter conversation naturally through simple questions and casual chat.

- Current bottleneck:
  - When speaking starts to feel more like a task, answers still become shorter and less natural.

- Child snapshot:
  - Your child is willing to interact and can join casual conversation, but becomes less steady when speaking feels formal. A relaxed chat opening works better than pushing practice too early.

- Next small goal:
  - Next, we want to help your child answer with one full sentence and then add one small extra detail.

- Parent support suggestion:
  - After your child answers, ask only one small follow-up question.
  - Try not to correct too early; keep the conversation moving first.

## 9. V1 Implementation Guidance

V1 should be built as:

1. a structured internal object
2. a formatter that turns it into parent-readable text

Recommended pipeline:

- gather recent summaries
- load latest learner profile
- load current learning plan
- generate report object
- later render as text or UI

## 10. Non-Goals

V1 should not try to include:

- numeric scoring
- ranking
- pronunciation grades
- detailed grammar breakdowns
- large historical charts

## 11. Summary

The V1 parent report should make growth visible in a light, trustworthy way.

It should answer:

- what is happening
- what is improving
- what still needs help
- what the parent can do next

In short:

**the child experiences natural conversation; the parent sees purposeful growth.**
