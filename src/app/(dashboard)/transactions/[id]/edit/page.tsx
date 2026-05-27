"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/auth-context";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
}

interface ExistingAttachment {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
}

interface NewAttachment {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  filePath?: string;
}

export default function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [existingAttachments, setExistingAttachments] = useState<ExistingAttachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<NewAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    type: "expense" as "income" | "expense",
    amount: 0,
    categoryId: "",
    description: "",
    transactionDate: "",
  });

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  useEffect(() => {
    fetchCategories();
  }, [form.type]);

  async function fetchTransaction() {
    const res = await apiFetch(`/api/v1/transactions/${id}`);
    const data = await res.json();
    if (data.success) {
      const tx = data.data;
      setForm({
        type: tx.type,
        amount: tx.amount,
        categoryId: tx.categoryId,
        description: tx.description || "",
        transactionDate: tx.transactionDate.split("T")[0],
      });
      if (tx.attachments) {
        setExistingAttachments(tx.attachments);
      }
    } else {
      setError("Transaction not found");
    }
    setFetching(false);
  }

  async function fetchCategories() {
    const res = await apiFetch(`/api/v1/categories?type=${form.type}`);
    const data = await res.json();
    if (data.success) setCategories(data.data);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const attachments: NewAttachment[] = Array.from(files).map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      uploading: false,
      uploaded: false,
    }));

    setNewAttachments((prev) => [...prev, ...attachments]);
  }

  function removeNewAttachment(index: number) {
    setNewAttachments((prev) => {
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
    formData.append("transactionId", id);

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
      // Upload new attachments
      for (let i = 0; i < newAttachments.length; i++) {
        if (!newAttachments[i].uploaded) {
          setNewAttachments((prev) => {
            const newAttachments = [...prev];
            newAttachments[i] = { ...newAttachments[i], uploading: true };
            return newAttachments;
          });

          const path = await uploadFile(newAttachments[i].file);
          if (path) {
            setNewAttachments((prev) => {
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
        }
      }

      // Update transaction
      const res = await apiFetch(`/api/v1/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: form.amount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast("success", "Transaction updated");
        router.push("/transactions");
      } else {
        setError(data.error?.message || "Failed to update");
        toast("error", data.error?.message || "Failed to update");
      }
    } catch {
      setError("Network error");
      toast("error", "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/v1/transactions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("success", "Transaction deleted");
        router.push("/transactions");
      } else {
        toast("error", "Failed to delete");
      }
    } catch {
      toast("error", "Failed to delete");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  }

  if (fetching) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="h-8 bg-border animate-pulse rounded w-40" />
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div className="h-10 bg-border animate-pulse rounded-xl" />
            <div className="h-10 bg-border animate-pulse rounded-xl" />
            <div className="h-10 bg-border animate-pulse rounded-xl" />
            <div className="h-20 bg-border animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !form.amount) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto text-center py-12">
          <p className="text-muted mb-4">{error}</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Edit Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <Label>Amount</Label>
              <MoneyInput
                value={form.amount}
                onChange={(value) => setForm({ ...form, amount: value })}
                required
              />
            </div>

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

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.transactionDate}
                onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Existing Attachments */}
            {existingAttachments.length > 0 && (
              <div>
                <Label>Current Attachments</Label>
                <div className="mt-2 space-y-2">
                  {existingAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-3 p-2 bg-muted rounded-lg"
                    >
                      {att.mimeType.startsWith("image/") ? (
                        <img
                          src={att.filePath}
                          alt={att.fileName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                          📄
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{att.fileName}</p>
                      </div>
                      <a
                        href={att.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Attachments */}
            <div>
              <Label>Add More Attachments</Label>
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

              {newAttachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {newAttachments.map((att, index) => (
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
                        onClick={() => removeNewAttachment(index)}
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
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
              >
                Delete
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
