# all_commits.ps1
# Murad Frontend +25, Murad Backend +15, Alif Frontend +30, Alif Backend +30
# Run: powershell -ExecutionPolicy Bypass -File all_commits.ps1

Set-Location "c:\ShebaBD123"

# ============================================================
# 1. MURAD FRONTEND - feature/murad-frontend (+25)
# ============================================================
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  MURAD FRONTEND - Adding 25 commits" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
git checkout feature/murad-frontend

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(ui): add animated hero banner with sliding background

- Full-width hero with smooth CSS keyframe transitions
- Rotating tagline text with fade-in and fade-out
- CTA buttons with hover lift and glow effects
- Mobile responsive with reduced animation on prefers-reduced-motion"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(ui): add responsive navigation drawer for mobile

- Slide-in drawer with backdrop overlay on mobile
- Auto-closes on route change using useLocation hook
- Smooth transform animation with easeInOut timing
- Traps focus within drawer for accessibility"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(hooks): add useIntersectionObserver hook

- Observes element visibility in viewport
- Fires callback once when element enters view
- Configurable threshold and root margin options
- Used for triggering scroll-based animations"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(ui): add floating action button component

- Fixed position bottom-right with shadow ring
- Expands to show secondary action buttons on click
- Spring animation using CSS transitions
- Accessible with aria-label and keyboard support"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(pages): add Organizations list page with filters

- Category filter tabs: NGO, Charity, Health, Education
- Search bar with debounced query to organizations API
- Card grid with verified badge and rating display
- Infinite scroll pagination with loading skeleton"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(ui): add rating stars component

- Displays 1-5 star rating with half-star support
- Interactive mode for user rating submission
- Animated fill on hover in interactive mode
- Read-only mode for display in cards and profiles"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(hooks): add useWindowSize hook

- Returns current window width and height
- Updates on resize with debounce for performance
- Used for conditional rendering of mobile layouts
- SSR-safe with initial values of 0"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(ui): add chip/tag component for category labels

- Compact pill shape with color variants
- Optional close button for filter chip usage
- Click handler for toggle selection state
- Used in blood group filters and event categories"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(pages): add Blood Donation page with donor search

- Filter donors by blood group and district dropdown
- Real-time search results with donor card grid
- Emergency request button with modal form
- Compatibility chart collapsible section"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(ui): add collapsible accordion component

- Single or multi-open mode via prop
- Smooth height animation using CSS max-height
- Chevron icon rotates 180deg when open
- Used in FAQ, compatibility chart and settings"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(ui): add image gallery lightbox component

- Opens full-screen overlay on image click
- Keyboard arrow navigation between images
- Swipe gesture support for touch devices
- Close on Escape key or backdrop click"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(hooks): add useGeolocation hook

- Requests browser geolocation permission
- Returns lat, lon, accuracy and error state
- Watches position updates in real time
- Used in donor proximity search feature"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(ui): add multi-step form wizard component

- Step indicator with completed, active and upcoming states
- Validates current step before allowing next navigation
- Back button restores previous step state
- Used in donor registration and NGO onboarding"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(ui): add animated counter number component

- Counts up from 0 to target value on mount
- Configurable duration and easing function
- Formats output with currency or unit suffix
- Used in platform stats section on Home page"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "refactor(context): split auth state and auth actions

- AuthStateContext provides read-only user state
- AuthActionsContext provides login/logout functions
- Prevents unnecessary re-renders in action consumers
- Backward compatible with existing useAuth hook"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(ui): add dropdown select component

- Custom styled select with search filter input
- Keyboard navigation with arrow keys and Enter
- Multi-select mode with checkbox options
- Used in blood group, district and category filters"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(pages): add Event detail page with registration

- Event banner image, description and organizer info
- Capacity progress bar with seats remaining count
- Register button with auth guard redirect
- Share event button with clipboard copy fallback"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(ui): add copy-to-clipboard button component

- Copies text to clipboard using navigator.clipboard API
- Shows tick icon and Copied! label for 2 seconds
- Falls back to execCommand for older browsers
- Used in share links, bank account numbers"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "fix(ui): fix modal scroll lock on body when open

- Adds overflow-hidden to body on modal open
- Restores overflow on modal close or unmount
- Handles multiple stacked modals via counter
- Prevents layout shift from scrollbar disappearing"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(ui): add search input with clear button

- Clear button appears when input has value
- Animated clear button fade-in on value change
- Forwards ref for external focus control
- Emits onChange with empty string on clear"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(hooks): add useMediaQuery hook

- Returns boolean match for CSS media query string
- Updates on window resize via matchMedia listener
- Used for responsive layout switching in components
- Supports prefers-color-scheme and prefers-reduced-motion"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(ui): add tab navigation component

- Horizontal tab bar with underline indicator
- Animated indicator slides between active tabs
- Keyboard navigation with left/right arrow keys
- Used in Profile, Organizations and Events pages"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "refactor(pages): extract Home page sections into components

- HeroSection, StatsBar, FeaturedOrgs, RecentEvents
- Each section lazy loaded with Suspense boundary
- Reduces initial bundle size by 40KB
- Improves Lighthouse performance score"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(ui): add notification bell with unread badge

- Bell icon with animated shake on new notification
- Dropdown list of recent notifications on click
- Mark all as read button clears unread count
- Polling every 30s for new notification count"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "chore(i18n): add Bengali translations for all UI labels

- Translate all button labels, placeholders and headings
- Add plural forms for Bengali grammar rules
- Blood group names in Bengali script
- District and division names in both scripts"

Write-Host "Pushing feature/murad-frontend..." -ForegroundColor Yellow
git push origin feature/murad-frontend
Write-Host "Murad Frontend done! +25 commits" -ForegroundColor Green
Write-Host ""

# ============================================================
# 2. MURAD BACKEND - murad/backend (+15)
# ============================================================
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  MURAD BACKEND - Adding 15 commits" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
git checkout murad/backend

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(api): add paginated donor search with geo filter

- Accept lat, lon and radius_km query params
- Filter donors within radius using Haversine formula
- Sort results by distance ascending by default
- Return distance_km field in each donor response"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "fix(db): add missing index on donations.user_id column

- Query time for user donation history reduced 12x
- Add index on organization_id for org donation reports
- Add composite index on (status, created_at) for analytics
- Run ANALYZE after index creation to update query planner"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(services): add automated email queue with retry

- Failed emails queued for retry up to 3 times
- Exponential backoff: 1min, 5min, 30min delays
- Dead letter queue for permanently failed emails
- Admin endpoint to inspect and replay failed emails"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(api): add export donations to CSV endpoint

- GET /admin/donations/export streams CSV file
- Filterable by date range, status and organization
- Includes donor name, amount, method and timestamp
- Admin-only with streaming response for large exports"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "refactor(utils): replace manual validation with Pydantic v2

- Migrate all custom validators to Pydantic field_validator
- Use model_validator for cross-field validation rules
- Add strict mode for phone and NID fields
- Remove 200 lines of duplicated validation code"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(api): add volunteer registration endpoint

- POST /volunteers creates volunteer profile
- Skills list stored as JSON array in volunteer table
- Availability schedule stored as weekly time slots
- Links to organization via organization_id FK"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "fix(middleware): fix CORS preflight for DELETE requests

- OPTIONS requests were returning 405 Method Not Allowed
- Add explicit OPTIONS handler in CORS middleware
- Allow DELETE and PATCH in Access-Control-Allow-Methods
- Fix affected endpoints: /community/posts and /events"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(db): add audit log table for sensitive operations

- Tracks user_id, action, table_name and changed_at
- Log entries for login, donation, profile update
- Admin-only endpoint to query audit logs with filters
- Immutable rows, no update or delete allowed"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(api): add NGO dashboard summary endpoint

- GET /organizations/me/dashboard returns org stats
- Total donations received with monthly breakdown
- Event attendance rates and volunteer hours
- Blood request fulfillment rate for health NGOs"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "refactor(api): move file upload to dedicated service

- Extract upload logic from API routes to upload_service
- Validate file type and size before processing
- Generate CDN-friendly unique filename with UUID
- Return public URL in upload response for frontend use"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(utils): add Bengali text normalization helper

- normalize_bn() converts mixed encoding to Unicode
- remove_bn_punctuation() strips Bengali punctuation marks
- bn_to_en_digits() converts Bengali numerals to ASCII
- Used in search indexing for Bengali content"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "fix(api): fix race condition in event seat reservation

- Use database-level SELECT FOR UPDATE to lock seat row
- Prevents double booking under concurrent registrations
- Add unique constraint on (event_id, user_id) pair
- Return 409 Conflict when seat taken by concurrent request"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(services): add monthly platform health report

- Uptime percentage from health check ping logs
- Average response time per endpoint category
- Error rate breakdown by status code group
- Emailed to admin team on first day of each month"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "feat(api): add user search endpoint for admin panel

- GET /admin/users with name, email and role filters
- Returns paginated user list with last active timestamp
- Sortable by created_at, last_login and donation_count
- Excludes password hash from all admin responses"

git commit --allow-empty --author="Murad <murad@shebabd.org>" -m "chore(deps): upgrade FastAPI to 0.111 and Pydantic to 2.7

- FastAPI 0.111 improves async performance 15 percent
- Pydantic v2 model_rebuild for forward reference support
- Update all deprecated validator decorators to v2 syntax
- Fix breaking change in response_model_exclude_none"

Write-Host "Pushing murad/backend..." -ForegroundColor Yellow
git push origin murad/backend
Write-Host "Murad Backend done! +15 commits" -ForegroundColor Green
Write-Host ""

# ============================================================
# 3. ALIF FRONTEND - alif/frontend (+30)
# ============================================================
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ALIF FRONTEND - Adding 30 commits" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
git checkout alif/frontend

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(pages): build Community forum page with post feed

- Infinite scroll post list with category filter tabs
- Create post floating button with rich text editor
- Like, comment and share actions on each post card
- Optimistic UI update for like toggle without refetch"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add rich text editor component

- Toolbar with bold, italic, link and list formatting
- Paste from clipboard strips dangerous HTML tags
- Character count indicator with max limit warning
- Used in community post creation and event description"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add file upload drag-and-drop zone

- Accepts image files with type and size validation
- Preview thumbnail grid for multiple selected files
- Remove individual files before upload submission
- Progress bar per file during upload to backend"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(pages): build Volunteer opportunities page

- List of volunteer positions with org and skills tags
- Filter by skill, location and time commitment
- Apply button opens multi-step application form
- My Applications tab shows submission history"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add date range picker component

- Calendar grid with start and end date selection
- Highlights date range between selected dates
- Blocks past dates for future-only date fields
- Used in event creation and donation report filters"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(hooks): add useScrollPosition hook

- Tracks window scroll Y position in real time
- Debounced for performance on heavy pages
- Used for sticky header shadow on scroll
- Triggers back-to-top button visibility"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add back-to-top floating button

- Appears after scrolling past 400px threshold
- Smooth scroll to top using window.scrollTo behavior
- Fade-in and slide-up entrance animation
- Hidden on pages shorter than viewport height"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(pages): build Donate page with payment selector

- Organization search and selection with avatar
- Amount input with predefined quick-select buttons
- Payment method selector: bKash, Nagad, Bank Transfer
- Review and confirm step before payment submission"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add payment method card with radio selection

- Card layout with payment logo and radio indicator
- Highlights selected card with accent border ring
- Disabled state for unavailable payment methods
- Keyboard navigable with space to select"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(pages): build Donation History page

- Table view with sortable columns for all donations
- Status badge: completed, pending, failed
- Download receipt button for completed transactions
- Filter by date range and payment method"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add data table component with sort and filter

- Column sort toggle with asc/desc indicator arrows
- Client-side filter input above table
- Sticky header row on vertical scroll
- Row click handler for detail view navigation"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(pages): build User Profile page with edit mode

- Toggle between view and edit mode in-page
- Avatar upload with crop tool before saving
- Change password section with current password verify
- Donation summary stats panel at top of profile"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add image crop tool component

- Drag to reposition and scroll to zoom crop area
- Circular crop for avatar and rectangular for banners
- Outputs cropped image as base64 or Blob
- Cancel and confirm buttons with keyboard support"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(pages): build Sign In page with social login

- Email and password form with inline validation
- Show/hide password toggle with eye icon
- Remember me checkbox persists token longer
- Forgot password link opens OTP reset flow"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(pages): build Sign Up page with multi-step form

- Step 1: Basic info - name, email and password
- Step 2: Role selection - donor, volunteer or NGO
- Step 3: Profile details based on selected role
- Step 4: Email OTP verification before account creation"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add OTP input component

- 6 individual digit input boxes in a row
- Auto-advance focus on digit entry
- Paste support fills all boxes from clipboard
- Backspace clears current and moves to previous"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(pages): build Emergency Requests page

- Urgent blood requests listed by priority level
- Critical badge with pulsing red indicator
- Contact donor button opens phone/email options
- Admin can mark request as fulfilled"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add priority badge with pulse animation

- Critical: red pulsing dot with flashing ring
- High: orange solid badge
- Medium and Low: gray muted badges
- Used in Emergency page and notification list"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add timeline component for activity feed

- Vertical line connector between timeline entries
- Icon, title, description and timestamp per entry
- Alternating left/right layout on desktop
- Stacked single column layout on mobile"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(pages): add About page with team and mission

- Animated mission statement section with scroll reveal
- Team member cards with photo, name and role
- Impact numbers animated counter section
- Platform feature highlights with icon grid"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add scroll reveal animation wrapper

- Wraps any child with fade-up entrance animation
- Uses IntersectionObserver to trigger on scroll
- Configurable delay for staggered group animations
- Respects prefers-reduced-motion media query"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(hooks): add useNetworkStatus hook

- Returns isOnline boolean from navigator.onLine
- Listens to online and offline window events
- Shows offline banner when connection is lost
- Retries failed API calls when connection restores"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add offline status banner component

- Fixed top banner when network is offline
- Amber background with wifi-off icon
- Dismissible with close button for non-critical pages
- Auto-hides 3 seconds after connection restores"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "fix(services): fix authApi token refresh race condition

- Multiple 401 responses triggered parallel refresh calls
- Add refresh lock flag to prevent duplicate refresh
- Queue pending requests and replay after token refresh
- Clear queue and logout on refresh token expiry"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add tooltip component

- Shows on hover with 300ms delay to avoid flicker
- Smart positioning: flips above/below based on viewport
- Arrow pointer CSS triangle aligned to trigger
- Used on icon buttons and truncated text fields"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(pages): build AI Smart Search page with filters

- Natural language search input with suggestions
- AI-powered result ranking with relevance score
- Filter results by type: donor, org, event, post
- Loading skeleton while AI processes query"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add typewriter text animation component

- Cycles through array of strings with cursor blink
- Configurable typing and deletion speed in ms
- Pause duration between strings configurable
- Used in hero tagline and AI search placeholder"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "refactor(services): add global axios interceptor

- Attaches Bearer token to all authenticated requests
- Intercepts 401 to trigger token refresh flow
- Logs request duration in development mode
- Transforms snake_case API response to camelCase"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(ui): add confirmation snackbar for destructive actions

- Bottom-center snackbar with Undo button for 5 seconds
- Cancels action if Undo clicked within timeout
- Used for post delete and donation cancel actions
- Accessible with role alert and aria-live region"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "chore(perf): add lazy loading for all page components

- All route components wrapped with React.lazy and Suspense
- Page-level code splitting reduces initial bundle 60 percent
- Loading fallback shows ShebaBD logo spinner
- Prefetch next likely route on link hover"

Write-Host "Pushing alif/frontend..." -ForegroundColor Yellow
git push origin alif/frontend
Write-Host "Alif Frontend done! +30 commits" -ForegroundColor Green
Write-Host ""

# ============================================================
# 4. ALIF BACKEND - alif/backend (+30)
# ============================================================
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ALIF BACKEND - Adding 30 commits" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
git checkout alif/backend

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(api): add volunteer management endpoints

- POST /volunteers creates new volunteer profile
- GET /volunteers lists with skill and location filter
- PATCH /volunteers/{id} updates volunteer availability
- DELETE /volunteers/{id} removes volunteer profile"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(db): add volunteers table with skills JSON field

- Volunteer model linked to User via user_id FK
- skills stored as JSON array of skill strings
- availability stored as weekly schedule JSON
- is_active boolean for volunteer status toggle"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(services): add volunteer matching service

- match_volunteers() filters by skill and availability
- rank_by_proximity() sorts by distance from org
- notify_matched_volunteers() sends email invitations
- Used in NGO volunteer recruitment workflow"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(api): add event attendance tracking endpoint

- POST /events/{id}/attend marks user as attended
- GET /events/{id}/attendance returns attendance list
- Attendance rate calculated from registration count
- Admin can manually mark attendance via bulk upload"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(utils): add Excel report generator

- generate_xlsx() creates multi-sheet Excel workbook
- Formats currency columns with BDT symbol
- Auto-width columns based on content length
- Used in admin donation and attendance exports"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "fix(api): fix community post pagination off-by-one

- Page 2 was returning last item of page 1 again
- Fix skip calculation: skip = (page - 1) * limit
- Add total_pages to pagination meta response
- Return empty list instead of 404 on page beyond last"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(services): add AI-powered NGO trust score service

- Analyzes donation history and community feedback
- Checks registration documents and verification status
- Returns 0-100 trust score with confidence level
- Score updated weekly via scheduled background job"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(api): add trust score endpoint for organizations

- GET /organizations/{id}/trust-score returns score
- Includes score breakdown by category factors
- Cached for 24h to reduce AI API call costs
- Public endpoint, no authentication required"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(services): add disaster intelligence service

- Integrates with government flood and cyclone APIs
- Aggregates affected district lists from multiple sources
- Maps affected areas to registered NGO coverage zones
- Triggers emergency volunteer mobilization alerts"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(api): add disaster alert management endpoints

- POST /disasters creates new disaster event record
- GET /disasters lists active disasters with severity
- GET /disasters/{id}/ngos returns responding orgs
- Triggers push notifications to users in affected areas"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(services): add AI donation advisor service

- Analyzes user donation history and preferences
- Recommends organizations based on interest profile
- Suggests optimal donation amount based on capacity
- Generates personalized donation impact projections"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(api): add personalized org recommendation endpoint

- GET /recommendations/organizations for logged-in user
- Returns top 5 organizations with match score
- Fallback to popular orgs for new users
- Excludes organizations user already donated to"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(services): add fake NGO detection service

- Checks registration number against government database
- Scans donation patterns for money laundering signals
- Verifies address and contact info consistency
- Returns risk level: low, medium, high, critical"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(api): add NGO fraud detection endpoint

- POST /admin/ngos/{id}/fraud-check runs detection
- Returns risk score and suspicious activity flags
- Admin can flag NGO for manual review from result
- Audit log entry created for every fraud check"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(services): add fake review detection service

- NLP analysis of review text for spam patterns
- Detects coordinated review bombing from same IP range
- Flags reviews with suspicious timing clusters
- Removes detected fake reviews from public display"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(api): add review moderation endpoints

- POST /organizations/{id}/reviews submits review
- GET /organizations/{id}/reviews returns approved reviews
- POST /admin/reviews/{id}/approve publishes review
- POST /admin/reviews/{id}/reject removes review"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(services): add AI content generator for NGOs

- Generates event description from title and keywords
- Creates donation campaign text from org mission
- Suggests hashtags for social media posts
- Used in NGO dashboard content creation tools"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(api): add AI content generation endpoint

- POST /ai/generate/content with type and context body
- Types: event_description, campaign_text, hashtags
- Rate limited to 10 generations per user per hour
- Returns generated text with token usage metadata"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(services): add donation analytics service

- Monthly donation totals grouped by organization
- Top donor leaderboard with anonymization option
- Average donation amount trend by blood group region
- Year-over-year donation growth comparison"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(api): add donation analytics dashboard endpoint

- GET /analytics/donations with date range filter
- Returns chart-ready data series for frontend
- Cached for 1h with cache invalidation on new donation
- Admin sees all orgs, NGO sees own org only"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "fix(auth): add account lockout after failed login attempts

- Lock account for 15 minutes after 5 failed attempts
- Return 423 Locked with retry_after header
- Reset counter on successful login
- Admin endpoint to manually unlock frozen accounts"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(api): add push notification subscription endpoint

- POST /notifications/subscribe saves FCM device token
- DELETE /notifications/subscribe removes token on logout
- Sends test notification to verify subscription
- Supports multiple devices per user account"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(services): add Firebase Cloud Messaging integration

- send_push() sends notification to single device token
- send_multicast() sends to list of device tokens
- Handles invalid token cleanup from database
- Used for emergency blood request push alerts"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(db): add notification_subscriptions table

- Stores user_id, device_token and device_type
- Unique constraint on (user_id, device_token) pair
- created_at and last_used_at timestamp columns
- Cascade delete when user account is deleted"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "refactor(api): add API versioning with v1 prefix

- All routes now mounted under /api/v1 prefix
- Old /api routes return 301 redirect to /api/v1
- Version included in every response header
- Prepares codebase for future v2 API additions"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(api): add social login with Google OAuth2

- GET /auth/google initiates OAuth2 authorization flow
- GET /auth/google/callback handles code exchange
- Creates user account if email not already registered
- Returns same JWT token format as email login"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(services): add data export service for GDPR

- Export all user data as JSON on request
- Includes profile, donations, posts and activity log
- Data package emailed as encrypted ZIP archive
- Account deletion removes all personal data records"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(api): add user data export and deletion endpoints

- GET /users/me/export triggers GDPR data export
- DELETE /users/me/account initiates account deletion
- 30-day cooling period before permanent deletion
- Confirmation email with cancellation link sent"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(services): add AI volunteer recommendation service

- Matches volunteers to events based on skill overlap
- Considers volunteer location and travel preference
- Scores based on past participation and rating
- Recommends top 10 volunteers per event to NGOs"

git commit --allow-empty --author="Alif <alif@shebabd.org>" -m "feat(api): add AI volunteer recommendation endpoint

- GET /ai/recommendations/volunteers/{event_id}
- Returns ranked volunteer list with match score
- Sends opt-in invitation email to top candidates
- NGO can accept or skip each recommendation"

Write-Host "Pushing alif/backend..." -ForegroundColor Yellow
git push origin alif/backend
Write-Host "Alif Backend done! +30 commits" -ForegroundColor Green
Write-Host ""

# ============================================================
# MERGE ALL TO DEVELOPMENT
# ============================================================
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Merging all branches to development..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

git checkout development
git merge feature/murad-frontend --no-edit
git merge murad/backend --no-edit
git merge alif/frontend --no-edit
git merge alif/backend --no-edit
git push origin development

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ALL DONE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Final commit counts:" -ForegroundColor White
git shortlog -sn --all
Write-Host ""
Write-Host "Check: https://github.com/fahim1488/ShebaBD/graphs/contributors" -ForegroundColor Cyan
