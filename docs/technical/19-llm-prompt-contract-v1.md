# LLM Prompt Contract V1

## Purpose

This document defines the V1 contract between:

- Hermes governance / planning outputs
- LLM prompt construction
- LLM reply expectations

The goal is to keep prompt behavior:

- stable
- explainable
- tuneable
- less likely to drift into awkward scripted tutoring

## 1. Core Principle

The LLM should not be asked to do everything.

Role split:

1. Hermes decides:
   - stage goal
   - weekly focus
   - session goal
   - support level
   - correction mode

2. LLM decides:
   - the natural wording of the reply
   - how to sound warm and human
   - how to steer gently without sounding like a worksheet

In short:

**Hermes supplies direction. LLM supplies phrasing.**

## 2. Prompt Layers

V1 prompt should be built from four layers.

### 2.1 System Layer

Stable identity and hard constraints.

Examples:

- warm English speaking buddy
- child-facing
- natural spoken English
- short replies
- no analysis labels
- no exam tone

This layer should change rarely.

### 2.2 Child Context Layer

Durable learner context.

Examples:

- current speaking level
- encouragement style
- recent strengths
- recent bottlenecks

### 2.3 Planning Layer

Educational direction for the current period.

Examples:

- stage goal
- weekly focus
- session goal
- support level
- correction mode

This layer should influence priorities, but not force unnatural wording.

### 2.4 Turn Layer

Live context for the current reply.

Examples:

- recent conversation turns
- latest child utterance
- topic soft guide
- current turn strategy mode

This layer should have the strongest influence on the next reply.

## 3. Required V1 Prompt Inputs

Current V1 prompt should include:

- `child speaking level`
- `encouragement style`
- `current strategy mode`
- `current strategy move`
- `current comprehension support mode`
- `current stage goal`
- `current weekly focus`
- `current session goal`
- `current support level`
- `soft topic title`
- `soft topic goal`
- `recent conversation`
- `latest child message`

Recommended next additions later:

- `top bottlenecks`
- `top strengths`
- `correction mode`
- `topic rotation recommendation`
- `recent progress signals`

## 4. What The Prompt May Ask The LLM To Do

The prompt may instruct the LLM to:

- reply naturally first
- comfort the child when nervous
- accept mixed Chinese-English input
- lower the language difficulty when the child does not understand
- add one very short Chinese support line when needed
- let the child start in Chinese first when they are truly stuck
- guide toward fuller answers
- ask at most one simple follow-up
- softly steer toward the current learning goal

## 5. What The Prompt Must Not Push The LLM To Do

The prompt must not push the LLM to:

- explain grammar like a teacher every turn
- output teaching notes
- output evaluation labels
- sound like a scoring engine
- mention internal stage ids to the child
- hard-force the current topic if the child clearly goes elsewhere

## 6. Current Live Baseline

The current runtime prompt already includes:

- child speaking level
- encouragement style
- turn index
- current strategy mode
- current strategy move
- current comprehension support mode
- current stage goal
- current weekly focus
- current session goal
- current support level
- topic soft guide
- recent conversation
- latest child message

Live implementation:

- `backend/src/hermes/llmTutorResponder.ts`

## 7. System Prompt Rules

V1 system prompt should enforce:

1. sound like a warm real person
2. respond to meaning first
3. comfort before correction when anxious
4. use short spoken English
5. ask at most one simple follow-up
6. avoid analysis / labels / teaching notes
7. treat topic as soft guidance, not hard script
8. reduce language difficulty before repeating pressure
9. return JSON only

## 8. User Prompt Rules

The user prompt should:

1. give enough context to guide the reply
2. avoid overloading the model with too many policy details
3. keep planning information compact
4. keep recent conversation short
5. end with a clear instruction to write the next tutor reply

## 9. Priority Order Inside The Prompt

When signals conflict, the effective priority should be:

1. child's real meaning and emotional state
2. safety and child appropriateness
3. conversation naturalness
4. current session goal
5. weekly focus
6. topic soft guide

Examples:

- if the child sounds anxious, comfort comes before pushing weekly focus
- if the child asks a real question, answer it naturally before steering back

## 10. Session Goal Injection Rule

`session goal` should be injected as:

- a lightweight directional cue
- not a command to mention the goal explicitly

Good effect:

- reply naturally, but lean toward fuller answers

Bad effect:

- "Today we will practice saying three full sentences..."

The child should feel guided, not assigned.

## 11. Weekly Focus Injection Rule

`weekly focus` should influence:

- follow-up style
- expansion style
- correction preference

It should not cause repetitive explicit coaching phrasing every turn.

## 12. Support Level Injection Rule

### High Support

Prefer:

- easier questions
- more sentence starters
- more either/or prompts
- lower pressure

### Medium Support

Prefer:

- one small expansion push
- one follow-up detail

### Light Support

Prefer:

- more open prompts
- delayed support
- less hand-holding

## 13. Correction Mode Injection Rule

### Minimal

- keep flow first
- avoid visible correction unless necessary

### Gentle

- correct lightly when useful

### Focused

- keep correction narrow
- still only one point at a time

## 14. Output Contract

The V1 output contract remains:

```json
{
  "replyText": "...",
  "promptHint": null
}
```

Requirements:

- `replyText` must be child-facing
- `promptHint` is optional helper output
- if JSON is imperfect, parser may still fall back to plain text

## 15. Tuning Risks

### 15.1 Overloaded Prompt

Too many planning fields can make replies stiff.

### 15.2 Over-Steering

If session goal is phrased too strongly, the LLM may sound like a worksheet.

### 15.3 Under-Steering

If stage goal and weekly focus are too weak, the system becomes only pleasant chat.

## 16. V1 Tuning Strategy

Recommended tuning order:

1. preserve naturalness first
2. inject planning softly
3. check whether weekly focus is visible in behavior, not in wording
4. only then tighten correction / planning influence

## 17. Summary

The V1 prompt contract should make the model behave like:

- a natural speaking buddy on the surface
- with a quiet teaching direction underneath

It should not sound like:

- a lesson script
- a grammar checker
- a study-task announcer
