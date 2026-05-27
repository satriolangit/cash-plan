import { NextResponse } from "next/server";
import { categoryService } from "@/features/categories/category.service";
import { createCategorySchema } from "@/lib/schemas";
import { authenticateRequest, unauthorized, validationError, serverError } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;

    const result = await categoryService.list(user.householdId, type);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("GET /api/v1/categories error:", error);
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const input = createCategorySchema.parse(body);

    const result = await categoryService.create(input, user.householdId);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/categories error:", error);
    if (error instanceof Error) return validationError(error.message);
    return serverError();
  }
}
