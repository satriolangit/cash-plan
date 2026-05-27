# Family Wallet — Updated Page Flow (Google Auth + Invite Link MVP)

Flow ini sudah direvisi berdasarkan architecture terbaru:

- Full Next.js App Router
- [Auth.js](https://authjs.dev?utm_source=chatgpt.com) + Google OAuth
- Invite link onboarding
- Mobile-first UX
- Full deployment di [Vercel](https://vercel.com?utm_source=chatgpt.com)
- No password flow
- No manual registration
- Low friction onboarding

---

# 1. High Level Application Flow

```txt id="q3l8gb"
Landing
   ↓
Continue with Google
   ↓
Check Session State
   ↓
┌─────────────────────────────┐
│ New User?                   │
├─────────────────────────────┤
│ YES → Create Household      │
│ NO  → Load Existing Data    │
└─────────────────────────────┘
   ↓
Dashboard
```

---

# 2. Route Structure (Updated)

```txt id="1plb3m"
/
├── /landing
├── /auth/signin
├── /auth/error
├── /invite/[token]

├── /(dashboard)
│   ├── /dashboard
│   ├── /transactions
│   ├── /transactions/new
│   ├── /transactions/[id]/edit
│   │
│   ├── /reports
│   ├── /reports/category
│   ├── /reports/monthly
│   │
│   ├── /budgets
│   ├── /budgets/new
│   ├── /budgets/[id]/edit
│   │
│   ├── /categories
│   ├── /categories/new
│   ├── /categories/[id]/edit
│   │
│   ├── /household
│   ├── /household/members
│   ├── /household/invite
│   ├── /household/settings
│   │
│   └── /profile
│
├── /403
├── /404
└── /500
```

---

# 3. Public Flow

---

# 3.1 Landing Page Flow

## Route

```txt id="fzm34q"
/landing
```

---

## Purpose

- marketing page
- onboarding entry
- trust building
- conversion

---

## User Flow

```txt id="3cq3qs"
Landing
↓
Continue with Google
↓
Google OAuth
↓
Dashboard
```

---

## Sections

```txt id="a9h13w"
Hero
Features
Mobile Preview
Security Trust
CTA
Footer
```

---

## Primary CTA

```txt id="u7otw0"
[ Continue with Google ]
```

---

# 3.2 Auth Sign In Flow

## Route

```txt id="c1tvtx"
/auth/signin
```

---

## Flow

```txt id="7obzqj"
Click Google Button
↓
Google Consent
↓
Auth.js Callback
↓
Create Session
↓
Redirect
```

---

# 3.3 Invite Link Flow

## Route

```txt id="uwah6m"
/invite/[token]
```

---

# Invite Flow UX

```txt id="v7g1pq"
Open Invite Link
↓
Validate Token
↓
Show Household Preview
↓
Continue with Google
↓
Join Household
↓
Dashboard
```

---

# Invite Page Components

```txt id="t6dxkr"
Household Name
Member Count
Invite Expiration
Continue with Google Button
```

---

# 4. First Time User Flow

---

# 4.1 New User Without Invite

```txt id="7sif75"
Google Login
↓
No Existing User
↓
Create User
↓
Create Household
↓
Seed Categories
↓
Dashboard
```

---

# System Actions

## Auto Create

```txt id="c3o1d6"
Household
Default Categories
Session
```

---

# Household Naming

Recommended:

```txt id="4d4v5q"
"{FirstName} Family"
```

Example:

```txt id="3fzfzd"
"Budi Family"
```

---

# 5. Returning User Flow

```txt id="gok7t7"
Open App
↓
Session Exists?
↓
YES
↓
Dashboard
```

---

# 6. Dashboard Flow

---

# Route

```txt id="h7n9z7"
/dashboard
```

---

# Dashboard Purpose

Single source of truth untuk kondisi keuangan keluarga.

---

# Dashboard Structure

## Mobile Priority Order

```txt id="6t4ytr"
Header
Balance Card
Quick Add
Budget Alert
Recent Transactions
Budget Progress
Mini Charts
Bottom Navigation
```

---

# Desktop Structure

```txt id="mr4zmm"
Sidebar
Topbar
Summary Cards
Charts
Recent Transactions
Budget Monitoring
```

---

# Dashboard Navigation Flow

```txt id="fc1sgv"
Dashboard
├── Add Transaction
├── View Transactions
├── View Reports
├── Manage Budget
└── Manage Household
```

---

# 7. Transaction Flow

---

# 7.1 Transactions List

## Route

```txt id="4dv59m"
/transactions
```

---

# Flow

```txt id="dgs5ru"
Transactions
↓
Filter/Search
↓
View Transaction
↓
Edit/Delete
```

---

# Features

```txt id="pgn4rq"
Month Filter
Type Filter
Category Filter
Pagination
```

---

# Mobile UX

Recommended:

```txt id="pl6x86"
Card List
```

Bukan table.

---

# 7.2 Create Transaction

## Route

```txt id="p7vbo6"
/transactions/new
```

---

# Flow

```txt id="4lnqql"
Open Add Form
↓
Input Data
↓
Validate
↓
Save
↓
Refresh Dashboard
↓
Back
```

---

# Recommended UX

## Mobile

Gunakan:

```txt id="3qtbko"
Bottom Sheet Modal
```

---

# Form Order

```txt id="efgic8"
Type
Amount
Category
Date
Description
Save
```

---

# Smart Defaults

```txt id="wtxdx5"
Date = Today
Last Category Suggestion
Numeric Keyboard
```

---

# 7.3 Edit Transaction

## Route

```txt id="j4j8oi"
/transactions/[id]/edit
```

---

# Actions

```txt id="x47s1e"
Edit
Delete
Save Changes
```

---

# 8. Reports Flow

---

# Route

```txt id="5jlwm1"
/reports
```

---

# Purpose

Financial insights sederhana.

---

# Navigation Tabs

```txt id="jyg9vq"
Overview
Categories
Monthly Trends
```

---

# 8.1 Category Report

## Route

```txt id="d0vyj0"
/reports/category
```

---

# Content

```txt id="8rk8i2"
Donut Chart
Category Ranking
Percentage Breakdown
```

---

# 8.2 Monthly Report

## Route

```txt id="r6sjri"
/reports/monthly
```

---

# Content

```txt id="b1wg3l"
Income vs Expense
Monthly Savings
Trend Chart
```

---

# 9. Budget Flow

---

# Route

```txt id="jlwmqv"
/budgets
```

---

# Access

```txt id="9pss4k"
Owner Only
```

---

# Flow

```txt id="1l0l8w"
View Budget
↓
Check Progress
↓
Add/Edit Budget
```

---

# Budget Status

```txt id="k06q12"
Green = Safe
Yellow = Warning
Red = Over Budget
```

---

# 9.1 Create Budget

## Route

```txt id="62m17y"
/budgets/new
```

---

# Form

```txt id="jlwm8d"
Category
Amount
Month
Year
Save
```

---

# 10. Categories Flow

---

# Route

```txt id="7pw4dy"
/categories
```

---

# Purpose

Manage expense/income grouping.

---

# Grouping

```txt id="r5fzrr"
Income Categories
Expense Categories
```

---

# Actions

```txt id="xf1h9d"
Create
Edit
Delete
```

---

# 10.1 Create Category

## Route

```txt id="65s5dx"
/categories/new
```

---

# Form

```txt id="10lxx6"
Name
Type
Icon
Color
Save
```

---

# 11. Household Flow

---

# Route

```txt id="kv7xwe"
/household
```

---

# Purpose

Manage family collaboration.

---

# Household Overview Components

```txt id="ww68ng"
Household Name
Member Count
Invite Link
Settings Shortcut
```

---

# 11.1 Members Flow

## Route

```txt id="z3jv5v"
/household/members
```

---

# Actions

```txt id="kh5zz0"
View Members
Remove Member
```

---

# Member Card

```txt id="jlwm2z"
Avatar
Name
Role
Joined Date
```

---

# 11.2 Invite Flow

## Route

```txt id="jlwmj6"
/household/invite
```

---

# Flow

```txt id="jlwmv2"
Generate Invite
↓
Copy Link
↓
Share WhatsApp
```

---

# Invite Components

```txt id="jlwm0t"
Invite URL
Copy Button
WhatsApp Share
Regenerate Link
```

---

# Recommended WhatsApp Message

```txt id="jlwm24"
Gabung ke Family Wallet keluarga kami 👋
Klik link berikut:
https://app.domain.com/invite/abc123
```

---

# 11.3 Household Settings

## Route

```txt id="jz30r4"
/household/settings
```

---

# Features

```txt id="jlwmr1"
Rename Household
Revoke Invite
Danger Zone
```

---

# 12. Profile Flow

---

# Route

```txt id="jlwm3q"
/profile
```

---

# Components

```txt id="jlwm6w"
Avatar
Name
Email
Logout
```

---

# 13. Navigation System

---

# Mobile Navigation (Primary)

Recommended:

```txt id="f07qq5"
Dashboard
Transactions
Reports
Profile
```

---

# Floating Action Button

```txt id="jlwmps"
+ Add Transaction
```

---

# Desktop Navigation

```txt id="jlwmwi"
Dashboard
Transactions
Reports
Budgets
Categories
Household
Profile
```

---

# 14. Middleware Flow

---

# Protected Routes

```txt id="p5c24s"
/dashboard/*
```

---

# Middleware Logic

```txt id="4xxprl"
Check Session
↓
Session Valid?
├── YES → Continue
└── NO  → Redirect Sign In
```

---

# 15. Error Flow

---

# Unauthorized

```txt id="sotbt4"
403
↓
Back Dashboard
```

---

# Invalid Invite

```txt id="jlwm9q"
Invite Expired
↓
Contact Household Owner
```

---

# Network Error

```txt id="9ixtsj"
Retry Request
```

---

# 16. Empty State Flow

---

# No Transactions

```txt id="a2jj6v"
No Transactions
↓
Add First Transaction
```

---

# No Budget

```txt id="jlwm8g"
No Budget
↓
Create Budget
```

---

# 17. Recommended MVP UX Principles

---

# Core UX Goals

```txt id="jlwm11"
Fast onboarding
Minimal typing
Simple navigation
Fast transaction input
Clear financial visibility
```

---

# VERY IMPORTANT

## MVP Focus

Aplikasi ini harus terasa seperti:

```txt id="jlwm0g"
Simple family finance app
```

Bukan:

```txt id="jlwm8o"
Complex accounting software
```

---

# 18. Recommended Future Flow Expansion (Phase 2)

```txt id="x7m5qq"
/goals
/recurring-transactions
/subscriptions
/notifications
/receipt-upload
/ai-insights
```
