import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MealPlan from "@/models/MealPlan";

export async function GET() {
  await dbConnect();
  try {
    const mealPlans = await MealPlan.find({});
    const obj: Record<string, any> = {};
    mealPlans.forEach((p) => {
      obj[p.id] = p.planData;
    });
    if (Object.keys(obj).length === 0) {
      obj.default = {};
    }
    return NextResponse.json(obj);
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
    await MealPlan.deleteMany({});
    const docs = Object.entries(mealPlansData).map(([id, planData]) => ({
      id,
      planData,
    }));
    await MealPlan.insertMany(docs);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving meal plans:", error);
    return NextResponse.json(
      { error: "Failed to save meal plans" },
      { status: 500 }
    );
  }
}
