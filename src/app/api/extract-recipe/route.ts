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

    let foodItems: FoodItem[] = await loadFoodItems();
    const foodNames = foodItems.map((item) => item.name.toLowerCase());

    const extractionPrompt = `
      Extract structured data for the following recipe:
      - Convert all ingredient names to English.
      - Return structured JSON with: name, amount, unit, and steps.

      Recipe:
      "${recipeText}"
    `;

    const extractionResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: extractionPrompt }],
      temperature: 0.3,
    });

    let responseText = extractionResponse.choices[0].message.content || "{}";
    responseText = responseText.replace(/^```json\s*|```$/g, "");
    const extractedData = JSON.parse(responseText);

    extractedData.category = extractedData.category || "dinner";

    extractedData.ingredients = extractedData.ingredients.map((ing: any) => ({
      name: ing.name || "Unknown Ingredient",
      amount: ing.amount ?? "To taste",
      unit: ing.unit ?? "",
    }));

    const missingIngredients = extractedData.ingredients.filter(
      (ing: any) => !foodNames.includes(ing.name?.toLowerCase())
    );

    const missingNames = missingIngredients
      .map((ing: any) => ing.name)
      .filter(Boolean)
      .join(", ");

    if (missingNames.trim().length > 0) {
      console.log("Requesting AI for missing ingredients:", missingNames);

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
                      ]
                      
                      Do not include any extra text before or after the JSON.`,
          },
        ],
        temperature: 0.4,
      });

      let aiResponseText = aiCompletion.choices[0].message.content || "[]";
      aiResponseText = aiResponseText.replace(/^```json\s*|```$/g, "");

      try {
        const aiGeneratedIngredients = JSON.parse(aiResponseText);

        if (!Array.isArray(aiGeneratedIngredients)) {
          throw new Error("AI response is not a valid JSON array.");
        }

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

        // ✅ Refresh food items after AI additions
        clearFoodItemsCache();
        await preloadFoodItems();
        foodItems = await loadFoodItems();

        // ✅ Assign correct foodItemId and ensure all ingredients have valid IDs
        extractedData.ingredients = extractedData.ingredients.map(
          (ing: any) => {
            const found = foodItems.find(
              (item) => item.name.toLowerCase() === ing.name.toLowerCase()
            );

            if (found) {
              return { ...ing, foodItemId: found.id };
            }

            const aiGeneratedItem = aiGeneratedIngredients.find(
              (aiIng: any) =>
                aiIng.name.toLowerCase() === ing.name.toLowerCase()
            );

            return aiGeneratedItem
              ? {
                  ...ing,
                  foodItemId: aiGeneratedItem.name
                    .toLowerCase()
                    .replace(/\s+/g, "-"),
                  nutritionPer100g: aiGeneratedItem.nutritionPer100g,
                  price: aiGeneratedItem.price,
                  priceUnit: aiGeneratedItem.priceUnit,
                }
              : {
                  ...ing,
                  foodItemId: ing.name.toLowerCase().replace(/\s+/g, "-"),
                };
          }
        );
      } catch (jsonError) {
        console.error("Failed to parse AI response as JSON:", jsonError);
      }
    }

    return NextResponse.json({ success: true, data: extractedData });
  } catch (error) {
    console.error("Error extracting recipe:", error);
    return NextResponse.json(
      { error: "Failed to extract recipe" },
      { status: 500 }
    );
  }
}
