# Deploy WinPodiums SimHub plugin: build and copy DLL(s) to SimHub Plugins folder.
# From repo root: .\scripts\deploy-plugin.ps1
# Or: powershell -ExecutionPolicy Bypass -File scripts/deploy-plugin.ps1
# Copying to Program Files usually requires running PowerShell as Administrator.

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot + "\.."
$ProjectPath = Join-Path $RepoRoot "apps\plugin\WinPodiums.Plugin\WinPodiums.Plugin.csproj"
$OutputDir = Join-Path $RepoRoot "apps\plugin\WinPodiums.Plugin\bin\Release\net48"
$SimHubPlugins = if ($env:SIMHUB_PLUGINS) { $env:SIMHUB_PLUGINS } else { "C:\Program Files (x86)\SimHub\Plugins" }

Write-Host "WinPodiums — deploy plugin to SimHub" -ForegroundColor Cyan
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

# Copy to SimHub Plugins
if (-not (Test-Path $SimHubPlugins)) {
    Write-Host "ERROR: SimHub Plugins folder not found: $SimHubPlugins" -ForegroundColor Red
    Write-Host "Set SIMHUB_PLUGINS if SimHub is installed elsewhere." -ForegroundColor Gray
    exit 1
}

Write-Host "Copying to $SimHubPlugins ..." -ForegroundColor Yellow
try {
    Copy-Item -Path $DllPath -Destination $SimHubPlugins -Force
    Write-Host "  WinPodiums.Plugin.dll" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Copy failed. Try running PowerShell as Administrator." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

$JsonPath = Join-Path $OutputDir "Newtonsoft.Json.dll"
if (Test-Path $JsonPath) {
    try {
        Copy-Item -Path $JsonPath -Destination $SimHubPlugins -Force
        Write-Host "  Newtonsoft.Json.dll" -ForegroundColor Green
    } catch {
        Write-Host "  Newtonsoft.Json.dll (copy failed, optional)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Deploy complete. Restart SimHub to load the plugin." -ForegroundColor Cyan
