param(
    [string]$DistroName = "Ubuntu",
    [string]$HermesRoot = "/home/zhwyyt/.hermes/hermes-agent",
    [string]$LaunchCommand = "python3 /home/zhwyyt/.hermes/hermes-agent/hermes_cli/main.py gateway",
    [string]$WslUbuntuRoot = "D:\WSL\Ubuntu"
)

$bridgeWindowsPath = "I:\jiajiaoagent\backend\scripts\invoke-hermes-tutor-bridge.ps1"

function Test-IsAdmin {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Repair-WslUbuntuAccess {
    param(
        [string]$UbuntuRoot
    )

    if (-not (Test-Path -LiteralPath $UbuntuRoot)) {
        Write-Host "WSL Ubuntu root not found: $UbuntuRoot"
        return $false
    }

    if (-not (Test-IsAdmin)) {
        Write-Host "WSL repair requires an elevated PowerShell window."
        return $false
    }

    Write-Host "Repairing WSL Ubuntu permissions at $UbuntuRoot ..."
    & takeown.exe /f $UbuntuRoot /r /d y | Out-Null
    & icacls.exe $UbuntuRoot /grant "$env:USERNAME`:(OI)(CI)F" /t | Out-Null
    & icacls.exe $UbuntuRoot /grant "SYSTEM`:(OI)(CI)F" /t | Out-Null
    & icacls.exe $UbuntuRoot /grant "Administrators`:(OI)(CI)F" /t | Out-Null
    return $true
}

function Test-WslDistroReady {
    param(
        [string]$Name
    )

    & wsl.exe -d $Name bash -lc "true" 2>$null | Out-Null
    return $LASTEXITCODE -eq 0
}

$wslListRaw = ((& wsl.exe --list --quiet 2>$null | Out-String) -replace [char]0, "")
if ($LASTEXITCODE -ne 0) {
    Write-Host "WSL is not available."
    exit 1
}

$distros = @(
    ($wslListRaw -split "`r?`n" | ForEach-Object { $_.Trim([char]0, ' ', "`t") }) |
    Where-Object { $_ }
)

if ($distros -notcontains $DistroName) {
    Write-Host "WSL distro '$DistroName' not found."
    if ($distros.Count -gt 0) {
        Write-Host "Available distros: $($distros -join ', ')"
    } else {
        Write-Host "No distros are visible to the current Windows account: $env:USERNAME"
        Write-Host "WSL distro registration is per Windows account."
        Write-Host "If Ubuntu exists in another account, run this script from that same account instead."
    }
    exit 1
}

if (-not (Test-WslDistroReady -Name $DistroName)) {
    Write-Host "WSL distro '$DistroName' is present but not ready. Trying access repair..."
    & wsl.exe --shutdown 2>$null | Out-Null
    $repaired = Repair-WslUbuntuAccess -UbuntuRoot $WslUbuntuRoot
    if ($repaired) {
        Start-Sleep -Seconds 1
    }
    if (-not (Test-WslDistroReady -Name $DistroName)) {
        Write-Host "WSL still cannot start '$DistroName'."
        Write-Host "If the error mentions ext4.vhdx access, rerun this script in an elevated PowerShell window."
        exit 1
    }
}

$startCommand = @'
set -e
export JIAJIAOAGENT_FAST_PATH=true
export JIAJIAOAGENT_BRIDGE_PS1='__BRIDGE_WINDOWS_PATH__'
cd __HERMES_ROOT__
PROFILE_ARG=
ACTIVE_PROFILE=default
if [ -f /home/zhwyyt/.hermes/active_profile ]; then
  read -r ACTIVE_PROFILE < /home/zhwyyt/.hermes/active_profile
  if [ -n "$ACTIVE_PROFILE" ] && [ "$ACTIVE_PROFILE" != "default" ]; then
    PROFILE_ARG="--profile $ACTIVE_PROFILE"
  fi
fi
echo JIAJIAOAGENT_FAST_PATH=$JIAJIAOAGENT_FAST_PATH
echo JIAJIAOAGENT_BRIDGE_PS1=$JIAJIAOAGENT_BRIDGE_PS1
echo HERMES_ROOT=$(pwd)
echo ACTIVE_PROFILE=$ACTIVE_PROFILE
echo PROFILE_ARG=$PROFILE_ARG
if [ -n "$PROFILE_ARG" ]; then
  __LAUNCH_COMMAND__ $PROFILE_ARG
else
  __LAUNCH_COMMAND__
fi
'@

$startCommand = $startCommand.Replace('__BRIDGE_WINDOWS_PATH__', $bridgeWindowsPath)
$startCommand = $startCommand.Replace('__HERMES_ROOT__', $HermesRoot)
$startCommand = $startCommand.Replace('__LAUNCH_COMMAND__', $LaunchCommand)

$startCommandBase64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($startCommand))
$bashLauncher = "printf '%s' '$startCommandBase64' | base64 -d | bash"

& wsl.exe -d $DistroName bash -lc $bashLauncher
exit $LASTEXITCODE
