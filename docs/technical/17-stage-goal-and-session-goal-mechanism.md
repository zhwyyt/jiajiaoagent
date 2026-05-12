# Stage Goal And Session Goal Mechanism

## Purpose

Define how the tutor should decide:

1. the child's current stage goal;
2. the current week's main training focus;
3. the goal of a single session.

This document answers one key product question:

**Should teaching goals be determined through conversation?**

Answer:

**Yes, but not by one conversation alone.**

Goals should be decided by:

- live conversation signals;
- recent historical records;
- planning rules.

## 1. Core Principle

The system should not randomly change the child's teaching direction every session.

Instead, it should use a layered structure:

1. `turn-level observation`
   - what happened in this turn

2. `session-level summary`
   - what was true in this whole conversation

3. `stage-goal decision`
   - what should the child focus on for the next 1 to 2 weeks

4. `session-goal derivation`
   - what this specific session should practice under that stage goal

## 2. Why One Conversation Is Not Enough

One session can be noisy.

For example:

- the child is tired today;
- the child is shy with a new topic;
- the child is distracted;
- speech recognition is worse today;
- the child happens to be in a good or bad mood.

So the planner should not say:

- "today the child was quiet, so the whole stage goal changes."

Instead it should ask:

- is this pattern stable across several sessions?

## 3. Three Layers Of Goal

## 3.1 Stage Goal

Definition:

- the main developmental focus for the next `1 to 2 weeks`

Examples:

- `opening-confidence`
- `full-sentence-building`
- `add-one-more-detail`
- `simple-reasoning`
- `more-independent-speaking`

Properties:

- relatively stable
- not changed every session
- only updated when evidence is strong enough

## 3.2 Weekly Focus

Definition:

- 1 to 3 concrete practice priorities under the current stage goal

Examples:

- answer in full sentences
- add one more detail
- say "because" for simple reasons

Properties:

- more specific than stage goal
- may refresh weekly or every few sessions

## 3.3 Session Goal

Definition:

- the main practice objective of this single conversation

Examples:

- say 3 full sentences about family
- answer one follow-up with one extra detail
- use one "because" sentence

Properties:

- lightweight
- child-facing when needed
- derived from stage goal and weekly focus

## 4. Inputs For Stage Goal Decision

The planner should use three input groups.

## 4.1 Live Conversation Signals

From recent sessions:

- answer length
- full-sentence rate
- follow-up success rate
- amount of Chinese rescue needed
- retry willingness
- silence / refusal frequency
- whether the child can add details
- whether the child can answer simple "why" questions

## 4.2 Historical Trend

From recent `3 to 5 sessions` or `7 to 14 days`:

- is the child improving?
- is one bottleneck repeating?
- is the same support type always needed?
- has one old bottleneck become less important?

## 4.3 Planning Rules

Examples:

- confidence problems outrank grammar polishing
- persistent one-word answers should trigger sentence-building focus
- inability to extend answers should trigger detail-building focus
- stable sentence answers plus failed "why" responses should trigger simple-reasoning focus

## 5. Suggested Stage Goals

First version should keep the stage system simple.

## 5.1 `opening-confidence`

Use when:

- the child often refuses, stays silent, or says very little
- anxiety is more important than structure right now

Main aim:

- keep the child willing to speak

Conversation implications:

- very familiar topics
- low-pressure openings
- more either/or prompts
- almost no correction

## 5.2 `full-sentence-building`

Use when:

- the child usually answers with one word or short fragments
- the child can respond, but not in full sentences yet

Main aim:

- move from fragments to simple complete sentences

Conversation implications:

- heavy use of sentence starters
- repeated full-sentence modeling
- gentle retry prompts

## 5.3 `add-one-more-detail`

Use when:

- the child can already answer in a sentence
- but answers stop too early and do not expand

Main aim:

- extend answers by one more fact or detail

Conversation implications:

- "tell me one more thing"
- one follow-up detail question
- not too much grammar focus

## 5.4 `simple-reasoning`

Use when:

- the child can state preferences or facts
- but struggles with `why / because`

Main aim:

- produce short reason-based speaking

Conversation implications:

- simple "why" prompts
- "because" scaffolds
- easy preference-and-reason topics

## 5.5 `more-independent-speaking`

Use when:

- the child already speaks with decent support
- and now should rely less on scaffolds

Main aim:

- reduce dependency on heavy prompting

Conversation implications:

- fewer sentence starters
- more open but still child-safe prompts
- delayed support instead of immediate rescue

## 6. How To Decide A Stage Goal

Suggested rule for V1:

- do not switch stage goal from a single session
- evaluate after every session
- only consider stage-goal change after `3 to 5 recent sessions`

## 6.1 Suggested Decision Rhythm

1. every turn:
   - collect observation signals

2. every session end:
   - produce session summary
   - update bottlenecks / strengths

3. every `3 to 5 sessions` or about `once per week`:
   - run stage-goal review

4. only switch if:
   - strong repeated evidence exists

## 6.2 Example Upgrade Rules

### Move To `full-sentence-building`

If recent sessions show:

- child is willing to answer
- but most answers are still word / fragment level

### Move To `add-one-more-detail`

If recent sessions show:

- child now produces full sentences
- but often stops after one short sentence

### Move To `simple-reasoning`

If recent sessions show:

- child can answer basic factual questions
- but struggles with simple reasons

### Move Back To `opening-confidence`

If recent sessions show:

- clear increase in silence, refusal, anxiety, or pressure

This is important:

stage movement is not only upward.

The system should allow temporary fallback when confidence drops.

## 7. How Session Goals Are Derived

Session goal should be a light child-practice target derived from:

- stage goal
- weekly focus
- recent bottleneck
- current topic

## 7.1 Derivation Pattern

### If stage goal is `opening-confidence`

Session goal examples:

- answer 4 easy questions
- say 2 complete sentences with help
- stay in conversation for 5 turns

### If stage goal is `full-sentence-building`

Session goal examples:

- say 3 full sentences about family
- answer with "I like ..." or "My ... is ..."
- retry one corrected sentence

### If stage goal is `add-one-more-detail`

Session goal examples:

- add one more detail after each main answer
- say one sentence and one extra fact

### If stage goal is `simple-reasoning`

Session goal examples:

- answer one "why" question
- use one short "because" sentence

## 7.2 Session Goal Constraints

Session goal must be:

- small
- easy to understand
- emotionally safe
- possible within `8 to 10` minutes

The child should not feel they received homework.

## 8. Recommended V1 Decision Model

For V1, use:

**rules first, LLM second**

Meaning:

- stage-goal switching should primarily use explicit rules and thresholds
- LLM can help summarize evidence
- but should not freely invent a new stage goal

This keeps planning more stable and explainable.

## 9. What Should Be Stored

For stage-goal planning, V1 should store:

- current stage goal
- stage-goal confidence
- last review date
- weekly focus list
- recent supporting evidence
- recent bottlenecks
- recent strengths

For session-goal planning, V1 should store:

- session goal
- whether it was achieved
- which support type helped

## 10. Parent-Facing Interpretation

Parents do not need to see internal stage ids.

Instead show simplified descriptions like:

- 当前重点：敢开口说
- 当前重点：把答案说完整
- 当前重点：多说一个细节
- 当前重点：学会说简单原因

## 11. V1 Non-Goals

This mechanism should not try to do:

- exact proficiency scoring
- complex curriculum trees
- many parallel goals
- automatic daily homework scheduling

## 12. Summary

The correct approach is:

- use conversation to discover signals;
- use history to verify patterns;
- use planning rules to set stable stage goals;
- derive lightweight session goals from those stage goals.

In short:

**conversation detects, memory confirms, planner decides, session goal applies.**
