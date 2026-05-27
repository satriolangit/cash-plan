import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  signAccessToken,
  signRefreshToken,
  getRefreshTokenExpiry,
} from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

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

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("POST /api/v1/auth/login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Server error" },
      },
      { status: 500 }
    );
  }
}
