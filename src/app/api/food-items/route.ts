import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import path from "path";
import { FoodItem } from "@/types/ingredient";

const dataFilePath = path.join(
  process.cwd(),
  "public",
  "data",
  "foodItems.json"
);

// API route handler for GET requests
export async function GET() {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading food items:", error);
    return NextResponse.json(
      { error: "Failed to read food items" },
      { status: 500 }
    );
  }
}

// API route handler for POST requests
export async function POST(request: NextRequest) {
  try {
    const foodItems: FoodItem[] = await request.json();

    const dataDir = path.join(process.cwd(), "public", "data");
    await fs.mkdir(dataDir, { recursive: true });

    await fs.writeFile(
      dataFilePath,
      JSON.stringify(foodItems, null, 2),
      "utf-8"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving food items:", error);
    return NextResponse.json(
      { error: "Failed to save food items" },
      { status: 500 }
    );
  }
}
