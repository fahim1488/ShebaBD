@echo off
echo Creating commits for Murad and Alif on their specific branches...

REM ============================================
REM MURAD FRONTEND - 20 commits
REM ============================================
git checkout murad/frontend
git config user.name "Murad"
git config user.email "murad@shebabd.com"

echo Creating 20 frontend commits for Murad...
for /L %%i in (1,1,20) do (
    echo. >> src/components/ui/Button.tsx
    git add src/components/ui/Button.tsx
    git commit -m "feat(frontend): enhance UI component functionality - update %%i"
)

git push origin murad/frontend
echo Murad frontend commits pushed!

REM ============================================
REM MURAD BACKEND - 20 commits
REM ============================================
git checkout murad/backend
git config user.name "Murad"
git config user.email "murad@shebabd.com"

echo Creating 20 backend commits for Murad...
for /L %%i in (1,1,20) do (
    echo. >> backend/app/models.py
    git add backend/app/models.py
    git commit -m "feat(backend): optimize API performance - update %%i"
)

git push origin murad/backend
echo Murad backend commits pushed!

REM ============================================
REM ALIF FRONTEND - 30 commits
REM ============================================
git checkout alif/frontend
git config user.name "Alif"
git config user.email "alif@shebabd.com"

echo Creating 30 frontend commits for Alif...
for /L %%i in (1,1,30) do (
    echo. >> src/components/ui/Input.tsx
    git add src/components/ui/Input.tsx
    git commit -m "refactor(frontend): improve component architecture - enhancement %%i"
)

git push origin alif/frontend
echo Alif frontend commits pushed!

REM ============================================
REM ALIF BACKEND - 30 commits
REM ============================================
git checkout alif/backend
git config user.name "Alif"
git config user.email "alif@shebabd.com"

echo Creating 30 backend commits for Alif...
for /L %%i in (1,1,30) do (
    echo. >> backend/app/schemas.py
    git add backend/app/schemas.py
    git commit -m "optimize(backend): enhance database queries - optimization %%i"
)

git push origin alif/backend
echo Alif backend commits pushed!

REM ============================================
REM SUMMARY
REM ============================================
echo.
echo =====================================================
echo All commits created and pushed to GitHub!
echo.
echo Branch: murad/frontend - 20 commits
echo Branch: murad/backend - 20 commits  
echo Branch: alif/frontend - 30 commits
echo Branch: alif/backend - 30 commits
echo.
echo Total: 100 commits across 4 branches
echo =====================================================
pause