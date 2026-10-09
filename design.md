# 🐐 Khamar Khata (Farm Management SaaS) — Design System & Architecture Specification

> **Source of Truth**: This document is derived 100% from the Khamar Khata codebase (`README.md`, `src/app/globals.css`, `src/db/schema.ts`, `src/types/index.ts`, `src/contexts/SettingsContext.tsx`, `src/utils/format.ts`, and core route components). Nothing in this specification is speculative or placeholder.

---

## 1. Product Overview & Purpose

**Khamar Khata** is a premium, mobile-first farm management and financial tracking system designed specifically for livestock farmers (focusing on goat and cattle farming) in India and Bangladesh, equipped with global multi-currency portability.

### Core Goals
1. **Accurate Farm Unit Economics**: Eliminate guesswork by calculating true cost-of-goods-sold and individual profit/loss per animal (livestock purchase cost + direct medical/feed expenses + pro-rata shared farm expenses vs. realized sale price).
2. **Pedigree & Herd Lifecycle Tracking**: Maintain complete records for every animal: parentage (mother/father), offspring, chronological growth milestones, veterinary logs, and photos.
3. **Multi-Owner Partnership Ledger**: Track capital contributions against agreed ownership share percentages for co-owned farms.
4. **Field-Ready Usability & Low-Bandwidth Resilience**: Deliver an interface tailored for one-handed operation on mobile devices in farm sheds, with a dedicated **Simple Mode** that eliminates expensive animations and blur filters for low-end hardware.
5. **Global Multi-Currency Engine**: Support 10 national and regional currencies with locale-correct digit grouping and compact formatting (e.g., Lakhs `1L` for South Asia vs. Thousands `100K` internationally).

---

## 2. Dominant Feature: Advanced Financial Reporting & 3-Tab Analytics

As established in the product documentation, **Financial Reporting dominates the application**. Farming operations depend first on solvency and margin clarity before operational logs.

### The 3-View Dashboard Architecture (`src/app/dashboard/DashboardOverview.tsx`)
The home dashboard provides instant toggling across three analytical scopes:

```
[ Farm Total ]          [ 🐐 Goats ]          [ 🐄 Cows ]
Combined farm ledger    CapEx & Goat costs    CapEx & Cow costs
```

1. **📊 Farm Total (Combined)**: Aggregates all livestock acquisitions, animal-specific expenses, general overhead expenses, and sales into a farm-wide balance.
2. **🐐 Goats**: Isolates goat purchase capital, direct & allocated goat expenses, goat sales, and goat net profit/loss.
3. **🐄 Cows**: Isolates cattle purchase capital, direct & allocated cow expenses, cattle sales, and cow net profit/loss.

### Core Metric Formulation
Every view computes and displays four primary financial measures:

| Metric Display Name | Internal Source / Formulation | Visual Treatment |
| :--- | :--- | :--- |
| **Buying Cost** | Sum of `purchase_price` for animals in the selected view | `border-l-4 border-primary`, font-bold 3xl |
| **Expenses** | Direct animal expenses + allocated shared expenses (+ general expenses in Total view) | `border-l-4 border-error`, font-bold 3xl |
| **Sales** | Sum of `sale_price` for sold animals in the selected view | `border-l-4 border-blue-500`, font-bold 3xl |
| **Net Profit / Loss** | **`Sales - (Buying Cost + Expenses)`** | Giant 4xl display banner, `ArrowUpRight` (green) / `ArrowDownRight` (red) |

---

## 3. Product Native Shape: The Dual Ledger & Pedigree Graph

Khamar Khata is organized around two complementary data structures rather than a generic section template:

```
                    ┌─────────────────────────┐
                    │    Expenses Ledger      │
                    └───────────┬─────────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
┌──────────────────┐                        ┌──────────────────┐
│ expense_goat_map │                        │ expense_cow_map  │
└─────────┬────────┘                        └─────────┬────────┘
          │ (Pro-rata cost distribution)              │ (Pro-rata cost distribution)
          ▼                                           ▼
┌──────────────────┐                        ┌──────────────────┐
│  Goats Inventory │                        │  Cows Inventory  │
│  (Pedigree Graph)│                        │  (Pedigree Graph)│
└─────────┬────────┘                        └─────────┬────────┘
          │                                           │
          └─────────────────────┬─────────────────────┘
                                ▼
                    ┌─────────────────────────┐
                    │      Sales Ledger       │
                    │  (Realized Net Margin)  │
                    └─────────────────────────┘
```

1. **The Pro-Rata Cost Distribution Pipeline**:
   - Shared expenses (e.g., 50kg feed sack, vet visits, worker wages) are mapped to multiple animals via `expense_goat_map` and `expense_cow_map`.
   - The cost is dynamically divided: `allocatedCost = expense.amount / mapCount`.
   - When viewing an animal profile, total lifetime investment is calculated as `purchasePrice + sum(allocatedCost)`.
2. **The Biological Pedigree & Health Graph**:
   - Each animal links to optional parents (`mother_id`, `father_id`) and queries bidirectional offspring (`offspringAsMother`, `offspringAsFather`).
   - Health events (`vaccine`, `deworming`, `treatment`, `checkup`) and growth milestones form a chronological audit trail.
3. **The Multi-Owner Capital Ledger**:
   - Farm equity is divided by `share_percentage` among partners.
   - Cash injections are logged through `owner_contributions`, tracking expected capital versus realized deposits.

---

## 4. Visual Identity System & Design Tokens

The visual language balances agricultural vitality with clean, modern data clarity. Tokens are defined in `src/app/globals.css`.

### 4.1 Color System (`@theme`)

```css
/* Brand Primaries */
--color-primary: #0d631b;            /* Deep Forest Green (Brand / Positive / Active) */
--color-primary-container: #2e7d32;  /* Medium Leaf Green */
--color-on-primary: #ffffff;         /* Pure White Text on Primary */
--color-secondary: #126d27;        /* Secondary Green */
--color-tertiary: #6b4f45;         /* Warm Earth Brown */

/* Surface & Canvas Spectrum */
--color-background: #f9f9f9;         /* Neutral Canvas */
--color-on-background: #1a1c1c;      /* High-contrast Near-Black Ink */

--color-surface-lowest: #ffffff;     /* Card Canvas / Elevated Panels */
--color-surface-low: #f3f3f3;        /* Secondary Buttons / Inset Wells */
--color-surface: #f9f9f9;            /* Base Surface */
--color-surface-high: #e8e8e8;       /* Subtle Borders & Dividers */
--color-surface-highest: #e2e2e2;    /* Inactive Trackers */

/* Semantic Accents */
--color-error: #ba1a1a;              /* Negative Profit / Due / Expense Red */
```

#### Contextual Semantic Color Accents
- **Goats**: Emerald Green (`#0d631b` / `bg-emerald-600`)
- **Cows / Cattle**: Amber / Warm Brown (`#b45309` / `bg-amber-600`)
- **Sales / Revenue**: Blue (`#2563eb` / `bg-blue-600`)
- **Expenses**: Crimson Red (`#ba1a1a` / `bg-red-600`)
- **Partners / Equity**: Royal Purple (`#9333ea` / `bg-purple-600`)
- **Sick Status**: Warning Amber (`#d97706` / `bg-amber-500/10`)

### 4.2 Typography Scales

| Role | Font Family | CSS Custom Property | Usage |
| :--- | :--- | :--- | :--- |
| **Display Headings** | `Plus Jakarta Sans`, sans-serif | `--font-display` | All `h1`-`h6`, large metric numbers, brand logotype |
| **Body & Data** | `Public Sans`, sans-serif | `--font-body` | Navigation items, form inputs, table data, body text |

### 4.3 Corner Radii & Elevation

```css
--radius-md: 0.75rem;    /* 12px: Standard cards, metric containers, table wrappers */
--radius-lg: 1rem;       /* 16px: Dialogs, large panels, tab selector backgrounds */
--radius-full: 9999px;   /* Full pills: Status chips, action buttons, FAB speed dial */
```

### 4.4 Surface Treatments & Utility Classes

```css
/* Frosted Glass Navigation & Headers */
.glass-panel {
  background-color: color-mix(in srgb, var(--color-surface-lowest) 70%, transparent);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.125);
}

/* Glassmorphic Metric Cards */
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}

/* Primary Call-to-Action Gradient */
.bg-gradient-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%);
}

/* Ambient Floating Elevation */
.shadow-ambient {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08);
}

/* Spring Interactive Lift */
.hover-lift {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.hover-lift:hover {
  transform: translateY(-4px);
}
```

### 4.5 Low-Power Field Resilience: Simple Mode (`[data-simple-mode="true"]`)
For rural operations on entry-level smartphones or battery-saver conditions, toggling **Simple Mode** enforces zero-overhead rendering:
- `backdrop-filter: none;` (disables costly GPU composite blur)
- `transition-duration: 0ms !important; animation-duration: 0ms !important;` (instant touch response)
- Flat `box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);`
- Solid primary background replaces CSS gradients.

---

## 5. Navigation Shell & Component Patterns

### 5.1 Desktop Shell (`src/app/dashboard/layout.tsx`)
- **Width**: `w-64` fixed left sidebar with `border-r border-(--color-surface-high)`.
- **Branding**: Circular logo with dual-tone display typography (`Khamar` in `--color-primary`, `Khata` in amber-900).
- **Navigation Links**:
  1. 🏠 `Dashboard` (`/dashboard`)
  2. 🐐 `Goats` (`/dashboard/goats`)
  3. 🐄 `Cows` (`/dashboard/cows`)
  4. ➕ `Expenses` (`/dashboard/expenses`)
  5. 📈 `Sales` (`/dashboard/sales`)
  6. 📊 `Reports` (`/dashboard/reports`)
  7. ⚙️ `Settings` (`/dashboard/settings`)
- **Bottom Anchor**: Sign out button with red accent.

### 5.2 Mobile Shell & Hamburger Side Drawer (`src/components/MobileNav.tsx`)
- **Sticky Top Bar**: Crisp header (`bg-(--color-surface-lowest)/95 backdrop-blur-md border-b`) with hamburger toggle button (`Menu`), circular brand logo, and quick settings / sign-out shortcuts.
- **Slide-out Side Menu Drawer**:
  - Full-height slide-over drawer (`w-72 max-w-[85vw] bg-(--color-surface-lowest) shadow-2xl`) triggered by the hamburger icon.
  - Backdrop overlay with blur (`bg-black/50 backdrop-blur-xs`) and body scroll lock.
  - **Quick Action Grid**: 4 one-tap shortcut buttons (`+ Add Goat`, `+ Add Cow`, `+ Expense`, `+ Sale`).
  - **Navigation Links**: 7 primary destinations with active indicators and icons.
  - **Footer**: User profile info and prominent sign-out action.
- *Note*: The legacy bottom navigation bar was completely removed to provide distraction-free, full-height vertical workspace on handheld screens.

### 5.3 Quick Actions FAB (`src/components/QuickActionsFAB.tsx`)
A sticky floating trigger located at `bottom-6 right-5` (mobile) / `bottom-8 right-10` (desktop) offering one-tap access from any page:
- 🐐 **Add New Goat** (`/dashboard/goats/add` — Emerald)
- 🐄 **Add New Cow** (`/dashboard/cows/add` — Amber)
- 💵 **Record Expense** (`/dashboard/expenses/add` — Orange)
- 🛍️ **Log New Sale** (`/dashboard/sales/add` — Blue)
- 🩺 **Health Record** (`/dashboard/goats` — Rose)

Includes backdrop blur curtain (`bg-black/40 backdrop-blur-[2px]`) and spring scale transitions.

---

## 6. Critical Files & Route Inventory

| Route | Primary Component Files | Responsibility |
| :--- | :--- | :--- |
| `/dashboard` | `DashboardOverview.tsx`, `page.tsx` | 3-tab financial dashboard, quick actions, metric cards, profit banner, pie chart, recent activity, partner widget |
| `/dashboard/goats` | `page.tsx`, `GoatSearch.tsx`, `GoatFilter.tsx` | Goat flock catalog, live image cards, search bar, status tabs (`Current`, `Active`, `Sick`, `Archived`, `All`) |
| `/dashboard/goats/[id]` | `page.tsx`, `FamilyTree.tsx`, `GrowthTimeline.tsx`, `HealthRecordModal.tsx`, `NoteModal.tsx`, `DeleteGoatButton.tsx` | Individual goat unit economics, direct & allocated expense accounting, pedigree family tree, growth timeline, medical history, photo gallery |
| `/dashboard/goats/add` | `AddGoatForm.tsx`, `page.tsx` | Add goat form (Name/Tag, Breed, Gender, Purchase Price, Date, Source, Mother, Father, Photo upload) |
| `/dashboard/goats/[id]/edit` | `EditGoatForm.tsx`, `page.tsx` | Update goat profile, status lifecycle transitions |
| `/dashboard/cows` | `page.tsx`, `CowSearch.tsx`, `CowFilter.tsx` | Cattle herd catalog with status filtering and image cards |
| `/dashboard/cows/[id]` | `page.tsx`, `FamilyTree.tsx`, `GrowthTimeline.tsx`, `HealthRecordModal.tsx`, `NoteModal.tsx`, `DeleteCowButton.tsx` | Individual cattle unit economics, lineage, health records, notes, cost allocation |
| `/dashboard/cows/add` | `AddCowForm.tsx`, `page.tsx` | Add cattle form with source tracking and parentage selection |
| `/dashboard/cows/[id]/edit` | `EditCowForm.tsx`, `page.tsx` | Update cow details and status |
| `/dashboard/expenses` | `page.tsx`, `actions.ts` | Expense ledger, category badges, payment status (`Paid`, `Partial`, `Due`), animal allocation badges |
| `/dashboard/expenses/add` | `AddExpenseForm.tsx`, `page.tsx` | Expense creation form, category selector, payment status, M:N animal allocation selector |
| `/dashboard/expenses/[id]/edit` | `EditExpenseForm.tsx`, `page.tsx` | Edit expense amount, date, notes, and category |
| `/dashboard/sales` | `page.tsx`, `actions.ts` | Sales ledger with automated individual profit and ROI calculation, goat vs. cow badges |
| `/dashboard/sales/add` | `AddSaleForm.tsx`, `page.tsx` | Record sale form, select animal from active inventory, automatically marks animal as `sold` |
| `/dashboard/sales/[id]/edit` | `EditSaleForm.tsx`, `page.tsx` | Edit sale price and sale date |
| `/dashboard/reports` | `ReportsUI.tsx`, `page.tsx`, `ProfitTrendsChart.tsx`, `TopPerformingLivestock.tsx`, `FinancialStatementTable.tsx`, `EquityReport.tsx` | Comprehensive financial statements, date range selector (`7d`, `30d`, `1y`, `All`), Recharts trend visualizer, A4 PDF printable styles |
| `/dashboard/settings` | `page.tsx`, `SettingsClientActions.tsx`, `BackupRestoreSection.tsx`, `ChangePasswordSection.tsx` | Multi-currency selector, Simple Mode toggle, JSON backup export & atomic restore, category management, partner equity allocation |
| `/dashboard/settings/owners` | `page.tsx`, `OwnerClientPage.tsx` | Manage partners, ownership percentages, equity sum verification |
| `/dashboard/settings/owners/[id]` | `page.tsx` | Individual partner investment ledger and transaction history |

---

## 7. Data Models & State Primitives

Defined in `src/db/schema.ts` (PostgreSQL / Drizzle ORM) and `src/types/index.ts`:

### 7.1 Enums & Status Literals
- **Livestock Status (`goat_status`, `cow_status`)**:
  - `'active'`: Healthy and currently present on farm.
  - `'sick'`: Under active medical care or quarantine.
  - `'sold'`: Divested through the sales workflow.
  - `'dead'`: Deceased (written off).
  - `'archived'`: Historical record retained for audit.
- **Payment Status (`expenses.payment_status`)**:
  - `'paid'`: Fully settled.
  - `'partial'`: Partially settled with remaining `due_amount`.
  - `'due'`: Unpaid liability.
- **Health Record Types (`record_type`)**:
  - `'vaccine'`, `'deworming'`, `'treatment'`, `'checkup'`
- **Livestock Source (`source`)**:
  - `'purchased'`, `'born_on_farm'`

### 7.2 Core Entities

```typescript
// Livestock Entity (Goat / Cow)
{
  id: string;              // UUID primary key
  userId: string;          // Farm profile owner
  nameOrTag: string;       // Ear tag or farm name
  breed: string | null;    // e.g., Black Bengal, Jamunapari, Boer, Sahiwal, Holstein
  gender: string | null;   // Male / Female (Buck, Doe, Bull, Cow, Heifer, Calf)
  purchasePrice: number;   // CapEx acquisition cost
  purchaseDate: string;    // YYYY-MM-DD
  status: 'active' | 'sick' | 'sold' | 'dead' | 'archived';
  imageUrl: string | null; // Compressed Cloudflare/Supabase image URL
  source: string | null;   // 'purchased' | 'born_on_farm'
  motherId: string | null; // Lineage link
  fatherId: string | null; // Lineage link
}

// Expense Entity
{
  id: string;
  userId: string;
  categoryId: string;      // Foreign key to expense_categories
  amount: number;          // Total cash spent
  paidAmount: number;      // Amount settled
  dueAmount: number;       // Outstanding liability
  paymentStatus: 'paid' | 'partial' | 'due';
  expenseDate: string;
  note: string | null;
}

// Pro-Rata Allocation Maps
// expense_goat_map: (id, userId, expenseId, goatId)
// expense_cow_map:  (id, userId, expenseId, cowId)

// Sale Entity
{
  id: string;
  userId: string;
  goatId: string | null;   // Set if goat sold
  cowId: string | null;    // Set if cow sold
  salePrice: number;       // Realized revenue
  saleDate: string;
  note: string | null;
}

// Partner Equity & Contributions
// owners:              (id, userId, name, sharePercentage)
// owner_contributions: (id, userId, ownerId, expenseId, goatId, cowId, amount)
```

---

## 8. Multi-Currency Engine (`src/contexts/SettingsContext.tsx`)

Khamar Khata supports international operations with zero conversion friction:

| Code | Symbol | Currency Name | Native Locale | Compact Example |
| :---: | :---: | :--- | :--- | :---: |
| **BDT** | ৳ | Bangladeshi Taka | `bn-BD` | `15.5K৳` / `1.2M৳` |
| **INR** | ₹ | Indian Rupee | `en-IN` | `₹1.5L` |
| **USD** | $ | US Dollar | `en-US` | `$150K` |
| **EUR** | € | Euro | `de-DE` | `150K €` |
| **GBP** | £ | British Pound | `en-GB` | `£150K` |
| **SAR** | ﷼ | Saudi Riyal | `ar-SA` | `١٥٠ ألف ر.س.` |
| **AED** | د.إ | UAE Dirham | `ar-AE` | `١٥٠ ألف د.إ` |
| **PKR** | ₨ | Pakistani Rupee | `en-PK` | `PKR 1.5L` |
| **MYR** | RM | Malaysian Ringgit | `ms-MY` | `RM 150K` |
| **SGD** | S$ | Singapore Dollar | `en-SG` | `S$150K` |

---

## 9. Plain English & Content Tone Guidelines

Per the design guidelines established across all components, high-vocabulary corporate financial jargon is strictly prohibited in favor of plain, accessible English:

| ❌ Avoid Corporate Jargon | ✅ Use Plain English | Code Context |
| :--- | :--- | :--- |
| Acquisition Capital | **Buying Cost** | Metric Cards & Rosters |
| Operational Expenditure | **Farm Expenses** | Dashboard & Nav |
| Divestment / Realized Revenue | **Sales** | Sales Ledgers |
| Pedigree Genealogy | **Family Tree** | Animal Detail Profile |
| Financial Contingency Reserve | **Emergency Fund Tip** | Settings & Reports |
| Top Alpha Livestock | **Top Profitable Animals** | Analytics Widgets |
| Equity Amortization | **Partner Shares** | Partner Management |
| Allocation Discrepancy | **Unallocated Share** | Settings Owners |

The tone of Khamar Khata is **transparent, grounded, encouraging, and farmer-first**.
