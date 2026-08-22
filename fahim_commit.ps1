# fahim_commit.ps1
# Auto-commit real code changes for Fahim - Frontend and Backend
# Run: powershell -ExecutionPolicy Bypass -File fahim_commit.ps1

Set-Location "c:\ShebaBD123"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ShebaBD - Fahim Commit Script" -ForegroundColor Cyan
Write-Host "  6 Frontend + 6 Backend commits" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# FRONTEND - feature/fahim-frontend
# ============================================================

Write-Host "Switching to feature/fahim-frontend..." -ForegroundColor Yellow
git stash
git checkout feature/fahim-frontend

Write-Host "[1/12] StatCard component..." -ForegroundColor Green
git add src/components/common/StatCard.tsx
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "feat(ui): add StatCard component for dashboard metrics"

Write-Host "[2/12] PageHeader component..." -ForegroundColor Green
git add src/components/common/PageHeader.tsx
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "feat(ui): add reusable PageHeader component"

Write-Host "[3/12] EmptyState component..." -ForegroundColor Green
git add src/components/common/EmptyState.tsx
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "feat(ui): add EmptyState component with icon and action slot"

Write-Host "[4/12] useDebounce hook..." -ForegroundColor Green
git add src/hooks/useDebounce.ts
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "feat(hooks): add useDebounce hook for search inputs"

Write-Host "[5/12] useLocalStorage hook..." -ForegroundColor Green
git add src/hooks/useLocalStorage.ts
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "feat(hooks): add useLocalStorage hook with cross-tab sync"

Write-Host "[6/12] formatters utility..." -ForegroundColor Green
git add src/utils/formatters.ts
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "feat(utils): add formatting utilities for currency and text"

Write-Host "Pushing frontend to GitHub..." -ForegroundColor Yellow
git push origin feature/fahim-frontend

Write-Host ""
Write-Host "Frontend done! 6 commits pushed." -ForegroundColor Green
Write-Host ""

# ============================================================
# BACKEND - fahim/backend
# ============================================================

Write-Host "Switching to fahim/backend..." -ForegroundColor Yellow
git checkout fahim/backend

Write-Host "[7/12] analytics_service..." -ForegroundColor Green
git add backend/app/services/analytics_service.py
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "feat(services): add platform analytics service"

Write-Host "[8/12] request_logger middleware..." -ForegroundColor Green
git add backend/app/middleware/request_logger.py
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "feat(middleware): add HTTP request logger middleware"

Write-Host "[9/12] security utils..." -ForegroundColor Green
git add backend/app/utils/security.py
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "feat(utils): add JWT token creation and verification"

Write-Host "[10/12] cache utility..." -ForegroundColor Green
git add backend/app/utils/cache.py
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "feat(utils): add in-memory TTL cache for API responses"

Write-Host "[11/12] blood_matcher utility..." -ForegroundColor Green
git add backend/app/utils/blood_matcher.py
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "feat(utils): add blood group compatibility matcher"

Write-Host "[12/12] notification_service..." -ForegroundColor Green
git add backend/app/services/notification_service.py
git commit --author="MD. Fahim Muntasir <fahim@shebabd.org>" -m "feat(services): add notification service for alerts"

Write-Host "Pushing backend to GitHub..." -ForegroundColor Yellow
git push origin fahim/backend

Write-Host ""
Write-Host "Backend done! 6 commits pushed." -ForegroundColor Green
Write-Host ""

# ============================================================
# MERGE TO DEVELOPMENT
# ============================================================

Write-Host "Merging into development..." -ForegroundColor Yellow
git checkout development
git merge feature/fahim-frontend --no-edit
git merge fahim/backend --no-edit
git push origin development

# ============================================================
# FINAL SUMMARY
# ============================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ALL DONE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Commit count per author:" -ForegroundColor White
git shortlog -sn --all
Write-Host ""
Write-Host "Branches updated:" -ForegroundColor White
Write-Host "  feature/fahim-frontend  +6 commits" -ForegroundColor Green
Write-Host "  fahim/backend           +6 commits" -ForegroundColor Green
Write-Host "  development             merged"      -ForegroundColor Green
Write-Host ""
Write-Host "Check: https://github.com/fahim1488/ShebaBD/graphs/contributors" -ForegroundColor Cyan
Write-Host ""
