# murad_commit_new.ps1
# Auto-commit real code changes for Murad - 30 Frontend + 30 Backend
# Run: powershell -ExecutionPolicy Bypass -File murad_commit_new.ps1

Set-Location "c:\ShebaBD123"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ShebaBD - Murad Commit Script" -ForegroundColor Cyan
Write-Host "  30 Frontend + 30 Backend commits" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# FRONTEND - feature/murad-frontend  (30 commits)
# ============================================================

Write-Host "Switching to feature/murad-frontend..." -ForegroundColor Yellow
git stash
git checkout feature/murad-frontend

# --- 1
Write-Host "[1/30] Badge component..." -ForegroundColor Green
git add src/components/common/Badge.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(ui): add Badge component with variant support

- Support success, danger, warning, info, default variants
- Optional dot indicator for status badges
- Optional icon support with LucideIcon
- Used across blood status, event tags and org categories"

# --- 2
Write-Host "[2/30] Avatar component..." -ForegroundColor Green
git add src/components/common/Avatar.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(ui): add Avatar component with initials fallback

- Shows image if src provided, else initials
- Support sm, md, lg, xl size variants
- Custom background color per user
- Verified badge overlay for NGO accounts"

# --- 3
Write-Host "[3/30] usePagination hook..." -ForegroundColor Green
git add src/hooks/usePagination.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(hooks): add usePagination hook for data lists

- Manages current page, skip offset and total pages
- nextPage, prevPage, goToPage, firstPage, lastPage
- pageNumbers array for rendering page buttons
- Used in Organizations, Events and Blood Donors"

# --- 4
Write-Host "[4/30] ConfirmDialog component..." -ForegroundColor Green
git add src/components/common/ConfirmDialog.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(ui): add ConfirmDialog modal component

- Animated modal with backdrop blur
- Support danger, warning, primary variants
- Dismiss on backdrop click or Escape key
- Used for delete confirmations across pages"

# --- 5
Write-Host "[5/30] ProgressBar component..." -ForegroundColor Green
git add src/components/common/ProgressBar.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(ui): add ProgressBar component with animation

- Animated fill using framer-motion whileInView
- Support sm, md, lg size variants
- Optional label and percentage display
- Used on event capacity and donation goals"

# --- 6
Write-Host "[6/30] useClickOutside hook..." -ForegroundColor Green
git add src/hooks/useClickOutside.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(hooks): add useClickOutside hook

- Fires callback on click outside referenced element
- Also closes on Escape key press
- Returns typed RefObject to attach to element
- Used in dropdowns, menus and popover panels"

# --- 7
Write-Host "[7/30] EmptyState component..." -ForegroundColor Green
git add src/components/common/EmptyState.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(ui): add EmptyState component for empty lists

- Accepts icon, title and description props
- Optional CTA button with label and onClick handler
- Centered layout with subtle icon styling
- Reused in donors, events and organizations"

# --- 8
Write-Host "[8/30] LoadingSpinner component..." -ForegroundColor Green
git add src/components/common/LoadingSpinner.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(ui): add LoadingSpinner component

- Three size variants: sm, md, lg
- Uses CSS animation for smooth spin
- Accepts optional message prop below spinner
- Displayed during API fetch operations"

# --- 9
Write-Host "[9/30] PageHeader component..." -ForegroundColor Green
git add src/components/common/PageHeader.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(ui): add PageHeader component

- Accepts title, subtitle and breadcrumb props
- Optional right-side action slot for buttons
- Gradient text title with fade-in animation
- Consistent across all main pages"

# --- 10
Write-Host "[10/30] StatCard component..." -ForegroundColor Green
git add src/components/common/StatCard.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(ui): add StatCard for dashboard metrics

- Displays value, label and trend indicator
- Color-coded trend with up/down icons
- Glassmorphism card background
- Used in admin dashboard and analytics"

# --- 11
Write-Host "[11/30] Skeleton component..." -ForegroundColor Green
git add src/components/common/Skeleton.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(ui): add Skeleton loading placeholder

- Supports text, avatar and card skeletons
- Pulse animation for loading indication
- Composable via SkeletonGroup wrapper
- Replaces spinner in list-heavy views"

# --- 12
Write-Host "[12/30] ErrorBoundary component..." -ForegroundColor Green
git add src/components/common/ErrorBoundary.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(ui): add ErrorBoundary class component

- Catches render errors in child tree
- Shows friendly error message UI
- Reset button to retry rendering
- Logs error to console in development"

# --- 13
Write-Host "[13/30] ShebaBDLogo component..." -ForegroundColor Green
git add src/components/common/ShebaBDLogo.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(ui): add ShebaBDLogo SVG component

- Inline SVG for zero network request
- Accepts size and color props
- Dark mode aware color switching
- Used in navbar, footer and auth pages"

# --- 14
Write-Host "[14/30] useDebounce hook..." -ForegroundColor Green
git add src/hooks/useDebounce.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(hooks): add useDebounce hook

- Delays value update by configurable ms
- Cancels previous timer on each render
- Used in search inputs to reduce API calls
- Default delay 400ms, configurable per use"

# --- 15
Write-Host "[15/30] useFormValidation hook..." -ForegroundColor Green
git add src/hooks/useFormValidation.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(hooks): add useFormValidation hook

- Schema-based validation with error map
- validate() returns boolean pass/fail
- getFieldError() per-field error accessor
- clearErrors() resets validation state"

# --- 16
Write-Host "[16/30] useLocalStorage hook..." -ForegroundColor Green
git add src/hooks/useLocalStorage.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(hooks): add useLocalStorage hook

- useState wrapper with localStorage sync
- Handles JSON parse/stringify automatically
- SSR safe with try/catch fallback
- Used for theme, language and auth token"

# --- 17
Write-Host "[17/30] AuthContext..." -ForegroundColor Green
git add src/context/AuthContext.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(context): add AuthContext for user session

- Exposes user, token, isAuthenticated state
- login() and logout() actions
- Context consumed by useAuth hook
- Provider wraps entire application tree"

# --- 18
Write-Host "[18/30] LanguageProvider..." -ForegroundColor Green
git add src/context/LanguageProvider.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(context): add LanguageProvider for i18n

- Manages active locale: en or bn
- t() function for keyed translations
- Persists preference to localStorage
- Consumed by useLanguage hook"

# --- 19
Write-Host "[19/30] ThemeProvider..." -ForegroundColor Green
git add src/context/ThemeProvider.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(context): add ThemeProvider for dark/light mode

- Toggles data-theme attribute on document
- Persists preference in localStorage
- Consumed via useTheme hook
- Supports system preference detection"

# --- 20
Write-Host "[20/30] ToastContext..." -ForegroundColor Green
git add src/context/ToastContext.tsx
git commit --author="Murad <murad@shebabd.org>" -m "feat(context): add ToastContext for notifications

- showToast() triggers floating notification
- success, error, warning, info variants
- Auto-dismiss after configurable timeout
- Stack-based for multiple simultaneous toasts"

# --- 21
Write-Host "[21/30] authApi service..." -ForegroundColor Green
git add src/services/authApi.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(services): add authApi for authentication

- login() posts credentials and stores token
- register() creates new user account
- logout() clears token from storage
- getProfile() fetches current user data"

# --- 22
Write-Host "[22/30] bloodApi service..." -ForegroundColor Green
git add src/services/bloodApi.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(services): add bloodApi for donor endpoints

- searchDonors() with blood group and location filters
- registerDonor() posts donor profile
- updateAvailability() toggles donor status
- getCompatibleGroups() returns match list"

# --- 23
Write-Host "[23/30] eventsApi service..." -ForegroundColor Green
git add src/services/eventsApi.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(services): add eventsApi for events CRUD

- getEvents() with pagination and category filter
- getEventById() fetches single event detail
- registerForEvent() posts participant record
- cancelRegistration() removes participant"

# --- 24
Write-Host "[24/30] organizationsApi service..." -ForegroundColor Green
git add src/services/organizationsApi.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(services): add organizationsApi

- getOrganizations() with category filter
- getOrganizationById() for detail view
- getFeaturedOrganizations() for home page
- Pagination support via limit and skip"

# --- 25
Write-Host "[25/30] currencyFormatter util..." -ForegroundColor Green
git add src/utils/currencyFormatter.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add currency formatter utility

- formatBDT() formats number as Bangladeshi Taka
- Supports compact notation for large values
- Locale-aware using Intl.NumberFormat
- Used in donation cards and payment forms"

# --- 26
Write-Host "[26/30] dateFormatter util..." -ForegroundColor Green
git add src/utils/dateFormatter.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add date formatter utilities

- formatDate() outputs localized date string
- formatRelative() returns time-ago format
- formatEventDate() formats event date range
- Supports both English and Bengali locales"

# --- 27
Write-Host "[27/30] validators util..." -ForegroundColor Green
git add src/utils/validators.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add form validation utilities

- isValidEmail() checks RFC 5322 format
- isValidPhone() validates BD mobile numbers
- isStrongPassword() checks complexity rules
- isValidNID() validates national ID length"

# --- 28
Write-Host "[28/30] apiError util..." -ForegroundColor Green
git add src/utils/apiError.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add API error handler utility

- parseApiError() extracts message from response
- isNetworkError() detects offline status
- formatValidationErrors() maps 422 details
- Used in all service catch blocks"

# --- 29
Write-Host "[29/30] blood.types..." -ForegroundColor Green
git add src/types/blood.types.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(types): add blood donation type definitions

- BloodGroup enum for all 8 blood types
- DonorProfile interface for donor data
- BloodRequest interface for request records
- DonorSearchParams for filter params"

# --- 30
Write-Host "[30/30] events.types..." -ForegroundColor Green
git add src/types/events.types.ts
git commit --author="Murad <murad@shebabd.org>" -m "feat(types): add events type definitions

- EventCategory enum for event types
- Event interface with full field set
- EventRegistration interface for participants
- EventsFilterParams for list queries"

Write-Host "Pushing frontend to GitHub..." -ForegroundColor Yellow
git push origin feature/murad-frontend

Write-Host ""
Write-Host "Frontend done! 30 commits pushed." -ForegroundColor Green
Write-Host ""

# ============================================================
# BACKEND - murad/backend  (30 commits)
# ============================================================

Write-Host "Switching to murad/backend..." -ForegroundColor Yellow
git checkout murad/backend

# --- 1
Write-Host "[1/30 BE] search_service..." -ForegroundColor Green
git add backend/app/services/search_service.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(services): add unified global search service

- Search across donors, organizations and events
- Case-insensitive LIKE queries with SQLAlchemy
- Returns grouped SearchResult dataclass objects
- global_search combines all types in one call"

# --- 2
Write-Host "[2/30 BE] file_handler utility..." -ForegroundColor Green
git add backend/app/utils/file_handler.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add file upload validation handler

- validate_image checks type and 5MB size limit
- validate_document checks type and 10MB size limit
- generate_filename creates unique names with UUID
- get_upload_path ensures upload directories exist"

# --- 3
Write-Host "[3/30 BE] text_helpers utility..." -ForegroundColor Green
git add backend/app/utils/text_helpers.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add text processing helper functions

- slugify converts text to URL-friendly format
- normalize_search cleans query strings
- sanitize_html strips tags to prevent XSS
- highlight_match wraps search terms in mark tags"

# --- 4
Write-Host "[4/30 BE] pagination utility..." -ForegroundColor Green
git add backend/app/utils/pagination.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add pagination helper for query results

- paginate_query() applies limit/skip to SQLAlchemy query
- get_pagination_meta() returns total, page and pages
- PaginatedResponse dataclass wraps list and meta
- Used in blood, events and organizations endpoints"

# --- 5
Write-Host "[5/30 BE] password utility..." -ForegroundColor Green
git add backend/app/utils/password.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add password hashing utilities

- hash_password() uses bcrypt with salt rounds
- verify_password() constant-time comparison
- generate_reset_token() creates secure random token
- is_strong_password() enforces complexity rules"

# --- 6
Write-Host "[6/30 BE] security utility..." -ForegroundColor Green
git add backend/app/utils/security.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add JWT security helpers

- create_access_token() signs JWT with expiry
- decode_token() verifies and decodes JWT
- get_current_user() FastAPI dependency
- Raises 401 on expired or invalid tokens"

# --- 7
Write-Host "[7/30 BE] validators utility..." -ForegroundColor Green
git add backend/app/utils/validators.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add input validation utilities

- validate_bd_phone() checks 01X format
- validate_blood_group() verifies valid group
- validate_nid() checks length 10 or 17 digits
- validate_email() RFC-compliant regex check"

# --- 8
Write-Host "[8/30 BE] cache utility..." -ForegroundColor Green
git add backend/app/utils/cache.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add in-memory cache utility

- TTLCache stores key-value pairs with expiry
- get() returns None on miss or expired entry
- set() stores value with configurable TTL
- clear() removes all cached entries"

# --- 9
Write-Host "[9/30 BE] hash_helpers utility..." -ForegroundColor Green
git add backend/app/utils/hash_helpers.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add hashing helper functions

- md5_hash() for non-secure fingerprinting
- sha256_hash() for checksums
- generate_otp() creates 6-digit one-time code
- mask_phone() obscures middle digits for display"

# --- 10
Write-Host "[10/30 BE] responses utility..." -ForegroundColor Green
git add backend/app/utils/responses.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add standard API response helpers

- success_response() wraps data with status ok
- error_response() wraps message with status error
- paginated_response() includes meta and data keys
- Consistent JSON structure across all endpoints"

# --- 11
Write-Host "[11/30 BE] rate_limit_helpers utility..." -ForegroundColor Green
git add backend/app/utils/rate_limit_helpers.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add rate limiting helper functions

- get_client_ip() extracts IP from request headers
- build_rate_key() creates per-user limit key
- check_rate_limit() raises 429 when exceeded
- Used in auth and donation endpoints"

# --- 12
Write-Host "[12/30 BE] sanitizers utility..." -ForegroundColor Green
git add backend/app/utils/sanitizers.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add input sanitization utilities

- strip_html() removes all HTML tags
- clean_phone() normalizes phone number format
- trim_fields() strips whitespace from strings
- sanitize_search_query() escapes SQL wildcards"

# --- 13
Write-Host "[13/30 BE] metrics utility..." -ForegroundColor Green
git add backend/app/utils/metrics.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add platform metrics collector

- increment_counter() increments named metric
- get_all_metrics() returns snapshot dict
- track_response_time() records endpoint latency
- reset_metrics() clears all counters"

# --- 14
Write-Host "[14/30 BE] blood_matcher utility..." -ForegroundColor Green
git add backend/app/utils/blood_matcher.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(utils): add blood compatibility matcher

- COMPATIBILITY_MAP covers all 8 blood groups
- get_compatible_donors() filters donor list
- can_receive_from() checks donor-recipient pair
- is_universal_donor() detects O- blood group"

# --- 15
Write-Host "[15/30 BE] notification_service..." -ForegroundColor Green
git add backend/app/services/notification_service.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(services): add notification service

- send_blood_request_alert() notifies nearby donors
- send_event_reminder() emails registered participants
- send_donation_receipt() sends payment confirmation
- Queues notifications for async processing"

# --- 16
Write-Host "[16/30 BE] analytics_service..." -ForegroundColor Green
git add backend/app/services/analytics_service.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(services): add platform analytics service

- get_donation_summary() by date range
- get_blood_request_stats() with status breakdown
- get_event_participation_rate() per event
- get_active_users_count() for last 30 days"

# --- 17
Write-Host "[17/30 BE] scheduler service..." -ForegroundColor Green
git add backend/app/services/scheduler.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(services): add background task scheduler

- schedule_event_reminders() 24h before events
- cleanup_expired_tokens() daily at midnight
- send_weekly_digest() emails to active users
- Uses APScheduler with AsyncIO backend"

# --- 18
Write-Host "[18/30 BE] report_service..." -ForegroundColor Green
git add backend/app/services/report_service.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(services): add platform report generation service

- get_new_users_count for registration trends
- get_blood_requests_report with fulfill rate
- get_emergency_report grouped by priority
- get_full_report combines all metrics in one call"

# --- 19
Write-Host "[19/30 BE] email_service..." -ForegroundColor Green
git add backend/app/services/email_service.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(services): add email service with templates

- send_welcome_email() for new registrations
- send_password_reset() with secure OTP link
- send_donation_confirmation() with receipt PDF
- Uses SMTP with TLS and async queue"

# --- 20
Write-Host "[20/30 BE] blood.py API endpoint..." -ForegroundColor Green
git add backend/app/api/blood.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(api): add blood donation API endpoints

- GET /blood/donors with search and filter params
- POST /blood/register creates new donor profile
- PATCH /blood/availability toggles donor status
- GET /blood/compatible returns compatible groups"

# --- 21
Write-Host "[21/30 BE] auth.py API endpoint..." -ForegroundColor Green
git add backend/app/api/auth.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(api): add authentication API endpoints

- POST /auth/register creates user account
- POST /auth/login returns JWT access token
- GET /auth/me returns current user profile
- POST /auth/logout invalidates session token"

# --- 22
Write-Host "[22/30 BE] events.py API endpoint..." -ForegroundColor Green
git add backend/app/api/events.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(api): add events CRUD API endpoints

- GET /events with pagination and filters
- GET /events/{id} returns event detail
- POST /events/{id}/register adds participant
- DELETE /events/{id}/register removes registration"

# --- 23
Write-Host "[23/30 BE] organizations.py API..." -ForegroundColor Green
git add backend/app/api/organizations.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(api): add organizations API endpoints

- GET /organizations with category filter
- GET /organizations/{id} returns org detail
- GET /organizations/featured for home page
- Pagination and sorting by rating"

# --- 24
Write-Host "[24/30 BE] emergency.py API..." -ForegroundColor Green
git add backend/app/api/emergency.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(api): add emergency request API

- POST /emergency creates urgent request
- GET /emergency lists active emergencies
- PATCH /emergency/{id}/status updates status
- Sends alert notifications to nearby donors"

# --- 25
Write-Host "[25/30 BE] community.py API..." -ForegroundColor Green
git add backend/app/api/community.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(api): add community forum API endpoints

- GET /community/posts returns paginated posts
- POST /community/posts creates new post
- POST /community/posts/{id}/reply adds reply
- POST /community/posts/{id}/like toggles like"

# --- 26
Write-Host "[26/30 BE] donations.py API..." -ForegroundColor Green
git add backend/app/api/donations.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(api): add donations API endpoints

- POST /donations/initiate creates payment session
- POST /donations/verify verifies payment gateway
- GET /donations/history returns user history
- GET /donations/receipt/{id} returns PDF receipt"

# --- 27
Write-Host "[27/30 BE] config.py..." -ForegroundColor Green
git add backend/app/config.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(config): add centralized app configuration

- Settings class reads from .env via pydantic
- DATABASE_URL with SQLite fallback for dev
- JWT_SECRET and token expiry settings
- CORS origins and OpenAI key config"

# --- 28
Write-Host "[28/30 BE] database.py..." -ForegroundColor Green
git add backend/app/database.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(db): add SQLAlchemy database connection

- create_engine with connection pool settings
- SessionLocal factory for request sessions
- get_db() FastAPI dependency for session injection
- Base declarative model for all ORM models"

# --- 29
Write-Host "[29/30 BE] models.py..." -ForegroundColor Green
git add backend/app/models.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(db): add SQLAlchemy ORM models

- User model with role and profile fields
- BloodDonor model linked to User
- Event and EventRegistration models
- Organization and Donation models"

# --- 30
Write-Host "[30/30 BE] main.py..." -ForegroundColor Green
git add backend/app/main.py
git commit --author="Murad <murad@shebabd.org>" -m "feat(app): add FastAPI app entry point

- Registers all API routers with prefixes
- Adds CORS, rate limiting middleware
- Starts scheduler on startup event
- Health check endpoint at GET /health"

Write-Host "Pushing backend to GitHub..." -ForegroundColor Yellow
git push origin murad/backend

Write-Host ""
Write-Host "Backend done! 30 commits pushed." -ForegroundColor Green
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
Write-Host "  ALL DONE - MURAD!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Commit count per author:" -ForegroundColor White
git shortlog -sn --all
Write-Host ""
Write-Host "Branches updated:" -ForegroundColor White
Write-Host "  feature/murad-frontend  +30 commits" -ForegroundColor Green
Write-Host "  murad/backend           +30 commits" -ForegroundColor Green
Write-Host "  development             merged"       -ForegroundColor Green
Write-Host ""
Write-Host "Check: https://github.com/fahim1488/ShebaBD/graphs/contributors" -ForegroundColor Cyan
Write-Host ""
