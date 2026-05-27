import { NextResponse } from "next/server";
import { budgetService } from "@/features/budgets/budget.service";
import { createBudgetSchema } from "@/lib/schemas";
import { getCurrentMonthYear } from "@/lib/utils";
import { authenticateRequest, unauthorized, forbidden, validationError, serverError } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get("month")) || getCurrentMonthYear().month;
    const year = Number(searchParams.get("year")) || getCurrentMonthYear().year;

    const result = await budgetService.list(user.householdId, month, year);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("GET /api/v1/budgets error:", error);
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    if (user.role !== "owner") {
      return forbidden("Only owner can create budgets");
    }

    const body = await request.json();
    const input = createBudgetSchema.parse(body);

    const result = await budgetService.create(input, user.householdId);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/budgets error:", error);
    if (error instanceof Error) return validationError(error.message);
    return serverError();
  }
}
