import { Meal } from "@/types/meal";

export interface MealPlanEntry {
  meal: Meal;
  portions: number;
}

export type SnackEntry = MealPlanEntry;

export type DayPlan = {
  [key: string]: MealPlanEntry | SnackEntry[] | null;
};

// Enfin, “MealPlanState” est une map Jours → DayPlan
export type MealPlanState = Record<string, DayPlan>;
