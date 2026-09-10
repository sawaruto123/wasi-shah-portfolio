# =============================================================
#  ImageKit setup wizard  (free, no credit card)
#  Walks you through creating an ImageKit account and captures
#  the 3 values the site needs, writing them to .env.local.
#
#  Run:  powershell -ExecutionPolicy Bypass -File scripts\setup-imagekit.ps1
# =============================================================
$ErrorActionPreference = 'Stop'
$env_file = Join-Path (Get-Location) '.env.local'
$TOTAL = 3
$stage = 0

function Clear-Stage { Clear-Host }
function Stage($name) {
  $script:stage++
  Clear-Stage
  Write-Host ""
  Write-Host "  > Stage $($script:stage)/$TOTAL - $name" -ForegroundColor Cyan
}
function Say($t)  { Write-Host "  $t" -ForegroundColor Gray }
function Step($t) { Write-Host "  * $t" -ForegroundColor White }
function Warn($t) { Write-Host "  ! $t" -ForegroundColor Yellow }
function Open-Url($u) { Write-Host "  -> opening $u" -ForegroundColor Green; Start-Process $u }
function Pause($msg) { Read-Host "  $msg (press Enter)" | Out-Null }

function Read-Existing($key) {
  if (!(Test-Path $env_file)) { return "" }
  $line = Get-Content $env_file | Where-Object { $_ -match "^$key=" } | Select-Object -Last 1
  if ($line) { return $line.Substring($line.IndexOf('=') + 1) }
  return ""
}
function Ask($key, $prompt) {
  $cur = Read-Existing $key
  if ($cur) { $v = Read-Host "  $prompt [$cur]" ; if (-not $v) { $v = $cur } }
  else { $v = Read-Host "  $prompt" }
  return $v
}
function Ask-Secret($key, $prompt) {
  $cur = Read-Existing $key
  if ($cur) { $v = Read-Host "  $prompt [$cur]" ; if (-not $v) { $v = $cur } }
  else { $v = Read-Host "  $prompt" }
  return $v
}
function Write-Env($key, $value) {
  $lines = @()
  if (Test-Path $env_file) { $lines = Get-Content $env_file | Where-Object { $_ -notmatch "^$key=" } }
  $lines += "$key=$value"
  Set-Content -LiteralPath $env_file -Value $lines -Encoding UTF8
  Write-Host "  v wrote $key -> .env.local" -ForegroundColor Green
}

# ── Banner ───────────────────────────────────────────────────
Clear-Stage
Write-Host ""
Write-Host "  IMAGEKIT SETUP" -ForegroundColor Cyan -BackgroundColor Black
Write-Host "  $TOTAL stages" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  ImageKit gives you 20 GB/month of free image bandwidth + a CDN" -ForegroundColor DarkGray
Write-Host "  with auto WebP/AVIF optimization - more than Supabase's free 5 GB," -ForegroundColor DarkGray
Write-Host "  and NO credit card. This wizard captures your 3 keys into .env.local." -ForegroundColor DarkGray
Pause "Ready to start?"

# ── Stage 1: account ─────────────────────────────────────────
Stage "Create your ImageKit account"
Say "Free forever, no credit card. We'll open the sign-up page."
Open-Url "https://imagekit.io/registration/"
Step "Sign up with email or Google (no card required)."
Step "Confirm your email if asked."
Pause "Done? Press Enter once you're in the ImageKit dashboard"

# ── Stage 2: keys ────────────────────────────────────────────
Stage "Copy your ImageKit keys"
Say "You need 3 values from the dashboard."
Open-Url "https://imagekit.io/dashboard/developer/api-keys"
Step "URL-endpoint: the 'ImageKit ID' shown at the top (looks like 'abc123xyz')."
$URL_ENDPOINT = Ask "IMAGEKIT_URL_ENDPOINT" "Paste your ImageKit ID:"
Step "Public key (starts 'public_...')."
$PUBLIC_KEY = Ask "IMAGEKIT_PUBLIC_KEY" "Paste your public key:"
Step "Private key (starts 'private_...'). Keep it secret."
$PRIVATE_KEY = Ask-Secret "IMAGEKIT_PRIVATE_KEY" "Paste your private key:"
Pause "Got all 3? Press Enter to save"

# ── Stage 3: save ────────────────────────────────────────────
Stage "Save to .env.local"
Write-Env "IMAGEKIT_URL_ENDPOINT" $URL_ENDPOINT
Write-Env "IMAGEKIT_PUBLIC_KEY" $PUBLIC_KEY
Write-Env "IMAGEKIT_PRIVATE_KEY" $PRIVATE_KEY

Clear-Stage
Write-Host ""
Write-Host "  v Setup complete" -ForegroundColor Green
Write-Host "  3 values written to .env.local:" -ForegroundColor DarkGray
Write-Host "    IMAGEKIT_URL_ENDPOINT, IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Next: tell the agent the keys are set, and it will wire the CMS" -ForegroundColor DarkGray
Write-Host "  uploads + media URLs to ImageKit." -ForegroundColor DarkGray
Write-Host ""
