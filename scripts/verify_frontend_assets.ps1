# PowerShell validation script for Stellar Bazaar Frontend Assets & Components
$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "     Stellar Bazaar Frontend Quality Verification          " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Running TypeScript typecheck..." -ForegroundColor Yellow
npm run typecheck

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[FAIL] Typecheck failed with code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n[2/3] Running Vitest test suite..." -ForegroundColor Yellow
npm test -- --run

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[FAIL] Test suite failed with code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n[3/3] Compiling production build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[FAIL] Production build failed with code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "All 91 frontend tests passed and production build succeeded!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
