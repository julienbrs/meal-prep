// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    // Generate a unique path using the same pattern you were using before
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}-${file.name
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    });
    console.log("blobl url:", blob.url);

    // Return the URL of the uploaded file
    return NextResponse.json({
      success: true,
      path: blob.url,
    });
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json(
      { error: "Error uploading file." },
      { status: 500 }
    );
  }
}
