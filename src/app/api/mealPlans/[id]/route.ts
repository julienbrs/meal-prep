import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MealPlan from "@/models/MealPlan";

// GET /api/mealPlans/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  try {
    const plan = await MealPlan.findOne({ id });
    if (!plan) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(plan.planData);
  } catch (error) {
    console.error("Error getting meal plan:", error);
    return NextResponse.json(
      { error: "Failed to get meal plan" },
      { status: 500 }
    );
  }
}

// PUT /api/mealPlans/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  try {
    const planData = await request.json();
    const updated = await MealPlan.findOneAndUpdate(
      { id },
      { planData },
      { new: true }
    );
    if (!updated) {
      // create new if missing
      await new MealPlan({ id, planData }).save();
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating meal plan:", error);
    return NextResponse.json(
      { error: "Failed to update meal plan" },
      { status: 500 }
    );
  }
}

// DELETE /api/mealPlans/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  try {
    const result = await MealPlan.findOneAndDelete({ id });
    if (!result) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    return NextResponse.json(
      { error: "Failed to delete meal plan" },
      { status: 500 }
    );
  }
}
