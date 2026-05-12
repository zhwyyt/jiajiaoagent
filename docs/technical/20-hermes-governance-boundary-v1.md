# Hermes Governance Boundary V1

## Purpose

This document defines what Hermes should own in V1, and what it should deliberately not own.

The goal is to avoid both failure modes:

1. everything hardcoded in rules
2. everything delegated to the LLM

V1 needs a practical middle line.

## 1. Core Principle

Hermes should govern the conversation, not replace the conversation.

That means:

- Hermes controls direction
- LLM writes the actual natural reply

In short:

**Hermes governs. LLM speaks.**

## 2. What Hermes Must Own

V1 Hermes should own six areas.

### 2.1 Command Handling

Examples:

- `重新开始聊天`
- speech speed switching
- future language-mode commands

These should stay deterministic.

### 2.2 Session Lifecycle

Examples:

- new session creation
- turn counting
- wrap-up eligibility
- session completion
- restart / reset behavior

### 2.3 Learning Memory Update

Examples:

- session summary update
- bottleneck extraction
- strength extraction
- rolling learning snapshot update

### 2.4 Progress Evaluation

Examples:

- whether to keep the current stage goal
- whether to advance
- whether to fallback
- whether to wait for more evidence

### 2.5 Learning Planning

Examples:

- current stage goal
- weekly focus
- session goal
- support level
- correction mode
- topic rotation recommendation

### 2.6 Output Constraints

Examples:

- keep reply short
- avoid exam tone
- do not overload with multiple tasks
- avoid over-correction
- lower language difficulty when comprehension is weak
- allow brief Chinese support when needed

## 3. What Hermes May Influence Indirectly

Hermes may influence the LLM through:

- prompt inputs
- turn strategy
- support level
- correction mode
- session goal

But Hermes should not usually generate the final wording itself unless:

- quick intent fires
- a command is handled
- LLM is unavailable
- fallback path is needed

## 4. What Hermes Must Not Own

Hermes should not become:

### 4.1 Main Reply Template Engine

Avoid:

- huge if/else reply trees
- one response template per scenario
- teaching-script responses for every case

### 4.2 Long-Term Curriculum Author By Itself

V1 Hermes should support planning, but not invent a huge school-like curriculum tree.

### 4.3 Child-Facing Teaching Narrator

Hermes should not make the product sound like:

- "today's lesson objective is..."
- "now we will practice..."
- "you have completed stage two..."

Those may exist internally, not in the child's main reply stream.

### 4.4 Frontend Interaction Layer

Hermes should not own:

- STT UI behavior
- TTS playback behavior
- button behavior
- transport-specific interaction details

## 5. V1 Rule Scope

V1 rules should be narrow and valuable.

Keep rules mainly for:

1. quick intent
2. command parsing
3. session lifecycle
4. memory tagging
5. stage-goal evaluation
6. learning planning
7. output constraints
8. comprehension-support mode switching

Avoid expanding rules for:

- every emotional nuance
- every topic variant
- every possible child wording

Those belong mostly to the LLM.

## 6. Boundary Between Hermes And LLM

### Hermes decides:

- should we keep pressure low?
- should we favor full-sentence building?
- should we favor one more detail?
- should correction be minimal or focused?
- should wrap-up be allowed?

### LLM decides:

- what exact words to use
- how to sound warm
- how to answer the child's meaning naturally
- how to steer gently without sounding forced

## 7. Boundary Between Hermes And Planner

In current V1, planner lives inside the Hermes-side backend structure.

But logically:

- governance is about this turn
- planning is about this stage

That means:

### Governance owns:

- turn-level behavior
- immediate constraints
- immediate redirection

### Planning owns:

- stage goal
- weekly focus
- session goal

## 8. Boundary Between Hermes And Memory

Memory should supply structured signals.

Hermes should:

- consume memory
- evaluate memory
- plan from memory

Hermes should not:

- store everything as loose free text only
- rely only on vague impressions

## 9. Wrap-Up Boundary

Wrap-up should remain governed by Hermes, not by the LLM alone.

Why:

- wrap-up timing is a product decision
- wrap-up interruption risk is high
- emotional turns can be damaged by badly timed summary behavior

So Hermes should decide:

- whether wrap-up is allowed
- when it should be suppressed

The LLM may help with wording later, but not with the main gating decision.

### Current V1 gating rule

Wrap-up should only be allowed when all of the following are true:

1. turn index is already in the wrap-up zone
2. current reply mode is not `open-chat`
3. the child has already produced enough meaningful turns
4. the latest child turn is not mainly emotional distress
5. the latest child turn is not mainly a real question
6. the latest child turn is not a restart-like command

This keeps wrap-up from appearing just because the conversation became long enough.

## 10. Quick Intent Boundary

Quick intent remains valid in V1, but should stay small.

Good quick intents:

- hello
- who are you
- what can you do
- thanks
- bye

Bad quick intent expansion:

- trying to cover every emotional or topical variant with rules

### Current V1 matching rule

Quick intent should prefer conservative matching:

1. only very short standalone utterances
2. exact normalized phrases first
3. avoid substring-style catching inside normal conversation

The goal is to preserve natural LLM replies for ordinary chat.

## 11. Fallback Boundary

Fallback exists for resilience, not for product direction.

Fallback should:

- keep the system running when LLM fails
- provide acceptable simple replies

Fallback should not:

- become the dominant tutoring mode again

## 12. Governance Success Criteria

Hermes governance is working well when:

1. replies stay natural
2. planning direction is still visible
3. wrap-up does not interrupt key emotional moments
4. rules remain understandable
5. adding one more topic does not require many new branches

## 13. Governance Failure Smells

Warning signs:

1. too many special-case branches
2. planner outputs exist but do not affect behavior
3. child replies sound like they are inside a lesson script
4. quick intent catches too much normal conversation
5. wrap-up appears at awkward moments

## 14. V1 Near-Term Governance Tasks

The next governance work should focus on:

1. finalizing prompt contract
2. tightening quick intent scope
3. formalizing wrap-up gating
4. making planner output visible but subtle
5. keeping the LLM free enough to sound natural

## 15. Summary

V1 Hermes should be:

- strict about structure
- light on wording
- conservative about rules
- clear about planning

The best short description is:

**Hermes should quietly steer, not loudly perform.**
