import { Meal, RecipeIngredient } from "@/types/meal";
import { NutritionInfo } from "@/types/ingredient";

/* Repas ad-hoc (non stocké en DB) */
export interface CustomMeal {
  type: "custom";
  tempId: string;
  name: string;
  ingredients: RecipeIngredient[];
  /* facultatif : si tu veux pré-calculer */
  calculatedNutrition?: NutritionInfo;
  totalCost?: number;
}

/* Repas planifié = recette catalogue  OU  repas libre */
export interface MealPlanEntry {
  meal: Meal | CustomMeal;
  portions: number;
}

export type SnackEntry = MealPlanEntry;
export type DayPlan = { [key: string]: MealPlanEntry | SnackEntry[] | null };
export type MealPlanState = Record<string, DayPlan>;

/* utilitaire (importable) */
export const isCatalogMeal = (m: Meal | CustomMeal): m is Meal =>
  (m as Meal).categories !== undefined;
