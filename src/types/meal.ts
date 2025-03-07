import { NutritionInfo } from "./ingredient";

export interface Meal {
  id: string;
  name: string;
  description: string;
  category: "breakfast" | "lunch" | "dinner" | "snack";
  preparationTime: number; // in minutes
  image?: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  calculatedNutrition?: NutritionInfo;
  totalCost?: number;
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
