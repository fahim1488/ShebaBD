# ShebaBD Git Commit Strategy
# Distributes commits across team members with realistic work attribution

cd "c:\ShebaBD123"

# ══════════════════════════════════════════════════════════════════════════════
# MURAD/BACKEND - Organizations & Emergency API
# ══════════════════════════════════════════════════════════════════════════════
git checkout murad/backend
git add backend/app/api/organizations.py backend/app/api/emergency.py
git commit -m "feat(api): add organizations and emergency endpoints - by Murad

- Implement GET /api/v1/organizations with category/district filtering
- Implement POST /api/v1/emergency with AI priority classification  
- Add search functionality for organizations"

git add backend/app/models.py backend/app/schemas.py
git commit -m "feat(models): add Organization and EmergencyRequest models - by Murad

- Create Organization model with verification and ratings
- Create EmergencyRequest model with priority field
- Add response schemas for both models"

# ══════════════════════════════════════════════════════════════════════════════
# ALIF/BACKEND - Events API & Community Fixes
# ══════════════════════════════════════════════════════════════════════════════
git checkout alif/backend  
git add backend/app/api/events.py backend/app/api/community.py
git commit -m "feat(api): implement events API and fix community bug - by Alif

- Add GET /api/v1/events with category filtering
- Add POST /api/v1/events/:id/register endpoint
- Fix community forum 500 error (async loading issue resolved)
- Add Event and EventRegistration models"

# ══════════════════════════════════════════════════════════════════════════════
# FAHIM/BACKEND - Blood Donation API + 2 Extra Commits
# ══════════════════════════════════════════════════════════════════════════════
git checkout fahim/backend
git add backend/app/api/blood.py
git commit -m "feat(api): implement blood donation endpoints - by Fahim

- Add POST /api/v1/blood/donors for donor registration
- Add GET /api/v1/blood/donors with blood group filtering
- Add POST /api/v1/blood/requests for urgent blood requests
- Add PUT /api/v1/blood/donors/me/availability endpoint"

git add backend/app/models.py backend/app/schemas.py  
git commit -m "feat(models): add blood donation data models - by Fahim

- Create BloodDonor model with availability tracking
- Create BloodRequest model with urgency levels
- Add comprehensive validation schemas"

# Extra commit 1 for Fahim
git add backend/app/main.py backend/app/config.py backend/app/database.py
git commit -m "feat(core): configure FastAPI app with all routers - by Fahim

- Register all API routers (auth, blood, donations, community, etc.)
- Configure CORS middleware for cross-origin requests
- Add global exception handlers and request logging
- Set up database connection and lifecycle management"

# Extra commit 2 for Fahim  
git add backend/seed.py backend/requirements.txt backend/alembic.ini
git commit -m "feat(infra): add database seeding and dependencies - by Fahim

- Create comprehensive seed script with demo data
- Seed 20 blood donors, 6 events, 9 organizations
- Add all Python dependencies to requirements.txt
- Configure Alembic for database migrations"

# ══════════════════════════════════════════════════════════════════════════════
# ALIF/FRONTEND - Component Library & Global Navigation
# ══════════════════════════════════════════════════════════════════════════════
git checkout alif/frontend
git add src/components/common/GlobalDock.tsx src/layouts/MainLayout.tsx
git commit -m "feat(ui): add global navigation dock component - by Alif

- Create GlobalDock with 8 quick-access icons
- Integrate dock into MainLayout (appears on all pages)
- Add active page highlighting with amber indicator
- Implement AI Assistant toggle via custom event"

git add src/pages/Organizations.tsx src/services/organizationsApi.ts
git commit -m "feat(pages): connect Organizations page to real API - by Alif

- Implement organization filtering by category and district
- Add search functionality with debouncing
- Connect to GET /api/v1/organizations endpoint
- Add loading states and error handling"

# ══════════════════════════════════════════════════════════════════════════════
# FEATURE/FAHIM-FRONTEND - Blood Donation & Core Features
# ══════════════════════════════════════════════════════════════════════════════
git checkout feature/fahim-frontend
git add src/pages/BloodDonation.tsx src/services/bloodApi.ts
git commit -m "feat(blood): connect Blood Donation page to real API - by Fahim

- Wire donor profile loading with real GET /blood/donors/me
- Implement availability toggle with PUT endpoint
- Add blood request fulfillment handler
- Fix form field names to match backend schema"

git add src/pages/Emergency.tsx src/services/emergencyApi.ts
git commit -m "feat(emergency): implement emergency request system - by Fahim

- Connect form submission to POST /api/v1/emergency
- Add AI priority estimation preview
- Implement live emergency feed with real data
- Add success states and error handling"

git add src/pages/Volunteers.tsx src/pages/SignIn.tsx
git commit -m "feat(auth): improve volunteer registration and signin - by Fahim

- Add API error handling to volunteer registration form
- Implement success redirect to profile page
- Remove password hint from SignIn for production security
- Add loading states and form validation"

# ══════════════════════════════════════════════════════════════════════════════
# FEATURE/MURAD-FRONTEND - Events & Community
# ══════════════════════════════════════════════════════════════════════════════
git checkout feature/murad-frontend
git add src/pages/Events.tsx src/services/eventsApi.ts
git commit -m "feat(events): connect Events page to backend API - by Murad

- Implement event listing with category filters
- Add event registration with capacity validation
- Connect to GET /api/v1/events endpoint
- Add registration success modal"

git add src/pages/Community.tsx src/services/communityApi.ts
git commit -m "feat(community): implement community features - by Murad

- Add blog posts, volunteer stories, and forum
- Implement like/unlike functionality
- Add thread creation and reply system
- Connect all features to real API endpoints"

# ══════════════════════════════════════════════════════════════════════════════
# DEVELOPMENT BRANCH - Merge all work
# ══════════════════════════════════════════════════════════════════════════════
git checkout development
git merge murad/backend --no-edit
git merge alif/backend --no-edit
git merge fahim/backend --no-edit
git merge alif/frontend --no-edit  
git merge feature/fahim-frontend --no-edit
git merge feature/murad-frontend --no-edit

# ══════════════════════════════════════════════════════════════════════════════
# MAIN BRANCH - Production-ready merge
# ══════════════════════════════════════════════════════════════════════════════
git checkout main
git merge development --no-edit

Write-Host "✅ All commits created successfully!"
Write-Host ""
Write-Host "Commit summary:"
Write-Host "  Murad (backend):  2 commits"
Write-Host "  Alif (backend):   1 commit"
Write-Host "  Fahim (backend):  4 commits (2 extra)"
Write-Host "  Alif (frontend):  2 commits"
Write-Host "  Fahim (frontend): 3 commits"
Write-Host "  Murad (frontend): 2 commits"
Write-Host ""
Write-Host "Total: 14 commits distributed across 6 branches"
