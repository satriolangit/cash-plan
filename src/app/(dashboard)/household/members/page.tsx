"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useHouseholdMembers } from "@/lib/api";

export default function MembersPage() {
  const { data: members = [], isLoading } = useHouseholdMembers();

  if (isLoading) {
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
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted">{member.email}</p>
                </div>
              </div>
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                {member.role}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
