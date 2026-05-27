import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const household = await prisma.household.findUnique({
      where: { id: user.householdId },
      include: { _count: { select: { users: true } } },
    });

    if (!household) return notFound("Household not found");

    return NextResponse.json({
      success: true,
      data: {
        id: household.id,
        name: household.name,
        memberCount: household._count.users,
        createdAt: household.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("GET /api/v1/household error:", error);
    return serverError();
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    if (user.role !== "owner") {
      return forbidden("Only owner can update household");
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Name is required" } },
        { status: 400 }
      );
    }

    const household = await prisma.household.update({
      where: { id: user.householdId },
      data: { name },
      include: { _count: { select: { users: true } } },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: household.id,
        name: household.name,
        memberCount: household._count.users,
      },
    });
  } catch (error) {
    console.error("PATCH /api/v1/household error:", error);
    return serverError();
  }
}
