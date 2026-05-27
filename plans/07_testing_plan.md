# Testing Plan — Family Wallet MVP

**Version:** 1.0
**Date:** 26 May 2026

---

# 1. Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit Tests | Vitest | Component, utility, service, repository tests |
| Integration Tests | Vitest + Supertest | API route handler tests |
| E2E Tests | Playwright (Phase 2) | Full browser flow testing |

---

# 2. Test Structure

```txt
src/
├── features/
│   ├── transactions/
│   │   ├── __tests__/
│   │   │   ├── transaction.service.test.ts
│   │   │   ├── transaction.repository.test.ts
│   │   │   └── transaction.schema.test.ts
│   │   └── ...
│   ├── budgets/
│   ├── categories/
│   ├── household/
│   └── auth/
│
├── app/
│   └── api/
│       └── v1/
│           ├── transactions/
│           │   └── __tests__/
│           │       └── route.test.ts
│           ├── budgets/
│           ├── categories/
│           └── household/
│
└── lib/
    └── __tests__/
```

---

# 3. Unit Tests

## 3.1 Service Layer Tests

### What to Test
- Business logic correctness
- Validation rules
- Error handling
- Household scoping
- Role-based access

### Example Pattern

```ts
describe('TransactionService', () => {
  describe('create', () => {
    it('should create transaction with valid input', async () => {
      // Arrange
      const mockRepo = { create: vi.fn().mockResolvedValue(mockTransaction) }
      const service = new TransactionService(mockRepo)

      // Act
      const result = await service.create(validInput, mockSession)

      // Assert
      expect(result).toEqual(expectedDTO)
      expect(mockRepo.create).toHaveBeenCalledWith(expectedPrismaInput)
    })

    it('should throw if category does not belong to household', async () => {})
    it('should throw if amount <= 0', async () => {})
  })

  describe('list', () => {
    it('should filter by household_id', async () => {})
    it('should exclude soft-deleted records', async () => {})
  })

  describe('delete', () => {
    it('should soft delete by setting deleted_at', async () => {})
  })
})
```

---

## 3.2 Repository Layer Tests

### What to Test
- Prisma query correctness
- Soft delete filtering
- Pagination logic
- Relation includes

### Example Pattern

```ts
describe('TransactionRepository', () => {
  describe('findAll', () => {
    it('should exclude records with deleted_at', async () => {})
    it('should support pagination', async () => {})
  })
})
```

---

## 3.3 Zod Schema Tests

### What to Test
- Valid input passes
- Invalid input fails with correct error
- Edge cases (empty string, negative numbers, future dates)

### Example Pattern

```ts
describe('createTransactionSchema', () => {
  it('should pass with valid input', () => {
    const result = createTransactionSchema.parse(validInput)
    expect(result).toEqual(validInput)
  })

  it('should fail when amount is negative', () => {
    expect(() =>
      createTransactionSchema.parse({ ...validInput, amount: -100 })
    ).toThrow()
  })

  it('should fail when type is invalid', () => {
    expect(() =>
      createTransactionSchema.parse({ ...validInput, type: 'invalid' })
    ).toThrow()
  })
})
```

---

## 3.4 Component Tests

### What to Test
- Render correctness
- User interactions
- Form validation
- Loading states
- Empty states

### Example Pattern

```ts
describe('TransactionCard', () => {
  it('should render expense with negative amount', () => {
    render(<TransactionCard transaction={mockExpense} />)
    expect(screen.getByText('- Rp 50.000')).toBeInTheDocument()
  })

  it('should render income with positive amount', () => {
    render(<TransactionCard transaction={mockIncome} />)
    expect(screen.getByText('+ Rp 5.000.000')).toBeInTheDocument()
  })
})
```

---

# 4. Integration Tests (API)

## 4.1 Setup

Use Supertest with Next.js route handlers.

```ts
// test/setup.ts
import { beforeEach, afterEach, vi } from 'vitest'
import { prisma } from '@/lib/prisma'

beforeEach(async () => {
  await prisma.transaction.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.household.deleteMany()
})

afterEach(async () => {
  await prisma.$disconnect()
})
```

---

## 4.2 Auth Mocking

Mock Auth.js session for protected routes.

```ts
// test/mocks/auth.ts
vi.mock('auth', () => ({
  auth: vi.fn(() => ({
    user: {
      id: 'usr_test',
      email: 'test@example.com',
      name: 'Test User',
      role: 'owner',
      householdId: 'hh_test',
    },
  })),
}))
```

---

## 4.3 API Test Patterns

### GET Endpoints

```ts
describe('GET /api/v1/transactions', () => {
  it('should return 200 with transaction list', async () => {
    await seedTestTransactions()

    const res = await request(app)
      .get('/api/v1/transactions')
      .set('Cookie', mockSessionCookie)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(3)
  })

  it('should exclude soft-deleted transactions', async () => {
    await prisma.transaction.create({
      data: { ...mockTransaction, deletedAt: new Date() },
    })

    const res = await request(app)
      .get('/api/v1/transactions')
      .set('Cookie', mockSessionCookie)

    expect(res.body.data).toHaveLength(0)
  })

  it('should return 401 without session', async () => {
    const res = await request(app).get('/api/v1/transactions')
    expect(res.status).toBe(401)
  })
})
```

### POST Endpoints

```ts
describe('POST /api/v1/transactions', () => {
  it('should create transaction with valid input', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Cookie', mockSessionCookie)
      .send({
        type: 'expense',
        amount: 50000,
        categoryId: 'cat_test',
        description: 'Lunch',
        transactionDate: '2026-05-26',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBeDefined()
  })

  it('should return 400 with invalid input', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Cookie', mockSessionCookie)
      .send({ type: 'invalid', amount: -100 })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})
```

### PATCH Endpoints

```ts
describe('PATCH /api/v1/transactions/:id', () => {
  it('should update transaction', async () => {
    const transaction = await createTestTransaction()

    const res = await request(app)
      .patch(`/api/v1/transactions/${transaction.id}`)
      .set('Cookie', mockSessionCookie)
      .send({ amount: 75000 })

    expect(res.status).toBe(200)
    expect(res.body.data.amount).toBe(75000)
  })

  it('should return 404 for non-existent transaction', async () => {
    const res = await request(app)
      .patch('/api/v1/transactions/non-existent-id')
      .set('Cookie', mockSessionCookie)
      .send({ amount: 75000 })

    expect(res.status).toBe(404)
  })
})
```

### DELETE Endpoints (Soft Delete)

```ts
describe('DELETE /api/v1/transactions/:id', () => {
  it('should soft delete transaction (set deleted_at)', async () => {
    const transaction = await createTestTransaction()

    const res = await request(app)
      .delete(`/api/v1/transactions/${transaction.id}`)
      .set('Cookie', mockSessionCookie)

    expect(res.status).toBe(200)

    const deleted = await prisma.transaction.findUnique({
      where: { id: transaction.id },
    })
    expect(deleted.deletedAt).not.toBeNull()
  })

  it('should not return soft-deleted transaction in list', async () => {
    const transaction = await createTestTransaction()
    await request(app)
      .delete(`/api/v1/transactions/${transaction.id}`)
      .set('Cookie', mockSessionCookie)

    const res = await request(app)
      .get('/api/v1/transactions')
      .set('Cookie', mockSessionCookie)

    expect(res.body.data).not.toContainEqual(
      expect.objectContaining({ id: transaction.id })
    )
  })
})
```

---

# 5. Test Database

## 5.1 Configuration

Use separate test database.

```env
# .env.test
DATABASE_URL=postgresql://xxx/test_db
```

---

## 5.2 Lifecycle

```txt
Before All Tests
  ↓
Run migrations on test DB
  ↓
Before Each Test
  ↓
Clean tables (deleteMany)
  ↓
Run Test
  ↓
After Each Test
  ↓
Clean tables
  ↓
After All Tests
  ↓
Drop test DB
```

---

# 6. Coverage Targets

| Module | Target Coverage |
|--------|-----------------|
| Service Layer | >= 80% |
| Repository Layer | >= 70% |
| Zod Schemas | >= 90% |
| API Routes | >= 75% |
| Components | >= 60% |
| Utils/Lib | >= 80% |

---

# 7. Test Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

# 8. CI/CD Integration

## GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm prisma migrate
      - run: pnpm test:coverage
```

---

# 9. Testing Rules

## MUST

- All service methods must have tests
- All API routes must have at least 1 happy path + 1 error path test
- All Zod schemas must have validation tests
- Soft delete must be tested (exclude from queries, set deleted_at)
- Household scoping must be tested (cross-household access denied)
- Role-based access must be tested (owner vs member)

## SHOULD

- Test edge cases (empty lists, max values, boundary dates)
- Test pagination boundaries
- Test concurrent operations

## MUST NOT

- Do not test Prisma itself
- Do not test Next.js framework
- Do not mock what you do not own

---

# 10. Test Data Factories

Use factory functions for consistent test data.

```ts
// test/factories/transaction.ts
export function createTransactionFactory(overrides = {}) {
  return {
    type: 'expense',
    amount: 50000,
    description: 'Test transaction',
    transactionDate: '2026-05-26',
    householdId: 'hh_test',
    userId: 'usr_test',
    categoryId: 'cat_test',
    deletedAt: null,
    ...overrides,
  }
}

// test/factories/household.ts
export function createHouseholdFactory(overrides = {}) {
  return {
    name: 'Test Family',
    ...overrides,
  }
}

// test/factories/user.ts
export function createUserFactory(overrides = {}) {
  return {
    name: 'Test User',
    email: 'test@example.com',
    role: 'owner',
    ...overrides,
  }
}
```

---

# 11. Recommended Test Order

1. **Zod schemas** — fastest, no dependencies
2. **Repository layer** — depends on Prisma only
3. **Service layer** — depends on repository
4. **API routes** — depends on service layer
5. **Components** — depends on all above

---

# 12. Phase 2 Testing (Future)

- **E2E Tests** — Playwright for critical user flows
  - Google login → Dashboard → Add transaction → View report
  - Invite link → Join household → View shared data
- **Performance Tests** — API response time under load
- **Accessibility Tests** — axe-core for WCAG compliance
