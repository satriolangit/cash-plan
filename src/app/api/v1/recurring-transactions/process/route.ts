import { NextResponse } from "next/server";
import { recurringTransactionService } from "@/features/recurring-transactions/recurring-transaction.service";
import { authenticateRequest, unauthorized, forbidden, serverError } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    // Only owner can trigger processing
    if (user.role !== "owner") {
      return forbidden("Only owner can process recurring transactions");
    }

    const processedCount = await recurringTransactionService.processRecurringTransactions();

    return NextResponse.json({
      success: true,
      data: { processedCount },
      message: `Processed ${processedCount} recurring transactions`,
    });
  } catch (error) {
    console.error("POST /api/v1/recurring-transactions/process error:", error);
    return serverError();
  }
}
