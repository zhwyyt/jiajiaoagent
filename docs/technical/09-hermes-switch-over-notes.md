# Hermes Switch-Over Notes

## Goal

Switch the existing Hermes bot runtime on this machine from the old business bridge toward `jiajiaoagent`, without losing the ability to roll back.

## Current Machine Facts

1. Hermes-related workspace exists at `I:\hermes`.
2. Existing Hermes adapters contain hardcoded fast-path bridge hooks for the old `autoribao` flow.
3. Those adapters have now been patched in-place so they can be switched by environment variables instead of only fixed paths.
4. `jiajiaoagent` now exposes a compatible bridge wrapper:

```powershell
I:\jiajiaoagent\backend\scripts\invoke-hermes-tutor-bridge.ps1
```

## Patched Hermes Behavior

Patched files:

- `I:\hermes\weixin.py`
- `I:\hermes\hermes-edit\qqbot.py`

Behavior after patch:

1. `AUTORIBAO_BRIDGE_PS1` now prefers `JIAJIAOAGENT_BRIDGE_PS1` from env if present.
2. `_should_use_autoribao_fast_path(...)` now returns `true` for any non-empty text when:

```text
JIAJIAOAGENT_FAST_PATH=true
```

3. If that env var is not enabled, old `autoribao` trigger behavior stays unchanged.

## Safe Switch Strategy

### Phase 1: Keep old runtime intact by default

Do nothing by default:

- old bridge path remains usable;
- old pattern-based fast path still works.

### Phase 2: Start Hermes with jiajiaoagent switch env

When ready to route traffic to `jiajiaoagent`, start the Hermes bot runtime with:

```powershell
$env:JIAJIAOAGENT_FAST_PATH='true'
$env:JIAJIAOAGENT_BRIDGE_PS1='I:\jiajiaoagent\backend\scripts\invoke-hermes-tutor-bridge.ps1'
```

Then restart the relevant Hermes / bot runtime.

## Quick Local Validation

The new bridge wrapper already works locally:

```powershell
powershell -ExecutionPolicy Bypass -File I:\jiajiaoagent\backend\scripts\invoke-hermes-tutor-bridge.ps1 `
  -Text "My mother is kind" `
  -SenderId "weixin-user-001" `
  -Source "weixin"
```

Expected result:

- JSON output;
- `ok: true`;
- `replyText` contains tutor response;
- same `senderId` keeps session continuity across turns.

## Rollback

To roll back to the old bridge behavior:

1. unset:

```powershell
Remove-Item Env:JIAJIAOAGENT_FAST_PATH -ErrorAction SilentlyContinue
Remove-Item Env:JIAJIAOAGENT_BRIDGE_PS1 -ErrorAction SilentlyContinue
```

2. restart Hermes / bot runtime.

Because the old bridge path remains as the fallback constant, removing those env vars restores the previous behavior.

## Important Caution

There is still an old bot process running on this machine:

```text
node src\qq-bot-napcat.js
```

Do not kill it blindly until the exact launch path and traffic ownership are confirmed. The recommended order is:

1. validate `jiajiaoagent` bridge independently;
2. launch Hermes with switch env vars;
3. verify inbound/outbound tutoring loop;
4. only then disconnect the old runtime if it is confirmed to be replaced.
