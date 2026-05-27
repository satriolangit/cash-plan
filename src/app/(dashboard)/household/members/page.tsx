"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/auth-context";

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    const res = await apiFetch("/api/v1/household/members");
    const data = await res.json();
    if (data.success) setMembers(data.data);
    setLoading(false);
  }

  if (loading) {
    return <div className="p-4 text-center text-muted">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Members</h1>

      <div className="space-y-2">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {member.name[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-muted">{member.email}</p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  member.role === "owner"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {member.role}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
