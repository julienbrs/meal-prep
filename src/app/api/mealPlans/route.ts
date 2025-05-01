import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MealPlan from "@/models/MealPlan";

export async function GET() {
  await dbConnect();

  try {
    const mealPlans = await MealPlan.find({});

    // Convert array to object with id as key
    const mealPlansObj: Record<string, any> = {};
    mealPlans.forEach((plan) => {
      mealPlansObj[plan.id] = plan.planData;
    });

    // If no plans exist, create a default empty one
    if (Object.keys(mealPlansObj).length === 0) {
      mealPlansObj.default = {};
    }

    return NextResponse.json(mealPlansObj);
  } catch (error) {
    console.error("Error reading meal plans:", error);
    return NextResponse.json(
      { error: "Failed to read meal plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const mealPlansData = await request.json();

    // Delete all existing meal plans
    await MealPlan.deleteMany({});

    // Create array of meal plan documents
    const mealPlanDocuments = Object.entries(mealPlansData).map(
      ([id, planData]) => ({
        id,
        planData,
      })
    );

    // Insert new meal plans
    await MealPlan.insertMany(mealPlanDocuments);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving meal plans:", error);
    return NextResponse.json(
      { error: "Failed to save meal plans" },
      { status: 500 }
    );
  }
}
