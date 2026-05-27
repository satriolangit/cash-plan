import { NextResponse } from "next/server";
import { transactionRepository } from "@/features/transactions/transaction.repository";
import { budgetRepository } from "@/features/budgets/budget.repository";
import { getCurrentMonthYear } from "@/lib/utils";
import { authenticateRequest, unauthorized, serverError } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const householdId = user.householdId;
    const { month, year } = getCurrentMonthYear();

    const [totalIncome, totalExpense] = await Promise.all([
      transactionRepository.getTotalByType(householdId, "income", month, year),
      transactionRepository.getTotalByType(householdId, "expense", month, year),
    ]);

    const balance = totalIncome - totalExpense;

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const [prevIncome, prevExpense] = await Promise.all([
      transactionRepository.getTotalByType(householdId, "income", prevMonth, prevYear),
      transactionRepository.getTotalByType(householdId, "expense", prevMonth, prevYear),
    ]);

    const prevBalance = prevIncome - prevExpense;
    const monthlyChangePercent =
      prevBalance !== 0
        ? Math.round(((balance - prevBalance) / Math.abs(prevBalance)) * 100)
        : 0;

    const budgets = await budgetRepository.findAll(householdId, month, year);
    const budgetAlerts = budgets
      .filter((b) => b.status === "warning" || b.status === "over")
      .map((b) => ({
        categoryId: b.categoryId,
        categoryName: b.category.name,
        percentage: b.percentage,
      }));

    const recentResult = await transactionRepository.findAll(householdId, {
      page: 1,
      limit: 5,
      month,
      year,
    });

    const expenseChart = await transactionRepository.getCategoryBreakdown(
      householdId,
      month,
      year
    );

    const monthlyTrend = await transactionRepository.getMonthlyTrend(householdId, 6);

    return NextResponse.json({
      success: true,
      data: {
        balance,
        totalIncome,
        totalExpense,
        monthlyChangePercent,
        budgetAlerts,
        recentTransactions: recentResult.data,
        expenseChart,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error("GET /api/v1/dashboard/summary error:", error);
    return serverError();
  }
}
