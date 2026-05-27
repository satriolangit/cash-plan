import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentMonthYear } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid session" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get("month")) || getCurrentMonthYear().month;
    const year = Number(searchParams.get("year")) || getCurrentMonthYear().year;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        householdId: session.user.householdId,
        deletedAt: null,
        transactionDate: { gte: start, lte: end },
      },
      include: {
        category: { select: { name: true } },
      },
      orderBy: { transactionDate: "desc" },
    });

    // Build CSV
    const header = "Date,Type,Category,Description,Amount";
    const rows = transactions.map((tx) => {
      const date = tx.transactionDate.toISOString().split("T")[0];
      const type = tx.type;
      const category = tx.category.name;
      const description = tx.description || "";
      const amount = Number(tx.amount);
      return `${date},${type},"${category}","${description}",${amount}`;
    });

    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="transactions-${month}-${year}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/v1/reports/export error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Server error" } },
      { status: 500 }
    );
  }
}
