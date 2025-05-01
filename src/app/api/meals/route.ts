import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Meal from "@/models/Meal";

export async function GET() {
  await dbConnect();

  try {
    const meals = await Meal.find({});
    return NextResponse.json(meals);
  } catch (error) {
    console.error("Error reading meals:", error);
    return NextResponse.json(
      { error: "Failed to read meals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const meal = await request.json();

    // Generate ID if not provided
    if (!meal.id) {
      meal.id =
        Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    const newMeal = new Meal(meal);
    await newMeal.save();

    return NextResponse.json({ success: true, meal: newMeal });
  } catch (error) {
    console.error("Error saving meal:", error);
    return NextResponse.json({ error: "Failed to save meal" }, { status: 500 });
  }
}
