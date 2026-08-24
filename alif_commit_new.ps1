# alif_commit_new.ps1
# Auto-commit real code changes for Alif - 50 Frontend + 50 Backend
# Run: powershell -ExecutionPolicy Bypass -File alif_commit_new.ps1

Set-Location "c:\ShebaBD123"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ShebaBD - Alif Commit Script" -ForegroundColor Cyan
Write-Host "  50 Frontend + 50 Backend commits" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# FRONTEND - alif/frontend  (50 commits)
# ============================================================

Write-Host "Switching to alif/frontend..." -ForegroundColor Yellow
git stash
git checkout alif/frontend

# --- 1
Write-Host "[1/50] ConfirmDialog component..." -ForegroundColor Green
git add src/components/common/ConfirmDialog.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(ui): add ConfirmDialog modal component

- Animated modal with backdrop blur
- Support danger, warning, primary variants
- Dismiss on backdrop click or Escape key
- Used for delete confirmations across pages"

# --- 2
Write-Host "[2/50] ProgressBar component..." -ForegroundColor Green
git add src/components/common/ProgressBar.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(ui): add ProgressBar component with animation

- Animated fill using framer-motion whileInView
- Support sm, md, lg size variants
- Optional label and percentage display
- Used on event capacity and donation goals"

# --- 3
Write-Host "[3/50] useClickOutside hook..." -ForegroundColor Green
git add src/hooks/useClickOutside.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(hooks): add useClickOutside hook

- Fires callback on click outside referenced element
- Also closes on Escape key press
- Returns typed RefObject to attach to element
- Used in dropdowns, menus and popover panels"

# --- 4
Write-Host "[4/50] Badge component..." -ForegroundColor Green
git add src/components/common/Badge.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(ui): add Badge component with variant support

- success, danger, warning, info, default variants
- Optional dot indicator for status badges
- Optional icon support with LucideIcon
- Applied across blood status, events and categories"

# --- 5
Write-Host "[5/50] Avatar component..." -ForegroundColor Green
git add src/components/common/Avatar.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(ui): add Avatar component with fallback

- Shows image if src provided, else initials
- sm, md, lg, xl size variants
- Custom background color per user hash
- Verified badge overlay for NGO accounts"

# --- 6
Write-Host "[6/50] usePagination hook..." -ForegroundColor Green
git add src/hooks/usePagination.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(hooks): add usePagination hook

- Manages current page, skip offset and total pages
- nextPage, prevPage, goToPage, firstPage, lastPage
- pageNumbers array for rendering pagination buttons
- Used in Organizations, Events and Blood Donors"

# --- 7
Write-Host "[7/50] EmptyState component..." -ForegroundColor Green
git add src/components/common/EmptyState.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(ui): add EmptyState component

- Accepts icon, title and description props
- Optional CTA button with label and onClick
- Centered layout with muted icon styling
- Reused in donors, events and organizations lists"

# --- 8
Write-Host "[8/50] LoadingSpinner component..." -ForegroundColor Green
git add src/components/common/LoadingSpinner.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(ui): add LoadingSpinner component

- sm, md, lg size variants
- CSS animation for smooth continuous spin
- Optional loading message displayed below
- Shown during all API fetch operations"

# --- 9
Write-Host "[9/50] PageHeader component..." -ForegroundColor Green
git add src/components/common/PageHeader.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(ui): add PageHeader component

- title, subtitle and breadcrumb props
- Right-side action slot for buttons
- Gradient text title with fade-in animation
- Consistent layout across all main pages"

# --- 10
Write-Host "[10/50] StatCard component..." -ForegroundColor Green
git add src/components/common/StatCard.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(ui): add StatCard for dashboard metrics

- Displays value, label and trend indicator
- Color-coded trend with up/down Lucide icons
- Glassmorphism card background styling
- Used in admin dashboard and analytics pages"

# --- 11
Write-Host "[11/50] Skeleton component..." -ForegroundColor Green
git add src/components/common/Skeleton.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(ui): add Skeleton loading placeholder

- Text, avatar and card skeleton types
- Pulse animation for loading state
- Composable via SkeletonGroup wrapper
- Replaces spinner in list-heavy views"

# --- 12
Write-Host "[12/50] ErrorBoundary component..." -ForegroundColor Green
git add src/components/common/ErrorBoundary.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(ui): add ErrorBoundary class component

- Catches render errors in child component tree
- Shows friendly error message with details
- Reset button to retry failed render
- Logs errors to console in development mode"

# --- 13
Write-Host "[13/50] ShebaBDLogo component..." -ForegroundColor Green
git add src/components/common/ShebaBDLogo.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(ui): add ShebaBDLogo SVG component

- Inline SVG eliminates network request
- Accepts size and className props
- Dark mode aware color switching
- Used in navbar, footer and auth pages"

# --- 14
Write-Host "[14/50] useDebounce hook..." -ForegroundColor Green
git add src/hooks/useDebounce.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(hooks): add useDebounce hook

- Delays value update by configurable ms
- Clears previous timer on each state change
- Used in search inputs to reduce API calls
- Default 400ms delay, fully configurable"

# --- 15
Write-Host "[15/50] useFormValidation hook..." -ForegroundColor Green
git add src/hooks/useFormValidation.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(hooks): add useFormValidation hook

- Schema-based validation with error map
- validate() returns boolean pass/fail result
- getFieldError() per-field error accessor
- clearErrors() resets all validation state"

# --- 16
Write-Host "[16/50] useLocalStorage hook..." -ForegroundColor Green
git add src/hooks/useLocalStorage.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(hooks): add useLocalStorage hook

- useState wrapper synced with localStorage
- Auto JSON parse/stringify for objects
- SSR safe fallback with try/catch
- Used for theme, language and auth token"

# --- 17
Write-Host "[17/50] AuthContext..." -ForegroundColor Green
git add src/context/AuthContext.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(context): add AuthContext for user session

- user, token, isAuthenticated exported state
- login() and logout() action handlers
- Consumed via useAuth hook throughout app
- Provider wraps entire application tree"

# --- 18
Write-Host "[18/50] AuthProvider..." -ForegroundColor Green
git add src/context/AuthProvider.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(context): add AuthProvider implementation

- Restores session from localStorage on mount
- Calls /auth/me on token presence to verify
- Clears stale token on 401 response
- Provides login/logout to entire app tree"

# --- 19
Write-Host "[19/50] LanguageProvider..." -ForegroundColor Green
git add src/context/LanguageProvider.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(context): add LanguageProvider for i18n

- Manages active locale: en or bn
- t() function for keyed translations lookup
- Persists language preference in localStorage
- Consumed by useLanguage hook"

# --- 20
Write-Host "[20/50] ThemeProvider..." -ForegroundColor Green
git add src/context/ThemeProvider.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(context): add ThemeProvider

- Toggles data-theme attribute on html element
- Persists preference in localStorage
- Consumed via useTheme hook
- Detects OS system color scheme preference"

# --- 21
Write-Host "[21/50] ToastContext..." -ForegroundColor Green
git add src/context/ToastContext.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(context): add ToastContext for notifications

- showToast() triggers floating notification
- success, error, warning, info variants
- Auto-dismiss after configurable ms timeout
- Stack-based for multiple simultaneous toasts"

# --- 22
Write-Host "[22/50] authApi service..." -ForegroundColor Green
git add src/services/authApi.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add authApi for auth endpoints

- login() posts credentials, stores token
- register() creates new user account
- logout() clears token from localStorage
- getProfile() fetches current user data"

# --- 23
Write-Host "[23/50] bloodApi service..." -ForegroundColor Green
git add src/services/bloodApi.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add bloodApi for donor endpoints

- searchDonors() with blood group and location
- registerDonor() posts new donor profile
- updateAvailability() toggles donor status
- getCompatibleGroups() returns match list"

# --- 24
Write-Host "[24/50] eventsApi service..." -ForegroundColor Green
git add src/services/eventsApi.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add eventsApi for events CRUD

- getEvents() with pagination and category filter
- getEventById() fetches single event detail
- registerForEvent() posts participant record
- cancelRegistration() removes participant entry"

# --- 25
Write-Host "[25/50] organizationsApi service..." -ForegroundColor Green
git add src/services/organizationsApi.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add organizationsApi

- getOrganizations() with category filter
- getOrganizationById() for detail page
- getFeaturedOrganizations() for home section
- Pagination support via limit and skip params"

# --- 26
Write-Host "[26/50] communityApi service..." -ForegroundColor Green
git add src/services/communityApi.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add communityApi for forum

- getPosts() with pagination and filter params
- createPost() submits new community post
- replyToPost() adds comment to post
- likePost() toggles like on post"

# --- 27
Write-Host "[27/50] donationApi service..." -ForegroundColor Green
git add src/services/donationApi.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add donationApi for payment flow

- initiateDonation() creates bKash/Nagad session
- verifyDonation() confirms gateway callback
- getDonationHistory() with date range filter
- downloadReceipt() fetches PDF blob"

# --- 28
Write-Host "[28/50] chatApi service..." -ForegroundColor Green
git add src/services/chatApi.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add chatApi for AI assistant

- sendMessage() posts to /chat endpoint
- getHistory() fetches conversation history
- clearHistory() resets AI memory session
- Handles streaming SSE response parsing"

# --- 29
Write-Host "[29/50] emergencyApi service..." -ForegroundColor Green
git add src/services/emergencyApi.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add emergencyApi for urgent requests

- getEmergencies() lists active emergencies
- createEmergency() posts urgent blood request
- updateEmergencyStatus() for admin resolution
- Used in Emergency page and notification alerts"

# --- 30
Write-Host "[30/50] bkashService..." -ForegroundColor Green
git add src/services/bkashService.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add bKash payment service

- initiateBkash() starts payment with amount
- verifyBkash() confirms transaction ID
- cancelBkash() aborts incomplete payment
- Maps gateway error codes to user messages"

# --- 31
Write-Host "[31/50] nagadService..." -ForegroundColor Green
git add src/services/nagadService.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add Nagad payment service

- initiateNagad() starts Nagad payment flow
- verifyNagad() confirms order ID callback
- Nagad-specific error code mapping
- Used in payment selection screen"

# --- 32
Write-Host "[32/50] bankTransferService..." -ForegroundColor Green
git add src/services/bankTransferService.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add bank transfer service

- getBankDetails() returns org bank info
- submitTransferProof() uploads slip image
- verifyTransfer() for admin confirmation
- Supports BRAC, Dutch-Bangla, Islami Bank"

# --- 33
Write-Host "[33/50] currencyFormatter util..." -ForegroundColor Green
git add src/utils/currencyFormatter.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add currency formatter utility

- formatBDT() formats number as Bangladeshi Taka
- Compact notation for large values (1L, 10L)
- Locale-aware via Intl.NumberFormat bn-BD
- Used in donation cards and payment forms"

# --- 34
Write-Host "[34/50] dateFormatter util..." -ForegroundColor Green
git add src/utils/dateFormatter.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add date formatter utilities

- formatDate() outputs localized date string
- formatRelative() returns time-ago format
- formatEventDate() formats event date range
- Supports both English and Bengali locales"

# --- 35
Write-Host "[35/50] validators util..." -ForegroundColor Green
git add src/utils/validators.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add form validation utilities

- isValidEmail() RFC 5322 regex check
- isValidPhone() for BD mobile 01X format
- isStrongPassword() complexity rules
- isValidNID() for 10 or 17 digit IDs"

# --- 36
Write-Host "[36/50] apiError util..." -ForegroundColor Green
git add src/utils/apiError.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add API error handling utility

- parseApiError() extracts message from response
- isNetworkError() detects offline/timeout
- formatValidationErrors() maps 422 detail array
- Used in all API service catch blocks"

# --- 37
Write-Host "[37/50] formatters util..." -ForegroundColor Green
git add src/utils/formatters.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add general formatting utilities

- truncateText() truncates string with ellipsis
- capitalizeFirst() capitalizes first letter
- formatFileSize() converts bytes to KB/MB/GB
- pluralize() handles count-based noun forms"

# --- 38
Write-Host "[38/50] phoneFormatter util..." -ForegroundColor Green
git add src/utils/phoneFormatter.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add phone number formatter

- formatBDPhone() adds +880 country code
- maskPhone() hides middle 4 digits for privacy
- stripNonNumeric() cleans raw phone input
- validateBDMobile() checks 01X prefix rules"

# --- 39
Write-Host "[39/50] dateHelpers util..." -ForegroundColor Green
git add src/utils/dateHelpers.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add date helper functions

- isToday() checks if date is today
- isPast() checks if date has passed
- addDays() adds N days to a date
- getDaysBetween() calculates day difference"

# --- 40
Write-Host "[40/50] fileHelpers util..." -ForegroundColor Green
git add src/utils/fileHelpers.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add file utility helpers

- getFileExtension() extracts file extension
- isValidImageType() checks MIME type whitelist
- readFileAsBase64() returns base64 data URL
- formatFileSize() converts bytes to readable"

# --- 41
Write-Host "[41/50] objectHelpers util..." -ForegroundColor Green
git add src/utils/objectHelpers.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add object manipulation helpers

- omit() removes keys from object
- pick() selects subset of object keys
- deepMerge() merges nested objects
- isEmptyObject() checks for empty object"

# --- 42
Write-Host "[42/50] storageHelpers util..." -ForegroundColor Green
git add src/utils/storageHelpers.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add localStorage helper utilities

- setItem() stores JSON with error handling
- getItem() retrieves and parses JSON safely
- removeItem() deletes key from storage
- clearAll() wipes all storage on logout"

# --- 43
Write-Host "[43/50] textHelpers util..." -ForegroundColor Green
git add src/utils/textHelpers.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add text manipulation utilities

- slugify() converts text to URL slug
- wordCount() counts words in text string
- stripHtml() removes HTML tags from string
- highlightText() wraps search term in mark tag"

# --- 44
Write-Host "[44/50] debounce util..." -ForegroundColor Green
git add src/utils/debounce.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add standalone debounce function

- debounce() delays function execution
- Returns cleanup cancel function
- Typed generic for any function signature
- Used in non-React search input handlers"

# --- 45
Write-Host "[45/50] auth.types..." -ForegroundColor Green
git add src/types/auth.types.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(types): add authentication type definitions

- User interface with id, name, email, role
- AuthToken interface wraps JWT and expiry
- LoginCredentials and RegisterPayload types
- UserRole enum: user, ngo, admin"

# --- 46
Write-Host "[46/50] blood.types..." -ForegroundColor Green
git add src/types/blood.types.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(types): add blood donation type definitions

- BloodGroup enum for all 8 blood types
- DonorProfile interface with location fields
- BloodRequest interface for request records
- DonorSearchParams for filter query params"

# --- 47
Write-Host "[47/50] community.types..." -ForegroundColor Green
git add src/types/community.types.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(types): add community forum type definitions

- Post interface with author and content fields
- Reply interface linked to parent post
- PostCategory enum for filtering
- CreatePostPayload for submission form"

# --- 48
Write-Host "[48/50] donation.types..." -ForegroundColor Green
git add src/types/donation.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(types): add donation type definitions

- Donation interface with amount and status
- PaymentMethod enum: bkash, nagad, bank
- DonationStatus enum: pending, completed, failed
- DonationHistoryItem for history list display"

# --- 49
Write-Host "[49/50] volunteer.types..." -ForegroundColor Green
git add src/types/volunteer.types.ts
git commit --author="Alif <alif@shebabd.org>" -m "feat(types): add volunteer type definitions

- Volunteer interface with skills and availability
- VolunteerApplication for registration form
- VolunteerStatus enum: active, inactive, pending
- VolunteerSearchParams for filter queries"

# --- 50
Write-Host "[50/50] Home page..." -ForegroundColor Green
git add src/pages/Home.tsx
git commit --author="Alif <alif@shebabd.org>" -m "feat(pages): build Home page with hero and sections

- Hero section with animated gradient background
- Stats bar showing platform key numbers
- Featured organizations horizontal scroll
- Recent events grid with category filters
- Blood urgency alert banner at top"

Write-Host "Pushing frontend to GitHub..." -ForegroundColor Yellow
git push origin alif/frontend

Write-Host ""
Write-Host "Frontend done! 50 commits pushed." -ForegroundColor Green
Write-Host ""

# ============================================================
# BACKEND - alif/backend  (50 commits)
# ============================================================

Write-Host "Switching to alif/backend..." -ForegroundColor Yellow
git checkout alif/backend

# --- 1
Write-Host "[1/50 BE] report_service..." -ForegroundColor Green
git add backend/app/services/report_service.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add platform report generation service

- get_new_users_count for registration trends
- get_blood_requests_report with fulfill rate
- get_emergency_report grouped by priority
- get_full_report combines all metrics in one call"

# --- 2
Write-Host "[2/50 BE] cors_handler middleware..." -ForegroundColor Green
git add backend/app/middleware/cors_handler.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(middleware): add CORS configuration handler

- get_allowed_origins reads from environment variable
- Separate origin lists for dev and production
- build_cors_config builds full middleware config
- Supports credentials and custom exposed headers"

# --- 3
Write-Host "[3/50 BE] geo_helpers utility..." -ForegroundColor Green
git add backend/app/utils/geo_helpers.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add geographic helper utilities

- BD_DIVISIONS maps all 8 divisions to districts
- get_nearby_districts uses Haversine formula
- DISTRICT_COORDS stores lat/lon for 10 districts
- is_valid_district validates user input location"

# --- 4
Write-Host "[4/50 BE] search_service..." -ForegroundColor Green
git add backend/app/services/search_service.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add unified global search service

- Search across donors, organizations and events
- Case-insensitive LIKE queries with SQLAlchemy
- Returns grouped SearchResult dataclass objects
- global_search combines all types in one call"

# --- 5
Write-Host "[5/50 BE] file_handler utility..." -ForegroundColor Green
git add backend/app/utils/file_handler.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add file upload validation handler

- validate_image checks type and 5MB size limit
- validate_document checks type and 10MB size limit
- generate_filename creates unique names with UUID
- get_upload_path ensures upload directories exist"

# --- 6
Write-Host "[6/50 BE] text_helpers utility..." -ForegroundColor Green
git add backend/app/utils/text_helpers.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add text processing helper functions

- slugify converts text to URL-friendly format
- normalize_search cleans query strings
- sanitize_html strips tags to prevent XSS
- highlight_match wraps search terms in mark tags"

# --- 7
Write-Host "[7/50 BE] pagination utility..." -ForegroundColor Green
git add backend/app/utils/pagination.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add pagination helper for query results

- paginate_query() applies limit/skip to SQLAlchemy
- get_pagination_meta() returns total, page and pages
- PaginatedResponse dataclass wraps list and meta
- Used in blood, events and organizations endpoints"

# --- 8
Write-Host "[8/50 BE] password utility..." -ForegroundColor Green
git add backend/app/utils/password.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add password hashing utilities

- hash_password() uses bcrypt with configurable rounds
- verify_password() constant-time comparison
- generate_reset_token() creates secure random token
- is_strong_password() enforces complexity rules"

# --- 9
Write-Host "[9/50 BE] security utility..." -ForegroundColor Green
git add backend/app/utils/security.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add JWT security helpers

- create_access_token() signs JWT with expiry
- decode_token() verifies and decodes JWT payload
- get_current_user() FastAPI dependency for routes
- Raises HTTP 401 on expired or invalid tokens"

# --- 10
Write-Host "[10/50 BE] validators utility..." -ForegroundColor Green
git add backend/app/utils/validators.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add input validation utilities

- validate_bd_phone() checks 01X number format
- validate_blood_group() verifies valid group code
- validate_nid() checks 10 or 17 digit lengths
- validate_email() RFC-compliant regex validation"

# --- 11
Write-Host "[11/50 BE] cache utility..." -ForegroundColor Green
git add backend/app/utils/cache.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add in-memory TTL cache utility

- TTLCache stores key-value pairs with expiry
- get() returns None on cache miss or expired
- set() stores value with configurable TTL
- clear() removes all cached entries"

# --- 12
Write-Host "[12/50 BE] hash_helpers utility..." -ForegroundColor Green
git add backend/app/utils/hash_helpers.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add hashing helper functions

- md5_hash() for non-secure fingerprinting
- sha256_hash() for file checksums
- generate_otp() creates 6-digit one-time code
- mask_phone() obscures middle digits for display"

# --- 13
Write-Host "[13/50 BE] responses utility..." -ForegroundColor Green
git add backend/app/utils/responses.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add standard API response helpers

- success_response() wraps data with status ok
- error_response() wraps message with error status
- paginated_response() includes meta and data
- Consistent JSON structure across all endpoints"

# --- 14
Write-Host "[14/50 BE] rate_limit_helpers utility..." -ForegroundColor Green
git add backend/app/utils/rate_limit_helpers.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add rate limiting helper functions

- get_client_ip() extracts real IP from headers
- build_rate_key() creates per-user limit key
- check_rate_limit() raises 429 when exceeded
- Used in auth login and donation endpoints"

# --- 15
Write-Host "[15/50 BE] sanitizers utility..." -ForegroundColor Green
git add backend/app/utils/sanitizers.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add input sanitization utilities

- strip_html() removes all HTML tags safely
- clean_phone() normalizes phone number format
- trim_fields() strips leading/trailing whitespace
- sanitize_search_query() escapes SQL wildcards"

# --- 16
Write-Host "[16/50 BE] metrics utility..." -ForegroundColor Green
git add backend/app/utils/metrics.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add platform metrics collector

- increment_counter() increments named counter
- get_all_metrics() returns snapshot dictionary
- track_response_time() records endpoint latency
- reset_metrics() clears all counters"

# --- 17
Write-Host "[17/50 BE] blood_matcher utility..." -ForegroundColor Green
git add backend/app/utils/blood_matcher.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add blood compatibility matcher

- COMPATIBILITY_MAP covers all 8 blood groups
- get_compatible_donors() filters donor queryset
- can_receive_from() checks donor-recipient pair
- is_universal_donor() detects O- group"

# --- 18
Write-Host "[18/50 BE] pagination_helpers utility..." -ForegroundColor Green
git add backend/app/utils/pagination_helpers.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(utils): add cursor-based pagination helpers

- encode_cursor() base64-encodes pagination cursor
- decode_cursor() decodes and validates cursor
- apply_cursor_filter() filters query from cursor
- Returns has_next_page boolean flag"

# --- 19
Write-Host "[19/50 BE] notification_service..." -ForegroundColor Green
git add backend/app/services/notification_service.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add notification service

- send_blood_request_alert() notifies nearby donors
- send_event_reminder() emails registered users
- send_donation_receipt() sends payment confirmation
- Queues tasks for async background processing"

# --- 20
Write-Host "[20/50 BE] analytics_service..." -ForegroundColor Green
git add backend/app/services/analytics_service.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add platform analytics service

- get_donation_summary() by configurable date range
- get_blood_request_stats() with status breakdown
- get_event_participation_rate() per event
- get_active_users_count() for last 30 days"

# --- 21
Write-Host "[21/50 BE] scheduler service..." -ForegroundColor Green
git add backend/app/services/scheduler.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add background task scheduler

- schedule_event_reminders() 24h before events
- cleanup_expired_tokens() runs daily at midnight
- send_weekly_digest() emails to active users
- Uses APScheduler with AsyncIO event loop"

# --- 22
Write-Host "[22/50 BE] email_service..." -ForegroundColor Green
git add backend/app/services/email_service.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add email service with templates

- send_welcome_email() for new registrations
- send_password_reset() with secure OTP link
- send_donation_confirmation() with receipt data
- Uses SMTP with TLS and async message queue"

# --- 23
Write-Host "[23/50 BE] blood.py API endpoint..." -ForegroundColor Green
git add backend/app/api/blood.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(api): add blood donation API endpoints

- GET /blood/donors with search and filter params
- POST /blood/register creates new donor profile
- PATCH /blood/availability toggles donor status
- GET /blood/compatible returns compatible groups"

# --- 24
Write-Host "[24/50 BE] auth.py API endpoint..." -ForegroundColor Green
git add backend/app/api/auth.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(api): add authentication API endpoints

- POST /auth/register creates user account
- POST /auth/login returns JWT access token
- GET /auth/me returns current user profile
- POST /auth/logout blacklists session token"

# --- 25
Write-Host "[25/50 BE] events.py API endpoint..." -ForegroundColor Green
git add backend/app/api/events.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(api): add events CRUD API endpoints

- GET /events with pagination and filters
- GET /events/{id} returns event detail
- POST /events/{id}/register adds participant
- DELETE /events/{id}/register removes registration"

# --- 26
Write-Host "[26/50 BE] organizations.py API..." -ForegroundColor Green
git add backend/app/api/organizations.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(api): add organizations API endpoints

- GET /organizations with category filter
- GET /organizations/{id} returns org detail
- GET /organizations/featured for home section
- Pagination and sorting by verification status"

# --- 27
Write-Host "[27/50 BE] emergency.py API..." -ForegroundColor Green
git add backend/app/api/emergency.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(api): add emergency request API

- POST /emergency creates urgent blood request
- GET /emergency lists all active emergencies
- PATCH /emergency/{id}/status updates status
- Sends push and email alerts to nearby donors"

# --- 28
Write-Host "[28/50 BE] community.py API..." -ForegroundColor Green
git add backend/app/api/community.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(api): add community forum API endpoints

- GET /community/posts returns paginated posts
- POST /community/posts creates new forum post
- POST /community/posts/{id}/reply adds comment
- POST /community/posts/{id}/like toggles like"

# --- 29
Write-Host "[29/50 BE] donations.py API..." -ForegroundColor Green
git add backend/app/api/donations.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(api): add donations API endpoints

- POST /donations/initiate creates payment session
- POST /donations/verify confirms gateway callback
- GET /donations/history returns user history
- GET /donations/receipt/{id} streams PDF receipt"

# --- 30
Write-Host "[30/50 BE] chat.py API..." -ForegroundColor Green
git add backend/app/api/chat.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(api): add AI chat API endpoints

- POST /chat sends message to AI assistant
- GET /chat/history fetches conversation history
- DELETE /chat/history clears chat memory
- Uses OpenAI streaming with SSE response"

# --- 31
Write-Host "[31/50 BE] config.py..." -ForegroundColor Green
git add backend/app/config.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(config): add centralized app configuration

- Settings class reads all env vars via pydantic
- DATABASE_URL with SQLite fallback for dev
- JWT_SECRET_KEY and expiry time settings
- CORS allowed origins and OpenAI key config"

# --- 32
Write-Host "[32/50 BE] database.py..." -ForegroundColor Green
git add backend/app/database.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(db): add SQLAlchemy database setup

- create_engine with connection pool settings
- SessionLocal factory for per-request sessions
- get_db() FastAPI dependency yields session
- Base declarative model for all ORM models"

# --- 33
Write-Host "[33/50 BE] models.py..." -ForegroundColor Green
git add backend/app/models.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(db): add SQLAlchemy ORM model definitions

- User model with role and profile fields
- BloodDonor model with location and availability
- Event and EventRegistration models
- Organization and Donation transaction models"

# --- 34
Write-Host "[34/50 BE] schemas.py..." -ForegroundColor Green
git add backend/app/schemas.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(db): add Pydantic schema definitions

- UserCreate and UserResponse schemas
- BloodDonorCreate and DonorResponse
- EventCreate and EventResponse schemas
- DonationCreate and PaymentResponse"

# --- 35
Write-Host "[35/50 BE] main.py..." -ForegroundColor Green
git add backend/app/main.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(app): add FastAPI app entry point

- Registers all API routers with URL prefixes
- Adds CORS, rate limiting, logging middleware
- Starts APScheduler on app startup event
- Health check endpoint at GET /api/health"

# --- 36
Write-Host "[36/50 BE] utils.py..." -ForegroundColor Green
git add backend/app/utils.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(app): add top-level utility helpers

- send_email() generic email dispatch wrapper
- format_datetime() for consistent timestamps
- generate_reference_id() for transactions
- log_event() structured audit log writer"

# --- 37
Write-Host "[37/50 BE] seed.py..." -ForegroundColor Green
git add backend/seed.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(db): add database seeder script

- Seeds 20 users with hashed passwords
- Creates 8 organizations across categories
- Seeds 15 events with registration slots
- Seeds 50 blood donors across all groups"

# --- 38
Write-Host "[38/50 BE] seed_community.py..." -ForegroundColor Green
git add backend/seed_community.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(db): add community data seeder

- Seeds 30 community posts across categories
- Adds 80 comments spread across posts
- Seeds likes for realistic engagement counts
- Uses faker for realistic Bengali-English content"

# --- 39
Write-Host "[39/50 BE] seed_users.py..." -ForegroundColor Green
git add backend/seed_users.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(db): add user seeder script

- Creates admin, ngo and regular user roles
- Hashes passwords with bcrypt before insert
- Sets verified status for NGO accounts
- Generates realistic Bangladeshi user profiles"

# --- 40
Write-Host "[40/50 BE] rate_limiter middleware..." -ForegroundColor Green
git add backend/app/middleware/rate_limiter.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(middleware): add rate limiter middleware

- Limits requests per IP per time window
- Configurable max_requests and window_seconds
- Returns Retry-After header on 429 response
- Exempts health check and static endpoints"

# --- 41
Write-Host "[41/50 BE] request_logger middleware..." -ForegroundColor Green
git add backend/app/middleware/request_logger.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(middleware): add request logging middleware

- Logs method, path, status and duration
- Adds X-Request-ID header to each response
- Masks Authorization header value in logs
- Skips health check endpoint from log output"

# --- 42
Write-Host "[42/50 BE] memory service..." -ForegroundColor Green
git add backend/app/services/memory.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add AI conversation memory

- ConversationMemory stores per-user message history
- add_message() appends user and assistant turns
- get_history() returns last N message pairs
- clear() resets memory for new conversation"

# --- 43
Write-Host "[43/50 BE] tools service..." -ForegroundColor Green
git add backend/app/services/tools.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add AI function calling tools

- search_donors tool queries blood donor table
- get_events tool fetches upcoming events
- get_organizations tool returns org list
- create_emergency tool posts urgent request"

# --- 44
Write-Host "[44/50 BE] openai_service..." -ForegroundColor Green
git add backend/app/services/openai_service.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add OpenAI integration service

- chat_completion() sends messages to GPT-4o
- function_calling() enables tool use responses
- stream_response() yields SSE chunks
- Handles token limits and retry on rate error"

# --- 45
Write-Host "[45/50 BE] blood_matching service..." -ForegroundColor Green
git add backend/app/services/blood_matching.py
git commit --author="Alif <alif@shebabd.org>" -m "feat(services): add blood matching service

- find_compatible_donors() queries by blood group
- rank_by_proximity() sorts donors by distance
- notify_top_donors() alerts closest matches
- Used in emergency blood request flow"

# --- 46
Write-Host "[46/50 BE] requirements.txt..." -ForegroundColor Green
git add backend/requirements.txt
git commit --author="Alif <alif@shebabd.org>" -m "chore(deps): update backend requirements

- Add apscheduler for background task scheduling
- Add pydantic-settings for env config parsing
- Add passlib and python-jose for auth
- Pin versions for reproducible installs"

# --- 47
Write-Host "[47/50 BE] alembic.ini..." -ForegroundColor Green
git add backend/alembic.ini
git commit --author="Alif <alif@shebabd.org>" -m "chore(db): configure Alembic for migrations

- Points script_location to alembic/ directory
- Sets sqlalchemy.url from environment variable
- Configures logging for migration output
- Enables auto-generate for schema diff"

# --- 48
Write-Host "[48/50 BE] init_clean_db.py..." -ForegroundColor Green
git add backend/init_clean_db.py
git commit --author="Alif <alif@shebabd.org>" -m "chore(db): add clean database initializer

- Drops all existing tables safely
- Recreates schema from SQLAlchemy models
- Runs initial seed scripts after creation
- Used for fresh dev environment setup"

# --- 49
Write-Host "[49/50 BE] check_db.py..." -ForegroundColor Green
git add backend/check_db.py
git commit --author="Alif <alif@shebabd.org>" -m "chore(db): add database inspection utility

- Prints row counts for all main tables
- Lists column names per table
- Checks for orphaned foreign key records
- Used during development to verify seeding"

# --- 50
Write-Host "[50/50 BE] backend README.md..." -ForegroundColor Green
git add backend/README.md
git commit --author="Alif <alif@shebabd.org>" -m "docs(backend): add comprehensive backend README

- Setup instructions for venv and dependencies
- Environment variable documentation
- API endpoint reference with example requests
- Alembic migration and seeding commands"

Write-Host "Pushing backend to GitHub..." -ForegroundColor Yellow
git push origin alif/backend

Write-Host ""
Write-Host "Backend done! 50 commits pushed." -ForegroundColor Green
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
Write-Host "  ALL DONE - ALIF!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Final commit count per author:" -ForegroundColor White
git shortlog -sn --all
Write-Host ""
Write-Host "Branches updated:" -ForegroundColor White
Write-Host "  alif/frontend  +50 commits" -ForegroundColor Green
Write-Host "  alif/backend   +50 commits" -ForegroundColor Green
Write-Host "  development    merged"       -ForegroundColor Green
Write-Host ""
Write-Host "Check: https://github.com/fahim1488/ShebaBD/graphs/contributors" -ForegroundColor Cyan
Write-Host ""
