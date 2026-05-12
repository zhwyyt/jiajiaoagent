# Weixin Voice Output Silk Plan

## Purpose

Define the next-step implementation plan for outbound WeChat bot voice replies after confirming that:

1. the current bridge can generate reply audio locally;
2. Hermes Weixin adapter can read and submit outbound voice media;
3. `.wav` voice output is still not rendered as a visible voice bubble in the WeChat client.

## Confirmed Findings

### Official Capability Signal

From Tencent's official `openclaw-weixin` materials:

- `voice_item` is described as `Voice (SILK encoded)`;
- official plugin dependencies include `silk-wasm`;
- public examples for outbound voice are much less explicit than text/image/video/file, but the type definition strongly suggests SILK is the intended voice payload format.

Working conclusion:

- WeChat bot outbound voice should be treated as a **SILK-first** capability, not a generic audio upload capability.

### Local Runtime Findings

We have already verified:

1. `jiajiaoagent` bridge can generate reply audio files;
2. bridge can return outbound media paths to Hermes;
3. live WSL `weixin.py` can read those files;
4. `send_voice()` is invoked successfully;
5. `.wav` still does not show as a visible voice message in the client.

Working conclusion:

- continuing to optimize `.wav` output is low-value;
- the next serious route is `TTS -> WAV -> SILK -> Weixin voice_item`.

## Product Decision

### Recommended V1 Boundary

For the current trial version, define the WeChat bot MVP boundary as:

- inbound text: supported
- inbound voice: supported
- outbound text: supported
- outbound voice bubble: **deferred from MVP blocking scope**

This keeps the first child-facing WeChat trial usable while the native voice-output pipeline is built separately.

### Recommended Follow-up Milestone

Create a dedicated follow-up milestone:

- `Weixin Native Voice Output`

Goal:

- make tutor replies appear as visible WeChat voice bubbles using a SILK-based outbound path.

## Technical Plan

### Target Pipeline

Recommended output path:

1. tutor reply text
2. local TTS synthesis to `.wav`
3. `.wav` to `.silk` conversion
4. bridge returns `.silk` media path
5. Hermes Weixin adapter sends SILK voice media

### Responsibility Split

#### 1. Bridge Layer

Keep audio generation responsibility in the bridge:

- generate `.wav` from reply text;
- convert `.wav` to `.silk`;
- return final outbound media path in `files[].path`;
- prefer returning only the final `.silk` file to Hermes.

Reason:

- bridge already owns the reply payload shape;
- bridge already runs on the Windows side where the current TTS path is working;
- this keeps Weixin adapter simpler and transport-focused.

#### 2. Hermes Weixin Adapter

Keep adapter responsibility minimal:

- read `files[].path`;
- detect `.silk`;
- send it as `ITEM_VOICE`;
- preserve logging around media send success/failure.

The adapter should not become the main audio-conversion layer unless absolutely necessary.

#### 3. Conversion Tooling

Need one concrete SILK conversion route.

Recommended evaluation order:

1. reuse Tencent/OpenClaw-related SILK tooling if a straightforward CLI/runtime path exists;
2. evaluate a Node-side or Python-side SILK encoder that can be called from the bridge;
3. only fall back to custom wrapper glue if no stable ready-made path exists.

## Implementation Stages

### Stage 1: Freeze MVP Boundary

Actions:

1. accept current WeChat MVP as `voice input + text output`;
2. stop spending more time on `.wav` rendering behavior;
3. keep current diagnostics in place for future reference.

Success condition:

- team treats outbound voice bubble as a follow-up feature, not a blocker for first trial.

### Stage 2: Pick SILK Conversion Path

Actions:

1. inspect official / near-official SILK tooling around `openclaw-weixin`;
2. choose one local conversion method that can run on this machine repeatedly;
3. verify it can convert one English `.wav` into `.silk`.

Success condition:

- a single local command or script can produce `.silk` from bridge-generated `.wav`.

Current status:

- `backend` already has `silk-wasm` installed;
- bridge prototype already converts `.wav` into `.silk` locally;
- current bridge output already includes:
  - `files[].path`
  - `files[].format = "silk"`
  - `files[].durationMs`
  - `files[].playtimeSeconds`

### Stage 3: Integrate Into Bridge

Actions:

1. add `.wav -> .silk` conversion step after TTS;
2. return only `.silk` in bridge `files`;
3. log generated file type and conversion result.

Success condition:

- local bridge self-test returns `.silk` file path.

### Stage 4: End-to-End WeChat Validation

Actions:

1. restart Hermes gateway;
2. send real WeChat text message;
3. verify visible outbound voice bubble appears;
4. verify playback works on the phone.

Success condition:

- WeChat client shows a real voice bubble instead of only text.

Current status:

- live `weixin.py` has been patched to pass bridge file metadata through to `_send_file()`;
- adapter now accepts `playtimeSeconds` from bridge metadata;
- the next required validation is a real WeChat round-trip after gateway restart.

## Risks

1. available SILK encoder libraries may be incomplete or poorly maintained;
2. WeChat may require more than file extension alone, such as stricter metadata or payload shape;
3. English TTS audio may need sample-rate/channel normalization before SILK conversion;
4. the official public documentation for outbound voice remains thin, so runtime verification is still necessary.

## Immediate Recommendation

Proceed in this order:

1. lock current WeChat MVP boundary as `voice input + text output`;
2. create a focused implementation task for SILK conversion research;
3. avoid more `.wav`-only iterations on the live bot path.
