# verify-build.ps1 — Mimics Vercel build + serves + smoke tests locally
# Usage: .\scripts\verify-build.ps1
# Requires: node, npm, uv (for playwright smoke test)

param(
    [int]$Port = 4567,
    [switch]$SkipSmoke
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (!(Test-Path "$root\package.json")) { $root = Get-Location }
Set-Location $root

Write-Host "`n=== VERIFY BUILD ===" -ForegroundColor Cyan

# Step 1: Read vercel.json to match Vercel behavior
$vercelConfig = Get-Content "vercel.json" | ConvertFrom-Json
$buildCmd = $vercelConfig.buildCommand
$outputDir = $vercelConfig.outputDirectory
$framework = $vercelConfig.framework

Write-Host "[1/5] vercel.json: build='$buildCmd' output='$outputDir' framework='$framework'"

if (!$buildCmd -and $framework -eq "vite") {
    $buildCmd = "npm run build"
}

if (!$buildCmd) {
    Write-Host "WARNING: No buildCommand in vercel.json — serving root as-is" -ForegroundColor Yellow
    $outputDir = "."
}

# Step 2: Clean install + build (same as Vercel)
Write-Host "[2/5] npm install..." -ForegroundColor Gray
npm install --silent 2>&1 | Out-Null

if ($buildCmd) {
    Write-Host "[3/5] Running: $buildCmd" -ForegroundColor Gray
    Invoke-Expression $buildCmd
    if ($LASTEXITCODE -ne 0) {
        Write-Host "BUILD FAILED!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Build OK" -ForegroundColor Green
} else {
    Write-Host "[3/5] No build step" -ForegroundColor Yellow
}

# Step 3: Check output directory exists and has index.html
$servePath = Join-Path $root $outputDir
if (!(Test-Path "$servePath\index.html")) {
    Write-Host "FAIL: No index.html in $outputDir" -ForegroundColor Red
    exit 1
}
Write-Host "[4/5] index.html found in $outputDir" -ForegroundColor Green

# Step 4: Serve with npx serve and run smoke test
if (!$SkipSmoke) {
    Write-Host "[5/5] Smoke test..." -ForegroundColor Gray
    
    # Start static server
    $serverProc = Start-Process -FilePath "npx" -ArgumentList "serve $servePath -l $Port -s --no-clipboard" -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 3
    
    try {
        # Basic HTTP check
        $response = Invoke-WebRequest -Uri "http://localhost:$Port" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -ne 200) {
            Write-Host "FAIL: HTTP $($response.StatusCode)" -ForegroundColor Red
            exit 1
        }
        Write-Host "  HTTP 200 OK" -ForegroundColor Green
        
        # Check page isn't empty (static HTML check)
        if ($response.Content.Length -lt 200) {
            Write-Host "FAIL: Page too small ($($response.Content.Length) bytes)" -ForegroundColor Red
            exit 1
        }
        Write-Host "  Page size: $($response.Content.Length) bytes" -ForegroundColor Green

        # Check for script tag (SPA needs JS)
        if ($response.Content -match 'type="module"' -or $response.Content -match '<script') {
            Write-Host "  JS entry point found" -ForegroundColor Green
        }

        # Playwright smoke test (checks JS rendering)
        $smokeScript = @"
import asyncio, sys
from playwright.async_api import async_playwright

async def smoke():
    errors = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        page.on("pageerror", lambda err: errors.append(str(err)))
        
        await page.goto("http://localhost:$Port", wait_until="networkidle", timeout=15000)
        
        root = await page.query_selector("#root")
        html = await root.inner_html() if root else ""
        
        if len(html) < 100:
            print(f"FAIL: #root is empty ({len(html)} chars)")
            sys.exit(1)
        
        print(f"  #root rendered: {len(html)} chars")
        
        if errors:
            for e in errors[:5]:
                print(f"  JS ERROR: {e}")
            sys.exit(1)
        
        print("  No JS errors")
        
        # Take screenshot for reference
        await page.screenshot(path="scripts/last-build-screenshot.png", full_page=False)
        print("  Screenshot saved to scripts/last-build-screenshot.png")
        
        await browser.close()
    print("SMOKE TEST PASSED")

asyncio.run(smoke())
"@
        $smokeScript | uv run --with playwright -
        if ($LASTEXITCODE -ne 0) {
            Write-Host "SMOKE TEST FAILED" -ForegroundColor Red
            exit 1
        }
    }
    finally {
        # Kill server
        Stop-Process -Id $serverProc.Id -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "[5/5] Smoke test skipped" -ForegroundColor Yellow
}

Write-Host "`n=== ALL CHECKS PASSED ===" -ForegroundColor Green
