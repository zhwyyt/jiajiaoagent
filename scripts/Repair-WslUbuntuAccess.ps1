param(
    [string]$WslUbuntuRoot = "D:\WSL\Ubuntu"
)

$currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Please run this script in an elevated PowerShell window."
    exit 1
}

if (-not (Test-Path -LiteralPath $WslUbuntuRoot)) {
    Write-Host "WSL Ubuntu root not found: $WslUbuntuRoot"
    exit 1
}

Write-Host "Shutting down WSL ..."
& wsl.exe --shutdown 2>$null | Out-Null

Write-Host "Repairing ownership and ACLs for $WslUbuntuRoot ..."
& takeown.exe /f $WslUbuntuRoot /r /d y
& icacls.exe $WslUbuntuRoot /grant "$env:USERNAME`:(OI)(CI)F" /t
& icacls.exe $WslUbuntuRoot /grant "SYSTEM`:(OI)(CI)F" /t
& icacls.exe $WslUbuntuRoot /grant "Administrators`:(OI)(CI)F" /t

Write-Host ""
Write-Host "Testing WSL ..."
& wsl.exe
