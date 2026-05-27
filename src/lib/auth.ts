import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { household: true },
        });

        if (existingUser) {
          // Update user info if needed
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name || existingUser.name,
              avatarUrl: user.image || existingUser.avatarUrl,
            },
          });
          return true;
        }

        // New user: create household + user + default categories
        const household = await prisma.household.create({
          data: {
            name: `${user.name?.split(" ")[0] || "My"} Family`,
          },
        });

        const newUser = await prisma.user.create({
          data: {
            id: user.id,
            name: user.name || "User",
            email: user.email,
            avatarUrl: user.image,
            role: "owner",
            householdId: household.id,
          },
        });

        // Seed default categories
        await seedDefaultCategories(household.id);

        // Create account record
        if (account) {
          await prisma.account.create({
            data: {
              userId: newUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          });
        }

        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        // On initial sign in, fetch user data
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
          token.householdId = dbUser.householdId;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
        session.user.householdId = token.householdId as string;
      }
      return session;
    },
  },
});

// ─── Default Categories Seeder ────────────────────────────────────────────────

async function seedDefaultCategories(householdId: string) {
  const incomeCategories = [
    { name: "Salary", icon: "💼", color: "#22C55E", type: "income" },
    { name: "Bonus", icon: "🎁", color: "#16A34A", type: "income" },
    { name: "Investment", icon: "📈", color: "#15803D", type: "income" },
    { name: "Other", icon: "💰", color: "#4ADE80", type: "income" },
  ];

  const expenseCategories = [
    { name: "Food & Drink", icon: "🍜", color: "#F97316", type: "expense" },
    { name: "Transport", icon: "⛽", color: "#3B82F6", type: "expense" },
    { name: "Shopping", icon: "🛒", color: "#EC4899", type: "expense" },
    { name: "Health", icon: "🏥", color: "#EF4444", type: "expense" },
    { name: "Education", icon: "📚", color: "#8B5CF6", type: "expense" },
    { name: "Entertainment", icon: "🎮", color: "#A855F7", type: "expense" },
    { name: "Bills & Utilities", icon: "📋", color: "#64748B", type: "expense" },
    { name: "Other", icon: "📦", color: "#78716C", type: "expense" },
  ];

  const allCategories = [
    ...incomeCategories,
    ...expenseCategories,
  ].map((cat) => ({
    ...cat,
    householdId,
    isDefault: true,
  }));

  await prisma.category.createMany({ data: allCategories });
}

// ─── Type Augmentation ────────────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      householdId: string;
    } & DefaultSession["user"];
  }
}
