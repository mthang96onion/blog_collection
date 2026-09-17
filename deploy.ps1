# deploy.ps1 — Build cổng + 2 blog vào 1 repo `blog_collection` rồi đẩy lên GitHub Pages.
#   Dùng:  .\deploy.ps1
#
# Kết quả:
#   https://mthang96onion.github.io/blog_collection/           (trang cổng)
#   https://mthang96onion.github.io/blog_collection/ielts/            (blog IELTS)
#   https://mthang96onion.github.io/blog_collection/phat-trien-ban-than/ (blog Duongg)
#   https://mthang96onion.github.io/blog_collection/marketing/        (blog Marketing)

$ErrorActionPreference = 'Stop'
$root   = $PSScriptRoot
$ielts  = 'D:\Thang\TikTok Transcripts\cohienielts-blog'
$duongg = 'D:\Thang\TikTok Transcripts\dreamerd-blog'
$mkt    = 'D:\Thang\TikTok Transcripts\marketing-blog'
$cs     = 'D:\Thang\TikTok Transcripts\casestudy-blog'
$key    = 'D:/Thang/.ssh/id_mthang96onion_acct'
$repo   = 'git@github.com:mthang96onion/blog_collection.git'
$sshCmd = "C:/Windows/System32/OpenSSH/ssh.exe -i $key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -o HostName=ssh.github.com -o Port=443"

Write-Host '== 1/3 Build blog IELTS -> ielts/ ==' -ForegroundColor Cyan
python -m mkdocs build -f "$ielts\mkdocs.yml" -d "$root\ielts" --strict

Write-Host '== 2/4 Build blog Duongg -> phat-trien-ban-than/ ==' -ForegroundColor Cyan
python -m mkdocs build -f "$duongg\mkdocs.yml" -d "$root\phat-trien-ban-than" --strict

Write-Host '== 3/5 Build blog Marketing -> marketing/ ==' -ForegroundColor Cyan
python -m mkdocs build -f "$mkt\mkdocs.yml" -d "$root\marketing" --strict

Write-Host '== 4/5 Build blog Case Study -> casestudy/ ==' -ForegroundColor Cyan
python "$cs\build_index.py"   # sinh lai casestudies.json + nav truoc khi build
python -m mkdocs build -f "$cs\mkdocs.yml" -d "$root\casestudy" --strict

$nojekyll = Join-Path $root '.nojekyll'
if (-not (Test-Path $nojekyll)) { New-Item -ItemType File -Path $nojekyll | Out-Null }

Write-Host '== 5/5 Day len GitHub Pages ==' -ForegroundColor Cyan
Set-Location $root
if (-not (Test-Path (Join-Path $root '.git'))) {
  git init -b main -q
  git config user.name  'mthang96onion'
  git config user.email '120548966+mthang96onion@users.noreply.github.com'
  git config core.sshCommand $sshCmd
  git remote add origin $repo
} else {
  git config core.sshCommand $sshCmd
}
git add -A
git -c commit.gpgsign=false commit -q -m 'Cap nhat Blog Collection'
git push --force origin main

Write-Host ''
Write-Host 'XONG! Neu chua bat Pages: repo blog_collection > Settings > Pages > Source = main / (root).' -ForegroundColor Yellow
Write-Host '  https://mthang96onion.github.io/blog_collection/' -ForegroundColor Green
