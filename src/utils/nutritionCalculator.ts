// src/utils/nutritionCalculator.ts
import { RecipeIngredient } from "@/types/meal";
import { FoodItem, NutritionInfo } from "@/types/ingredient";

// Calculate nutrition for a recipe - sync version (for when food items are already loaded)
export function calculateRecipeNutrition(
  ingredients: RecipeIngredient[],
  foodItems: FoodItem[],
  portionMultiplier: number = 1
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

    let amountInGrams = Number(ingredient.amount) * portionMultiplier;

    // Skip the calculation if amount is 0 (which was "To taste")
    if (amountInGrams === 0) return;

    if (isNaN(amountInGrams)) {
      console.warn(
        `Invalid amount for ${ingredient.foodItemId}:`,
        ingredient.amount
      );
      return;
    }

    let ratio: number;

    if (foodItem.units === "piece" && ingredient.unit === "piece") {
      if (foodItem.weightPerPiece && foodItem.weightPerPiece > 0) {
        const totalWeight = amountInGrams * foodItem.weightPerPiece;
        ratio = totalWeight / 100;
      } else {
        ratio = amountInGrams;
      }
    } else {
      if (ingredient.unit === "piece" && foodItem.weightPerPiece) {
        amountInGrams = amountInGrams * foodItem.weightPerPiece;
      }
      else if (ingredient.unit && ingredient.unit in UNIT_CONVERSIONS) {
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
  foodItems: FoodItem[],
  portionMultiplier: number = 1
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

    // Skip if the amount is 0 (which was "To taste")
    if (ingredient.amount === 0) return;

    let costMultiplier = 1;
    const adjustedAmount = ingredient.amount * portionMultiplier

    // Handle different price units with the new weightPerPiece field
    if (foodItem.units === "piece" && ingredient.unit === "piece") {
      if (foodItem.weightPerPiece && foodItem.weightPerPiece > 0) {
        const totalWeight = adjustedAmount * foodItem.weightPerPiece;
        costMultiplier = totalWeight / 100;
      } else {
        costMultiplier = adjustedAmount;
      }
    } else {
      let amount = adjustedAmount;

      if (ingredient.unit === "piece" && foodItem.weightPerPiece) {
        amount = adjustedAmount * foodItem.weightPerPiece;
      }
      else if (ingredient.unit !== foodItem.units) {
        if (ingredient.unit === "ml" && foodItem.priceUnit.includes("ml")) {
          amount = adjustedAmount;
        } else if (ingredient.unit in UNIT_CONVERSIONS) {
          amount = adjustedAmount * UNIT_CONVERSIONS[ingredient.unit];
        } else {
          amount = adjustedAmount * (ingredient.unit === "g" ? 1 : 100);
        }
      }

      costMultiplier = amount / 100;
    }

    totalCost += foodItem.price * costMultiplier;
  });

  return Number(totalCost.toFixed(2));
}

export function adjustIngredientsForPortions(
  ingredients: RecipeIngredient[],
  portionMultiplier: number
): RecipeIngredient[] {
  return ingredients.map((ingredient) => ({
    ...ingredient,
    amount: ingredient.amount * portionMultiplier,
  }));
}

const UNIT_CONVERSIONS: { [key: string]: number } = {
  cl: 10, // 1cl = 10ml
  ml: 1, // 1ml ≈ 1g for water-based liquids
  tsp: 5, // 1 tsp ≈ 5g
  tbsp: 15, // 1 tbsp ≈ 15g
  cup: 240, // 1 cup ≈ 240ml
};
