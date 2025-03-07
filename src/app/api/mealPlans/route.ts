import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import path from "path";

const dataFilePath = path.join(
  process.cwd(),
  "public",
  "data",
  "mealPlans.json"
);

// API route handler for GET requests
export async function GET() {
  try {
    try {
      await fs.access(dataFilePath);
    } catch {
      const dataDir = path.join(process.cwd(), "public", "data");
      await fs.mkdir(dataDir, { recursive: true });

      await fs.writeFile(
        dataFilePath,
        JSON.stringify({ default: {} }, null, 2),
        "utf-8"
      );
    }

    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading meal plans:", error);
    return NextResponse.json(
      { error: "Failed to read meal plans" },
      { status: 500 }
    );
  }
}

// API route handler for POST requests
export async function POST(request: NextRequest) {
  try {
    const mealPlans = await request.json();

    const dataDir = path.join(process.cwd(), "public", "data");
    await fs.mkdir(dataDir, { recursive: true });

    await fs.writeFile(
      dataFilePath,
      JSON.stringify(mealPlans, null, 2),
      "utf-8"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving meal plans:", error);
    return NextResponse.json(
      { error: "Failed to save meal plans" },
      { status: 500 }
    );
  }
}
