import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { loadFoodItems, addFoodItem } from "@/services/dataservice";
import { FoodItem } from "@/types/ingredient";
import { clearFoodItemsCache, preloadFoodItems } from "@/utils/foodItemFetcher";

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

    // ✅ Load food items to prioritize existing names
    let foodItems: FoodItem[] = await loadFoodItems();
    const foodNames = foodItems.map((item) => item.name.toLowerCase());

    // ✅ Step 1: Extract structured data **and** description in one call
    const extractionPrompt = `
      Extract structured data for the following recipe:
      - Convert all ingredient names to English.
      - Provide structured JSON with: name, amount, unit, steps, category, and a short description.
      - The description should be **one concise sentence** summarizing the dish, without listing ingredients.

      Recipe:
      "${recipeText}"

      Return ONLY JSON in this format (no text, no explanations):

      {
        "name": "Recipe Name",
        "description": "A delicious and creamy pasta dish with a hint of garlic.",
        "category": "dinner",
        "ingredients": [
          { "name": "ingredient 1", "amount": 100, "unit": "g" },
          { "name": "ingredient 2", "amount": 2, "unit": "tbsp" }
        ],
        "steps": ["Step 1", "Step 2", "Step 3"]
      }
    `;

    const extractionResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: extractionPrompt }],
      temperature: 0.3,
    });

    let responseText = extractionResponse.choices[0]?.message?.content || "{}";
    responseText = responseText.replace(/^```json\s*|```$/g, ""); // Clean JSON formatting

    let extractedData;
    try {
      extractedData = JSON.parse(responseText);
    } catch (jsonError) {
      console.error("❌ Failed to parse AI response as JSON:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON response from AI" },
        { status: 500 }
      );
    }

    console.log("✅ Extracted Data:", extractedData);

    extractedData.category = extractedData.category || "dinner";
    extractedData.ingredients = Array.isArray(extractedData.ingredients)
      ? extractedData.ingredients
      : [];

    extractedData.ingredients = extractedData.ingredients.map(
      (ing: { name: string; amount: any; unit: any }) => ({
        name: ing?.name || "Unknown Ingredient",
        amount: ing?.amount ?? "To taste",
        unit: ing?.unit ?? "",
      })
    );

    let aiGeneratedIngredients: FoodItem[] = [];

    const missingIngredients = extractedData.ingredients.filter(
      (ing: { name: string }) => !foodNames.includes(ing.name?.toLowerCase())
    );

    if (missingIngredients.length > 0) {
      const missingNames = missingIngredients.map((ing: { name: any; }) => ing.name).join(", ");
      console.log("🔍 Missing Ingredients:", missingNames);

      const aiCompletion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert in food nutrition and pricing. Always respond with a valid JSON object.`,
          },
          {
            role: "user",
            content: `Find detailed nutrition facts (calories, protein, carbs, fat, fiber, sugar per 100g) 
                      and estimated price in France (2025) for the following missing food items: ${missingNames}.
                      
                      Only return a valid JSON array in this format (no text, no explanation):
                      [
                        {
                          "name": "ingredient name",
                          "nutritionPer100g": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "sugar": 0 },
                          "price": 0.0,
                          "priceUnit": "per 100g"
                        }
                      ]`,
          },
        ],
        temperature: 0.4,
      });

      let aiResponseText = aiCompletion.choices[0]?.message?.content || "[]";
      aiResponseText = aiResponseText.replace(/^```json\s*|```$/g, "");

      try {
        aiGeneratedIngredients = JSON.parse(aiResponseText);
        if (!Array.isArray(aiGeneratedIngredients)) {
          throw new Error("AI response is not a valid JSON array.");
        }
      } catch (jsonError) {
        console.error(
          "❌ Failed to parse AI response for missing ingredients:",
          jsonError
        );
      }

      // ✅ Add missing ingredients to database
      for (const aiIng of aiGeneratedIngredients) {
        const newFoodItem: FoodItem = {
          id: aiIng.name.toLowerCase().replace(/\s+/g, "-"),
          name: aiIng.name,
          category: "misc",
          units: "g",
          nutritionPer100g: aiIng.nutritionPer100g,
          price: aiIng.price,
          priceUnit: aiIng.priceUnit,
        };
        await addFoodItem(newFoodItem);
      }

      // 🔄 Refresh food items in memory
      clearFoodItemsCache();
      await preloadFoodItems();
      foodItems = await loadFoodItems();
    }

    extractedData.ingredients = extractedData.ingredients.map((ing: { name: string; }) => {
      const found = foodItems.find(
        (item) => item.name.toLowerCase() === ing.name.toLowerCase()
      );

      if (found) {
        return { ...ing, foodItemId: found.id };
      }

      const aiGeneratedItem = aiGeneratedIngredients.find(
        (aiIng) => aiIng.name.toLowerCase() === ing.name.toLowerCase()
      );

      return aiGeneratedItem
        ? {
            ...ing,
            foodItemId: aiGeneratedItem.name.toLowerCase().replace(/\s+/g, "-"),
            nutritionPer100g: aiGeneratedItem.nutritionPer100g,
            price: aiGeneratedItem.price,
            priceUnit: aiGeneratedItem.priceUnit,
          }
        : {
            ...ing,
            foodItemId: ing.name.toLowerCase().replace(/\s+/g, "-"),
          };
    });

    return NextResponse.json({ success: true, data: extractedData });
  } catch (error) {
    console.error("❌ Error extracting recipe:", error);
    return NextResponse.json(
      { error: "Failed to extract recipe" },
      { status: 500 }
    );
  }
}
