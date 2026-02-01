# Deploy WinPodiums SimHub plugin: build and copy DLL(s) to SimHub install folder.
# From repo root: .\scripts\deploy-plugin.ps1
# Or: powershell -ExecutionPolicy Bypass -File scripts/deploy-plugin.ps1
# Copying to Program Files usually requires running PowerShell as Administrator.
# Default: install root C:\Program Files (x86)\SimHub. Override: $env:SIMHUB_PLUGINS (e.g. ...\SimHub\Plugins).

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot + "\.."
$ProjectPath = Join-Path $RepoRoot "apps\plugin\WinPodiums.Plugin\WinPodiums.Plugin.csproj"
$OutputDir = Join-Path $RepoRoot "apps\plugin\WinPodiums.Plugin\bin\Release\net48"
$SimHubDeploy = if ($env:SIMHUB_PLUGINS) { $env:SIMHUB_PLUGINS } else { "C:\Program Files (x86)\SimHub" }

Write-Host "WinPodiums - deploy plugin to SimHub" -ForegroundColor Cyan
Write-Host ""

# Build
Write-Host "Building plugin (Release)..." -ForegroundColor Yellow
Push-Location $RepoRoot
try {
    dotnet build $ProjectPath --configuration Release --no-incremental
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

$DllPath = Join-Path $OutputDir "WinPodiums.Plugin.dll"
if (-not (Test-Path $DllPath)) {
    Write-Host "ERROR: Build output not found: $DllPath" -ForegroundColor Red
    exit 1
}

# Copy to SimHub (install root or SIMHUB_PLUGINS)
if (-not (Test-Path $SimHubDeploy)) {
    Write-Host "ERROR: SimHub folder not found: $SimHubDeploy" -ForegroundColor Red
    Write-Host "Set SIMHUB_PLUGINS if SimHub is installed elsewhere (e.g. ...\SimHub or ...\SimHub\Plugins)." -ForegroundColor Gray
    exit 1
}

Write-Host "Copying to $SimHubDeploy ..." -ForegroundColor Yellow
try {
    Copy-Item -Path $DllPath -Destination $SimHubDeploy -Force
    Write-Host "  WinPodiums.Plugin.dll" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Copy failed. Try running PowerShell as Administrator." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

$JsonPath = Join-Path $OutputDir "Newtonsoft.Json.dll"
if (Test-Path $JsonPath) {
    try {
        Copy-Item -Path $JsonPath -Destination $SimHubDeploy -Force
        Write-Host "  Newtonsoft.Json.dll" -ForegroundColor Green
    } catch {
        Write-Host "  Newtonsoft.Json.dll (copy failed, optional)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Deploy complete. Restart SimHub to load the plugin." -ForegroundColor Cyan
