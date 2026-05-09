param(
    [string]$BotRoot = "I:\autoweb\autoribao",
    [string]$BridgeScript = "I:\jiajiaoagent\backend\scripts\invoke-hermes-tutor-bridge.ps1",
    [string]$NodeEntry = "src\qq-bot-napcat.js"
)

$resolvedBotRoot = (Resolve-Path -LiteralPath $BotRoot).Path
$resolvedBridgeScript = (Resolve-Path -LiteralPath $BridgeScript).Path
$entryPath = Join-Path $resolvedBotRoot $NodeEntry

if (-not (Test-Path -LiteralPath $entryPath)) {
    throw "Bot entry not found: $entryPath"
}

$nodeCommand = Get-Command node -ErrorAction Stop

$env:JIAJIAOAGENT_FAST_PATH = "true"
$env:JIAJIAOAGENT_BRIDGE_PS1 = $resolvedBridgeScript

Write-Host "Starting Hermes/NapCat runtime with jiajiaoagent bridge..."
Write-Host "Bot root: $resolvedBotRoot"
Write-Host "Entry: $entryPath"
Write-Host "Bridge: $resolvedBridgeScript"
Write-Host "JIAJIAOAGENT_FAST_PATH=$($env:JIAJIAOAGENT_FAST_PATH)"

Push-Location $resolvedBotRoot
try {
    & $nodeCommand.Source $NodeEntry
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
