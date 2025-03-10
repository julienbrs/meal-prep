import { NextRequest, NextResponse } from "next/server";
import { loadFoodItems, addFoodItem } from "@/services/dataservice";
import { FoodItem } from "@/types/ingredient";
import { clearFoodItemsCache, preloadFoodItems } from "@/utils/foodItemFetcher";

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
  let responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  responseText = responseText.replace(/^```json\n/, "").replace(/\n```$/, "");

  try {
    const parsedResponse = JSON.parse(responseText);

    if (typeof parsedResponse !== "object" || Array.isArray(parsedResponse)) {
      throw new Error("Response is not a valid JSON object.");
    }

    return parsedResponse;
  } catch (error) {
    console.error("❌ Error parsing JSON:", error);
    throw new Error("Invalid JSON response from Gemini API.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { recipeText } = await req.json();
    if (!recipeText) {
      return NextResponse.json(
        { error: "Missing recipe text" },
        { status: 400 }
      );
    }

    let foodItems: FoodItem[] = await loadFoodItems();
    const foodNames = foodItems.map((item) => item.name.toLowerCase());

    const extractionPrompt = `
    You are given a recipe in free text. Convert it to exactly one JSON object.
    It MUST have these top-level fields: "name", "description", "category", "ingredients", "steps".
    
    Example format:
    {
      "name": "Fettuccine Alfredo",
      "description": "A creamy classic pasta dish with parmesan.",
      "category": "dinner",
      "ingredients": [
        { "name": "Fettuccine pasta", "amount": 200, "unit": "g" },
        { "name": "Butter", "amount": 2, "unit": "tbsp" }
      ],
      "steps": [
        "Cook pasta as directed.",
        "Melt butter and stir in cream."
      ]
    }
    
    Convert the ingredient names to English if needed. Return JSON only, with no extra text:
    
    Recipe:
    "${recipeText}"
    `;

    let extractedData;
    try {
      extractedData = await callGeminiAPI(extractionPrompt); // ✅ Returns full object
    } catch (jsonError) {
      console.error("❌ Failed to parse Gemini response:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON response from Gemini API" },
        { status: 500 }
      );
    }

    console.log("✅ Extracted Recipe Object:", extractedData);

    if (
      !extractedData ||
      typeof extractedData !== "object" ||
      !extractedData.ingredients ||
      !Array.isArray(extractedData.ingredients)
    ) {
      console.error("❌ Invalid extracted data:", extractedData);
      return NextResponse.json(
        { error: "Extracted data is missing required fields." },
        { status: 500 }
      );
    }

    extractedData.category = extractedData.category || "dinner";

    extractedData.ingredients = extractedData.ingredients.map(
      (ing: { name: string; amount: any; unit: any }) => ({
        name: ing?.name || "Unknown Ingredient",
        amount: ing?.amount ?? "To taste",
        unit: ing?.unit ?? "",
      })
    );

    console.log("✅ Final Processed Data:", extractedData);

    const missingIngredients = extractedData.ingredients.filter(
      (ing: { name: string }) => !foodNames.includes(ing.name?.toLowerCase())
    );

    console.log("🔍 Missing Ingredients:", missingIngredients);

    return NextResponse.json({
      success: true,
      data: extractedData,
      missingIngredients,
    });
  } catch (error) {
    console.error("❌ Error extracting recipe:", error);
    return NextResponse.json(
      { error: "Failed to extract recipe" },
      { status: 500 }
    );
  }
}
