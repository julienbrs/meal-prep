import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import FoodItem from "@/models/FoodItem";

export async function GET() {
  await dbConnect();

  try {
    const foodItems = await FoodItem.find({});
    return NextResponse.json(foodItems);
  } catch (error) {
    console.error("Error reading food items:", error);
    return NextResponse.json(
      { error: "Failed to read food items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const foodItem = await request.json();

    // Generate ID if not provided
    if (!foodItem.id) {
      foodItem.id =
        Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    const newItem = new FoodItem(foodItem);
    await newItem.save();

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error("Error saving food item:", error);
    return NextResponse.json(
      { error: "Failed to save food item" },
      { status: 500 }
    );
  }
}
