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
$backendRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$tsxCliPath = Join-Path $backendRoot "node_modules\tsx\dist\cli.mjs"
$scriptPath = Join-Path $PSScriptRoot '..\src\bridge\hermesTutorBridge.ts'

if (-not (Test-Path -LiteralPath $tsxCliPath)) {
    throw "tsx CLI not found: $tsxCliPath"
}

Push-Location $backendRoot
try {
    & $nodeCommand.Source $tsxCliPath $scriptPath --input-json-base64 $payloadBase64
} finally {
    Pop-Location
}

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
