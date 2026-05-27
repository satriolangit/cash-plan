import { NextResponse } from "next/server";
import { savingsTargetService } from "@/features/savings-targets/savings-target.service";
import { updateSavingsTargetSchema } from "@/lib/schemas";
import { authenticateRequest, unauthorized, notFound, validationError, serverError } from "@/lib/api-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const { id } = await params;
    const item = await savingsTargetService.getById(id, user.householdId);
    if (!item) return notFound("Savings target not found");

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("GET /api/v1/savings-targets/[id] error:", error);
    return serverError();
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const { id } = await params;
    const body = await request.json();
    const input = updateSavingsTargetSchema.parse(body);

    const result = await savingsTargetService.update(id, input, user.householdId);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("PATCH /api/v1/savings-targets/[id] error:", error);
    if (error instanceof Error) return validationError(error.message);
    return serverError();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const { id } = await params;
    await savingsTargetService.delete(id, user.householdId);

    return NextResponse.json({ success: true, message: "Savings target deleted" });
  } catch (error) {
    console.error("DELETE /api/v1/savings-targets/[id] error:", error);
    if (error instanceof Error) return validationError(error.message);
    return serverError();
  }
}
