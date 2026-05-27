import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Refresh token is required" },
        },
        { status: 400 }
      );
    }

    // Verify JWT signature
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_TOKEN", message: "Invalid refresh token" },
        },
        { status: 401 }
      );
    }

    // Check if token exists and is not revoked
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.revoked || new Date() > stored.expiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_TOKEN", message: "Refresh token expired or revoked" },
        },
        { status: 401 }
      );
    }

    // Generate new access token
    const accessToken = signAccessToken({
      sub: stored.userId,
      email: stored.user.email,
      role: stored.user.role,
      householdId: stored.user.householdId,
    });

    return NextResponse.json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    console.error("POST /api/v1/auth/refresh error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Server error" },
      },
      { status: 500 }
    );
  }
}
