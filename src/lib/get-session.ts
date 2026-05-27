import { auth as authJsAuth } from "@/lib/auth";
import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import type { UserSession } from "@/types";

interface AuthResult {
  user: UserSession | null;
}

export async function getSession(request?: Request): Promise<AuthResult> {
  // Try Auth.js session first (Google OAuth)
  try {
    const session = await authJsAuth();
    if (session?.user) {
      return {
        user: {
          id: session.user.id,
          name: session.user.name ?? null,
          email: session.user.email ?? "",
          image: session.user.image ?? undefined,
          role: session.user.role,
          householdId: session.user.householdId,
        },
      };
    }
  } catch {
    // Auth.js session not available
  }

  // Try JWT Bearer token (Email/Password)
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const payload = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
        });

        if (user) {
          return {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.avatarUrl ?? undefined,
              role: user.role,
              householdId: user.householdId,
            },
          };
        }
      } catch {
        // Invalid token
      }
    }
  }

  return { user: null };
}
