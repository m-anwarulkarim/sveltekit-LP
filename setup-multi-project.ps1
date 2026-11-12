# ONE-TIME SETUP — run once from Test Dashboard folder
$CORE_GITHUB = "https://github.com/m-anwarulkarim/sveltekit-LP.git"
$CORE_LOCAL  = "d:\anwarul karim\Code\Test Dashboard"

$clients = @(
    @{ name = "faris shop new"; github = "local" }
    # add more later:
    # @{ name = "faris seed"; github = "https://github.com/m-anwarulkarim/faris-seed.git" }
)

Write-Host "=== Step 1: upstream + .gitattributes in each client ===" -ForegroundColor Cyan
foreach ($c in $clients) {
    $path = "d:\anwarul karim\Code\$($c.name)"

    # upstream
    $ex = git -C $path remote get-url upstream 2>$null
    if ($ex) { Write-Host "  already set: $($c.name)" -ForegroundColor Gray }
    else {
        git -C $path remote add upstream $CORE_GITHUB
        Write-Host "  upstream added: $($c.name)" -ForegroundColor Green
    }

    # lock config files
    $ga = "$path\.gitattributes"
    $lock = "wrangler.jsonc merge=ours`n.env merge=ours`n"
    if (Test-Path $ga) {
        if ((Get-Content $ga -Raw) -notmatch "wrangler.jsonc merge=ours") {
            Add-Content $ga $lock; Write-Host "  .gitattributes updated" -ForegroundColor Green
        }
    } else {
        Set-Content $ga $lock -Encoding utf8; Write-Host "  .gitattributes created" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== Step 2: add clients as remotes in Test Dashboard ===" -ForegroundColor Cyan
foreach ($c in $clients) {
    $rName = $c.name -replace " ", "-"
    $rUrl  = if ($c.github -eq "local") { "d:\anwarul karim\Code\$($c.name)" } else { $c.github }
    $ex = git -C $CORE_LOCAL remote get-url $rName 2>$null
    if ($ex) { Write-Host "  already set: $rName" -ForegroundColor Gray }
    else {
        git -C $CORE_LOCAL remote add $rName $rUrl
        Write-Host "  remote added in Test Dashboard: $rName" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Setup complete! Now use sync-clients.ps1 to sync." -ForegroundColor Green
