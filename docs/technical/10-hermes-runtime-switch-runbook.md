# Hermes Runtime Switch Runbook

## Purpose

Record the concrete runtime entrypoint and the repeatable switch steps for routing the existing Hermes/NapCat bot traffic into `jiajiaoagent`.

## Confirmed Legacy Runtime

The previously observed process:

```text
node src\qq-bot-napcat.js
```

maps to:

```text
I:\autoweb\autoribao
```

Confirmed supporting files:

- `I:\autoweb\autoribao\package.json`
- `I:\autoweb\autoribao\start-qq-bot-napcat.bat`
- `I:\autoweb\autoribao\src\qq-bot-napcat.js`

This means the current live bot runtime is highly likely to be the legacy `autoribao` NapCat bot process.

## Switch Inputs

`jiajiaoagent` provides:

- bridge wrapper: `I:\jiajiaoagent\backend\scripts\invoke-hermes-tutor-bridge.ps1`
- launch helper: `I:\jiajiaoagent\scripts\Start-HermesJiajiaoAgentNapCat.ps1`
- local bridge self-test: `I:\jiajiaoagent\scripts\Test-HermesTutorBridge.ps1`

Patched Hermes-side adapters already support:

- `JIAJIAOAGENT_FAST_PATH=true`
- `JIAJIAOAGENT_BRIDGE_PS1=<bridge-script-path>`

## Recommended Procedure

1. Self-test the bridge first:

```powershell
powershell -ExecutionPolicy Bypass -File I:\jiajiaoagent\scripts\Test-HermesTutorBridge.ps1
```

2. Stop the old live NapCat runtime only when you are ready to replace it.
3. Start the runtime from `jiajiaoagent` side:

```powershell
powershell -ExecutionPolicy Bypass -File I:\jiajiaoagent\scripts\Start-HermesJiajiaoAgentNapCat.ps1
```

4. Send a real inbound message from the test account.
5. Verify:
   - inbound message still reaches the bot;
   - bridge returns tutor text JSON successfully;
   - bot sends the tutor reply back outward;
   - same sender preserves session continuity across turns.

## What The Launch Helper Does

The helper script:

1. resolves the target bot root;
2. resolves the `jiajiaoagent` bridge wrapper path;
3. exports:
   - `JIAJIAOAGENT_FAST_PATH=true`
   - `JIAJIAOAGENT_BRIDGE_PS1=I:\jiajiaoagent\backend\scripts\invoke-hermes-tutor-bridge.ps1`
4. runs:

```text
node src\qq-bot-napcat.js
```

inside:

```text
I:\autoweb\autoribao
```

## Rollback

To roll back:

1. stop the replacement runtime;
2. start the legacy runtime using its old start method;
3. do not set `JIAJIAOAGENT_FAST_PATH`;
4. do not set `JIAJIAOAGENT_BRIDGE_PS1`.

Because the Hermes-side patch still falls back to the old bridge path when those env vars are absent, rollback stays simple.
