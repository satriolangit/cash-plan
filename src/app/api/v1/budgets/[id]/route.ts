import { NextResponse } from "next/server";
import { budgetService } from "@/features/budgets/budget.service";
import { updateBudgetSchema } from "@/lib/schemas";
import { authenticateRequest, unauthorized, forbidden, notFound, validationError, serverError } from "@/lib/api-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const { id } = await params;
    const budget = await budgetService.getById(id, user.householdId);
    if (!budget) return notFound("Budget not found");

    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error("GET /api/v1/budgets/[id] error:", error);
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

    if (user.role !== "owner") {
      return forbidden("Only owner can update budgets");
    }

    const { id } = await params;
    const body = await request.json();
    const input = updateBudgetSchema.parse(body);

    const result = await budgetService.update(id, input, user.householdId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("PATCH /api/v1/budgets/[id] error:", error);
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

    if (user.role !== "owner") {
      return forbidden("Only owner can delete budgets");
    }

    const { id } = await params;
    await budgetService.delete(id, user.householdId);

    return NextResponse.json({ success: true, message: "Budget deleted" });
  } catch (error) {
    console.error("DELETE /api/v1/budgets/[id] error:", error);
    if (error instanceof Error) return validationError(error.message);
    return serverError();
  }
}
