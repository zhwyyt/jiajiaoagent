param(
    [Parameter(Mandatory = $true)]
    [string]$TextBase64,

    [Parameter(Mandatory = $true)]
    [string]$OutputPathBase64,

    [int]$Rate = 0
)

$text = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($TextBase64))
$outputPath = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($OutputPathBase64))
$outputDir = Split-Path -Path $outputPath -Parent

if (-not (Test-Path -LiteralPath $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

Add-Type -AssemblyName System.Speech

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $englishVoice = $synth.GetInstalledVoices() |
        ForEach-Object { $_.VoiceInfo } |
        Where-Object { $_.Culture.Name -like 'en-*' } |
        Select-Object -First 1

    if ($englishVoice) {
        try {
            $synth.SelectVoice($englishVoice.Name)
        } catch {
            # Keep the default Windows voice when the preferred English voice cannot be selected.
        }
    }

    if ($Rate -lt -10) {
        $Rate = -10
    } elseif ($Rate -gt 10) {
        $Rate = 10
    }

    $synth.Rate = $Rate

    $synth.SetOutputToWaveFile($outputPath)
    $synth.Speak($text)
} finally {
    $synth.Dispose()
}
