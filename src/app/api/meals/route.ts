import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import path from "path";
import { Meal } from "@/types/meal";

// Get the path to the data file
const dataFilePath = path.join(process.cwd(), "public", "data", "meals.json");

export async function GET() {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading meals:", error);
    return NextResponse.json(
      { error: "Failed to read meals" },
      { status: 500 }
    );
  }
}

// API route handler for POST requests
export async function POST(request: NextRequest) {
  try {
    const meals: Meal[] = await request.json();

    const dataDir = path.join(process.cwd(), "public", "data");
    await fs.mkdir(dataDir, { recursive: true });

    await fs.writeFile(dataFilePath, JSON.stringify(meals, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving meals:", error);
    return NextResponse.json(
      { error: "Failed to save meals" },
      { status: 500 }
    );
  }
}
