import { NextResponse } from "next/server";
import {
  registerSchema,
} from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import {
  signAccessToken,
  signRefreshToken,
  getRefreshTokenExpiry,
} from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = registerSchema.parse(body);

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EMAIL_EXISTS", message: "Email already registered" },
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create household
    const household = await prisma.household.create({
      data: { name: `${input.name.split(" ")[0]} Family` },
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: "owner",
        householdId: household.id,
      },
    });

    // Seed default categories
    await seedDefaultCategories(household.id);

    // Generate tokens
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      householdId: user.householdId,
    });

    const refreshToken = signRefreshToken(user.id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            householdId: user.householdId,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/v1/auth/register error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Server error" },
      },
      { status: 500 }
    );
  }
}

// ─── Default Categories Seeder ────────────────────────────────────────────────

async function seedDefaultCategories(householdId: string) {
  const categories = [
    { name: "Salary", icon: "💼", color: "#22C55E", type: "income", householdId, isDefault: true },
    { name: "Bonus", icon: "🎁", color: "#16A34A", type: "income", householdId, isDefault: true },
    { name: "Investment", icon: "📈", color: "#15803D", type: "income", householdId, isDefault: true },
    { name: "Other Income", icon: "💰", color: "#4ADE80", type: "income", householdId, isDefault: true },
    { name: "Food & Drink", icon: "🍜", color: "#F97316", type: "expense", householdId, isDefault: true },
    { name: "Transport", icon: "⛽", color: "#3B82F6", type: "expense", householdId, isDefault: true },
    { name: "Shopping", icon: "🛒", color: "#EC4899", type: "expense", householdId, isDefault: true },
    { name: "Health", icon: "🏥", color: "#EF4444", type: "expense", householdId, isDefault: true },
    { name: "Education", icon: "📚", color: "#8B5CF6", type: "expense", householdId, isDefault: true },
    { name: "Entertainment", icon: "🎮", color: "#A855F7", type: "expense", householdId, isDefault: true },
    { name: "Bills & Utilities", icon: "📋", color: "#64748B", type: "expense", householdId, isDefault: true },
    { name: "Other Expense", icon: "📦", color: "#78716C", type: "expense", householdId, isDefault: true },
  ];

  await prisma.category.createMany({ data: categories });
}
