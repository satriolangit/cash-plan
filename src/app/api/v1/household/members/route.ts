import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, unauthorized, serverError } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const members = await prisma.user.findMany({
      where: {
        householdId: user.householdId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: members.map((m) => ({
        ...m,
        avatar: m.avatarUrl,
      })),
    });
  } catch (error) {
    console.error("GET /api/v1/household/members error:", error);
    return serverError();
  }
}
