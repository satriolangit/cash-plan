import { NextResponse } from "next/server";
import { transactionRepository } from "@/features/transactions/transaction.repository";
import { getCurrentMonthYear } from "@/lib/utils";
import { authenticateRequest, unauthorized, serverError } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get("month")) || getCurrentMonthYear().month;
    const year = Number(searchParams.get("year")) || getCurrentMonthYear().year;

    const breakdown = await transactionRepository.getCategoryBreakdown(
      user.householdId,
      month,
      year
    );

    return NextResponse.json({ success: true, data: breakdown });
  } catch (error) {
    console.error("GET /api/v1/reports/category-breakdown error:", error);
    return serverError();
  }
}
