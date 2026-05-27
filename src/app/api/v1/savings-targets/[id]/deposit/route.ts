import { NextResponse } from "next/server";
import { savingsTargetService } from "@/features/savings-targets/savings-target.service";
import { depositSavingsSchema } from "@/lib/schemas";
import { authenticateRequest, unauthorized, notFound, validationError, serverError } from "@/lib/api-utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const { id } = await params;
    const body = await request.json();
    const input = depositSavingsSchema.parse(body);

    const result = await savingsTargetService.deposit(id, input.amount, user.householdId);
    if (!result) return notFound("Savings target not found");

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("POST /api/v1/savings-targets/[id]/deposit error:", error);
    if (error instanceof Error) return validationError(error.message);
    return serverError();
  }
}
