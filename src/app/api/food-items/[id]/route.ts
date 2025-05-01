import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import FoodItem from "@/models/FoodItem";

// GET handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();

  try {
    const item = await FoodItem.findOne({ id });
    if (!item) {
      return NextResponse.json(
        { error: "Food item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(item);
  } catch (err) {
    console.error("Error getting food item:", err);
    return NextResponse.json(
      { error: "Failed to get food item" },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();

  try {
    const data = await request.json();
    const item = await FoodItem.findOneAndUpdate({ id }, data, { new: true });
    if (!item) {
      return NextResponse.json(
        { error: "Food item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, item });
  } catch (err) {
    console.error("Error updating food item:", err);
    return NextResponse.json(
      { error: "Failed to update food item" },
      { status: 500 }
    );
  }
}

// DELETE handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();

  try {
    const result = await FoodItem.findOneAndDelete({ id });
    if (!result) {
      return NextResponse.json(
        { error: "Food item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting food item:", err);
    return NextResponse.json(
      { error: "Failed to delete food item" },
      { status: 500 }
    );
  }
}
