import { NextResponse } from "next/server";
import { savingsTargetService } from "@/features/savings-targets/savings-target.service";
import { createSavingsTargetSchema } from "@/lib/schemas";
import { authenticateRequest, unauthorized, serverError, validationError } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const result = await savingsTargetService.list(user.householdId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("GET /api/v1/savings-targets error:", error);
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const input = createSavingsTargetSchema.parse(body);

    const result = await savingsTargetService.create(input, user.householdId);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/savings-targets error:", error);
    if (error instanceof Error) return validationError(error.message);
    return serverError();
  }
}
