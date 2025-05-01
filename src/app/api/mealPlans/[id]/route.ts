import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MealPlan from "@/models/MealPlan";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const mealPlan = await MealPlan.findOne({ id: params.id });
    if (!mealPlan) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(mealPlan.planData);
  } catch (error) {
    console.error("Error getting meal plan:", error);
    return NextResponse.json(
      { error: "Failed to get meal plan" },
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
    const planData = await request.json();

    // Try to update existing plan first
    const updatedPlan = await MealPlan.findOneAndUpdate(
      { id: params.id },
      { planData },
      { new: true }
    );

    // If plan doesn't exist, create it
    if (!updatedPlan) {
      const newPlan = new MealPlan({
        id: params.id,
        planData,
      });
      await newPlan.save();
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const result = await MealPlan.findOneAndDelete({ id: params.id });

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
