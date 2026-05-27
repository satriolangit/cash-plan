"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/auth-context";

export default function HouseholdSettingsPage() {
  const [household, setHousehold] = useState<{ id: string; name: string } | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHousehold();
  }, []);

  async function fetchHousehold() {
    const res = await apiFetch("/api/v1/household");
    const data = await res.json();
    if (data.success) {
      setHousehold(data.data);
      setName(data.data.name);
    }
    setLoading(false);
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
      setHousehold(data.data);
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="p-4 text-center text-muted">Loading...</div>;
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Household name"
          />
          <Button onClick={handleSave} disabled={saving || name === household?.name}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-danger/50">
        <CardHeader>
          <CardTitle className="text-danger">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted mb-3">
            Permanently delete this household and all its data. This action cannot be undone.
          </p>
          <Button variant="danger" disabled>
            Delete Household
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
