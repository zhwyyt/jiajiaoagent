param(
    [string]$Text = "Hello! My name is Anna.",
    [string]$SenderId = "wechat-trial-user",
    [string]$Source = "weixin",
    [string]$ChildId = "trial-child-001",
    [string]$TopicId = "my-family",
    [int]$CurrentLevel = 2
)

$bridgeScript = Join-Path $PSScriptRoot "..\backend\scripts\invoke-hermes-tutor-bridge.ps1"
$resolvedBridgeScript = (Resolve-Path -LiteralPath $bridgeScript).Path

& powershell -ExecutionPolicy Bypass -File $resolvedBridgeScript `
    -Text $Text `
    -SenderId $SenderId `
    -Source $Source `
    -ChildId $ChildId `
    -TopicId $TopicId `
    -CurrentLevel $CurrentLevel

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
