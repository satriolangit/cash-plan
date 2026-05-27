import { NextResponse } from "next/server";
import { transactionService } from "@/features/transactions/transaction.service";
import {
  createTransactionSchema,
  transactionQuerySchema,
} from "@/lib/schemas";
import { authenticateRequest, unauthorized, validationError, serverError } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const filters = transactionQuerySchema.parse(params);

    const result = await transactionService.list(filters, user.householdId);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("GET /api/v1/transactions error:", error);
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const input = createTransactionSchema.parse(body);

    const result = await transactionService.create(input, user.householdId, {
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      image: user.image ?? undefined,
      role: user.role,
      householdId: user.householdId,
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/transactions error:", error);

    if (error instanceof Error) {
      return validationError(error.message);
    }

    return serverError();
  }
}
