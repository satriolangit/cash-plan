import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/get-session";

export function unauthorized() {
  return NextResponse.json(
    {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid session" },
    },
    { status: 401 }
  );
}

export function forbidden(message = "No permission") {
  return NextResponse.json(
    { success: false, error: { code: "FORBIDDEN", message } },
    { status: 403 }
  );
}

export function notFound(message = "Resource not found") {
  return NextResponse.json(
    { success: false, error: { code: "NOT_FOUND", message } },
    { status: 404 }
  );
}

export function serverError() {
  return NextResponse.json(
    { success: false, error: { code: "INTERNAL_ERROR", message: "Server error" } },
    { status: 500 }
  );
}

export function validationError(message: string) {
  return NextResponse.json(
    { success: false, error: { code: "VALIDATION_ERROR", message } },
    { status: 400 }
  );
}

// Authenticate using either Auth.js session or JWT Bearer token
export async function authenticateRequest(request: Request) {
  // Try Auth.js session first
  const session = await auth();
  if (session?.user) {
    return {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? "",
      image: session.user.image ?? undefined,
      role: session.user.role,
      householdId: session.user.householdId,
    };
  }

  // Try JWT Bearer token
  const result = await getSession(request);
  if (result.user) {
    return result.user;
  }

  return null;
}
