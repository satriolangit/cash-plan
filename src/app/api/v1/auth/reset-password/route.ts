import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = resetPasswordSchema.parse(body);

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: input.token },
    });

    if (!resetToken || new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Reset link is invalid or has expired",
          },
        },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(input.password);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Password reset successfully" },
    });
  } catch (error) {
    console.error("POST /api/v1/auth/reset-password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Server error" },
      },
      { status: 500 }
    );
  }
}
