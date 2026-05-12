# V1 Completion Checklist

## Purpose

This document records the current V1 completion level for the elementary-school English tutor mainline.

Current V1 mainline:

`QQBot + NapCat + jiajiaoagent backend bridge + Hermes governance + LLM reply`

This is a stage-gate checklist, not a final-product checklist.

## Overall Assessment

Current assessment: **V1 mainline is basically complete and usable for staged trials.**

Meaning:

- the core child-facing loop is usable;
- the governance / memory / reporting baseline exists;
- the project can move from “can we build it” to “how good does it feel in repeated real use”.

It does **not** mean:

- all transport paths are productionized;
- all speech/media paths are fully hardened;
- all long-term teaching-planning loops are complete.

## Checklist

### 1. Trial Mainline

- [x] QQ is the current lowest-friction trial entry
- [x] NapCat whitelist routing is in place
- [x] QQ messages can enter the jiajiaoagent bridge
- [x] bridge can return tutor text to QQ
- [x] QQ path has passed real live-message verification

### 2. Tutor Runtime

- [x] topic packs exist for child daily-life speaking topics
- [x] opening / follow-up behavior is no longer fully template-first
- [x] mixed Chinese-English input has basic tolerance
- [x] high-frequency quick intents are supported
- [x] `重新开始聊天` is supported for single-window QQ usage
- [x] support mode can adapt between English-first and Chinese-bridged help

### 3. LLM Main Reply

- [x] runtime uses real LLM reply generation as the main path
- [x] fallback path still exists when LLM is unavailable
- [x] streaming response parsing has been fixed for the current provider path
- [x] reply source observability exists (`llm / fallback / quick-intent / wrap-up`)

### 4. Hermes Governance

- [x] quick intent boundary has been tightened
- [x] wrap-up has explicit gating instead of only turn-count forcing
- [x] learner profile can influence runtime behavior
- [x] planner output is injected as soft guidance instead of rigid classroom instructions
- [x] child-facing output constraints are documented

### 5. Memory / Planning / Reporting

- [x] session summary / learning snapshot / learner profile types exist
- [x] memory update engine is connected into runtime
- [x] progress evaluator is connected into runtime
- [x] learning planner is connected into runtime
- [x] learner profile generator is connected into runtime
- [x] parent report generator exists
- [x] QQ command can trigger a parent report text response

### 6. Persistence

- [x] mock-mode local persistence exists for multi-process bridge usage
- [x] PostgreSQL learning-memory repository exists
- [x] migration runner exists
- [x] schema migration for learning memory exists
- [x] Redis session-state path exists
- [x] bridge CLI now closes long-lived Redis / PostgreSQL resources after each invocation

### 7. Documentation

- [x] architecture direction has been rewritten to `LLM main reply + Hermes governance + planning layer`
- [x] governance boundary is documented
- [x] prompt contract is documented
- [x] stage-goal / weekly-focus / session-goal design is documented
- [x] learner-profile V1 design is documented
- [x] parent-report V1 design is documented
- [x] workflow status / project status / task list are updated in-repo

## Not Yet Complete

These are intentionally **outside** “V1 mainline basically complete”.

- [ ] repeated live-trial observation is systematized
- [ ] PostgreSQL + Redis formal environment is fully verified end to end
- [ ] children / topics seed strategy is finalized
- [ ] QQ voice/file return path is hardened across repeated live runs
- [ ] prompt / pacing / correction quality is tuned through enough real-child sessions
- [ ] weekly / monthly planning loop is upgraded beyond V1 minimal runtime guidance
- [ ] Android is reconsidered as a formal primary entry

## Recommended V1 Exit Statement

Recommended statement for this stage:

> V1 mainline is complete enough for staged real-world trials.  
> The project should now prioritize trial quality, runtime stability, and teaching-quality tuning over new transport exploration.
