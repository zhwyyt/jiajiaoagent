param(
    [Parameter(Mandatory = $true)]
    [string]$Text,

    [string]$SenderId = "",

    [string]$Source = "weixin",

    [string]$ChildId = "trial-child-001",

    [string]$TopicId = "my-family",

    [int]$CurrentLevel = 2
)

$payload = @{
    text = $Text
    senderId = $SenderId
    source = $Source
    childId = $ChildId
    topicId = $TopicId
    currentLevel = $CurrentLevel
} | ConvertTo-Json -Compress -Depth 8

$payloadBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($payload))

$nodeCommand = Get-Command node -ErrorAction Stop
$scriptPath = Join-Path $PSScriptRoot '..\src\bridge\hermesTutorBridge.ts'

& $nodeCommand.Source '.\node_modules\tsx\dist\cli.mjs' $scriptPath --input-json-base64 $payloadBase64
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
