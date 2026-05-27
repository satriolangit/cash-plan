# Seed Data — Family Wallet MVP

**Version:** 1.0
**Date:** 26 May 2026

---

# 1. Overview

Production-ready seed data for development, testing, and demo environments. The seeder creates a realistic family finance dataset with multiple months of transactions, budgets, and household structure.

---

# 2. Seed Environment

| Environment | Behavior |
|-------------|----------|
| Development | Always seed with demo data |
| Test | Minimal seed per test (handled by test setup) |
| Production | Guard check — only runs if `SEED_PROD=true` is set |

---

# 3. Seed Script

```ts
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  // Prevent accidental production seed
  if (process.env.NODE_ENV === 'production' && process.env.SEED_PROD !== 'true') {
    console.log('Skipping seed in production. Set SEED_PROD=true to force.')
    return
  }

  console.log('Seeding database...')

  // Clean existing data
  await prisma.transaction.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.category.deleteMany()
  await prisma.householdInvite.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.household.deleteMany()

  // 1. Create Household
  const household = await prisma.household.create({
    data: {
      id: 'hh_demo',
      name: 'Demo Family',
    },
  })

  console.log(`Created household: ${household.name}`)

  // 2. Create Users
  const owner = await prisma.user.create({
    data: {
      id: 'usr_owner',
      name: 'Budi Santoso',
      email: 'budi@example.com',
      role: 'owner',
      householdId: household.id,
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Budi',
    },
  })

  const member1 = await prisma.user.create({
    data: {
      id: 'usr_member_1',
      name: 'Ani Santoso',
      email: 'ani@example.com',
      role: 'member',
      householdId: household.id,
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ani',
    },
  })

  const member2 = await prisma.user.create({
    data: {
      id: 'usr_member_2',
      name: 'Dimas Santoso',
      email: 'dimas@example.com',
      role: 'member',
      householdId: household.id,
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Dimas',
    },
  })

  console.log(`Created users: ${owner.name}, ${member1.name}, ${member2.name}`)

  // 3. Create Categories
  const incomeCategories = await Promise.all([
    prisma.category.create({
      data: {
        id: 'cat_income_salary',
        householdId: household.id,
        name: 'Salary',
        icon: '💼',
        color: '#22C55E',
        type: 'income',
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat_income_bonus',
        householdId: household.id,
        name: 'Bonus',
        icon: '🎁',
        color: '#16A34A',
        type: 'income',
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat_income_investment',
        householdId: household.id,
        name: 'Investment',
        icon: '📈',
        color: '#15803D',
        type: 'income',
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat_income_other',
        householdId: household.id,
        name: 'Other Income',
        icon: '💰',
        color: '#4ADE80',
        type: 'income',
        isDefault: true,
      },
    }),
  ])

  const expenseCategories = await Promise.all([
    prisma.category.create({
      data: {
        id: 'cat_expense_food',
        householdId: household.id,
        name: 'Food & Drink',
        icon: '🍜',
        color: '#F97316',
        type: 'expense',
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat_expense_transport',
        householdId: household.id,
        name: 'Transport',
        icon: '⛽',
        color: '#3B82F6',
        type: 'expense',
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat_expense_shopping',
        householdId: household.id,
        name: 'Shopping',
        icon: '🛒',
        color: '#EC4899',
        type: 'expense',
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat_expense_health',
        householdId: household.id,
        name: 'Health',
        icon: '🏥',
        color: '#EF4444',
        type: 'expense',
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat_expense_education',
        householdId: household.id,
        name: 'Education',
        icon: '📚',
        color: '#8B5CF6',
        type: 'expense',
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat_expense_entertainment',
        householdId: household.id,
        name: 'Entertainment',
        icon: '🎮',
        color: '#A855F7',
        type: 'expense',
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat_expense_bills',
        householdId: household.id,
        name: 'Bills & Utilities',
        icon: '📋',
        color: '#64748B',
        type: 'expense',
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat_expense_other',
        householdId: household.id,
        name: 'Other Expense',
        icon: '📦',
        color: '#78716C',
        type: 'expense',
        isDefault: true,
      },
    }),
  ])

  console.log(`Created ${incomeCategories.length + expenseCategories.length} categories`)

  // 4. Create Budgets (May 2026)
  const budgets = await Promise.all([
    prisma.budget.create({
      data: {
        id: 'bud_food',
        householdId: household.id,
        categoryId: 'cat_expense_food',
        amount: 3000000,
        month: 5,
        year: 2026,
      },
    }),
    prisma.budget.create({
      data: {
        id: 'bud_transport',
        householdId: household.id,
        categoryId: 'cat_expense_transport',
        amount: 1000000,
        month: 5,
        year: 2026,
      },
    }),
    prisma.budget.create({
      data: {
        id: 'bud_shopping',
        householdId: household.id,
        categoryId: 'cat_expense_shopping',
        amount: 1500000,
        month: 5,
        year: 2026,
      },
    }),
    prisma.budget.create({
      data: {
        id: 'bud_bills',
        householdId: household.id,
        categoryId: 'cat_expense_bills',
        amount: 2000000,
        month: 5,
        year: 2026,
      },
    }),
    prisma.budget.create({
      data: {
        id: 'bud_entertainment',
        householdId: household.id,
        categoryId: 'cat_expense_entertainment',
        amount: 500000,
        month: 5,
        year: 2026,
      },
    }),
  ])

  console.log(`Created ${budgets.length} budgets`)

  // 5. Create Transactions — Last 3 Months

  // Helper: generate random amount between min and max
  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min

  // Helper: create date
  const date = (month: number, day: number) =>
    new Date(2026, month - 1, day).toISOString().split('T')[0]

  const transactions = [
    // ===== INCOME TRANSACTIONS =====
    {
      householdId: household.id,
      userId: owner.id,
      type: 'income',
      categoryId: 'cat_income_salary',
      amount: 8000000,
      description: 'Monthly salary',
      transactionDate: date(5, 1),
    },
    {
      householdId: household.id,
      userId: owner.id,
      type: 'income',
      categoryId: 'cat_income_salary',
      amount: 8000000,
      description: 'Monthly salary',
      transactionDate: date(4, 1),
    },
    {
      householdId: household.id,
      userId: owner.id,
      type: 'income',
      categoryId: 'cat_income_salary',
      amount: 8000000,
      description: 'Monthly salary',
      transactionDate: date(3, 1),
    },
    {
      householdId: household.id,
      userId: member1.id,
      type: 'income',
      categoryId: 'cat_income_salary',
      amount: 5000000,
      description: 'Monthly salary',
      transactionDate: date(5, 1),
    },
    {
      householdId: household.id,
      userId: member1.id,
      type: 'income',
      categoryId: 'cat_income_salary',
      amount: 5000000,
      description: 'Monthly salary',
      transactionDate: date(4, 1),
    },
    {
      householdId: household.id,
      userId: member1.id,
      type: 'income',
      categoryId: 'cat_income_salary',
      amount: 5000000,
      description: 'Monthly salary',
      transactionDate: date(3, 1),
    },
    {
      householdId: household.id,
      userId: owner.id,
      type: 'income',
      categoryId: 'cat_income_bonus',
      amount: 3000000,
      description: 'Lebaran bonus',
      transactionDate: date(4, 10),
    },
    {
      householdId: household.id,
      userId: owner.id,
      type: 'income',
      categoryId: 'cat_income_investment',
      amount: 1500000,
      description: 'Dividend',
      transactionDate: date(3, 15),
    },

    // ===== EXPENSE TRANSACTIONS — May 2026 =====
    ...Array.from({ length: 25 }, (_, i) => {
      const expenseList = [
        { catId: 'cat_expense_food', descs: ['Lunch', 'Dinner', 'Coffee', 'Snacks', 'Groceries', 'Food delivery', 'Breakfast'], min: 15000, max: 150000, userId: () => [owner.id, member1.id, member2.id][rand(0, 2)] },
        { catId: 'cat_expense_transport', descs: ['Gas', 'Gojek', 'Parking', 'Bus'], min: 10000, max: 100000, userId: () => [owner.id, member1.id][rand(0, 1)] },
        { catId: 'cat_expense_shopping', descs: ['Clothes', 'Home items', 'Gadget accessories', 'Books'], min: 50000, max: 300000, userId: () => [member1.id, member2.id][rand(0, 1)] },
        { catId: 'cat_expense_bills', descs: ['Electricity', 'Internet', 'Water', 'Phone'], min: 100000, max: 500000, userId: () => owner.id },
        { catId: 'cat_expense_entertainment', descs: ['Cinema', 'Game', 'Streaming'], min: 35000, max: 150000, userId: () => [member2.id, member1.id][rand(0, 1)] },
        { catId: 'cat_expense_health', descs: ['Vitamins', 'Checkup', 'Medicine'], min: 30000, max: 200000, userId: () => [owner.id, member1.id][rand(0, 1)] },
      ]

      const cat = expenseList[i % expenseList.length]

      return {
        householdId: household.id,
        userId: cat.userId(),
        type: 'expense' as const,
        categoryId: cat.catId,
        amount: rand(cat.min, cat.max),
        description: cat.descs[rand(0, cat.descs.length - 1)],
        transactionDate: date(5, rand(1, 26)),
      }
    }),

    // ===== EXPENSE TRANSACTIONS — April 2026 =====
    ...Array.from({ length: 20 }, (_, i) => {
      const expenseList = [
        { catId: 'cat_expense_food', descs: ['Lunch', 'Dinner', 'Nasi padang', 'Sate', 'Martabak'], min: 15000, max: 120000, userId: () => [owner.id, member1.id][rand(0, 1)] },
        { catId: 'cat_expense_transport', descs: ['Gas', 'Gojek', 'Parking'], min: 10000, max: 100000, userId: () => owner.id },
        { catId: 'cat_expense_shopping', descs: ['Baju lebaran', 'Kue lebaran', 'Parcel'], min: 50000, max: 750000, userId: () => member1.id },
        { catId: 'cat_expense_bills', descs: ['Electricity', 'Internet'], min: 100000, max: 500000, userId: () => owner.id },
        { catId: 'cat_expense_education', descs: ['Books', 'Tuition', 'Supplies'], min: 50000, max: 500000, userId: () => member2.id },
      ]

      const cat = expenseList[i % expenseList.length]

      return {
        householdId: household.id,
        userId: cat.userId(),
        type: 'expense' as const,
        categoryId: cat.catId,
        amount: rand(cat.min, cat.max),
        description: cat.descs[rand(0, cat.descs.length - 1)],
        transactionDate: date(4, rand(1, 30)),
      }
    }),

    // ===== EXPENSE TRANSACTIONS — March 2026 =====
    ...Array.from({ length: 15 }, (_, i) => {
      const expenseList = [
        { catId: 'cat_expense_food', descs: ['Lunch', 'Dinner', 'Coffee'], min: 15000, max: 100000, userId: () => [owner.id, member1.id][rand(0, 1)] },
        { catId: 'cat_expense_transport', descs: ['Gas', 'Gojek'], min: 10000, max: 100000, userId: () => owner.id },
        { catId: 'cat_expense_bills', descs: ['Electricity', 'Internet'], min: 100000, max: 500000, userId: () => owner.id },
      ]

      const cat = expenseList[i % expenseList.length]

      return {
        householdId: household.id,
        userId: cat.userId(),
        type: 'expense' as const,
        categoryId: cat.catId,
        amount: rand(cat.min, cat.max),
        description: cat.descs[rand(0, cat.descs.length - 1)],
        transactionDate: date(3, rand(1, 31)),
      }
    }),
  ]

  // Batch insert transactions
  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx })
  }

  console.log(`Created ${transactions.length} transactions`)

  // 6. Create Invite Link (reusable)
  await prisma.householdInvite.create({
    data: {
      id: 'inv_demo',
      householdId: household.id,
      token: 'abc123demo',
      isRevoked: false,
      createdBy: owner.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  console.log('Created demo invite link: /invite/abc123demo')
  console.log('Done!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

# 4. Package.json Scripts

```json
{
  "scripts": {
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:reset": "prisma migrate reset --force",
    "db:reset": "prisma migrate reset --force && pnpm prisma:seed"
  }
}
```

---

# 5. Data Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Household | 1 | "Demo Family" |
| Users | 3 | Owner + 2 Members |
| Income Categories | 4 | Salary, Bonus, Investment, Other |
| Expense Categories | 8 | Food, Transport, Shopping, Health, Education, Entertainment, Bills, Other |
| Budgets | 5 | Food, Transport, Shopping, Bills, Entertainment (May 2026) |
| Transactions | ~72 | March (18), April (23), May (31) |
| Invite Link | 1 | `/invite/abc123demo` (7-day expiry) |

---

# 6. Development Scripts

```bash
# Full reset and seed
pnpm db:reset

# Migration + seed
pnpm prisma migrate dev && pnpm prisma:seed

# Seed only (without reset)
pnpm prisma:seed

# Generate Prisma client + seed
pnpm prisma generate && pnpm prisma:seed
```
