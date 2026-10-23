$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker CLI was not found. Install Docker Desktop and reopen PowerShell."
}

docker info --format '{{.ServerVersion}}' | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "Docker Desktop engine is not available. Start Docker Desktop, wait until it reports Running, then rerun .\deploy.ps1."
}

$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envFile)) {
    $dbBytes = New-Object byte[] 32
    $rootBytes = New-Object byte[] 32
    $rng = New-Object Security.Cryptography.RNGCryptoServiceProvider
    $rng.GetBytes($dbBytes)
    $rng.GetBytes($rootBytes)
    $rng.Dispose()
    $dbPassword = [BitConverter]::ToString($dbBytes).Replace("-", "").ToLowerInvariant()
    $rootPassword = [BitConverter]::ToString($rootBytes).Replace("-", "").ToLowerInvariant()
    $lines = @(
        "DB_PASSWORD=$dbPassword"
        "MYSQL_ROOT_PASSWORD=$rootPassword"
    )
    [IO.File]::WriteAllLines($envFile, $lines, (New-Object Text.UTF8Encoding($false)))
    Write-Output "Created .env with generated local database credentials (ignored by Git)."
}

docker compose up --build --detach
if ($LASTEXITCODE -ne 0) {
    throw "Docker Compose deployment failed. Inspect the output above and run 'docker compose logs --tail 100'."
}

docker compose ps
