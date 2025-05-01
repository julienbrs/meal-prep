import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const pathToSave = formData.get("path") as string;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const publicDir = path.join(process.cwd(), "public");
    const fullPath = path.join(publicDir, pathToSave);
    await writeFile(fullPath, buffer);

    return NextResponse.json({ success: true, path: pathToSave });
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json(
      { error: "Error uploading file." },
      { status: 500 }
    );
  }
}
