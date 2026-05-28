"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/auth-context";
import { useHousehold, queryKeys } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

export default function HouseholdSettingsPage() {
  const { data: household, isLoading } = useHousehold();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  if (isLoading) {
    return <div className="p-4 text-center text-muted">Loading...</div>;
  }

  async function handleSave() {
    setSaving(true);
    const res = await apiFetch("/api/v1/household", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.success) {
      queryClient.invalidateQueries({ queryKey: queryKeys.household });
    }
    setSaving(false);
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Household Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Household Name</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={name || household?.name || ""}
            onChange={(e) => setName(e.target.value)}
            placeholder="Household name"
          />
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
