import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function date(month: number, day: number): Date {
  return new Date(2026, month - 1, day);
}

async function main() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.SEED_PROD !== "true"
  ) {
    console.log("Skipping seed in production. Set SEED_PROD=true to force.");
    return;
  }

  console.log("Seeding database...");

  // Clean existing data
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.category.deleteMany();
  await prisma.householdInvite.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.household.deleteMany();

  // 1. Create Household
  const household = await prisma.household.create({
    data: { id: "hh_demo", name: "Demo Family" },
  });
  console.log(`Created household: ${household.name}`);

  // 2. Create Users
  const owner = await prisma.user.create({
    data: {
      id: "usr_owner",
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "owner",
      householdId: household.id,
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Budi",
    },
  });

  const member1 = await prisma.user.create({
    data: {
      id: "usr_member_1",
      name: "Ani Santoso",
      email: "ani@example.com",
      role: "member",
      householdId: household.id,
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Ani",
    },
  });

  const member2 = await prisma.user.create({
    data: {
      id: "usr_member_2",
      name: "Dimas Santoso",
      email: "dimas@example.com",
      role: "member",
      householdId: household.id,
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Dimas",
    },
  });

  console.log(`Created users: ${owner.name}, ${member1.name}, ${member2.name}`);

  // 3. Create Categories
  const incomeCategories = [
    { name: "Salary", icon: "💼", color: "#22C55E", type: "income" },
    { name: "Bonus", icon: "🎁", color: "#16A34A", type: "income" },
    { name: "Investment", icon: "📈", color: "#15803D", type: "income" },
    { name: "Other Income", icon: "💰", color: "#4ADE80", type: "income" },
  ];

  const expenseCategories = [
    { name: "Food & Drink", icon: "🍜", color: "#F97316", type: "expense" },
    { name: "Transport", icon: "⛽", color: "#3B82F6", type: "expense" },
    { name: "Shopping", icon: "🛒", color: "#EC4899", type: "expense" },
    { name: "Health", icon: "🏥", color: "#EF4444", type: "expense" },
    { name: "Education", icon: "📚", color: "#8B5CF6", type: "expense" },
    { name: "Entertainment", icon: "🎮", color: "#A855F7", type: "expense" },
    { name: "Bills & Utilities", icon: "📋", color: "#64748B", type: "expense" },
    { name: "Other Expense", icon: "📦", color: "#78716C", type: "expense" },
  ];

  for (const cat of [...incomeCategories, ...expenseCategories]) {
    await prisma.category.create({
      data: { ...cat, householdId: household.id, isDefault: true },
    });
  }

  console.log(
    `Created ${incomeCategories.length + expenseCategories.length} categories`
  );

  // 4. Create Budgets (May 2026)
  // Get actual category IDs (look up by name since IDs are auto-generated)
  const foodCat = await prisma.category.findFirst({
    where: { householdId: household.id, name: "Food & Drink", deletedAt: null },
  });
  const transportCat = await prisma.category.findFirst({
    where: { householdId: household.id, name: "Transport", deletedAt: null },
  });
  const shoppingCat = await prisma.category.findFirst({
    where: { householdId: household.id, name: "Shopping", deletedAt: null },
  });
  const billsCat = await prisma.category.findFirst({
    where: { householdId: household.id, name: "Bills & Utilities", deletedAt: null },
  });
  const entertainmentCat = await prisma.category.findFirst({
    where: { householdId: household.id, name: "Entertainment", deletedAt: null },
  });

  const budgetPairs = [
    { catId: foodCat?.id, amount: 3000000, month: 5, year: 2026 },
    { catId: transportCat?.id, amount: 1000000, month: 5, year: 2026 },
    { catId: shoppingCat?.id, amount: 1500000, month: 5, year: 2026 },
    { catId: billsCat?.id, amount: 2000000, month: 5, year: 2026 },
    { catId: entertainmentCat?.id, amount: 500000, month: 5, year: 2026 },
  ];

  for (const b of budgetPairs) {
    if (b.catId) {
      await prisma.budget.create({
        data: {
          householdId: household.id,
          categoryId: b.catId,
          amount: b.amount,
          month: b.month,
          year: b.year,
        },
      });
    }
  }

  console.log("Created 5 budgets");

  // 5. Create Transactions — Last 3 Months
  const salaryCat = await prisma.category.findFirst({
    where: { householdId: household.id, name: "Salary", deletedAt: null },
  });
  const bonusCat = await prisma.category.findFirst({
    where: { householdId: household.id, name: "Bonus", deletedAt: null },
  });
  const investmentCat = await prisma.category.findFirst({
    where: { householdId: household.id, name: "Investment", deletedAt: null },
  });

  const allExpenseCats = await prisma.category.findMany({
    where: { householdId: household.id, type: "expense", deletedAt: null },
  });

  const getCatId = (name: string) => {
    const cat = allExpenseCats.find((c) => c.name === name);
    return cat?.id;
  };

  // Income transactions
  const incomeTransactions = [
    { userId: owner.id, catId: salaryCat?.id, amount: 8000000, desc: "Monthly salary", month: 5 },
    { userId: owner.id, catId: salaryCat?.id, amount: 8000000, desc: "Monthly salary", month: 4 },
    { userId: owner.id, catId: salaryCat?.id, amount: 8000000, desc: "Monthly salary", month: 3 },
    { userId: member1.id, catId: salaryCat?.id, amount: 5000000, desc: "Monthly salary", month: 5 },
    { userId: member1.id, catId: salaryCat?.id, amount: 5000000, desc: "Monthly salary", month: 4 },
    { userId: member1.id, catId: salaryCat?.id, amount: 5000000, desc: "Monthly salary", month: 3 },
    { userId: owner.id, catId: bonusCat?.id, amount: 3000000, desc: "Lebaran bonus", month: 4, day: 10 },
    { userId: owner.id, catId: investmentCat?.id, amount: 1500000, desc: "Dividend", month: 3, day: 15 },
  ];

  for (const tx of incomeTransactions) {
    if (tx.catId) {
      await prisma.transaction.create({
        data: {
          householdId: household.id,
          userId: tx.userId,
          categoryId: tx.catId,
          type: "income",
          amount: tx.amount,
          description: tx.desc,
          transactionDate: date(tx.month, tx.day ?? 1),
        },
      });
    }
  }

  // Expense transactions — May
  const mayExpenses = [
    { catName: "Food & Drink", descs: ["Lunch", "Dinner", "Coffee", "Snacks", "Groceries", "Food delivery", "Breakfast"], min: 15000, max: 150000, users: [owner.id, member1.id, member2.id] },
    { catName: "Transport", descs: ["Gas", "Gojek", "Parking", "Bus"], min: 10000, max: 100000, users: [owner.id, member1.id] },
    { catName: "Shopping", descs: ["Clothes", "Home items", "Gadget accessories", "Books"], min: 50000, max: 300000, users: [member1.id, member2.id] },
    { catName: "Bills & Utilities", descs: ["Electricity", "Internet", "Water", "Phone"], min: 100000, max: 500000, users: [owner.id] },
    { catName: "Entertainment", descs: ["Cinema", "Game", "Streaming"], min: 35000, max: 150000, users: [member2.id, member1.id] },
    { catName: "Health", descs: ["Vitamins", "Checkup", "Medicine"], min: 30000, max: 200000, users: [owner.id, member1.id] },
  ];

  const txData: Array<{
    householdId: string;
    userId: string;
    type: "expense";
    categoryId: string;
    amount: number;
    description: string;
    transactionDate: Date;
  }> = [];

  for (let i = 0; i < 25; i++) {
    const cat = mayExpenses[i % mayExpenses.length];
    const catId = getCatId(cat.catName);
    if (!catId) continue;

    txData.push({
      householdId: household.id,
      userId: cat.users[rand(0, cat.users.length - 1)],
      type: "expense",
      categoryId: catId,
      amount: rand(cat.min, cat.max),
      description: cat.descs[rand(0, cat.descs.length - 1)],
      transactionDate: date(5, rand(1, 26)),
    });
  }

  // Expense transactions — April
  const aprilExpenses = [
    { catName: "Food & Drink", descs: ["Lunch", "Dinner", "Nasi padang", "Sate", "Martabak"], min: 15000, max: 120000, users: [owner.id, member1.id] },
    { catName: "Transport", descs: ["Gas", "Gojek", "Parking"], min: 10000, max: 100000, users: [owner.id] },
    { catName: "Shopping", descs: ["Baju lebaran", "Kue lebaran", "Parcel"], min: 50000, max: 750000, users: [member1.id] },
    { catName: "Bills & Utilities", descs: ["Electricity", "Internet"], min: 100000, max: 500000, users: [owner.id] },
    { catName: "Education", descs: ["Books", "Tuition", "Supplies"], min: 50000, max: 500000, users: [member2.id] },
  ];

  for (let i = 0; i < 20; i++) {
    const cat = aprilExpenses[i % aprilExpenses.length];
    const catId = getCatId(cat.catName);
    if (!catId) continue;

    txData.push({
      householdId: household.id,
      userId: cat.users[rand(0, cat.users.length - 1)],
      type: "expense",
      categoryId: catId,
      amount: rand(cat.min, cat.max),
      description: cat.descs[rand(0, cat.descs.length - 1)],
      transactionDate: date(4, rand(1, 30)),
    });
  }

  // Expense transactions — March
  const marchExpenses = [
    { catName: "Food & Drink", descs: ["Lunch", "Dinner", "Coffee"], min: 15000, max: 100000, users: [owner.id, member1.id] },
    { catName: "Transport", descs: ["Gas", "Gojek"], min: 10000, max: 100000, users: [owner.id] },
    { catName: "Bills & Utilities", descs: ["Electricity", "Internet"], min: 100000, max: 500000, users: [owner.id] },
  ];

  for (let i = 0; i < 15; i++) {
    const cat = marchExpenses[i % marchExpenses.length];
    const catId = getCatId(cat.catName);
    if (!catId) continue;

    txData.push({
      householdId: household.id,
      userId: cat.users[rand(0, cat.users.length - 1)],
      type: "expense",
      categoryId: catId,
      amount: rand(cat.min, cat.max),
      description: cat.descs[rand(0, cat.descs.length - 1)],
      transactionDate: date(3, rand(1, 31)),
    });
  }

  await prisma.transaction.createMany({ data: txData });
  console.log(`Created ${txData.length} transactions`);

  // 6. Create Invite Link
  await prisma.householdInvite.create({
    data: {
      householdId: household.id,
      token: "abc123demo",
      isRevoked: false,
      createdBy: owner.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Created demo invite link: /invite/abc123demo");
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
