import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { loadFoodItems } from "@/services/dataservice";
import { FoodItem } from "@/types/ingredient";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { recipeText } = await req.json();
    if (!recipeText) {
      return NextResponse.json(
        { error: "Missing recipe text" },
        { status: 400 }
      );
    }

    const foodItems: FoodItem[] = await loadFoodItems();
    const foodNames = foodItems.map((item) => item.name).join(", ");

    const prompt = `
      Analyze the following recipe and extract structured data in **English**, ensuring the ingredients match the provided list of food items.
      
      **Available Food Items:**
      ${foodNames}
      
      **Extracted JSON format:**
      {
        "name": "Recipe Name",
        "category": "breakfast | lunch | dinner | snack",
        "preparationTime": "time in minutes",
        "ingredients": [
          {
            "foodItemId": "matching ID from database",
            "amount": "amount in correct unit",
            "unit": "correct unit from database"
          }
        ],
        "instructions": ["Step 1", "Step 2", ...]
      }
      
      **Recipe to Process:**
      "${recipeText}"
      
      Make sure all ingredients strictly match the given food items.
      
      **Return only valid JSON.**
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert recipe assistant that maps ingredients to a known database.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const extractedData = JSON.parse(
      response.choices[0].message.content || "{}"
    );

    return NextResponse.json({ success: true, data: extractedData });
  } catch (error) {
    console.error("Error extracting recipe:", error);
    return NextResponse.json(
      { error: "Failed to extract recipe" },
      { status: 500 }
    );
  }
}
