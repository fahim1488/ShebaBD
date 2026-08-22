# alif_commit.ps1
# Auto-commit real code changes for Alif - 3 Frontend + 3 Backend
# Run: powershell -ExecutionPolicy Bypass -File alif_commit.ps1

Set-Location "c:\ShebaBD123"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ShebaBD - Alif Commit Script" -ForegroundColor Cyan
Write-Host "  3 Frontend + 3 Backend commits" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# FRONTEND - alif/frontend
# ============================================================

Write-Host "Switching to alif/frontend..." -ForegroundColor Yellow
git stash
git checkout alif/frontend

Write-Host "[1/6] ConfirmDialog component..." -ForegroundColor Green
git add src/components/common/ConfirmDialog.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(ui): add ConfirmDialog modal component

- Animated modal with backdrop blur
- Support danger, warning, primary variants
- Dismiss on backdrop click or Escape key
- Used for delete confirmations across pages"

Write-Host "[2/6] ProgressBar component..." -ForegroundColor Green
git add src/components/common/ProgressBar.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(ui): add ProgressBar component with animation

- Animated fill using framer-motion whileInView
- Support sm, md, lg size variants
- Optional label and percentage display
- Used on event capacity and donation goals"

Write-Host "[3/6] useClickOutside hook..." -ForegroundColor Green
git add src/hooks/useClickOutside.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(hooks): add useClickOutside hook

- Fires callback on click outside referenced element
- Also closes on Escape key press
- Returns typed RefObject to attach to element
- Used in dropdowns, menus and popover panels"

Write-Host "Pushing frontend to GitHub..." -ForegroundColor Yellow
git push origin alif/frontend

Write-Host ""
Write-Host "Frontend done! 3 commits pushed." -ForegroundColor Green
Write-Host ""

# ============================================================
# BACKEND - alif/backend
# ============================================================

Write-Host "Switching to alif/backend..." -ForegroundColor Yellow
git checkout alif/backend

Write-Host "[4/6] report_service..." -ForegroundColor Green
git add backend/app/services/report_service.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add platform report generation service

- get_new_users_count for registration trends
- get_blood_requests_report with fulfill rate
- get_emergency_report grouped by priority and status
- get_full_report combines all metrics in one call"

Write-Host "[5/6] cors_handler middleware..." -ForegroundColor Green
git add backend/app/middleware/cors_handler.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(middleware): add CORS configuration handler

- get_allowed_origins reads from environment variable
- Separate origin lists for dev and production
- build_cors_config builds full middleware config
- Supports credentials and custom exposed headers"

Write-Host "[6/6] geo_helpers utility..." -ForegroundColor Green
git add backend/app/utils/geo_helpers.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add geographic helper utilities

- BD_DIVISIONS maps all 8 divisions to districts
- get_nearby_districts uses Haversine formula
- DISTRICT_COORDS stores lat/lon for 10 districts
- is_valid_district validates user input location
- Used for blood donor proximity matching"

Write-Host "Pushing backend to GitHub..." -ForegroundColor Yellow
git push origin alif/backend

Write-Host ""
Write-Host "Backend done! 3 commits pushed." -ForegroundColor Green
Write-Host ""

# ============================================================
# MERGE TO DEVELOPMENT
# ============================================================

Write-Host "Merging into development..." -ForegroundColor Yellow
git checkout development
git merge alif/frontend --no-edit
git merge alif/backend --no-edit
git push origin development

# ============================================================
# FINAL SUMMARY
# ============================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ALL DONE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Final commit count per author:" -ForegroundColor White
git shortlog -sn --all
Write-Host ""
Write-Host "Branches updated:" -ForegroundColor White
Write-Host "  alif/frontend  +3 commits" -ForegroundColor Green
Write-Host "  alif/backend   +3 commits" -ForegroundColor Green
Write-Host "  development    merged"      -ForegroundColor Green
Write-Host ""
Write-Host "Check: https://github.com/fahim1488/ShebaBD/graphs/contributors" -ForegroundColor Cyan
Write-Host ""
