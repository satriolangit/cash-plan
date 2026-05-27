import { NextResponse } from "next/server";
import { transactionService } from "@/features/transactions/transaction.service";
import { updateTransactionSchema } from "@/lib/schemas";
import { authenticateRequest, unauthorized, notFound, validationError, serverError } from "@/lib/api-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const { id } = await params;
    const result = await transactionService.getById(id, user.householdId);

    if (!result) return notFound("Transaction not found");

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("GET /api/v1/transactions/[id] error:", error);
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
    const input = updateTransactionSchema.parse(body);

    const result = await transactionService.update(id, input, user.householdId);

    if (!result) return notFound("Transaction not found");

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("PATCH /api/v1/transactions/[id] error:", error);
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
    await transactionService.delete(id, user.householdId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/v1/transactions/[id] error:", error);
    if (error instanceof Error && error.message === "Transaction not found") {
      return notFound(error.message);
    }
    return serverError();
  }
}
