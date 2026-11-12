# SYNC - run after committing in Test Dashboard
# Usage: .\sync-clients.ps1
# Usage: .\sync-clients.ps1 -only "faris-shop-new"
# Usage: .\sync-clients.ps1 -dryRun   (nothing changes, just preview)
param(
    [string]$only   = "",
    [switch]$dryRun = $false
)

$CORE        = "d:\anwarul karim\Code\.sas HaqPlus\Test Dashboard"
$BASE        = "d:\anwarul karim\Code\.sas HaqPlus"
$CONFIG_FILE = Join-Path $PSScriptRoot "clients.json"
$LOG_FILE    = Join-Path $PSScriptRoot "sync.log"
$startTime   = Get-Date

$results = @{ synced = 0; skipped = 0; failed = 0; nochange = 0 }

function Write-Log ($msg) {
    $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $msg"
    Add-Content -Path $LOG_FILE -Value $line
}

function Write-Step ($tag, $msg, $color = "White") {
    Write-Host "  [$tag] $msg" -ForegroundColor $color
}

if (-not (Test-Path $CONFIG_FILE)) {
    Write-Host "ERROR: clients.json not found at $CONFIG_FILE" -ForegroundColor Red
    exit 1
}

$clients = Get-Content $CONFIG_FILE -Raw | ConvertFrom-Json

Write-Host ""
Write-Host "========================================" -ForegroundColor DarkGray
Write-Host "  SYNC  --  $(Get-Date -Format 'dd MMM yyyy, hh:mm tt')" -ForegroundColor White
Write-Host "  Config : $CONFIG_FILE" -ForegroundColor DarkGray
Write-Host "  Total  : $($clients.Count) project(s)" -ForegroundColor DarkGray
if ($dryRun) { Write-Host "  MODE   : DRY RUN (no changes)" -ForegroundColor Cyan }
Write-Host "========================================" -ForegroundColor DarkGray

foreach ($c in $clients) {
    $rName = $c.name -replace " ", "-"
    if ($only -and $rName -ne $only) { continue }

    $path = "$BASE\$($c.name)"

    Write-Host ""
    Write-Host "+-- $($c.name)" -ForegroundColor Cyan
    if ($c.note) { Write-Step ".." $c.note "DarkGray" }

    if (-not (Test-Path "$path\.git")) {
        Write-Step "!!" "Not found -- SKIP ($path)" "Yellow"
        Write-Log "SKIP: $($c.name) -- folder not found at $path"
        $results.skipped++
        continue
    }

    if ($dryRun) {
        Write-Step "--" "Would sync -> $path" "DarkYellow"
        $results.skipped++
        continue
    }

    try {
        if ($c.github) {
            # GitHub project: fetch upstream -> merge -> push
            Write-Step ">>" "Fetching upstream..." "Gray"
            git -C $path fetch upstream 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "git fetch failed" }

            Write-Step ">>" "Merging..." "Gray"
            git -C $path merge upstream/main --no-ff -m "sync: core template update $(Get-Date -Format 'yyyy-MM-dd')" 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "CONFLICT -- fix manually: git -C '$path' merge --continue" }

            Write-Step ">>" "Pushing to GitHub..." "Gray"
            git -C $path push origin $c.branch 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "git push failed" }

            Write-Step "OK" "Pushed to GitHub" "Green"
            Write-Log "OK (github): $($c.name)"
            $results.synced++

        } else {
            # Local/copy project: robocopy src + drizzle -> commit -> (optionally push)
            Write-Step ">>" "Copying src/..." "Gray"
            robocopy "$CORE\src" "$path\src" /E /IS /IT /NFL /NDL /NJH /NJS | Out-Null

            Write-Step ">>" "Copying drizzle/..." "Gray"
            robocopy "$CORE\drizzle" "$path\drizzle" /E /IS /IT /NFL /NDL /NJH /NJS | Out-Null

            $changes = git -C $path status --short
            if ($changes) {
                git -C $path add src drizzle
                git -C $path commit -m "sync: update from core template $(Get-Date -Format 'yyyy-MM-dd')" 2>&1 | Out-Null; $null = $LASTEXITCODE

                # push to GitHub if push:true in config
                if ($c.push) {
                    Write-Step ">>" "Pushing to GitHub..." "Gray"
                    git -C $path push origin $c.branch 2>&1 | Out-Null
                    if ($LASTEXITCODE -ne 0) { throw "git push failed" }
                    Write-Step "OK" "Committed + Pushed to GitHub" "Green"
                    Write-Log "OK (copy+push): $($c.name)"
                } else {
                    Write-Step "OK" "Committed (local)" "Green"
                    Write-Log "OK (local): $($c.name)"
                }
                $results.synced++
            } else {
                Write-Step "--" "No changes" "DarkGray"
                Write-Log "NOCHANGE: $($c.name)"
                $results.nochange++
            }
        }
    } catch {
        Write-Step "XX" $_.Exception.Message "Red"
        Write-Log "FAIL: $($c.name) -- $($_.Exception.Message)"
        $results.failed++
    }

    Write-Host "+-- done" -ForegroundColor DarkGray
}

$elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)

Write-Host ""
Write-Host "========================================" -ForegroundColor DarkGray
Write-Host "  SUMMARY  ($($elapsed)s)" -ForegroundColor White
Write-Host "  [OK] Synced    : $($results.synced)" -ForegroundColor Green
Write-Host "  [--] No change : $($results.nochange)" -ForegroundColor DarkGray
Write-Host "  [!!] Skipped   : $($results.skipped)" -ForegroundColor Yellow
if ($results.failed -gt 0) {
    Write-Host "  [XX] Failed    : $($results.failed)" -ForegroundColor Red
} else {
    Write-Host "  [XX] Failed    : $($results.failed)" -ForegroundColor DarkGray
}
Write-Host "  Log: sync.log" -ForegroundColor DarkGray
Write-Host "========================================" -ForegroundColor DarkGray
Write-Host ""
