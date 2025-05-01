import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Meal from "@/models/Meal";

// GET /api/meals/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  try {
    const meal = await Meal.findOne({ id });
    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }
    return NextResponse.json(meal);
  } catch (error) {
    console.error("Error getting meal:", error);
    return NextResponse.json({ error: "Failed to get meal" }, { status: 500 });
  }
}

// PUT /api/meals/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  try {
    const data = await request.json();
    const updated = await Meal.findOneAndUpdate({ id }, data, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, meal: updated });
  } catch (error) {
    console.error("Error updating meal:", error);
    return NextResponse.json(
      { error: "Failed to update meal" },
      { status: 500 }
    );
  }
}

// DELETE /api/meals/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  try {
    const result = await Meal.findOneAndDelete({ id });
    if (!result) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meal:", error);
    return NextResponse.json(
      { error: "Failed to delete meal" },
      { status: 500 }
    );
  }
}
