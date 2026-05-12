# QQBot V1 Mainline

## Purpose

Record the current V1 mainline after comparing Android prototype, WeChat bot exploration, and QQ bot runtime viability.

This document defines the current practical path for the elementary-school English tutor trial.

## Current Decision

The active V1 mainline is:

`QQBot + Hermes + jiajiaoagent backend bridge`

Why this is the mainline now:

1. Android prototype proved the basic conversation flow, but real-device speech input/output was not stable enough for low-friction child trials.
2. WeChat bot text routing worked, but outbound native voice rendering did not become stable enough for V1.
3. QQ bot path now supports a real usable loop with audible voice replies.

## What Is Already Proven

The following path is already usable:

1. child sends QQ text or voice message;
2. QQ bot forwards event into Hermes-side fast path;
3. Hermes bridge calls `jiajiaoagent`;
4. `jiajiaoagent` returns tutor text plus audio file metadata;
5. QQ bot sends native voice reply back to QQ;
6. user can hear the returned voice message.

## Current Product Boundary

Current V1 focus:

- child-facing English speaking practice;
- daily-life topic conversation;
- light correction;
- short guided follow-up;
- low-friction trial through QQ.

Still not the focus of this phase:

- homework OCR;
- exam-paper analysis;
- parent dashboard;
- monthly report automation;
- complex multi-agent orchestration.

## Why QQBot Fits This Phase

QQBot is currently the best trial channel because it gives:

1. lower interaction friction than the Android prototype for immediate testing;
2. a working voice reply loop;
3. reuse of existing Hermes runtime capability on this machine;
4. a faster path to validating whether children will keep speaking with the tutor.

## What The Mainline Should Optimize Next

The next stage should focus on tutoring quality, not transport experimentation.

Priority areas:

1. make tutor replies more child-appropriate and more conversation-driven;
2. add clear session closing and short wrap-up;
3. make session continuity more stable across turns;
4. define a small repeatable trial script for real children.

## Relationship To Other Paths

### Android

Android remains a useful prototype asset, especially for:

- conversation UI structure;
- local STT/TTS packaging ideas;
- future dedicated app direction.

But it is not the current fastest path for V1 validation.

### WeChat Bot

WeChat bot remains an exploration record and may be revisited later.

It is not the current mainline because native voice output did not become stable enough.

## Next Implementation Focus

The repository should now return to the tutoring product itself:

1. improve the tutor reply strategy;
2. add simple session completion and recap behavior;
3. define topic packs for daily-life speaking practice;
4. prepare a small real-child trial flow and record observations.
