import { NextResponse } from "next/server";
import { categoryService } from "@/features/categories/category.service";
import { updateCategorySchema } from "@/lib/schemas";
import { authenticateRequest, unauthorized, notFound, validationError, serverError } from "@/lib/api-utils";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const { id } = await params;
    const body = await request.json();
    const input = updateCategorySchema.parse(body);

    const result = await categoryService.update(id, input, user.householdId);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("PATCH /api/v1/categories/[id] error:", error);
    if (error instanceof Error && error.message === "Category not found") {
      return notFound(error.message);
    }
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

    const { id } = await params;

    await categoryService.delete(id, user.householdId);

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("DELETE /api/v1/categories/[id] error:", error);
    if (error instanceof Error && error.message === "Category not found") {
      return notFound(error.message);
    }
    return serverError();
  }
}
