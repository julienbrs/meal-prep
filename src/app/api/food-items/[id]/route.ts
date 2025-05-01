import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import FoodItem from "@/models/FoodItem";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const item = await FoodItem.findOne({ id: params.id });
    if (!item) {
      return NextResponse.json(
        { error: "Food item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error getting food item:", error);
    return NextResponse.json(
      { error: "Failed to get food item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const data = await request.json();
    const item = await FoodItem.findOneAndUpdate({ id: params.id }, data, {
      new: true,
    });

    if (!item) {
      return NextResponse.json(
        { error: "Food item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Error updating food item:", error);
    return NextResponse.json(
      { error: "Failed to update food item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const result = await FoodItem.findOneAndDelete({ id: params.id });

    if (!result) {
      return NextResponse.json(
        { error: "Food item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting food item:", error);
    return NextResponse.json(
      { error: "Failed to delete food item" },
      { status: 500 }
    );
  }
}
