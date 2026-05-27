import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { authenticateRequest, unauthorized, serverError, validationError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorized();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const transactionId = formData.get("transactionId") as string | null;

    if (!file) {
      return validationError("No file provided");
    }

    if (file.size > MAX_FILE_SIZE) {
      return validationError("File size exceeds 10MB limit");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return validationError("File type not allowed. Allowed: JPEG, PNG, GIF, WebP, PDF");
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads", user.householdId);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomStr}.${ext}`;
    const filePath = join(uploadDir, fileName);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save to database if transactionId provided
    let attachment = null;
    if (transactionId) {
      attachment = await prisma.attachment.create({
        data: {
          transactionId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          filePath: `/uploads/${user.householdId}/${fileName}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        filePath: `/uploads/${user.householdId}/${fileName}`,
        attachmentId: attachment?.id,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/upload error:", error);
    return serverError();
  }
}
