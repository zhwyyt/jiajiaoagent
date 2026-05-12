param(
    [string]$DistroName = "Ubuntu",
    [string]$HermesRoot = "/home/zhwyyt/.hermes/hermes-agent",
    [string]$LaunchCommand = "python3 /home/zhwyyt/.hermes/hermes-agent/hermes_cli/main.py gateway"
)

$bridgeWindowsPath = "I:\jiajiaoagent\backend\scripts\invoke-hermes-tutor-bridge.ps1"

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
echo QQBOT_ROUTE=live-hermes-gateway
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
