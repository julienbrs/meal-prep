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
      console.log('foodItem.units === "piece" && ingredient.unit === "piece"')
      // Si on utilise des pièces et que l'ingrédient a un poids par pièce
      if (foodItem.weightPerPiece && foodItem.weightPerPiece > 0) {
        console.log('foodItem.weightPerPiece && foodItem.weightPerPiece > 0')
        // Le poids total des pièces en grammes
        const totalWeight = amountInGrams * foodItem.weightPerPiece;
        // Ratio par rapport à 100g
        ratio = totalWeight / 100;
      } else {
        // Si pas de poids par pièce défini, on utilise le nombre directement comme multiplicateur
        ratio = amountInGrams;
      }
    } else {
      // Pour les ingrédients non comptés en pièces
      // Si l'unité dans l'ingrédient est "piece" mais que l'unité de l'aliment n'est pas "piece",
      // convertir en grammes selon le poids moyen d'une pièce
      if (ingredient.unit === "piece" && foodItem.weightPerPiece) {
        amountInGrams = amountInGrams * foodItem.weightPerPiece;
      }
      // Pour les autres unités, appliquer les conversions standards
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

    // Skip if the amount is 0 (which was "To taste")
    if (ingredient.amount === 0) return;

    let costMultiplier = 1;

    // Handle different price units with the new weightPerPiece field
    if (foodItem.units === "piece" && ingredient.unit === "piece") {
      // For piece units, price is per 100g, but we need to calculate based on weight per piece
      if (foodItem.weightPerPiece && foodItem.weightPerPiece > 0) {
        // Le coût est basé sur le poids total des pièces par rapport à 100g
        const totalWeight = ingredient.amount * foodItem.weightPerPiece;
        costMultiplier = totalWeight / 100;
      } else {
        // Fallback if no weight per piece is defined
        costMultiplier = ingredient.amount;
      }
    } else {
      // Convert to the appropriate unit for cost calculation
      let amount = ingredient.amount;

      // Si l'ingrédient est mesuré en pièces mais que l'aliment ne l'est pas
      if (ingredient.unit === "piece" && foodItem.weightPerPiece) {
        amount = ingredient.amount * foodItem.weightPerPiece;
      }
      // Pour les autres unités de mesure
      else if (ingredient.unit !== foodItem.units) {
        if (ingredient.unit === "ml" && foodItem.priceUnit.includes("ml")) {
          // Direct ml to ml conversion
          amount = ingredient.amount;
        } else if (ingredient.unit in UNIT_CONVERSIONS) {
          // Convert to grams using the conversion table
          amount = ingredient.amount * UNIT_CONVERSIONS[ingredient.unit];
        } else {
          // Default conversion
          amount = ingredient.amount * (ingredient.unit === "g" ? 1 : 100);
        }
      }

      // Le prix est toujours calculé sur la base de 100g
      costMultiplier = amount / 100;
    }

    totalCost += foodItem.price * costMultiplier;
  });

  return Number(totalCost.toFixed(2));
}

// Constantes pour la conversion des unités
const UNIT_CONVERSIONS: { [key: string]: number } = {
  cl: 10, // 1cl = 10ml
  ml: 1, // 1ml ≈ 1g for water-based liquids
  tsp: 5, // 1 tsp ≈ 5g
  tbsp: 15, // 1 tbsp ≈ 15g
  cup: 240, // 1 cup ≈ 240ml
};
