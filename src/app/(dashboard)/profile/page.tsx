"use client";

import { signOut } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useHousehold } from "@/lib/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: household, isLoading } = useHousehold();

  if (isLoading) {
    return <div className="p-4 text-center text-muted">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{user?.name || "User"}</p>
              <p className="text-sm text-muted">{user?.email || ""}</p>
            </div>
            {household && (
              <p className="text-sm text-muted">
                {household.name} • {user?.role || "member"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full text-danger"
        onClick={() => signOut({ callbackUrl: "/landing" })}
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  );
}
