# WeChat Bot V1 Direction

## Purpose

This branch pivots the first trial version away from Android-first voice interaction and toward a WeChat bot entrypoint.

The goal is to validate:

1. whether a child can interact with the English tutor in a lower-friction channel;
2. whether Hermes can coordinate the tutoring flow behind a bot bridge;
3. whether voice input/output can be handled through the bot channel more reliably than the current Android device-side path.

## V1 Entry Flow

Preferred V1 flow:

1. Child sends voice or text message to WeChat bot.
2. Bot bridge receives message event.
3. Bot bridge normalizes payload into Hermes turn request.
4. Hermes loads session context, topic context, and tutoring strategy.
5. Tutor response is returned as:
   - text reply;
   - optional voice reply payload;
   - optional session hint / correction hint.
6. Bot bridge sends response back to WeChat.

## Proposed Modules

### 1. WeChat Bot Bridge

Responsibilities:

- receive inbound WeChat text / voice events;
- download or resolve inbound voice payload when needed;
- call STT when inbound message is voice;
- map inbound message to session id / child id;
- call Hermes-facing tutor service;
- send text and optional voice reply back to WeChat.

### 2. Hermes Tutor Orchestration

Responsibilities:

- determine whether message starts session or continues session;
- load active session state;
- build tutoring turn strategy;
- return structured tutor response;
- persist minimal session state.

### 3. Voice IO Layer

Responsibilities:

- voice-to-text for inbound WeChat voice;
- text-to-voice for outbound tutor reply;
- keep provider boundary isolated from bot bridge and tutoring logic.

## Suggested V1 Scope

In scope:

- one child test account path;
- one topic family or daily-life conversation path;
- inbound text support;
- inbound voice support if bridge can access media reliably;
- outbound text support;
- outbound voice support if TTS pipeline is stable.

Out of scope for first WeChat-bot trial:

- homework OCR;
- monthly report generation;
- parent dashboard;
- multi-child management UI;
- advanced growth analytics.

## Immediate Build Order

1. choose concrete WeChat bot runtime and transport path;
2. define bridge event schema into Hermes;
3. define STT/TTS provider boundary for bot flow;
4. implement minimal inbound text -> tutor reply -> outbound text loop;
5. add voice input and voice output on top of that loop;
6. add session continuity and wrap-up.

## Open Questions

1. Which WeChat bot runtime is preferred in this repo?
2. Will voice STT/TTS be provided by Hermes-adjacent services or inside the bot bridge?
3. Should V1 keep Android as a secondary prototype only, or continue maintaining both in parallel?
