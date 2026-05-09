param(
    [string]$DistroName = "Ubuntu",
    [string]$HermesRoot = "/home/zhwyyt/.hermes/hermes-agent"
)

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

$bridgeWslPath = "/mnt/i/jiajiaoagent/backend/scripts/invoke-hermes-tutor-bridge.ps1"
$checkCommand = @'
set -e
ACTIVE_PROFILE=default
echo DISTRO_OK
echo BRIDGE_PS1=__BRIDGE_WSL_PATH__
if [ -f /home/zhwyyt/.hermes/active_profile ]; then
  read -r ACTIVE_PROFILE < /home/zhwyyt/.hermes/active_profile
fi
echo ACTIVE_PROFILE=$ACTIVE_PROFILE
if [ -d __HERMES_ROOT__ ]; then
  echo HERMES_ROOT_OK=__HERMES_ROOT__
else
  echo HERMES_ROOT_MISSING=__HERMES_ROOT__
fi
if [ -f __HERMES_ROOT__/hermes_cli/main.py ]; then
  echo HERMES_ENTRY_OK=__HERMES_ROOT__/hermes_cli/main.py
else
  echo HERMES_ENTRY_MISSING
fi
if [ -f __HERMES_ROOT__/gateway/platforms/weixin.py ]; then
  echo WEIXIN_ADAPTER_OK
else
  echo WEIXIN_ADAPTER_MISSING
fi
python3 --version
'@

$checkCommand = $checkCommand.Replace('__BRIDGE_WSL_PATH__', $bridgeWslPath)
$checkCommand = $checkCommand.Replace('__HERMES_ROOT__', $HermesRoot)

& wsl.exe -d $DistroName bash -lc $checkCommand
exit $LASTEXITCODE
