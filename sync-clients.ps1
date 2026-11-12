# SYNC — run after committing in Test Dashboard
# Usage: .\sync-clients.ps1
# Usage: .\sync-clients.ps1 -only "faris-shop-new"
param([string]$only = "")

$clients = @(
    @{ name = "faris shop new"; branch = "master"; github = $false }
    # add more later:
    # @{ name = "faris seed"; branch = "main"; github = $true }
)

foreach ($c in $clients) {
    $rName = $c.name -replace " ", "-"
    if ($only -and $rName -ne $only) { continue }

    $path = "d:\anwarul karim\Code\$($c.name)"
    Write-Host ""
    Write-Host "--- $($c.name) ---" -ForegroundColor White

    git -C $path fetch upstream
    if ($LastExitCode -ne 0) { Write-Host "  fetch failed" -ForegroundColor Red; continue }

    git -C $path merge upstream/main --no-ff -m "sync: core template update"
    if ($LastExitCode -ne 0) { Write-Host "  CONFLICT — fix manually then: git merge --continue" -ForegroundColor Red; continue }

    if ($c.github) {
        git -C $path push origin $($c.branch)
        Write-Host "  pushed to GitHub" -ForegroundColor Green
    } else {
        Write-Host "  updated (local only — no GitHub)" -ForegroundColor Yellow
    }

    Write-Host "  done" -ForegroundColor Green
}

Write-Host ""
Write-Host "Sync complete." -ForegroundColor Green
