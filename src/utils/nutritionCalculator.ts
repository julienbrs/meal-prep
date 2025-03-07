import { RecipeIngredient } from "@/types/meal";
import { NutritionInfo } from "@/types/ingredient";
import { getFoodItemById, getFoodItemByIdSync } from "./foodItemFetcher";

// Calculate nutrition for a recipe - async version
export async function calculateRecipeNutritionAsync(
  ingredients: RecipeIngredient[]
): Promise<NutritionInfo> {
  const nutrition: NutritionInfo = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
  };

  // Process each ingredient
  for (const ingredient of ingredients) {
    const foodItem = await getFoodItemById(ingredient.foodItemId);
    if (!foodItem) continue;

    let amountInGrams = ingredient.amount;
    if (ingredient.unit !== "g") {
      if (foodItem.units === "piece" && ingredient.unit === "piece") {
        switch (foodItem.id) {
          case "protein-3": // Eggs
            amountInGrams = ingredient.amount * 50; // Average egg is 50g
            break;
          case "veg-1": // Avocado
            amountInGrams = ingredient.amount * 170; // Average avocado is 170g
            break;
          case "grain-1": // Bread slice
            amountInGrams = ingredient.amount * 30; // Average bread slice is 30g
            break;
          default:
            amountInGrams = ingredient.amount * 100; // Default conversion
        }
      } else if (ingredient.unit === "ml") {
        amountInGrams = ingredient.amount; // Assume 1ml = 1g for simplicity
      }
    }

    const ratio = amountInGrams / 100; // nutritionPer100g is based on 100g
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
  }

  return {
    calories: Math.round(nutrition.calories),
    protein: Number(nutrition.protein.toFixed(1)),
    carbs: Number(nutrition.carbs.toFixed(1)),
    fat: Number(nutrition.fat.toFixed(1)),
    fiber: nutrition.fiber ? Number(nutrition.fiber.toFixed(1)) : undefined,
    sugar: nutrition.sugar ? Number(nutrition.sugar.toFixed(1)) : undefined,
  };
}

// Calculate nutrition for a recipe - sync version (for when food items are already loaded)
export function calculateRecipeNutrition(
  ingredients: RecipeIngredient[]
): NutritionInfo {
  const nutrition: NutritionInfo = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
  };

  ingredients.forEach((ingredient) => {
    const foodItem = getFoodItemByIdSync(ingredient.foodItemId);
    if (!foodItem) return;

    let amountInGrams = ingredient.amount;
    if (ingredient.unit !== "g") {
      if (foodItem.units === "piece" && ingredient.unit === "piece") {
        switch (foodItem.id) {
          case "protein-3": // Eggs
            amountInGrams = ingredient.amount * 50; // Average egg is 50g
            break;
          case "veg-1": // Avocado
            amountInGrams = ingredient.amount * 170; // Average avocado is 170g
            break;
          case "grain-1": // Bread slice
            amountInGrams = ingredient.amount * 30; // Average bread slice is 30g
            break;
          default:
            amountInGrams = ingredient.amount * 100; // Default conversion
        }
      } else if (ingredient.unit === "ml") {
        amountInGrams = ingredient.amount; // Assume 1ml = 1g for simplicity
      }
    }

    const ratio = amountInGrams / 100; // nutritionPer100g is based on 100g
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

// Calculate cost for a recipe - async version
export async function calculateRecipeCostAsync(
  ingredients: RecipeIngredient[]
): Promise<number> {
  let totalCost = 0;

  for (const ingredient of ingredients) {
    const foodItem = await getFoodItemById(ingredient.foodItemId);
    if (!foodItem) continue;

    let amount = ingredient.amount;
    if (ingredient.unit !== foodItem.units) {
      if (foodItem.units === "piece" && ingredient.unit === "piece") {
        amount = ingredient.amount;
      } else if (
        ingredient.unit === "ml" &&
        foodItem.priceUnit.includes("ml")
      ) {
        amount = ingredient.amount;
      } else {
        amount = ingredient.amount * (ingredient.unit === "g" ? 1 : 100);
      }
    }

    const unitPrice = foodItem.price;
    if (foodItem.priceUnit.includes("100")) {
      totalCost += (amount / 100) * unitPrice;
    } else {
      totalCost += amount * unitPrice;
    }
  }

  return Number(totalCost.toFixed(2));
}

// Calculate cost for a recipe - sync version
export function calculateRecipeCost(ingredients: RecipeIngredient[]): number {
  let totalCost = 0;

  ingredients.forEach((ingredient) => {
    const foodItem = getFoodItemByIdSync(ingredient.foodItemId);
    if (!foodItem) return;

    let amount = ingredient.amount;
    if (ingredient.unit !== foodItem.units) {
      if (foodItem.units === "piece" && ingredient.unit === "piece") {
        amount = ingredient.amount;
      } else if (
        ingredient.unit === "ml" &&
        foodItem.priceUnit.includes("ml")
      ) {
        amount = ingredient.amount;
      } else {
        amount = ingredient.amount * (ingredient.unit === "g" ? 1 : 100);
      }
    }

    const unitPrice = foodItem.price;
    if (foodItem.priceUnit.includes("100")) {
      totalCost += (amount / 100) * unitPrice;
    } else {
      totalCost += amount * unitPrice;
    }
  });

  return Number(totalCost.toFixed(2));
}
