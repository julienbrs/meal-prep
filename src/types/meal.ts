import { NutritionInfo } from "./ingredient";

export interface Meal {
  id: string;
  name: string;
  description: string;
  categories: ("breakfast" | "lunch" | "dinner" | "snack" | "appetizer")[];
  preparationTime: number; // in minutes
  image?: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  calculatedNutrition?: NutritionInfo;
  totalCost?: number;
  createdBy?: string;
  // Nouveau : portions préférées par utilisateur
  preferredPortions?: { [userId: string]: number };
}

export interface RecipeIngredient {
  foodItemId: string;
  amount: number;
  unit: string;
  nutritionPer100g?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
  };
  price?: number;
  priceUnit?: string;
  aiGenerated?: boolean;
}

// Nouveau : Interface pour les calculs avec portions
export interface MealWithPortions {
  meal: Meal;
  portions: number;
  adjustedIngredients: RecipeIngredient[];
  adjustedNutrition: NutritionInfo;
  adjustedCost: number;
}
