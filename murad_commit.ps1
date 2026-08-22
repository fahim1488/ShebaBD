# murad_commit.ps1
# Auto-commit real code changes for Murad - 3 Frontend + 3 Backend
# Run: powershell -ExecutionPolicy Bypass -File murad_commit.ps1

Set-Location "c:\ShebaBD123"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ShebaBD - Murad Commit Script" -ForegroundColor Cyan
Write-Host "  3 Frontend + 3 Backend commits" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# FRONTEND - feature/murad-frontend
# ============================================================

Write-Host "Switching to feature/murad-frontend..." -ForegroundColor Yellow
git stash
git checkout feature/murad-frontend

Write-Host "[1/6] Badge component..." -ForegroundColor Green
git add src/components/common/Badge.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(ui): add Badge component with variant support

- Support success, danger, warning, info, default variants
- Optional dot indicator for status badges
- Optional icon support with LucideIcon
- Used across blood status, event tags and org categories"

Write-Host "[2/6] Avatar component..." -ForegroundColor Green
git add src/components/common/Avatar.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(ui): add Avatar component with initials fallback

- Shows image if src provided, else initials
- Support sm, md, lg, xl size variants
- Custom background color per user
- Verified badge overlay for NGO accounts"

Write-Host "[3/6] usePagination hook..." -ForegroundColor Green
git add src/hooks/usePagination.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(hooks): add usePagination hook for data lists

- Manages current page, skip offset and total pages
- nextPage, prevPage, goToPage, firstPage, lastPage
- pageNumbers array for rendering page buttons
- Used in Organizations, Events and Blood Donors"

Write-Host "Pushing frontend to GitHub..." -ForegroundColor Yellow
git push origin feature/murad-frontend

Write-Host ""
Write-Host "Frontend done! 3 commits pushed." -ForegroundColor Green
Write-Host ""

# ============================================================
# BACKEND - murad/backend
# ============================================================

Write-Host "Switching to murad/backend..." -ForegroundColor Yellow
git checkout murad/backend

Write-Host "[4/6] search_service..." -ForegroundColor Green
git add backend/app/services/search_service.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(services): add unified global search service

- Search across donors, organizations and events
- Case-insensitive LIKE queries with SQLAlchemy
- Returns grouped SearchResult dataclass objects
- global_search combines all types in one call"

Write-Host "[5/6] file_handler utility..." -ForegroundColor Green
git add backend/app/utils/file_handler.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add file upload validation handler

- validate_image checks type and 5MB size limit
- validate_document checks type and 10MB size limit
- generate_filename creates unique names with UUID
- get_upload_path ensures upload directories exist"

Write-Host "[6/6] text_helpers utility..." -ForegroundColor Green
git add backend/app/utils/text_helpers.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add text processing helper functions

- slugify converts text to URL-friendly format
- normalize_search cleans query strings
- sanitize_html strips tags to prevent XSS
- highlight_match wraps search terms in mark tags
- extract_keywords builds keyword list from text"

Write-Host "Pushing backend to GitHub..." -ForegroundColor Yellow
git push origin murad/backend

Write-Host ""
Write-Host "Backend done! 3 commits pushed." -ForegroundColor Green
Write-Host ""

# ============================================================
# MERGE TO DEVELOPMENT
# ============================================================

Write-Host "Merging into development..." -ForegroundColor Yellow
git checkout development
git merge feature/murad-frontend --no-edit
git merge murad/backend --no-edit
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
Write-Host "  feature/murad-frontend  +3 commits" -ForegroundColor Green
Write-Host "  murad/backend           +3 commits" -ForegroundColor Green
Write-Host "  development             merged"      -ForegroundColor Green
Write-Host ""
Write-Host "Check: https://github.com/fahim1488/ShebaBD/graphs/contributors" -ForegroundColor Cyan
Write-Host ""
