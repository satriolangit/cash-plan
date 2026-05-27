import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { generateToken, sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = forgotPasswordSchema.parse(body);

    // Look up user (but always return success to prevent email enumeration)
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (user) {
      // Delete any existing reset tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id },
        data: { expiresAt: new Date() }, // Mark as expired
      });

      // Generate new token
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      // Send reset email
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password/${token}`;
      await sendPasswordResetEmail(user.email, resetUrl);
    }

    // Always return the same response regardless of whether user exists
    return NextResponse.json({
      success: true,
      data: {
        message: "If an account exists, a reset link has been sent.",
      },
    });
  } catch (error) {
    console.error("POST /api/v1/auth/forgot-password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Server error" },
      },
      { status: 500 }
    );
  }
}
