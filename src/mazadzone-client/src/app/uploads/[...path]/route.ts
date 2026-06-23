import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePathSegment = resolvedParams.path;
    
    // Resolve absolute path in public/uploads/...
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      ...filePathSegment
    );

    // Prevent directory traversal attacks
    const resolvedBaseDir = path.resolve(process.cwd(), "public", "uploads");
    const resolvedFilePath = path.resolve(filePath);

    // Normalize both paths to lowercase for case-insensitive comparison (handles Windows drive letters)
    const normalizedBase = resolvedBaseDir.toLowerCase();
    const normalizedFile = resolvedFilePath.toLowerCase();

    if (!normalizedFile.startsWith(normalizedBase)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine content type based on extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") {
      contentType = "image/jpeg";
    } else if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".webp") {
      contentType = "image/webp";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    } else if (ext === ".svg") {
      contentType = "image/svg+xml";
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
