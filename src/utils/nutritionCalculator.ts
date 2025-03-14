import { RecipeIngredient } from "@/types/meal";
import { FoodItem, NutritionInfo } from "@/types/ingredient";

// Calculate nutrition for a recipe - sync version (for when food items are already loaded)
export function calculateRecipeNutrition(
  ingredients: RecipeIngredient[],
  foodItems: FoodItem[]
): NutritionInfo {
  const nutrition: NutritionInfo = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
  };

  const UNIT_CONVERSIONS: { [key: string]: number } = {
    cl: 10, // 1cl = 10ml
    ml: 1, // 1ml ≈ 1g for water-based liquids
    tsp: 5, // 1 tsp ≈ 5g
    tbsp: 15, // 1 tbsp ≈ 15g
  };

  ingredients.forEach((ingredient) => {
    const foodItem = foodItems.find(
      (item) => item.id === ingredient.foodItemId
    );
    if (!foodItem) return;

    let amountInGrams = Number(ingredient.amount);
    if (isNaN(amountInGrams)) {
      if (String(ingredient.amount).toLowerCase() === "to taste") return;
      console.warn(
        `Invalid amount for ${ingredient.foodItemId}:`,
        ingredient.amount
      );
      return;
    }

    let ratio: number;

    if (foodItem.units === "piece") {
      // For pieces, use amount directly as multiplier since nutrition is per piece
      ratio = amountInGrams;
    } else {
      // Convert to grams if needed based on unit
      if (ingredient.unit && ingredient.unit in UNIT_CONVERSIONS) {
        amountInGrams = amountInGrams * UNIT_CONVERSIONS[ingredient.unit];
      }
      ratio = amountInGrams / 100;
    }
    nutrition.calories += foodItem.nutritionPer100g.calories * ratio;
    nutrition.protein += foodItem.nutritionPer100g.protein * ratio;
    nutrition.carbs += foodItem.nutritionPer100g.carbs * ratio;
    nutrition.fat += foodItem.nutritionPer100g.fat * ratio;
    if (foodItem.nutritionPer100g.fiber) {
      nutrition.fiber! += foodItem.nutritionPer100g.fiber * ratio;
    }
    if (foodItem.nutritionPer100g.sugar) {
      nutrition.sugar! += foodItem.nutritionPer100g.sugar * ratio;
    }
  });

  return {
    calories: Math.round(nutrition.calories),
    protein: Number(nutrition.protein.toFixed(1)),
    carbs: Number(nutrition.carbs.toFixed(1)),
    fat: Number(nutrition.fat.toFixed(1)),
    fiber: nutrition.fiber ? Number(nutrition.fiber.toFixed(1)) : undefined,
    sugar: nutrition.sugar ? Number(nutrition.sugar.toFixed(1)) : undefined,
  };
}

// Calculate cost for a recipe - sync version
export function calculateRecipeCost(
  ingredients: RecipeIngredient[],
  foodItems: FoodItem[]
): number {
  let totalCost = 0;

  ingredients.forEach((ingredient) => {
    const foodItem = foodItems.find(
      (item) => item.id === ingredient.foodItemId
    );
    if (!foodItem) return;

    if (!foodItem.nutritionPer100g) {
      console.error(`Missing nutrition data for: ${foodItem.name}`);
      return;
    }

    let costMultiplier = 1;

    // Handle different price units
    if (foodItem.units === "piece") {
      // For piece units, price is per piece
      costMultiplier = ingredient.amount;
    } else {
      // For weight-based pricing
      let amount = ingredient.amount;

      // Convert to the appropriate unit for cost calculation
      if (ingredient.unit !== foodItem.units) {
        if (ingredient.unit === "ml" && foodItem.priceUnit.includes("ml")) {
          // Direct ml to ml conversion
          amount = ingredient.amount;
        } else {
          // Convert to grams or the appropriate unit
          amount = ingredient.amount * (ingredient.unit === "g" ? 1 : 100);
        }
      }

      // Apply price calculation based on price unit
      if (foodItem.priceUnit.includes("100")) {
        costMultiplier = amount / 100;
      } else {
        costMultiplier = amount;
      }
    }

    totalCost += foodItem.price * costMultiplier;
  });

  return Number(totalCost.toFixed(2));
}
