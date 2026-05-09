# Weixin Hermes Simple Start

## Goal

Reduce the Weixin bot startup path to one Windows command after Ubuntu WSL is healthy again.

## Scripts

- `I:\jiajiaoagent\scripts\Check-WeixinHermes.ps1`
- `I:\jiajiaoagent\scripts\Start-WeixinHermes.ps1`
- `I:\jiajiaoagent\scripts\Check-WeixinHermes.cmd`
- `I:\jiajiaoagent\scripts\Start-WeixinHermes.cmd`
- `I:\jiajiaoagent\scripts\Repair-WslUbuntuAccess.ps1`

## Intended Daily Use

Check environment:

```powershell
powershell -ExecutionPolicy Bypass -File I:\jiajiaoagent\scripts\Check-WeixinHermes.ps1
```

Start Weixin Hermes:

```powershell
powershell -ExecutionPolicy Bypass -File I:\jiajiaoagent\scripts\Start-WeixinHermes.ps1
```

Double-click entrypoints:

- `I:\jiajiaoagent\scripts\Check-WeixinHermes.cmd`
- `I:\jiajiaoagent\scripts\Start-WeixinHermes.cmd`

## Current Assumptions

The scripts currently assume:

1. WSL distro name is `Ubuntu`
2. Hermes root inside WSL is `/home/zhwyyt/.hermes/hermes-agent`
3. Hermes entrypoint is:

```text
python3 /home/zhwyyt/.hermes/hermes-agent/hermes_cli/main.py gateway
```

4. If `/home/zhwyyt/.hermes/active_profile` exists and is not `default`, the start script appends:

```text
--profile <active-profile-name>
```

## Bridge Wiring

The start script exports these variables inside Ubuntu before launching Hermes:

- `JIAJIAOAGENT_FAST_PATH=true`
- `JIAJIAOAGENT_BRIDGE_PS1=I:\jiajiaoagent\backend\scripts\invoke-hermes-tutor-bridge.ps1`

The bridge path intentionally uses a Windows path because `weixin.py` launches:

```text
powershell.exe -File <bridge-path>
```

from inside WSL.

That keeps the Weixin fast-path pointed at `jiajiaoagent`.

## WSL Recovery

This machine's Ubuntu disk currently lives at:

```text
D:\WSL\Ubuntu
```

`Start-WeixinHermes.ps1` now does a light readiness probe with:

```text
wsl.exe -d Ubuntu bash -lc "true"
```

If that probe fails, the script will:

1. shut down WSL;
2. try to repair ownership and ACLs under `D:\WSL\Ubuntu`;
3. probe Ubuntu again.

If you want to run only the repair step manually, use:

```powershell
powershell -ExecutionPolicy Bypass -File I:\jiajiaoagent\scripts\Repair-WslUbuntuAccess.ps1
```

## Important Account Note

WSL distro registration is per Windows account.

If `Check-WeixinHermes.cmd` or `Start-WeixinHermes.cmd` says no `Ubuntu` distro is visible, that does not always mean the disk is gone. It may simply mean the current Windows account is not the one that owns the WSL registration.

In that case:

1. sign into the Windows account that normally opens the `Ubuntu` app successfully;
2. run the `.cmd` launcher from that same account;
3. only use the ACL repair script when the distro exists but fails with disk access errors such as `ext4.vhdx` permission issues.

## Current Blocker

The remaining blocker is no longer startup or text routing, but stable voice output delivery.

Current repo-side direction:

1. bridge keeps returning `replyText`;
2. when `shouldPlayTts=true`, bridge also generates a local `.wav` file under `backend/.bridge-audio/`;
3. bridge returns a WSL-readable `/mnt/<drive>/...` path in `files[].path`;
4. Hermes Weixin adapter should pick up audio suffixes from `files` and send them as voice media.

Latest runtime conclusion:

- the adapter can read and submit `.wav` outbound media;
- WeChat still does not render that path as a visible voice bubble;
- the next proper route is to move from `.wav` toward a SILK-based outbound format.
