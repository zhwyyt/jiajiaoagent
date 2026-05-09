# Hermes Tutor Bridge Skeleton

## Purpose

`backend/src/bridge/hermesTutorBridge.ts` is the first minimal bridge entry that lets Hermes or a bot bridge call `jiajiaoagent` as a tutoring backend target.

It is intentionally shaped like the existing `autoribao` fast-path bridge:

- accepts compact inbound payload;
- returns compact JSON reply;
- keeps minimal sender-scoped session continuity.

## Current Input Shape

Supported fields:

```json
{
  "text": "My mother is kind",
  "senderId": "wechat-user-001",
  "source": "weixin",
  "childId": "trial-child-001",
  "topicId": "my-family",
  "currentLevel": 2
}
```

## Current Output Shape

Example:

```json
{
  "ok": true,
  "handled": true,
  "replyText": "Good job! You talked about your mother. What does your mother like to do?",
  "sessionId": "uuid",
  "topicId": "my-family",
  "promptHint": null,
  "shouldPlayTts": true,
  "isSessionComplete": false,
  "files": [
    {
      "path": "/mnt/i/jiajiaoagent/backend/.bridge-audio/1730000000000-weixin-user-uuid-turn-1.wav",
      "kind": "voice"
    }
  ],
  "correction": {
    "enabled": false,
    "focus": null,
    "mode": "none"
  }
}
```

## Runtime Behavior

1. sender key is computed from `source + senderId`;
2. when sender has no active session, bridge creates one;
3. bridge stores minimal session continuity in `backend/.bridge-state.json`;
4. follow-up turns reuse the same `sessionId`;
5. when tutor flow reports completion, sender session state is cleared.
6. when `shouldPlayTts=true`, bridge tries to synthesize a local `.wav` file and returns a WSL-readable path in `files[].path`.

## Commands

Direct TypeScript entry:

```powershell
npm run bridge:hermes -- --text "Hello" --sender-id test-user --source weixin
```

PowerShell wrapper:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\scripts\invoke-hermes-tutor-bridge.ps1 `
  -Text "My mother is kind" `
  -SenderId "wechat-user-001" `
  -Source "weixin"
```

## Current Decisions

1. default to `MOCK_STORAGE=true` when no database or redis env is configured;
2. keep bridge independent from HTTP routes;
3. keep current tutor topic default as `my-family`;
4. optimize for fast Hermes integration first, not long-term persistence;
5. use Windows built-in `System.Speech.Synthesis.SpeechSynthesizer` first for outbound WeChat voice reply validation.

## Next Integration Step

The next real switch-over step is to let Hermes reuse this bridge instead of the current `autoribao` business target, while preserving the existing Weixin / QQ transport layer already present in `I:\hermes`.
