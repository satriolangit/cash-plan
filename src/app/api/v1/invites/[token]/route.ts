import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invite = await prisma.householdInvite.findUnique({
      where: { token },
      include: {
        household: {
          select: {
            name: true,
            _count: { select: { users: true } },
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Invite not found" } },
        { status: 404 }
      );
    }

    if (invite.isRevoked) {
      return NextResponse.json(
        { success: false, error: { code: "INVITE_REVOKED", message: "Invite has been revoked" } },
        { status: 410 }
      );
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { success: false, error: { code: "INVITE_EXPIRED", message: "Invite has expired" } },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        householdName: invite.household.name,
        memberCount: invite.household._count.users,
        expiresAt: invite.expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("GET /api/v1/invites/[token] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Server error" } },
      { status: 500 }
    );
  }
}
