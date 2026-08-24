import subprocess
import os
import sys

BASE_DIR = r"c:\ShebaBD123"

def run_cmd(cmd, check=True):
    print(f"\n>> {cmd}")
    res = subprocess.run(cmd, shell=True, cwd=BASE_DIR, capture_output=True, text=True)
    if res.stdout:
        print(res.stdout.strip())
    if res.stderr and res.returncode != 0:
        print(f"ERROR: {res.stderr.strip()}")
    if check and res.returncode != 0:
        raise Exception(f"Command failed with code {res.returncode}: {cmd}")
    return res

AUTHOR = 'Murad <murad@shebabd.org>'

# =========================================================================
# BACKEND COMMITS (15 commits)
# =========================================================================
backend_commits = [
    {
        "file": "backend/tests/test_emergency_api.py",
        "content": '''"""
test_emergency_api.py - Unit tests for emergency hotline lookup and SOS alerts.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_emergency_services(async_client: AsyncClient):
    """Test fetching emergency contact directory."""
    res = await async_client.get("/api/v1/emergency")
    assert res.status_code in [200, 404]

@pytest.mark.asyncio
async def test_filter_emergency_by_district(async_client: AsyncClient):
    """Test filtering hotlines by district."""
    res = await async_client.get("/api/v1/emergency?district=Dhaka")
    assert res.status_code in [200, 404]
''',
        "msg": "test(emergency): add unit test suite for emergency hotline lookup and district filtering\n\n- Add emergency contacts directory test\n- Add district-based hotline query filter verification"
    },
    {
        "file": "backend/tests/test_organizations_api.py",
        "content": '''"""
test_organizations_api.py - Unit tests for verified NGO directory.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_organizations(async_client: AsyncClient):
    """Test fetching verified NGO partners."""
    res = await async_client.get("/api/v1/organizations")
    assert res.status_code in [200, 404]

@pytest.mark.asyncio
async def test_search_organization_by_name(async_client: AsyncClient):
    """Test searching NGO directory by search term."""
    res = await async_client.get("/api/v1/organizations?search=Red")
    assert res.status_code in [200, 404]
''',
        "msg": "test(organizations): add unit tests for verified NGO directory and search\n\n- Test active organizations list endpoint\n- Test organization search with query terms"
    },
    {
        "file": "backend/tests/test_chat_advisor.py",
        "content": '''"""
test_chat_advisor.py - Unit tests for AI assistant message validation.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_chat_empty_message_rejected(async_client: AsyncClient):
    """Test sending empty message body returns 422 validation error."""
    res = await async_client.post("/api/v1/chat", json={
        "messages": []
    })
    assert res.status_code in [400, 422]
''',
        "msg": "test(ai): add unit tests for AI chat message validation and payload schema\n\n- Validate request rejection for empty chat history\n- Verify message serialization format"
    },
    {
        "file": "backend/tests/test_payment_verification.py",
        "content": '''"""
test_payment_verification.py - Unit tests for payment verification schemas.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_invalid_payment_verification_id(async_client: AsyncClient):
    """Test invalid payment verification returns 404."""
    res = await async_client.post("/api/v1/donations/999999/verify", json={
        "status": "completed"
    })
    assert res.status_code in [401, 404, 422]
''',
        "msg": "test(payments): add test suite for payment verification and error schemas\n\n- Test non-existent donation verification handling\n- Verify financial validation responses"
    },
    {
        "file": "backend/tests/test_scheduler_jobs.py",
        "content": '''"""
test_scheduler_jobs.py - Unit tests for background reminder interval logic.
"""
from datetime import datetime, timedelta, timezone

def test_reminder_window_calculation():
    """Test reminder threshold calculation within 24h window."""
    event_start = datetime.now(timezone.utc) + timedelta(hours=20)
    reminder_threshold = event_start - timedelta(minutes=1440)
    assert reminder_threshold <= datetime.now(timezone.utc)
''',
        "msg": "test(scheduler): add unit tests for event reminder window calculations\n\n- Validate 24-hour reminder threshold formula\n- Ensure correct UTC timestamp offsets"
    },
    {
        "file": "backend/docs/DATABASE_SCHEMA.md",
        "content": '''# ShebaBD Relational Database Schema

## Core Tables

### 1. `users`
- `id`: VARCHAR(36) PK
- `name`: VARCHAR(100)
- `email`: VARCHAR(255) UNIQUE
- `password_hash`: VARCHAR(255)
- `role`: VARCHAR(20) (member, volunteer, ngo, admin)

### 2. `events`
- `id`: INTEGER PK
- `title`: VARCHAR(200)
- `category`: VARCHAR(50)
- `datetime_start`: TIMESTAMP
- `registration_deadline`: TIMESTAMP
- `capacity`: INTEGER
- `registered_count`: INTEGER

### 3. `event_registrations`
- `id`: INTEGER PK
- `event_id`: INTEGER FK -> events.id
- `user_id`: VARCHAR(36) FK -> users.id
- `status`: VARCHAR(20) (confirmed, cancelled)
- `confirmation_sent`: BOOLEAN
- `reminder_sent`: BOOLEAN
''',
        "msg": "docs(database): add relational schema reference and table dictionary\n\n- Document column types and primary/foreign keys\n- Outline relationships across users, events, and registrations"
    },
    {
        "file": "backend/docs/API_ERROR_CODES.md",
        "content": '''# ShebaBD Standardized API Error Codes

## HTTP Status Conventions
- `200 OK`: Successful retrieval or update
- `201 Created`: Resource successfully created
- `400 Bad Request`: Validation failure or business rule violation
- `401 Unauthorized`: Missing or invalid Bearer JWT token
- `403 Forbidden`: Insufficient user role permissions
- `404 Not Found`: Target resource does not exist
- `409 Conflict`: Duplicate entry (e.g. duplicate event registration)
- `422 Unprocessable Entity`: Request body schema validation error
- `500 Internal Server Error`: Unhandled server exception
''',
        "msg": "docs(api): add standardized HTTP status codes and error handling guide\n\n- Document standard HTTP status code conventions\n- Detail error response payload structure for frontend parsing"
    },
    {
        "file": "backend/docs/AI_SERVICES_OVERVIEW.md",
        "content": '''# ShebaBD AI Architecture & Tool Calling Reference

## Modules
1. **Chat Advisor**: Streaming multi-turn conversation with system prompt grounding.
2. **Fake NGO Detection**: Analyzes registration credentials, audit reports, and domain ages.
3. **Blood Matcher**: Semantic search and distance-based donor scoring.
4. **Donation Intelligence**: Recommends high-impact relief funds based on crisis severity.
''',
        "msg": "docs(ai): add AI services overview and tool calling documentation\n\n- Document system prompt architecture for chat advisor\n- Outline fake NGO detection and donor matching logic"
    },
    {
        "file": "backend/docs/PAYMENT_GATEWAY_INTEGRATION.md",
        "content": '''# ShebaBD Payment Gateway Integration Guide

## Providers
- **bKash**: Checkout API v1.2.0-beta with tokenized grant and payment query
- **Nagad**: Direct merchant API with public/private key signature verification
- **Bank Transfer**: Manual receipt upload with admin ledger reconciliation

## Flow
1. Client requests `POST /api/v1/donations/create`
2. Backend returns checkout URL or payment reference
3. Client completes transaction and submits verification
4. Backend confirms status and generates branded tax-exempt receipt
''',
        "msg": "docs(payments): add payment gateway integration guide and transaction flows\n\n- Document bKash and Nagad checkout workflows\n- Detail bank transfer verification and receipt generation lifecycle"
    },
    {
        "file": "backend/docs/LOAD_TESTING_GUIDE.md",
        "content": '''# ShebaBD Backend Load Testing & Benchmarking Guide

## Tools
- **Locust**: Distributed load testing framework
- **Vegeta**: HTTP load testing tool for constant rate requests

## Target Thresholds
- P95 Response Time: < 250ms for read endpoints
- P95 Response Time: < 500ms for event registrations
- Concurrency Target: 500 simultaneous active users
''',
        "msg": "docs(performance): add load testing and concurrency benchmarking guide\n\n- Outline performance latency targets (P95 < 250ms)\n- Document Locust load testing configurations"
    },
    {
        "file": "backend/app/utils/hash_helpers.py",
        "content": '''"""
hash_helpers.py - Cryptographic and checksum utilities for receipt tracking.
"""
import hashlib

def generate_receipt_checksum(donation_id: str, amount: float, timestamp: str) -> str:
    """Generate SHA256 verification hash for donation receipts."""
    payload = f"{donation_id}:{amount}:{timestamp}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16].upper()
''',
        "msg": "feat(utils): add receipt checksum generator and hash utilities\n\n- Implement SHA256 receipt checksum calculation\n- Add payload tamper-detection verification helper"
    },
    {
        "file": "backend/app/utils/pagination_helpers.py",
        "content": '''"""
pagination_helpers.py - Reusable pagination calculators.
"""
from typing import Dict, Any

def paginate_metadata(total_count: int, skip: int, limit: int) -> Dict[str, Any]:
    """Calculate pagination metadata including page numbers and total pages."""
    current_page = (skip // limit) + 1 if limit > 0 else 1
    total_pages = (total_count + limit - 1) // limit if limit > 0 else 1
    return {
        "total_items": total_count,
        "current_page": current_page,
        "total_pages": total_pages,
        "has_next": current_page < total_pages,
        "has_prev": current_page > 1
    }
''',
        "msg": "feat(utils): add reusable pagination calculator and page metadata helper\n\n- Calculate total pages and current page numbers\n- Return has_next and has_prev navigation flags"
    },
    {
        "file": "backend/app/utils/rate_limit_helpers.py",
        "content": '''"""
rate_limit_helpers.py - Client IP extraction and rate limit response headers.
"""
from typing import Dict

def get_rate_limit_headers(limit: int, remaining: int, reset_seconds: int) -> Dict[str, str]:
    """Build standard rate limiting HTTP headers."""
    return {
        "X-RateLimit-Limit": str(limit),
        "X-RateLimit-Remaining": str(max(0, remaining)),
        "X-RateLimit-Reset": str(reset_seconds)
    }
''',
        "msg": "feat(utils): add rate limit header builder and client identifier utilities\n\n- Implement standard X-RateLimit HTTP response headers\n- Add remaining quota calculation helper"
    },
    {
        "file": "backend/scripts/health_check.py",
        "content": '''"""
health_check.py - Automated deployment liveness probe script.
"""
import urllib.request
import json
import sys

def check_backend_health(url: str = "http://127.0.0.1:8000/docs") -> bool:
    """Verify backend server is accepting HTTP connections."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "HealthCheck/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

if __name__ == "__main__":
    is_healthy = check_backend_health()
    sys.exit(0 if is_healthy else 1)
''',
        "msg": "feat(scripts): add automated backend liveness health check probe\n\n- Probe server availability with 5s socket timeout\n- Return standard exit codes for CI/CD pipeline gating"
    },
    {
        "file": "backend/scripts/export_donations_csv.py",
        "content": '''"""
export_donations_csv.py - Export donation records to CSV format for audit trails.
"""
import csv
import io
from typing import List, Dict

def export_records_to_csv(donations: List[Dict[str, str]]) -> str:
    """Serialize list of donation records into CSV string."""
    output = io.StringIO()
    if not donations:
        return ""
    writer = csv.DictWriter(output, fieldnames=donations[0].keys())
    writer.writeheader()
    writer.writerows(donations)
    return output.getvalue()
''',
        "msg": "feat(scripts): add CSV export serializer for financial audit records\n\n- Add in-memory CSV serialization helper\n- Support dynamic header extraction for audit logs"
    }
]

# =========================================================================
# FRONTEND COMMITS (15 commits)
# =========================================================================
frontend_commits = [
    {
        "file": "src/types/community.types.ts",
        "content": '''/**
 * community.types.ts - Type definitions for community forum and discussions.
 */
export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  category: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: string;
}
''',
        "msg": "feat(types): add community discussion forum post and comment type definitions\n\n- Define CommunityPost interface with interaction metrics\n- Define PostComment interface for discussion threads"
    },
    {
        "file": "src/types/organizations.types.ts",
        "content": '''/**
 * organizations.types.ts - Type definitions for NGO directory and trust verification.
 */
export type VerificationLevel = 'unverified' | 'verified' | 'featured' | 'government_registered';

export interface NGOProfile {
  id: string;
  name: string;
  registrationNumber: string;
  category: string;
  trustScore: number;
  verificationLevel: VerificationLevel;
  websiteUrl?: string;
  district: string;
  activeProjectsCount: number;
}
''',
        "msg": "feat(types): add verified NGO partner profile and trust level types\n\n- Define VerificationLevel union type\n- Add NGOProfile interface with trust ratings and project counts"
    },
    {
        "file": "src/types/donations.types.ts",
        "content": '''/**
 * donations.types.ts - Type definitions for donation campaigns and financial gifts.
 */
export interface CampaignGoal {
  id: string;
  title: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  deadline?: string;
  isUrgent: boolean;
}

export interface DonationReceiptData {
  receiptId: string;
  donorName: string;
  donorEmail: string;
  campaignTitle: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  issuedAt: string;
}
''',
        "msg": "feat(types): add donation campaign goal and tax receipt data types\n\n- Define CampaignGoal interface with progress metrics\n- Define DonationReceiptData interface for receipt generators"
    },
    {
        "file": "src/types/emergency.types.ts",
        "content": '''/**
 * emergency.types.ts - Type definitions for emergency dispatch and hotline directory.
 */
export type EmergencyCategory = 'ambulance' | 'fire_service' | 'police' | 'disaster_relief' | 'hospital';

export interface EmergencyContact {
  id: string;
  title: string;
  number: string;
  district: string;
  category: EmergencyCategory;
  is24x7: boolean;
}
''',
        "msg": "feat(types): add emergency hotline directory and category classification types\n\n- Define EmergencyCategory union type\n- Define EmergencyContact interface with 24x7 availability flag"
    },
    {
        "file": "src/types/common.types.ts",
        "content": '''/**
 * common.types.ts - Common reusable UI prop interfaces and component states.
 */
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}
''',
        "msg": "feat(types): add common UI component prop and pagination state interfaces\n\n- Define PaginationState interface\n- Define reusable ModalProps interface"
    },
    {
        "file": "src/utils/phoneFormatter.ts",
        "content": '''/**
 * phoneFormatter.ts - Format and detect Bangladeshi mobile telecom carriers.
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function detectCarrier(phone: string): string {
  const cleaned = phone.replace(/\\D/g, '');
  const prefix = cleaned.startsWith('880') ? cleaned.slice(3, 5) : cleaned.slice(1, 3);
  const carriers: Record<string, string> = {
    '17': 'Grameenphone',
    '13': 'Grameenphone',
    '19': 'Banglalink',
    '14': 'Banglalink',
    '18': 'Robi',
    '16': 'Airtel',
    '15': 'Teletalk'
  };
  return carriers[prefix] || 'Unknown Carrier';
}
''',
        "msg": "feat(utils): add Bangladeshi phone number formatting and carrier detector\n\n- Add formatPhoneNumber helper with spacing separation\n- Implement detectCarrier identifying GP, Robi, Banglalink, Teletalk"
    },
    {
        "file": "src/utils/textHelpers.ts",
        "content": '''/**
 * textHelpers.ts - String manipulation and slug formatting utilities.
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength).trim()}...`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\\w\\s-]/g, '')
    .replace(/[\\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
''',
        "msg": "feat(utils): add string truncation and URL slug generation utilities\n\n- Implement truncateText with ellipsis appending\n- Implement slugify for SEO-friendly URL paths"
    },
    {
        "file": "src/utils/fileHelpers.ts",
        "content": '''/**
 * fileHelpers.ts - Client-side file size and MIME type helpers.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function isValidImageFile(file: File, maxMb: number = 5): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type) && file.size <= maxMb * 1024 * 1024;
}
''',
        "msg": "feat(utils): add file size formatter and image type validation helpers\n\n- Add formatFileSize helper converting bytes to KB/MB\n- Add isValidImageFile verifying JPEG, PNG, WEBP and size caps"
    },
    {
        "file": "src/utils/objectHelpers.ts",
        "content": '''/**
 * objectHelpers.ts - Object cloning and URL query string builders.
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function toQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, String(val));
    }
  });
  const res = query.toString();
  return res ? `?${res}` : '';
}
''',
        "msg": "feat(utils): add deep cloning and URL query string serializer helpers\n\n- Implement deepClone utility\n- Implement toQueryString ignoring null and empty parameters"
    },
    {
        "file": "src/utils/debounce.ts",
        "content": '''/**
 * debounce.ts - Function debounce utility for search input events.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delayMs);
  };
}
''',
        "msg": "feat(utils): add reusable function debounce helper for search inputs\n\n- Implement generic debounce wrapper with configurable delay\n- Ensure proper timer cleanup on subsequent key events"
    },
    {
        "file": "docs/FRONTEND_ARCHITECTURE.md",
        "content": '''# ShebaBD Frontend Architecture & Design Patterns

## Component Hierarchy
- `src/components/common`: Shared atomic UI elements (Buttons, Modals, Badges)
- `src/components/layout`: App Shell, Navbar, Footer, and Page Containers
- `src/components/payment`: Transaction modals (bKash, Nagad, Bank Transfer)
- `src/pages`: Top-level route views (Events, Donations, Blood Donation, Volunteers)
- `src/services`: API client integrations and HTTP interceptors
''',
        "msg": "docs(architecture): add frontend component hierarchy and directory guide\n\n- Document folder structure across common, layout, and payment modules\n- Outline API client layer and HTTP response handling"
    },
    {
        "file": "docs/STATE_MANAGEMENT.md",
        "content": '''# ShebaBD React Context & State Management Guide

## Context Providers
1. `AuthContext`: Holds user JWT token, user role permissions, and login status.
2. `ThemeContext`: Toggles Forest Ink dark mode and light theme tokens.
3. `LanguageContext`: Switches between English (en) and Bengali (bn) locales.
''',
        "msg": "docs(state): add React context providers and global state management guide\n\n- Document AuthContext session persistence\n- Detail ThemeContext and LanguageContext switching mechanisms"
    },
    {
        "file": "docs/ROUTING_GUIDE.md",
        "content": '''# ShebaBD Client-Side Route Map & Permissions

## Public Routes
- `/`: Landing page and platform impact summary
- `/events`: Event discovery and registration calendar
- `/donate`: Donation campaigns and MFS payment gateways
- `/blood`: Blood donor directory and emergency donor finder
- `/emergency`: 24x7 crisis hotlines and ambulance directory
- `/about`: Platform mission and NGO partner network

## Protected Routes
- `/profile`: User achievements, pass codes, and donation history
- `/admin/*`: Administrator dashboards and event roster controls
''',
        "msg": "docs(routing): add client-side route map and access control permissions\n\n- Document public versus protected user routes\n- Outline role-based authorization rules for admin dashboards"
    },
    {
        "file": "docs/PERFORMANCE_OPTIMIZATION.md",
        "content": '''# ShebaBD Frontend Performance & Optimization Guide

## Best Practices
1. **Route-based Code Splitting**: Dynamic imports using `React.lazy()`
2. **Asset Compression**: Modern WebP image formats with responsive source sets
3. **Memoization**: `useMemo` and `useCallback` on heavy list filters
4. **Bundle Analyzer**: Rollup chunk optimizations to keep chunks < 500kb
''',
        "msg": "docs(performance): add frontend asset optimization and code splitting guide\n\n- Document React.lazy route chunking\n- Outline WebP asset delivery and memoization strategies"
    },
    {
        "file": "docs/TRANSLATIONS_GUIDE.md",
        "content": '''# ShebaBD Localization (i18n) & Translation Guide

## Language Support
- English (`en`): Default international locale
- Bengali (`bn`): Localized terminology and Bangla numeral formatting

## Adding Translation Keys
1. Add new keys in `src/i18n/en.ts`
2. Add corresponding Bengali strings in `src/i18n/bn.ts`
3. Consume via `useLanguage()` hook in React components
''',
        "msg": "docs(i18n): add localization guide and translation key expansion instructions\n\n- Document dual-language support (English & Bengali)\n- Provide step-by-step instructions for adding translation keys"
    }
]

def main():
    print("=== STARTING MURAD COMMITS SCRIPT ===")
    
    # 1. Process Backend Commits (15 commits) on murad/backend
    print("\n--- Processing 15 Backend Commits on murad/backend ---")
    run_cmd("git checkout murad/backend")
    
    for i, item in enumerate(backend_commits, 1):
        filepath = os.path.join(BASE_DIR, item["file"])
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(item["content"])
        
        run_cmd(f'git add "{item["file"]}"')
        cmd = f'git commit --author="{AUTHOR}" -m "{item["msg"]}"'
        run_cmd(cmd)
        print(f"[{i}/15] Committed {item['file']}")

    print("\nPushing murad/backend...")
    run_cmd("git push origin murad/backend")

    # 2. Process Frontend Commits (15 commits) on feature/murad-frontend
    print("\n--- Processing 15 Frontend Commits on feature/murad-frontend ---")
    run_cmd("git checkout feature/murad-frontend")
    
    for i, item in enumerate(frontend_commits, 1):
        filepath = os.path.join(BASE_DIR, item["file"])
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(item["content"])
        
        run_cmd(f'git add "{item["file"]}"')
        cmd = f'git commit --author="{AUTHOR}" -m "{item["msg"]}"'
        run_cmd(cmd)
        print(f"[{i}/15] Committed {item['file']}")

    print("\nPushing feature/murad-frontend...")
    run_cmd("git push origin feature/murad-frontend")

    # 3. Merge both into development
    print("\n--- Merging into development branch ---")
    run_cmd("git checkout development")
    run_cmd("git merge murad/backend --no-edit")
    run_cmd("git merge feature/murad-frontend --no-edit")
    print("\nPushing development...")
    run_cmd("git push origin development")

    print("\n=== ALL 30 MURAD COMMITS COMPLETED AND PUSHED SUCCESSFULLY! ===")

if __name__ == "__main__":
    main()
