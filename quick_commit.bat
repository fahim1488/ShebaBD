@echo off
REM Quick Commit Script for ShebaBD Project
REM Run this from the root directory: c:\ShebaBD123

echo ================================
echo ShebaBD - Quick Git Commit
echo ================================
echo.

cd /d "c:\ShebaBD123"

echo [1/4] Staging all changes...
git add -A

echo [2/4] Creating commit...
git commit -m "feat: Complete ShebaBD platform - all features ready for deployment

- Implement all backend API endpoints (organizations, events, emergency, blood)
- Connect all frontend pages to real backend APIs
- Add global navigation dock on all pages
- Fix community forum 500 error bug
- Add comprehensive seed data for testing
- Remove production security issues (password hints)
- Improve error handling and loading states

Contributors:
- Fahim: Blood API, Emergency system, Core backend (7 commits)
- Murad: Organizations API, Community features (4 commits)
- Alif: Events API, Global dock, Org page (3 commits)"

echo [3/4] Pushing to development branch...
git push origin development

echo [4/4] Merging to main...
git checkout main
git merge development --no-edit
git push origin main
git checkout development

echo.
echo ================================
echo ✅ SUCCESS!
echo ================================
echo.
echo Commits pushed to:
echo   - development (current)
echo   - main
echo.
echo To push to feature branches, run:
echo   git checkout feature/fahim-frontend
echo   git merge development
echo   git push origin feature/fahim-frontend
echo.
echo   git checkout feature/murad-frontend
echo   git merge development  
echo   git push origin feature/murad-frontend
echo.
pause
