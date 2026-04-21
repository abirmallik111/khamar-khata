# 🐐 Khamar Khata (Farm Management SaaS)

Khamar Khata is a premium, mobile-first farm management and financial tracking system designed specifically for livestock farmers (focusing on goat farming) in India and Bangladesh. It provides a robust suite of tools to manage inventory, track expenses, calculate ROI, and manage multi-owner partnerships with ease.

---

## 🌟 Key Features

### 📊 Advanced Financial Reporting
- **Dynamic Dashboard**: Real-time overview of total investment, revenue, and profit/loss.
- **Performance Analytics**: Visualized trends using interactive charts (Income vs Expense).
- **Financial Statements**: Detailed breakdown of every transaction, category-wise spending, and livestock ROI.
- **PDF Export**: A4-ready financial report generation for professional record-keeping.

### 🐏 Livestock Management (Goat Inventory)
- **Detailed Profiles**: Track breed, gender, purchase price, and source (purchased vs. born on farm).
- **Status Tracking**: Monitor health and status (Active, Sick, Sold, Dead).
- **Image Management**: High-quality photo uploads for every animal with automatic compression.
- **Investment History**: View all expenses specifically linked to a particular goat.

### 💰 Expense & Sales Tracking
- **Smart Categorization**: Group expenses by Feed, Medicine, Labor, etc.
- **Multiple Payment Statuses**: Track Paid, Partial, and Due amounts.
- **Automated Sales Workflow**: Recording a sale automatically updates the goat's status and calculates profit margins.

### 🤝 Multi-Owner Partner Ledger
- **Equity Management**: Define ownership share percentages for multiple partners.
- **Contribution Tracking**: Automatically calculate how much each partner has contributed vs. their expected share.
- **Individual Ledgers**: Detailed transaction history for each partner.

### 🌍 Global Multi-Currency Support
- **Locale-Aware Formatting**: Uses the native `Intl` API to correctly format currency symbols, decimal places, and grouping based on the selected region.
- **Smart Compact Numbers**: Handles regional variations like **Lakhs (1L)** for India/Bangladesh vs **Thousands (100K)** for international markets.
- **Customizable**: Switch between BDT, INR, USD, EUR, and more in a single click.

### 🔒 Data Safety & Portability
- **Backup & Restore**: Export your entire farm data into a structured JSON file.
- **Atomic Restore**: Import backups with a single click, ensuring data integrity across all database relationships.
- **Supabase Security**: Row Level Security (RLS) ensures your farm data is only accessible to you.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Vanilla CSS with Modern Variables, Tailwind CSS (Utility support), Framer Motion (Animations)
- **Backend/Database**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Image Processing**: browser-image-compression

---

## 🚀 Recent Updates

- **v1.2.0**: Added **Multi-Currency Engine**. Users can now manage their farm in any global currency with locale-correct formatting (e.g., ৳, ₹, $).
- **v1.1.5**: Enhanced **Partner Ledger** logic to calculate balance based on total farm capital (Goat Purchases + Shared Expenses).
- **v1.1.0**: Implemented **A4 PDF Export** for Reports.
- **v1.0.5**: Added **Backup & Restore** system for local data portability.

---

## 💻 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Account

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/farm-management.git
   cd farm-management
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

---

## 📱 Mobile-First Design
Khamar Khata is built with a **Mobile-First** approach. The interface is optimized for handheld devices used on the field, featuring large touch targets, simplified navigation, and a glassmorphic aesthetic that feels premium on any screen.

---

## 📄 License
Commercial License - All rights reserved.
