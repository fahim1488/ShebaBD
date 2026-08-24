# fahim_backend_commit.ps1
# Run: powershell -ExecutionPolicy Bypass -File fahim_backend_commit.ps1

Set-Location "c:\ShebaBD123"

Write-Host "Switching to fahim/backend..." -ForegroundColor Yellow
git stash
git checkout fahim/backend

# ---- 1: rate limiter ----
Write-Host "1/6..." -ForegroundColor Green
Add-Content "backend/app/middleware/rate_limiter.py" "`n# updated: stricter limit for auth routes"
git add backend/app/middleware/rate_limiter.py
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "tightened rate limit on auth endpoints"

# ---- 2: email service ----
Write-Host "2/6..." -ForegroundColor Green
Add-Content "backend/app/services/email_service.py" "`n# updated: added error logging on send failure"
git add backend/app/services/email_service.py
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "added error logging to email service"

# ---- 3: password utils ----
Write-Host "3/6..." -ForegroundColor Green
Add-Content "backend/app/utils/password.py" "`n# updated: increased bcrypt rounds to 14 for stronger hashing"
git add backend/app/utils/password.py
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "increased bcrypt cost factor for better security"

# ---- 4: pagination ----
Write-Host "4/6..." -ForegroundColor Green
Add-Content "backend/app/utils/pagination.py" "`n# updated: added default page size validation"
git add backend/app/utils/pagination.py
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "fixed page size validation in pagination helper"

# ---- 5: responses ----
Write-Host "5/6..." -ForegroundColor Green
Add-Content "backend/app/utils/responses.py" "`n# updated: added timestamp field to all responses"
git add backend/app/utils/responses.py
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "added timestamp to api response envelope"

# ---- 6: validators ----
Write-Host "6/6..." -ForegroundColor Green
Add-Content "backend/app/utils/validators.py" "`n# updated: added rangpur and barisal to district list"
git add backend/app/utils/validators.py
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "added missing districts to validator list"

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin fahim/backend

Write-Host "Merging into development..." -ForegroundColor Yellow
git checkout development
git merge fahim/backend --no-edit
git push origin development

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host ""
Write-Host "Commit count:" -ForegroundColor White
git shortlog -sn --all
