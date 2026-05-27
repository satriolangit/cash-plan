import { NextResponse } from "next/server";
import { recurringTransactionService } from "@/features/recurring-transactions/recurring-transaction.service";
import { createRecurringTransactionSchema } from "@/lib/schemas";
import { authenticateRequest, unauthorized, serverError, validationError } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const result = await recurringTransactionService.list(user.householdId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("GET /api/v1/recurring-transactions error:", error);
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const input = createRecurringTransactionSchema.parse(body);

    const result = await recurringTransactionService.create(
      input,
      user.householdId,
      user.id
    );

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/recurring-transactions error:", error);
    if (error instanceof Error) return validationError(error.message);
    return serverError();
  }
}
