# Soft Delete Mechanism — Family Wallet MVP

**Version:** 1.0
**Date:** 26 May 2026

---

# 1. Overview

All deletions in the application use soft delete (setting a `deleted_at` timestamp) instead of hard deleting records. This provides:
- Audit trail for all deletions
- Ability to restore accidentally deleted data
- Data integrity for reports and analytics
- Safe cascade behavior

---

# 2. Tables with Soft Delete

| Table | Column | Type | Default |
|-------|--------|------|---------|
| TRANSACTIONS | `deleted_at` | `TIMESTAMP NULL` | `NULL` |
| CATEGORIES | `deleted_at` | `TIMESTAMP NULL` | `NULL` |
| BUDGETS | `deleted_at` | `TIMESTAMP NULL` | `NULL` |

---

# 3. Schema Changes

## 3.1 PRISMA Schema

```prisma
model Transaction {
  id              String    @id @default(uuid())
  householdId     String
  userId          String
  categoryId      String
  type            String
  amount          Decimal
  description     String?
  transactionDate DateTime
  createdAt       DateTime  @default(now())
  deletedAt       DateTime?  // Soft delete

  household  Household  @relation(fields: [householdId], references: [id])
  user       User       @relation(fields: [userId], references: [id])
  category   Category   @relation(fields: [categoryId], references: [id])

  @@index([householdId, deletedAt])
  @@index([deletedAt])
  @@map("transactions")
}

model Category {
  id          String   @id @default(uuid())
  householdId String
  name        String
  icon        String
  color       String
  type        String
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  deletedAt   DateTime?  // Soft delete

  household    Household     @relation(fields: [householdId], references: [id])
  transactions Transaction[]
  budgets      Budget[]

  @@index([householdId, deletedAt])
  @@map("categories")
}

model Budget {
  id          String   @id @default(uuid())
  householdId String
  categoryId  String
  amount      Decimal
  month       Int
  year        Int
  createdAt   DateTime @default(now())
  deletedAt   DateTime?  // Soft delete

  household Household @relation(fields: [householdId], references: [id])
  category  Category  @relation(fields: [categoryId], references: [id])

  @@unique([householdId, categoryId, month, year, deletedAt])
  @@index([householdId, deletedAt])
  @@map("budgets")
}
```

---

# 4. Repository Layer Implementation

## 4.1 Query Filtering

All read queries MUST filter out soft-deleted records.

```ts
// src/lib/prisma.ts

// Always exclude soft-deleted records
export const activeFilter = { deletedAt: null }

// In repositories:
const transactions = await prisma.transaction.findMany({
  where: {
    householdId: session.householdId,
    deletedAt: null,  // <-- Always include
    ...filters,
  },
  orderBy: { transactionDate: 'desc' },
  skip: (page - 1) * limit,
  take: limit,
})
```

---

## 4.2 Soft Delete Operation

```ts
// src/features/transactions/transaction.repository.ts

async softDelete(id: string, householdId: string): Promise<void> {
  await prisma.transaction.updateMany({
    where: {
      id,
      householdId,
      deletedAt: null,  // Prevent double-delete
    },
    data: {
      deletedAt: new Date(),
    },
  })
}

// For categories — also prevents delete if has active transactions
async softDeleteCategory(id: string, householdId: string): Promise<void> {
  const hasTransactions = await prisma.transaction.count({
    where: {
      categoryId: id,
      householdId,
      deletedAt: null,
    },
  })

  if (hasTransactions > 0) {
    throw new Error('Category has active transactions, cannot delete')
  }

  await prisma.category.updateMany({
    where: {
      id,
      householdId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  })
}
```

---

## 4.3 Restore Operation (Phase 2)

```ts
// Future: restore soft-deleted record
async restore(id: string, householdId: string): Promise<void> {
  await prisma.transaction.updateMany({
    where: {
      id,
      householdId,
      deletedAt: { not: null },
    },
    data: {
      deletedAt: null,
    },
  })
}
```

---

# 5. API Route Changes

## 5.1 DELETE Transaction

```ts
// src/app/api/v1/transactions/[id]/route.ts

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  validateSession(session)

  await transactionService.softDelete(params.id, session.user.householdId)

  return NextResponse.json({ success: true })
}
```

---

## 5.2 DELETE Category

```ts
// src/app/api/v1/categories/[id]/route.ts

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  validateSession(session)

  await categoryService.softDelete(params.id, session.user.householdId)

  return NextResponse.json({ success: true })
}
```

---

## 5.3 DELETE Budget

```ts
// src/app/api/v1/budgets/[id]/route.ts

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  validateSession(session)

  await budgetService.softDelete(params.id, session.user.householdId)

  return NextResponse.json({ success: true })
}
```

---

# 6. Dashboard & Report Query Changes

All aggregate queries MUST also exclude soft-deleted records.

```ts
// Dashboard summary must filter deleted records

const totalExpense = await prisma.transaction.aggregate({
  where: {
    householdId: session.user.householdId,
    type: 'expense',
    deletedAt: null,  // <-- Critical for accurate reports
    transactionDate: {
      gte: startOfMonth,
      lte: endOfMonth,
    },
  },
  _sum: { amount: true },
})
```

---

# 7. Unique Constraints with Soft Delete

For budgets, the unique constraint must account for soft delete:

```sql
-- Prisma unique constraint adjusted:
-- (household_id, category_id, month, year, deleted_at)

-- This allows re-creating the same budget after soft delete
-- because deleted_at will be different (NULL vs timestamp)

-- Migration:
ALTER TABLE budgets
DROP CONSTRAINT budgets_unique_constraint;

ALTER TABLE budgets
ADD CONSTRAINT budgets_unique_constraint
UNIQUE NULLS NOT DISTINCT (household_id, category_id, month, year, deleted_at);
```

---

# 8. Prisma Middleware (Optional)

For automated filtering, create a Prisma middleware:

```ts
// src/lib/prisma-middleware.ts

prisma.$use(async (params, next) => {
  // Auto-add deletedAt: null to all queries
  if (params.action === 'findMany' || params.action === 'findFirst') {
    params.args.where = {
      ...params.args.where,
      deletedAt: null,
    }
  }
  return next(params)
})
```

**Note:** Manual filtering in repositories is recommended over middleware for explicit control.

---

# 9. Safety Rules

| Rule | Implementation |
|------|---------------|
| Prevent double-delete | Check `deletedAt: null` before soft delete |
| Category with active transactions | Cannot soft delete category if linked to non-deleted transactions |
| Budget with active period | Cannot soft delete budget if transactions exist in that period |
| Dashboard/reports accuracy | ALWAYS filter `deletedAt: null` in aggregates |
| Cascade awareness | Soft-deleted categories keep their transaction links intact |

---

# 10. Migration File Example

```sql
-- Add deleted_at to transactions
ALTER TABLE transactions
ADD COLUMN deleted_at TIMESTAMP NULL;

CREATE INDEX idx_transactions_deleted_at
ON transactions (household_id, deleted_at);

-- Add deleted_at to categories
ALTER TABLE categories
ADD COLUMN deleted_at TIMESTAMP NULL;

CREATE INDEX idx_categories_deleted_at
ON categories (household_id, deleted_at);

-- Add deleted_at to budgets
ALTER TABLE budgets
ADD COLUMN deleted_at TIMESTAMP NULL;

-- Update unique constraint for budgets
ALTER TABLE budgets
DROP CONSTRAINT IF EXISTS budgets_unique;

ALTER TABLE budgets
ADD CONSTRAINT budgets_unique
UNIQUE NULLS NOT DISTINCT (household_id, category_id, month, year, deleted_at);

CREATE INDEX idx_budgets_deleted_at
ON budgets (household_id, deleted_at);
```

---

# 11. API Response Changes

Soft-deleted records are NEVER returned from any API response. The client should never know about soft-deleted data.

---

# 12. Cleanup Strategy (Phase 2)

For production maintenance:

```sql
-- Hard delete records soft-deleted > 90 days ago
DELETE FROM transactions
WHERE deleted_at < NOW() - INTERVAL '90 days';

DELETE FROM categories
WHERE deleted_at < NOW() - INTERVAL '90 days';

DELETE FROM budgets
WHERE deleted_at < NOW() - INTERVAL '90 days';
```

Run this as a cron job weekly.
