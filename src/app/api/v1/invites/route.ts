import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { authenticateRequest, unauthorized, forbidden, serverError } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    if (user.role !== "owner") {
      return forbidden("Only owner can create invites");
    }

    const token = randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = await prisma.householdInvite.create({
      data: {
        householdId: user.householdId,
        token,
        expiresAt,
        isRevoked: false,
        createdBy: user.id,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/invite/${invite.token}`;

    return NextResponse.json({
      success: true,
      data: {
        inviteUrl,
        token: invite.token,
        expiresAt: invite.expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/v1/invites error:", error);
    return serverError();
  }
}
