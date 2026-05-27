import { NextResponse } from "next/server";
import { transactionRepository } from "@/features/transactions/transaction.repository";
import { authenticateRequest, unauthorized, serverError } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const months = Number(searchParams.get("months")) || 6;

    const trend = await transactionRepository.getMonthlyTrend(
      user.householdId,
      months
    );

    return NextResponse.json({ success: true, data: trend });
  } catch (error) {
    console.error("GET /api/v1/reports/monthly-trend error:", error);
    return serverError();
  }
}
