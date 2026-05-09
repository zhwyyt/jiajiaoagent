# Tech Stack Decision

## Project

小学生英语口语陪练 Agent（Android MVP）

## Status

Accepted for MVP

## 1. Decision Summary

MVP 阶段采用以下技术路线：

### Android Client

- Language: Kotlin
- UI: Jetpack Compose
- Navigation: Navigation Compose
- State: ViewModel + Kotlin Coroutines + StateFlow
- Local persistence: DataStore first, Room only if session cache becomes necessary
- Audio playback: Android native TTS for MVP

### Backend / Agent Service

- Language: TypeScript
- Runtime: Node.js
- API style: lightweight HTTP JSON API
- Orchestration layer: Hermes
- Responsibility: conversation orchestration, correction hints, profile updates, training plan generation

### Infrastructure

- Primary database: PostgreSQL
- Cache / short-lived session state / coordination: Redis

### Voice Path

- Input STT: Android `SpeechRecognizer`, prefer on-device recognition when available, otherwise fall back to the default platform recognizer
- Output TTS: Android native `TextToSpeech` on device with English voice / locale selection

## 2. Why This Stack

### 2.1 Kotlin + Jetpack Compose

Reasons:
- Fast path to a clean Android MVP
- Good fit for modern Android UI and navigation
- Easy to iterate on prototype screens
- Clear state-driven structure for conversation flows

### 2.2 Node.js + TypeScript for Agent Service

Reasons:
- Fast for building API prototypes
- Good ergonomics for JSON-heavy orchestration logic
- Easy to model conversation, profile, and plan payloads
- Convenient for later AI service integration

### 2.3 Hermes as Orchestration Layer

Reasons:
- Fits the project's agent-oriented architecture
- Suitable for routing between conversation, memory, planning, and future homework-related capabilities
- Lets us keep product logic in a structured orchestration layer instead of scattering it across controllers
- Matches the earlier project direction already discussed for this repository

### 2.4 PostgreSQL + Redis

Reasons:
- The project has durable learning data that should not stay only in memory
- Student profile, session summary, training plan, and topic progress need structured persistence
- Redis is a good fit for short-lived session state, orchestration context, and transient coordination
- This keeps MVP architecture simple while still preparing for multi-session continuity

Suggested responsibility split:
- PostgreSQL: child profile, topic config, session summary, growth profile, training plans
- Redis: active session state, temporary orchestration context, idempotency / short cache, optional async coordination

### 2.5 DataStore Before Room

Reasons:
- First version should stay light
- Early MVP mainly needs simple preferences and small state snapshots
- Avoid premature schema complexity

Room remains an option if later we need:
- local session history
- offline recent summaries
- richer profile caching

### 2.6 Native Android TTS First

Reasons:
- Fastest integration path
- Low cost
- Good enough for feasibility validation

## 3. Deferred Decisions

### STT Provider

Accepted for MVP:
- use Android `SpeechRecognizer`
- check on-device recognition availability first
- use on-device recognition when available
- otherwise fall back to the default recognizer service

Why:
- fastest path for Android MVP
- no backend audio upload pipeline required in V1
- lower integration complexity and latency for early trial
- still leaves room to swap in cloud STT later if child-speech accuracy is insufficient

Implementation notes:
- request English recognition with `RecognizerIntent.EXTRA_LANGUAGE = "en-US"`
- use `RecognizerIntent.LANGUAGE_MODEL_FREE_FORM`
- enable partial results only if the UX benefits from it
- keep an app-side provider abstraction so this can later be replaced by cloud STT

### Authentication / Multi-user Model

Not a priority for the first internal trial version.

### TTS Engine Choice

Accepted for MVP:
- use Android `TextToSpeech`
- initialize once and reuse while the screen / app scope is active
- prefer an English voice when available
- fall back to a supported English locale if a preferred voice cannot be selected

Why:
- fastest integration path
- low cost
- good enough for first child trial
- avoids introducing backend speech synthesis in V1

Implementation notes:
- check `isLanguageAvailable(...)`
- prefer `en-US`
- inspect `getVoices()` and call `setVoice(...)` when a suitable English voice is available
- call `shutdown()` when the owner is destroyed

## 4. Architecture Boundary

### Android Client Owns

- screen rendering
- navigation
- microphone interaction
- TTS playback
- local UI state
- displaying growth and training summaries

### Backend / Agent Service Owns

- Hermes-based orchestration
- theme-based conversation orchestration
- correction hint generation
- session summary generation
- growth profile updates
- training plan generation

### Infrastructure Owns

- PostgreSQL durable persistence
- Redis transient session state and coordination

## 5. MVP Constraints

The stack must support these priorities:

1. Build fast
2. Keep architecture understandable
3. Allow later replacement of STT / AI providers
4. Avoid over-investing in infrastructure before child trial validation
5. Preserve a clean path from single-agent MVP flow to multi-agent Hermes orchestration
6. Keep voice I/O functional on-device before adding cloud speech services

## 6. Follow-up Implementation Actions

1. Initialize Android project structure under `app/`
2. Initialize backend service structure under `backend/`
3. Define shared request/response payloads in docs first
4. Define Hermes orchestration boundaries before implementing backend routes
5. Implement a minimal voice session loop before advanced profile logic
