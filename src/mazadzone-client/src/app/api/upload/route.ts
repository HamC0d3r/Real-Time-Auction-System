import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ALLOWED_UPLOAD_SCOPES = new Set(["auctions", "disputes"]);

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function resolveUploadTarget(request: Request) {
  const { searchParams } = new URL(request.url);
  const auctionId = searchParams.get("auctionId");

  if (auctionId) {
    return {
      scope: "auctions",
      entityId: sanitizePathSegment(auctionId),
      missingParamsMessage: "Missing auctionId parameter",
    } as const;
  }

  const scope = searchParams.get("scope");
  const entityId = searchParams.get("entityId");

  if (!scope || !entityId) {
    return null;
  }

  if (!ALLOWED_UPLOAD_SCOPES.has(scope)) {
    return null;
  }

  const sanitizedEntityId = sanitizePathSegment(entityId);

  if (!sanitizedEntityId) {
    return null;
  }

  return {
    scope,
    entityId: sanitizedEntityId,
    missingParamsMessage: "Missing scope or entityId parameter",
  } as const;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

export async function POST(request: Request) {
  try {
    const uploadTarget = resolveUploadTarget(request);

    if (!uploadTarget) {
      return NextResponse.json(
        { error: "Missing or invalid upload target parameters" },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 },
      );
    }

    // Base directory inside public to serve files statically
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      uploadTarget.scope,
      uploadTarget.entityId,
    );

    // Create directory recursively if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savedUrls: string[] = [];

    for (const file of files) {
      const originalName = file.name;
      const ext = path.extname(originalName);
      const baseName = path.basename(originalName, ext);

      // Generate a unique GUID
      const guid = crypto.randomUUID();

      // Format name: itsname_GUID.type
      const newFileName = `${baseName}_${guid}${ext}`;
      const filePath = path.join(uploadDir, newFileName);

      // Convert File buffer to Node.js Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Write file to filesystem
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${uploadTarget.scope}/${uploadTarget.entityId}/${newFileName}`;
      savedUrls.push(publicUrl);
    }

    return NextResponse.json({ urls: savedUrls }, { status: 200 });
  } catch (error) {
    console.error("Error saving uploaded files:", error);
    return NextResponse.json(
      { error: "Failed to upload images", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const uploadTarget = resolveUploadTarget(request);

    if (!uploadTarget) {
      return NextResponse.json(
        { error: "Missing or invalid upload target parameters" },
        { status: 400 },
      );
    }

    // Base directory inside public to serve files statically
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      uploadTarget.scope,
      uploadTarget.entityId,
    );

    // Delete directory and its contents recursively if it exists
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }

    return NextResponse.json({ message: "Uploads cleaned up successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error cleaning up uploaded files:", error);
    return NextResponse.json(
      { error: "Failed to cleanup images", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
