# Family Wallet — API Design & Contract (Next.js App Router)

API design ini dioptimalkan untuk:

- Next.js App Router
- Route Handlers
- Future mobile app compatibility
- Frontend/backend separation
- Vercel serverless environment
- Scalable MVP architecture

---

# 1. API DESIGN PRINCIPLES

---

# Base URL

```txt id="83f67m"
/api/v1
```

---

# API Style

## RESTful Hybrid

Gunakan:

- REST untuk resources
- lightweight action endpoints untuk auth/invite flow

---

# Response Standard

## Success

```json id="6pb0vy"
{
  "success": true,
  "data": {},
  "meta": {}
}
```

---

## Error

```json id="b3y61j"
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

---

# Authentication

## Strategy

```txt id="yfx32q"
Auth.js Session Cookie
```

---

# Protected API

Semua endpoint selain auth:

- require authenticated session
- household scoped

---

# API Folder Structure (Next.js)

```txt id="4ktm9y"
src/app/api/v1/
├── auth/
├── dashboard/
├── transactions/
├── categories/
├── budgets/
├── reports/
├── household/
└── invites/
```

---

# Recommended Feature Structure

```txt id="mdg9kq"
src/features/transactions/
├── transaction.service.ts
├── transaction.repository.ts
├── transaction.schema.ts
├── transaction.dto.ts
├── transaction.mapper.ts
└── transaction.types.ts
```

---

# 2. AUTH API

Karena menggunakan [Auth.js](https://authjs.dev?utm_source=chatgpt.com), sebagian besar auth flow ditangani framework.

---

# Route

```txt id="johz0l"
/api/auth/*
```

---

# Used Endpoints

| Endpoint                  | Purpose         |
| ------------------------- | --------------- |
| `/api/auth/signin/google` | Google OAuth    |
| `/api/auth/session`       | Current session |
| `/api/auth/signout`       | Logout          |

---

# Session Response

```json id="w5h0j6"
{
  "user": {
    "id": "usr_1",
    "name": "Budi",
    "email": "budi@gmail.com",
    "image": "https://...",
    "role": "owner",
    "householdId": "hh_1"
  }
}
```

---

# 3. DASHBOARD API

---

# GET Dashboard Summary

## Endpoint

```txt id="qdf5mf"
GET /api/v1/dashboard/summary
```

---

# Purpose

Load dashboard overview data.

---

# Response

```json id="bd8g5z"
{
  "success": true,
  "data": {
    "balance": 4500000,
    "totalIncome": 5500000,
    "totalExpense": 1000000,
    "monthlyChangePercent": 12,
    "budgetAlerts": [
      {
        "categoryId": "cat_1",
        "categoryName": "Transport",
        "percentage": 85
      }
    ],
    "recentTransactions": [],
    "expenseChart": [],
    "monthlyTrend": []
  }
}
```

---

# 4. TRANSACTION API

---

# Transaction DTO

```ts id="n6v6t4"
type TransactionDTO = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description?: string;
  transactionDate: string;

  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };

  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };

  createdAt: string;
};
```

---

# 4.1 GET Transactions

## Endpoint

```txt id="f9gfhw"
GET /api/v1/transactions
```

---

# Query Params

| Param      | Type           |
| ---------- | -------------- |
| page       | number         |
| limit      | number         |
| month      | number         |
| year       | number         |
| type       | income/expense |
| categoryId | string         |

---

# Example

```txt id="7uvmws"
/api/v1/transactions?page=1&limit=20&month=5&year=2026
```

---

# Response

```json id="qjzngn"
{
  "success": true,
  "data": [
    {
      "id": "trx_1",
      "type": "expense",
      "amount": 50000,
      "description": "Lunch",
      "transactionDate": "2026-05-26",

      "category": {
        "id": "cat_1",
        "name": "Food",
        "icon": "🍔",
        "color": "#F97316"
      },

      "createdBy": {
        "id": "usr_1",
        "name": "Budi"
      }
    }
  ],

  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

---

# 4.2 GET Transaction Detail

## Endpoint

```txt id="jlwmnr"
/api/v1/transactions/:id
```

---

# Response

```json id="jlwm4g"
{
  "success": true,
  "data": {
    "id": "trx_1",
    "type": "expense",
    "amount": 50000,
    "description": "Lunch"
  }
}
```

---

# 4.3 CREATE Transaction

## Endpoint

```txt id="6jlwm7"
POST /api/v1/transactions
```

---

# Request Body

```json id="9jlwmr"
{
  "type": "expense",
  "amount": 50000,
  "categoryId": "cat_1",
  "description": "Lunch",
  "transactionDate": "2026-05-26"
}
```

---

# Validation Rules

| Field           | Rule       |
| --------------- | ---------- |
| amount          | > 0        |
| categoryId      | must exist |
| type            | enum       |
| transactionDate | valid date |

---

# Response

```json id="9jlwm0"
{
  "success": true,
  "data": {
    "id": "trx_1"
  }
}
```

---

# 4.4 UPDATE Transaction

## Endpoint

```txt id="3jlwmf"
PATCH /api/v1/transactions/:id
```

---

# Request Body

```json id="4jlwm9"
{
  "amount": 70000,
  "description": "Dinner"
}
```

---

# 4.5 DELETE Transaction

## Endpoint

```txt id="8jlwmv"
DELETE /api/v1/transactions/:id
```

---

# Response

```json id="1jlwm8"
{
  "success": true
}
```

---

# 5. CATEGORY API

---

# Category DTO

```ts id="9jlwm6"
type CategoryDTO = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
};
```

---

# 5.1 GET Categories

## Endpoint

```txt id="0jlwmx"
GET /api/v1/categories
```

---

# Query Params

| Param | Example |
| ----- | ------- |
| type  | expense |

---

# Response

```json id="2jlwmn"
{
  "success": true,
  "data": [
    {
      "id": "cat_1",
      "name": "Food",
      "icon": "🍔",
      "color": "#F97316",
      "type": "expense"
    }
  ]
}
```

---

# 5.2 CREATE Category

## Endpoint

```txt id="4jlwmm"
POST /api/v1/categories
```

---

# Request

```json id="7jlwmk"
{
  "name": "Pet",
  "icon": "🐶",
  "color": "#3B82F6",
  "type": "expense"
}
```

---

# 5.3 UPDATE Category

```txt id="1jlwmv"
PATCH /api/v1/categories/:id
```

---

# 5.4 DELETE Category

```txt id="6jlwmh"
DELETE /api/v1/categories/:id
```

---

# 6. BUDGET API

---

# Budget DTO

```ts id="5jlwm2"
type BudgetDTO = {
  id: string;
  amount: number;
  month: number;
  year: number;

  category: {
    id: string;
    name: string;
    icon: string;
  };

  spent: number;
  percentage: number;
  status: "safe" | "warning" | "over";
};
```

---

# 6.1 GET Budgets

## Endpoint

```txt id="2jlwm0"
GET /api/v1/budgets
```

---

# Query

| Param | Example |
| ----- | ------- |
| month | 5       |
| year  | 2026    |

---

# Response

```json id="7jlwmq"
{
  "success": true,
  "data": [
    {
      "id": "bud_1",
      "amount": 2000000,
      "spent": 1400000,
      "percentage": 70,
      "status": "safe",

      "category": {
        "id": "cat_1",
        "name": "Food",
        "icon": "🍔"
      }
    }
  ]
}
```

---

# 6.2 CREATE Budget

## Endpoint

```txt id="0jlwm7"
POST /api/v1/budgets
```

---

# Request

```json id="3jlwmr"
{
  "categoryId": "cat_1",
  "amount": 2000000,
  "month": 5,
  "year": 2026
}
```

---

# 6.3 UPDATE Budget

```txt id="6jlwmm"
PATCH /api/v1/budgets/:id
```

---

# 6.4 DELETE Budget

```txt id="1jlwm4"
DELETE /api/v1/budgets/:id
```

---

# 7. REPORT API

---

# 7.1 Expense Breakdown

## Endpoint

```txt id="7jlwm9"
GET /api/v1/reports/category-breakdown
```

---

# Response

```json id="0jlwm4"
{
  "success": true,
  "data": [
    {
      "categoryId": "cat_1",
      "categoryName": "Food",
      "amount": 2000000,
      "percentage": 40
    }
  ]
}
```

---

# 7.2 Monthly Trend

## Endpoint

```txt id="2jlwm3"
GET /api/v1/reports/monthly-trend
```

---

# Response

```json id="4jlwm6"
{
  "success": true,
  "data": [
    {
      "month": "Jan",
      "income": 5000000,
      "expense": 3000000
    }
  ]
}
```

---

# 7.3 Export CSV

## Endpoint

```txt id="8jlwm1"
GET /api/v1/reports/export
```

---

# Query Params

| Param | Example |
| ----- | ------- |
| month | 5       |
| year  | 2026    |

---

# Response

```txt id="5jlwm7"
Content-Type: text/csv
```

---

# 8. HOUSEHOLD API

---

# Household DTO

```ts id="3jlwm5"
type HouseholdDTO = {
  id: string;
  name: string;
  memberCount: number;
};
```

---

# 8.1 GET Household

## Endpoint

```txt id="1jlwmq"
GET /api/v1/household
```

---

# Response

```json id="7jlwm3"
{
  "success": true,
  "data": {
    "id": "hh_1",
    "name": "Budi Family",
    "memberCount": 4
  }
}
```

---

# 8.2 UPDATE Household

## Endpoint

```txt id="2jlwm8"
PATCH /api/v1/household
```

---

# Request

```json id="4jlwm0"
{
  "name": "Santoso Family"
}
```

---

# 8.3 GET Members

## Endpoint

```txt id="8jlwm2"
GET /api/v1/household/members
```

---

# Response

```json id="9jlwm1"
{
  "success": true,
  "data": [
    {
      "id": "usr_1",
      "name": "Budi",
      "email": "budi@gmail.com",
      "avatar": "https://...",
      "role": "owner"
    }
  ]
}
```

---

# 8.4 REMOVE Member

## Endpoint

```txt id="0jlwm1"
DELETE /api/v1/household/members/:userId
```

---

# 9. INVITE API

---

# 9.1 CREATE Invite

## Endpoint

```txt id="6jlwm1"
POST /api/v1/invites
```

---

# Response

```json id="5jlwm0"
{
  "success": true,
  "data": {
    "inviteUrl": "https://app.domain.com/invite/abc123",
    "expiresAt": "2026-06-02T00:00:00Z"
  }
}
```

---

# 9.2 VALIDATE Invite

## Endpoint

```txt id="3jlwm0"
GET /api/v1/invites/:token
```

---

# Response

```json id="9jlwm5"
{
  "success": true,
  "data": {
    "householdName": "Budi Family",
    "memberCount": 4,
    "expiresAt": "2026-06-02T00:00:00Z"
  }
}
```

---

# 9.3 REVOKE Invite

## Endpoint

```txt id="7jlwm6"
DELETE /api/v1/invites/:token
```

---

# 10. ERROR CODES

| Code             | Meaning            |
| ---------------- | ------------------ |
| UNAUTHORIZED     | Invalid session    |
| FORBIDDEN        | No permission      |
| VALIDATION_ERROR | Invalid request    |
| NOT_FOUND        | Resource not found |
| INVITE_EXPIRED   | Invite invalid     |
| INTERNAL_ERROR   | Server error       |

---

# 11. Recommended Validation Stack

## Validation

Zod

---

# Example

```ts id="1jlwm2"
const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  categoryId: z.string().uuid(),
  description: z.string().optional(),
  transactionDate: z.string(),
});
```

---

# 12. Recommended Service Layer Flow

```txt id="8jlwm5"
Route Handler
↓
Auth Check
↓
Zod Validation
↓
Service Layer
↓
Repository Layer
↓
Prisma
↓
Response DTO
```

---

# 13. Recommended Route Handler Structure

## Example

```txt id="4jlwm7"
src/app/api/v1/transactions/route.ts
```

---

# Example Flow

```ts id="0jlwm2"
export async function POST(req: Request) {
  const session = await auth();

  validateSession(session);

  const body = await req.json();

  const parsed = schema.parse(body);

  const result = await transactionService.create(parsed);

  return NextResponse.json({
    success: true,
    data: result,
  });
}
```

---

# 14. Recommended Security Rules

---

# Household Scope Protection

Semua query wajib:

```txt id="9jlwm2"
WHERE household_id = session.householdId
```

---

# Never Trust Frontend IDs

Selalu validasi:

- ownership
- household access
- role access

---

# Owner-only Endpoints

```txt id="5jlwm5"
POST /budgets
DELETE /members
DELETE /invites
PATCH /household
```

---

# 15. Future Scalability Ready

API design ini sudah siap untuk:

```txt id="1jlwm1"
Mobile App
Realtime
AI Services
Separate Backend
Microservices
```
