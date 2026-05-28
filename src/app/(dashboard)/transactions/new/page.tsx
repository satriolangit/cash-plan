"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/ui/money-input";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/auth-context";
import { useCategories, queryKeys } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import type { Category } from "@/types";

interface AttachmentPreview {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  filePath?: string;
}

export default function NewTransactionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    type: "expense" as "income" | "expense",
    amount: 0,
    categoryId: "",
    description: "",
    transactionDate: new Date().toISOString().split("T")[0],
  });
  const { data: categories = [] } = useCategories(form.type);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: AttachmentPreview[] = Array.from(files).map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      uploading: false,
      uploaded: false,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => {
      const newAttachments = [...prev];
      if (newAttachments[index].preview) {
        URL.revokeObjectURL(newAttachments[index].preview);
      }
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  }

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiFetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        return data.data.filePath;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Upload all attachments first
      const uploadedPaths: string[] = [];
      for (let i = 0; i < attachments.length; i++) {
        if (!attachments[i].uploaded) {
          setAttachments((prev) => {
            const newAttachments = [...prev];
            newAttachments[i] = { ...newAttachments[i], uploading: true };
            return newAttachments;
          });

          const path = await uploadFile(attachments[i].file);
          if (path) {
            uploadedPaths.push(path);
            setAttachments((prev) => {
              const newAttachments = [...prev];
              newAttachments[i] = {
                ...newAttachments[i],
                uploading: false,
                uploaded: true,
                filePath: path,
              };
              return newAttachments;
            });
          }
        } else if (attachments[i].filePath) {
          uploadedPaths.push(attachments[i].filePath!);
        }
      }

      // Create transaction
      const res = await apiFetch("/api/v1/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: form.amount,
          attachments: uploadedPaths,
        }),
      });

      const data = await res.json();
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        toast("success", "Transaction created");
        router.push("/transactions");
      } else {
        setError(data.error?.message || "Failed to create transaction");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={form.type === "expense" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setForm({ ...form, type: "expense", categoryId: "" })}
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={form.type === "income" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setForm({ ...form, type: "income", categoryId: "" })}
              >
                Income
              </Button>
            </div>

            {/* Amount */}
            <div>
              <Label>Amount</Label>
              <MoneyInput
                placeholder="0"
                value={form.amount}
                onChange={(value) => setForm({ ...form, amount: value })}
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="flex h-10 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.transactionDate}
                onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="What was this for?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Attachments */}
            <div>
              <Label>Receipt / Attachment (optional)</Label>
              <div className="mt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📎 Choose Files
                </Button>
                <p className="text-xs text-muted mt-1">
                  Max 10MB per file. JPEG, PNG, GIF, WebP, PDF
                </p>
              </div>

              {/* Preview */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((att, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-muted rounded-lg"
                    >
                      {att.preview ? (
                        <img
                          src={att.preview}
                          alt="Preview"
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                          📄
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{att.file.name}</p>
                        <p className="text-xs text-muted">
                          {(att.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      {att.uploading && (
                        <span className="text-xs text-muted">Uploading...</span>
                      )}
                      {att.uploaded && (
                        <span className="text-xs text-success">✓</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-muted hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Saving..." : "Save Transaction"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
