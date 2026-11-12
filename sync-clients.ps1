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

# Backup files listed in .syncignore, return hashtable of path->content
function Backup-Ignored ($projectPath) {
    $ignorePath = Join-Path $projectPath ".syncignore"
    $backups = @{}
    if (-not (Test-Path $ignorePath)) { return $backups }

    Get-Content $ignorePath | Where-Object { $_.Trim() -ne "" -and -not $_.StartsWith("#") } | ForEach-Object {
        $rel  = $_.Trim()
        $full = Join-Path $projectPath $rel
        if (Test-Path $full) {
            $backups[$rel] = Get-Content $full -Raw
        }
    }
    return $backups
}

# Restore backed-up files
function Restore-Ignored ($projectPath, $backups) {
    foreach ($rel in $backups.Keys) {
        $full = Join-Path $projectPath $rel
        $dir  = Split-Path $full -Parent
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
        Set-Content -Path $full -Value $backups[$rel] -NoNewline
    }
}

# Count new drizzle migration files vs what the project already had
function Get-NewMigrations ($projectPath) {
    $coreMigrations    = Get-ChildItem "$CORE\drizzle" -Filter "*.sql" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
    $clientMigrations  = Get-ChildItem "$projectPath\drizzle" -Filter "*.sql" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
    $newOnes = $coreMigrations | Where-Object { $clientMigrations -notcontains $_ }
    return $newOnes
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
        # Show what would be protected
        $ignorePath = Join-Path $path ".syncignore"
        if (Test-Path $ignorePath) {
            $protected = Get-Content $ignorePath | Where-Object { $_.Trim() -ne "" -and -not $_.StartsWith("#") }
            Write-Step "--" "Would sync -> $path" "DarkYellow"
            foreach ($p in $protected) { Write-Step ">>" "Protected (will not overwrite): $p" "DarkGray" }
        } else {
            Write-Step "--" "Would sync -> $path (no .syncignore)" "DarkYellow"
        }
        $results.skipped++
        continue
    }

    try {
        if ($c.github) {
            # GitHub project with shared history: fetch upstream -> merge -> push
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
            # Copy project: backup ignored -> robocopy -> restore ignored -> commit -> (push)

            # 1. Check for new migrations before copy
            $newMigrations = Get-NewMigrations $path

            # 2. Backup .syncignore files
            $backups = Backup-Ignored $path
            if ($backups.Count -gt 0) {
                Write-Step ">>" "Protecting $($backups.Count) file(s) from overwrite..." "DarkGray"
            }

            # 3. Robocopy
            Write-Step ">>" "Copying src/..." "Gray"
            robocopy "$CORE\src" "$path\src" /E /IS /IT /NFL /NDL /NJH /NJS | Out-Null

            Write-Step ">>" "Copying drizzle/..." "Gray"
            robocopy "$CORE\drizzle" "$path\drizzle" /E /IS /IT /NFL /NDL /NJH /NJS | Out-Null

            # 4. Restore protected files
            if ($backups.Count -gt 0) {
                Restore-Ignored $path $backups
                Write-Step "OK" "Restored $($backups.Count) protected file(s)" "DarkGray"
            }

            # 5. Commit if changes exist
            $changes = git -C $path status --short
            if ($changes) {
                git -C $path add src drizzle
                git -C $path commit -m "sync: update from core template $(Get-Date -Format 'yyyy-MM-dd')" 2>&1 | Out-Null; $null = $LASTEXITCODE

                # 6. Push to GitHub if configured
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

                # 7. Auto-apply new migrations to D1 (remote)
                if ($newMigrations.Count -gt 0) {
                    Write-Host ""
                    Write-Step ">>" "Applying $($newMigrations.Count) new migration(s) to D1..." "Cyan"
                    foreach ($m in $newMigrations) { Write-Step ".." $m "DarkGray" }

                    Push-Location $path
                    $migrateOut = npx wrangler d1 migrations apply DB --remote 2>&1
                    $migrateOk  = $LASTEXITCODE -eq 0
                    Pop-Location

                    if ($migrateOk) {
                        Write-Step "OK" "Migrations applied to D1 (remote)" "Green"
                        Write-Log "MIGRATED: $($c.name) -- $($newMigrations -join ', ')"
                    } else {
                        Write-Step "!!" "Migration failed -- check manually" "Yellow"
                        Write-Step ".." ($migrateOut | Select-Object -Last 3 | Out-String).Trim() "DarkGray"
                        Write-Log "MIGRATE_FAIL: $($c.name) -- $($newMigrations -join ', ')"
                    }
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
