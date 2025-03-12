// app/api/auto-fill-food-items/route.ts

import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGeminiAPI(prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.statusText}`);
  }

  const result = await response.json();
  console.log("result:", result)
  let responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  responseText = responseText.replace(/^```json\n/, "").replace(/\n```$/, "");

  try {
    const parsedResponse = JSON.parse(responseText);
    return parsedResponse;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error("Invalid JSON response from Gemini API");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { foodItems } = await req.json();

    console.log("food items:", foodItems)

    const prompt = `For each of these food items, provide realistic nutrition facts (per 100g or per piece as indicated) and estimated price. Return a JSON array with the same structure as the input but with filled values.

Example format for the response:
[
  {
    "name": "Apple",
    "category": "fruit",
    "units": "piece",
    "price": 0.50,
    "priceUnit": "per piece",
    "nutritionPer100g": {
      "calories": 52,
      "protein": 0.3,
      "carbs": 14,
      "fat": 0.2,
      "fiber": 2.4,
      "sugar": 10.4
    }
  }
]

Food items to process:
${JSON.stringify(foodItems, null, 2)}`;

    const filledData = await callGeminiAPI(prompt);

    if (!Array.isArray(filledData)) {
      throw new Error("Invalid response format");
    }

    // Validate and clean up the data
    const processedData = filledData.map((item, index) => {
      const original = foodItems[index];
      return {
        ...original,
        price: Math.max(0, Number(item.price) || 0),
        nutritionPer100g: {
          calories: Math.max(0, Number(item.nutritionPer100g?.calories) || 0),
          protein: Math.max(0, Number(item.nutritionPer100g?.protein) || 0),
          carbs: Math.max(0, Number(item.nutritionPer100g?.carbs) || 0),
          fat: Math.max(0, Number(item.nutritionPer100g?.fat) || 0),
          fiber: Math.max(0, Number(item.nutritionPer100g?.fiber) || 0),
          sugar: Math.max(0, Number(item.nutritionPer100g?.sugar) || 0),
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: processedData,
    });
  } catch (error) {
    console.error("Error auto-filling food items:", error);
    return NextResponse.json(
      { error: "Failed to auto-fill food items" },
      { status: 500 }
    );
  }
}
