# SYNC - run after committing in Test Dashboard
# Usage: .\sync-clients.ps1
# Usage: .\sync-clients.ps1 -only "faris-shop-new"
param([string]$only = "")

$CORE    = "d:\anwarul karim\Code\Test Dashboard"
$BASE    = "d:\anwarul karim\Code"

# github=$true  -> fetch upstream + merge + push to GitHub
# github=$false -> robocopy src (local projects with no shared git history)
$clients = @(
    @{ name = "faris shop new"; branch = "master"; github = $false }
    # Add more later:
    # @{ name = "faris seed"; branch = "main"; github = $true }
)

foreach ($c in $clients) {
    $rName = $c.name -replace " ", "-"
    if ($only -and $rName -ne $only) { continue }

    $path = "$BASE\$($c.name)"
    if (-not (Test-Path "$path\.git")) {
        Write-Host "SKIP (not found): $($c.name)" -ForegroundColor Yellow
        continue
    }

    Write-Host ""
    Write-Host "--- $($c.name) ---" -ForegroundColor White

    if ($c.github) {
        # Projects with shared GitHub history: use git merge
        git -C $path fetch upstream
        if ($LastExitCode -ne 0) { Write-Host "  fetch failed" -ForegroundColor Red; continue }

        git -C $path merge upstream/main --no-ff -m "sync: core template update"
        if ($LastExitCode -ne 0) {
            Write-Host "  CONFLICT - fix manually then: git -C '$path' merge --continue" -ForegroundColor Red
            continue
        }

        git -C $path push origin $($c.branch)
        Write-Host "  pushed to GitHub" -ForegroundColor Green

    } else {
        # Local-only projects: robocopy src, then commit
        Write-Host "  Copying src..." -ForegroundColor Gray
        robocopy "$CORE\src" "$path\src" /E /IS /IT /NFL /NDL /NJH /NJS | Out-Null

        # Also copy drizzle migrations
        robocopy "$CORE\drizzle" "$path\drizzle" /E /IS /IT /NFL /NDL /NJH /NJS | Out-Null

        # Stage and commit
        $changes = git -C $path status --short
        if ($changes) {
            git -C $path add src drizzle
            git -C $path commit -m "sync: update from core template $(Get-Date -Format 'yyyy-MM-dd')"
            Write-Host "  committed (local only)" -ForegroundColor Yellow
        } else {
            Write-Host "  no changes" -ForegroundColor Gray
        }
    }

    Write-Host "  done: $($c.name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Sync complete." -ForegroundColor Green
