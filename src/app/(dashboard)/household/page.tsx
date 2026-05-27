"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Settings, UserPlus } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/auth-context";

interface Household {
  id: string;
  name: string;
  memberCount: number;
}

export default function HouseholdPage() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteUrl, setInviteUrl] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchHousehold();
  }, []);

  async function fetchHousehold() {
    const res = await apiFetch("/api/v1/household");
    const data = await res.json();
    if (data.success) setHousehold(data.data);
    setLoading(false);
  }

  async function generateInvite() {
    setGenerating(true);
    const res = await apiFetch("/api/v1/invites", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setInviteUrl(data.data.inviteUrl);
    }
    setGenerating(false);
  }

  function copyInvite() {
    navigator.clipboard.writeText(inviteUrl);
    alert("Link copied!");
  }

  if (loading) {
    return <div className="p-4 text-center text-muted">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Household</h1>

      {/* Household Info */}
      <Card>
        <CardContent className="text-center py-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">{household?.name}</h2>
          <p className="text-sm text-muted mt-1">{household?.memberCount} Members</p>
        </CardContent>
      </Card>

      {/* Invite Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Member
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {inviteUrl ? (
            <>
              <Input value={inviteUrl} readOnly />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={copyInvite}>
                  Copy Link
                </Button>
                <Button
                  className="flex-1"
                  onClick={() =>
                    window.open(
                      `https://wa.me/?text=Gabung ke Family Wallet keluarga kami 👋%0A${encodeURIComponent(inviteUrl)}`,
                      "_blank"
                    )
                  }
                >
                  Share WhatsApp
                </Button>
              </div>
            </>
          ) : (
            <Button
              className="w-full"
              onClick={generateInvite}
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate Invite Link"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="space-y-2">
        <Link href="/household/members">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center justify-between py-3">
              <span className="text-sm font-medium">Manage Members</span>
              <span className="text-muted">→</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/household/settings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center justify-between py-3">
              <span className="text-sm font-medium">Settings</span>
              <span className="text-muted">→</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
