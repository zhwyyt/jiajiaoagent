# V1 Stage Summary

## Purpose

This document summarizes the current V1 stage outcome for `jiajiaoagent` and defines the recommended next-step focus.

## Current V1 Statement

`jiajiaoagent` V1 mainline is now basically complete for staged real-world trials.

Current mainline:

`QQBot + NapCat + backend bridge + Hermes governance + LLM reply`

This means the project has moved beyond “can the loop run” and into “how good and stable does repeated real use feel”.

## What V1 Has Achieved

### 1. Child-Facing Trial Loop Is Usable

The current system can already support a low-friction QQ trial loop for child speaking practice:

- QQ message entry is working
- backend bridge routing is working
- LLM-based tutor reply is working
- session restart is supported
- basic speech-rate control is supported
- mixed Chinese-English input has baseline tolerance
- parent-report text command is supported

### 2. Runtime Direction Has Been Properly Reframed

The project is no longer centered on a rule-dominant reply engine.

The current architecture is:

- LLM decides how to reply in the current turn
- Hermes decides the governance boundary
- planning and memory decide what the child should gradually practice over time

This is a much better fit for a child-speaking tutor than a heavily scripted response system.

### 3. Planning / Memory / Reporting Baseline Exists

V1 now includes first-pass runtime support for:

- learning memory updates
- progress evaluation
- learning planning
- learner profile generation
- learner profile reinjection into runtime behavior
- parent report generation

So the project is no longer just a chat loop. It now has the beginnings of a real tutoring core with memory, planning, and parent-facing summarization.

### 4. Persistence Has Started Becoming Formal

The project now includes:

- PostgreSQL-backed learning-memory persistence
- migration runner support
- Redis session-state path
- mock-mode local persistence for bridge multi-process usage

In addition, the bridge CLI resource-lifecycle issue has been fixed, so Redis/PostgreSQL-backed bridge calls no longer hang waiting on long-lived handles.

## Best Current Assessment

The most accurate stage assessment is:

> V1 mainline is complete enough for staged real-world trials.

This does **not** mean the product is finished.

It means:

- the core loop exists
- the architecture direction is stable
- the runtime is good enough to begin repeated trial-driven refinement

## What Matters Next

The next phase should not focus on finding yet another transport path.

The next phase should focus on:

- reply naturalness
- runtime stability
- child trial quality
- planning-quality tuning
- long-term memory quality

## Recommended V1.1 Focus

### 1. Run Repeated Live QQ Trials

Verify that text reply, voice/file return, and parent-report command stay stable across repeated live sessions.

### 2. Build A Trial Observation Sheet

Record:

- which replies feel natural
- which replies feel awkward
- which follow-up styles keep the child speaking
- where support mode changes feel too abrupt or too weak

### 3. Reduce Remaining “Teaching Script” Feel

Continue tuning:

- planner injection strength
- learner-profile influence strength
- stage-goal / session-goal expression style

The training structure should remain present, but child-facing output should still feel like natural conversation.

### 4. Validate Support-Mode Switching

Observe whether the transition among:

- `english-only`
- `english-with-chinese-support`
- `chinese-bridge-to-english`

feels smooth in real use.

### 5. Tighten Live Runtime Boundaries

Continue validating whether:

- `quick intent` still over-matches
- `wrap-up gating` still interrupts natural turns

under real QQ usage.

### 6. Verify Formal Persistence End To End

Connect and verify real PostgreSQL / Redis usage in repeated runs, including migration execution and long-term memory continuity.

### 7. Finalize Seed / Initialization Strategy

Define a cleaner initialization path for:

- `children`
- `topics`

so new environments require less manual setup.

### 8. Continue Tuning Parent Report Quality

Adjust:

- wording
- length
- density
- readability

so the report feels like a useful parent-facing summary rather than a raw system dump.

## Closing Statement

V1 should now be treated as a usable trial milestone, not just a technical prototype.

The most valuable next work is not adding more channels, but making the current channel feel increasingly natural, stable, and educationally effective.
