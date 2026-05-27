# Business Requirements Document (BRD)

# Family Wallet — Family Finance Management App (MVP)

**Version:** 2.0
**Date:** 26 May 2026
**Status:** Revised MVP Architecture

---

# 1. Executive Summary

Family Wallet adalah aplikasi web modern untuk membantu keluarga mencatat, memonitor, dan memahami kondisi keuangan bersama secara sederhana dan real-time.

Aplikasi dirancang mobile-first, mudah digunakan oleh pengguna non-technical, dan memiliki onboarding super cepat menggunakan Google Login tanpa perlu registrasi password manual.

Target utama MVP adalah validasi market dengan development cost rendah menggunakan fullstack Next.js architecture di platform serverless.

---

# 2. Business Goals

## Primary Goals

- Menyederhanakan pencatatan keuangan keluarga
- Memberikan visibilitas pengeluaran keluarga secara real-time
- Membantu kontrol budget bulanan keluarga
- Mengurangi friction onboarding pengguna
- Menyediakan collaborative finance tracking antar anggota keluarga

---

## Success Metrics

| Metric                     | Target MVP    |
| -------------------------- | ------------- |
| Time onboarding            | < 1 menit     |
| Daily transaction input    | < 10 detik    |
| Active household retention | > 40% monthly |
| Mobile usability           | Excellent     |
| Monthly active household   | 100–1000      |

---

# 3. Product Scope

## In Scope (MVP)

### Authentication

- Google OAuth login
- Session management
- Invite-based household joining

---

### Household

- Household creation otomatis
- Multi-user household
- Invite member via invite link
- Household settings

---

### Transactions

- Income & expense tracking
- Transaction categories
- Transaction filtering
- Edit & delete transaction

---

### Budget

- Monthly category budget
- Budget progress monitoring
- Budget alerts

---

### Reports

- Expense category chart
- Monthly trend chart
- CSV export

---

### Responsive UI

- Mobile-first responsive web app
- Desktop support

---

# 4. Out of Scope (MVP)

- Native mobile app
- Bank integration
- E-wallet integration
- Investment tracking
- AI financial insights
- Push notification
- Recurring transactions
- Offline mode
- Realtime collaboration
- Multi-currency

---

# 5. User Roles

| Role   | Description                                      |
| ------ | ------------------------------------------------ |
| Owner  | Creator of household with full management access |
| Member | Household member with transaction access         |

---

# 6. Core Business Requirements

## BR-01 — Google Authentication

System harus mendukung login menggunakan Google account.

---

## BR-02 — Automatic Household Creation

Saat user pertama login tanpa invite link:

- sistem otomatis membuat household baru.

---

## BR-03 — Invite-based Joining

Owner dapat mengundang member menggunakan secure invite link.

---

## BR-04 — Shared Household Data

Semua member dalam household dapat melihat transaksi dan laporan yang sama.

---

## BR-05 — Transaction Recording

User dapat:

- menambah
- edit
- delete
- melihat transaksi

---

## BR-06 — Budget Monitoring

Owner dapat membuat budget bulanan per kategori.

---

## BR-07 — Financial Dashboard

System harus menyediakan dashboard real-time:

- income
- expense
- balance
- budget status

---

## BR-08 — Mobile-first UX

Aplikasi harus nyaman digunakan dari smartphone.

---

# 7. Technical Constraints

| Area       | Constraint             |
| ---------- | ---------------------- |
| Frontend   | Next.js App Router     |
| Backend    | Next.js Route Handlers |
| Database   | Neon PostgreSQL        |
| ORM        | Prisma                 |
| Deployment | Vercel                 |
| Auth       | Auth.js + Google OAuth |
| Session    | JWT Session            |
| Charts     | Recharts               |
| Validation | Zod                    |

---

# 8. Non Functional Requirements

| Area            | Requirement            |
| --------------- | ---------------------- |
| Response Time   | < 2 seconds            |
| Mobile Viewport | >= 360px               |
| Security        | HTTPS only             |
| Auth            | Secure session cookies |
| Availability    | Best effort via Vercel |
| Browser Support | Modern browsers only   |

---

# Functional Specification Document (FSD)

# Family Wallet — MVP

**Version:** 2.0

---

# 1. Authentication Module

## 1.1 Google Sign In

### Flow

```txt
Landing
↓
Continue with Google
↓
Authenticate Google
↓
Create/Login User
↓
Redirect Dashboard
```

---

## Process

### New User

1. User authenticate via Google OAuth
2. System create user record
3. System create household otomatis
4. System seed default categories
5. System create JWT session
6. Redirect `/dashboard`

---

### Existing User

1. Validate existing account
2. Create session
3. Redirect dashboard

---

## Stored User Data

| Field        | Description         |
| ------------ | ------------------- |
| id           | UUID                |
| name         | Google profile name |
| email        | Google email        |
| avatar_url   | Google avatar       |
| role         | owner/member        |
| household_id | active household    |

---

# 2. Invite System Module

## 2.1 Create Invite Link

Owner dapat generate invite link.

### Example

```txt
/invite/abc123xyz
```

---

## 2.2 Join Household

### Flow

```txt
Open invite link
↓
Google Login
↓
Validate token
↓
Join household
↓
Dashboard
```

---

## Rules

| Rule              | Value  |
| ----------------- | ------ |
| Invite expiration | 7 days |
| Invite reusable   | Yes    |
| Invite revocable  | Yes    |

---

# 3. Dashboard Module

## 3.1 Dashboard Summary

### Components

- Net balance
- Total income
- Total expense
- Budget alerts
- Recent transactions
- Monthly trend
- Expense category chart

---

## 3.2 Dashboard Data Source

### API

```txt
GET /api/v1/dashboard/summary
```

---

# 4. Transaction Module

## 4.1 Create Transaction

### Input

| Field       | Type           |
| ----------- | -------------- |
| type        | income/expense |
| amount      | number         |
| category_id | UUID           |
| date        | date           |
| description | optional       |

---

## Process

1. Validate Zod schema
2. Validate category ownership
3. Insert transaction
4. Revalidate dashboard cache

---

## 4.2 Transaction List

### Features

- Pagination
- Month filter
- Type filter
- Category filter

---

## 4.3 Edit Transaction

All fields editable.

---

## 4.4 Delete Transaction

Soft delete only (set `deleted_at` timestamp). Hard delete via cleanup job after 90 days (Phase 2).

---

# 5. Category Module

## 5.1 Default Categories

Seed otomatis saat household dibuat.

---

### Income

- Salary
- Bonus
- Investment
- Other

---

### Expense

- Food
- Transport
- Shopping
- Health
- Education
- Entertainment
- Bills
- Other

---

## 5.2 Custom Category

User dapat:

- add
- edit
- delete category

---

# 6. Budget Module

## 6.1 Create Budget

Owner dapat membuat budget bulanan.

---

## Input

| Field       | Type    |
| ----------- | ------- |
| category_id | UUID    |
| amount      | decimal |
| month       | number  |
| year        | number  |

---

## 6.2 Budget Indicator

### Threshold

| Status      | Condition |
| ----------- | --------- |
| Safe        | < 75%     |
| Warning     | 75%-99%   |
| Over Budget | >=100%    |

---

# 7. Reports Module

## 7.1 Expense Breakdown

### Chart

Donut chart.

---

## 7.2 Monthly Trend

### Chart

Bar chart:

- income
- expense

---

## 7.3 Export CSV

Columns:

- date
- type
- category
- description
- amount

---

# 8. Household Module

## 8.1 Household Overview

### Features

- household name
- member list
- invite link
- settings

---

## 8.2 Member Management

Owner dapat:

- remove member
- regenerate invite

---

# 9. Route Structure

```txt
/
├── /landing
├── /auth/signin
├── /invite/[token]

├── /(dashboard)
│   ├── /dashboard
│   ├── /transactions
│   ├── /reports
│   ├── /budgets
│   ├── /categories
│   ├── /household
│   └── /profile

└── /api/v1
    ├── /auth
    ├── /dashboard
    ├── /transactions
    ├── /reports
    ├── /budgets
    ├── /categories
    └── /household
```

---

# 10. API Design Standard

## Success Response

```json
{
  "success": true,
  "data": {}
}
```

---

## Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

---

# Entity Relationship Diagram (ERD)

```mermaid
erDiagram

    USERS {
        uuid id PK
        varchar name
        varchar email UK
        varchar avatar_url
        enum role "owner | member"
        uuid household_id FK
        timestamp created_at
    }

    HOUSEHOLDS {
        uuid id PK
        varchar name
        timestamp created_at
    }

    CATEGORIES {
        uuid id PK
        uuid household_id FK
        varchar name
        varchar icon
        varchar color
        enum type "income | expense | both"
        boolean is_default
        timestamp created_at
        timestamp deleted_at NULL
    }

    TRANSACTIONS {
        uuid id PK
        uuid household_id FK
        uuid user_id FK
        uuid category_id FK
        enum type "income | expense"
        decimal amount
        varchar description
        date transaction_date
        timestamp created_at
        timestamp deleted_at NULL
    }

    BUDGETS {
        uuid id PK
        uuid household_id FK
        uuid category_id FK
        decimal amount
        integer month
        integer year
        timestamp created_at
        timestamp deleted_at NULL
    }

    HOUSEHOLD_INVITES {
        uuid id PK
        uuid household_id FK
        varchar token UK
        timestamp expires_at
        boolean is_revoked
        uuid created_by FK
        timestamp created_at
    }

    ACCOUNTS {
        uuid id PK
        uuid user_id FK
        varchar provider
        varchar provider_account_id
        timestamp created_at
    }

    USERS ||--|| HOUSEHOLDS : belongs_to
    HOUSEHOLDS ||--o{ USERS : has
    HOUSEHOLDS ||--o{ CATEGORIES : owns
    HOUSEHOLDS ||--o{ TRANSACTIONS : records
    HOUSEHOLDS ||--o{ BUDGETS : has
    HOUSEHOLDS ||--o{ HOUSEHOLD_INVITES : creates
    USERS ||--o{ TRANSACTIONS : creates
    USERS ||--o{ ACCOUNTS : auth
    USERS ||--o{ HOUSEHOLD_INVITES : generates
    CATEGORIES ||--o{ TRANSACTIONS : categorizes
    CATEGORIES ||--o{ BUDGETS : budgeted
```

---

# Important Database Constraints

## USERS

- email unique globally
- lowercase email normalization

---

## BUDGETS

Unique constraint (soft-delete aware):

```txt
(household_id, category_id, month, year)
```

With `deleted_at` using `NULLS NOT DISTINCT` to allow re-creating budgets after soft delete.

---

## SOFT DELETE

All deletions use `deleted_at` timestamp. Applies to:

- TRANSACTIONS
- CATEGORIES
- BUDGETS

Active records always have `deleted_at IS NULL`. See `plans/08_soft_delete.md` for full implementation.

---

## CATEGORIES

Unique constraint:

```txt
(household_id, name)
```

---

## TRANSACTIONS

Check constraint:

```txt
amount > 0
```

---

# Recommended MVP Deployment

## Stack

| Layer    | Technology             |
| -------- | ---------------------- |
| Frontend | Next.js                |
| Backend  | Next.js Route Handlers |
| Database | Neon PostgreSQL        |
| ORM      | Prisma                 |
| Hosting  | Vercel                 |
| Auth     | Auth.js                |
| OAuth    | Google                 |
| Charts   | Recharts               |

---

# Recommended Future Enhancements (Phase 2)

```txt
Recurring Transactions
Savings Goals
AI Insights
Notification Engine
Receipt Upload
Mobile App
Bank Integration
Subscription Tracking
```
