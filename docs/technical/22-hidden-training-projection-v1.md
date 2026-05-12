# Hidden Training Projection V1

## Purpose

This document defines how internal training plans should be projected into conversation behavior without sounding like explicit instruction.

The core rule is:

**the child should feel like they are chatting, while the system is quietly steering toward a training goal.**

## 1. Design Principle

Internal planning can be explicit inside Hermes:

- `stageGoal`
- `weeklyFocus`
- `sessionGoal`

But child-facing conversation should stay implicit.

That means the agent should usually avoid saying:

- today we will practice ...
- your goal is ...
- now say three sentences ...

Instead, the system should hide training intent inside:

- how it opens
- what it follows up on
- how much support it gives
- when it corrects
- when it stops pushing

## 2. Projection Layers

Training plans should project into five conversation layers:

1. opening style
2. follow-up direction
3. scaffold type
4. correction intensity
5. wrap-up emphasis

## 3. StageGoal Mapping

### 3.1 `opening-confidence`

Primary hidden aim:

- keep the child talking

Projection:

- opening:
  - natural chat first
  - low pressure
  - accept almost any topic entry
- follow-up:
  - easy and short
  - avoid stacked questions
- scaffold:
  - either/or prompts
  - very short sentence starters
  - Chinese bridge allowed when needed
- correction:
  - minimal
- wrap-up:
  - praise willingness, not correctness

What it should feel like:

- this is safe
- I can answer something small

### 3.2 `full-sentence-building`

Primary hidden aim:

- move from fragments to fuller sentences

Projection:

- opening:
  - still natural, but can gently reuse the child's words
- follow-up:
  - nudge from one word to one full sentence
- scaffold:
  - sentence starters
  - light recasts
  - one model sentence at a time
- correction:
  - gentle, mainly around sentence completeness
- wrap-up:
  - highlight one fuller sentence success

What it should feel like:

- I said a little more than before

### 3.3 `add-one-more-detail`

Primary hidden aim:

- help the child extend a good answer

Projection:

- opening:
  - no need to push immediately
- follow-up:
  - one more small detail only
  - examples: who, what, with whom, when
- scaffold:
  - tiny extension prompts
  - not full re-teaching
- correction:
  - keep secondary
- wrap-up:
  - emphasize that the child added extra information

What it should feel like:

- I answered, then I added one more thing

### 3.4 `simple-reasoning`

Primary hidden aim:

- gently invite `because`-style thinking

Projection:

- opening:
  - preference-heavy or opinion-friendly topics work better
- follow-up:
  - only ask `why` when the child already has a base answer
- scaffold:
  - one short `because ...` model if needed
- correction:
  - very light
- wrap-up:
  - emphasize one reason idea, even if simple

What it should feel like:

- I said what I think, and a little why

### 3.5 `more-independent-speaking`

Primary hidden aim:

- reduce support and let the child carry more

Projection:

- opening:
  - less leading
- follow-up:
  - more open
- scaffold:
  - delayed help
  - less sentence starter dependence
- correction:
  - still selective, but can be a little firmer
- wrap-up:
  - emphasize independence

What it should feel like:

- I can say more by myself

## 4. WeeklyFocus Mapping

Weekly focus should not be spoken out loud directly in most cases.

Instead:

- `gently encourage full sentences`
  - more sentence starters
  - fewer open abstract prompts

- `gently invite one more detail`
  - more one-step detail follow-ups

- `gently invite one short because sentence`
  - more preference or opinion questions
  - only one reason follow-up at a time

- `keep pressure low`
  - lower correction
  - softer openings
  - fewer back-to-back prompts

## 5. SessionGoal Mapping

Session goals should usually stay invisible.

Examples:

### Internal session goal

- `Gently guide the child toward fuller sentences about my family.`

### Child-facing expression

Not:

- Let's practice fuller sentences about family.

Better:

- Oh, you have a brother? What is he like?
- Nice. Can you say the whole sentence?
- What do you do together?

The goal is not announced.
It is enacted.

## 6. LearnerProfile Interaction

The same training goal should project differently depending on learner profile.

Example:

### Same goal

- `full-sentence-building`

### Child A

- pressure-sensitive
- free-chat-first

Projection:

- natural reply first
- very soft nudge
- almost no explicit correction

### Child B

- lower pressure sensitivity
- direct-practice-ok

Projection:

- quicker move into sentence shaping
- more direct starter prompts

So:

**training goal decides what to improve; learner profile decides how to improve it.**

## 7. Anti-Patterns

The system should avoid:

1. turning internal goals into classroom instructions
2. stacking two or three training goals in one turn
3. correcting too early when confidence is the real bottleneck
4. pushing detail or reasoning before the child has a base answer
5. sounding like a rubric instead of a conversation partner

## 8. V1 Implementation Guidance

V1 should apply hidden training projection through:

1. planner output wording
2. turn strategy selection
3. prompt constraints
4. fallback wording
5. wrap-up wording

It does not require a separate new model.

## 9. Summary

The right behavior is:

- internal plan stays explicit inside Hermes
- outward behavior stays natural for the child

In short:

**the system should train on purpose, but sound unforced.**
