"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  household: {
    name: string;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Profile is available from session, but we'll fetch household info
    fetch("/api/v1/household")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile({
            id: "",
            name: "User",
            email: "",
            image: null,
            role: "owner",
            household: { name: data.data.name },
          });
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-muted">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardContent className="text-center py-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl font-bold text-primary">U</span>
          </div>
          <h2 className="text-xl font-bold">{profile?.name}</h2>
          <p className="text-sm text-muted">{profile?.email}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-3">
          <p className="text-xs text-muted">Household</p>
          <p className="font-medium">{profile?.household.name}</p>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => signOut({ callbackUrl: "/landing" })}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
