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
}
