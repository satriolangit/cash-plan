import { NextResponse } from "next/server";
import { recurringTransactionService } from "@/features/recurring-transactions/recurring-transaction.service";
import { updateRecurringTransactionSchema } from "@/lib/schemas";
import { authenticateRequest, unauthorized, forbidden, notFound, validationError, serverError } from "@/lib/api-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const { id } = await params;
    const item = await recurringTransactionService.getById(id, user.householdId);
    if (!item) return notFound("Recurring transaction not found");

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("GET /api/v1/recurring-transactions/[id] error:", error);
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
    const input = updateRecurringTransactionSchema.parse(body);

    const result = await recurringTransactionService.update(
      id,
      input,
      user.householdId
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("PATCH /api/v1/recurring-transactions/[id] error:", error);
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
    await recurringTransactionService.delete(id, user.householdId);

    return NextResponse.json({ success: true, message: "Recurring transaction deleted" });
  } catch (error) {
    console.error("DELETE /api/v1/recurring-transactions/[id] error:", error);
    if (error instanceof Error) return validationError(error.message);
    return serverError();
  }
}
