import { MealPlanState } from "@/types/mealPlan";
import { Meal } from "@/types/meal";

export function simplifyMealPlanForStorage(plan: MealPlanState) {
  const simplified: Record<string, any> = {};

  Object.entries(plan).forEach(([day, dayObj]) => {
    const dayStorage: Record<string, any> = {};

    Object.entries(dayObj).forEach(([mealType, entry]) => {
      if (!entry) {
        dayStorage[mealType] = null;
      } else if (Array.isArray(entry)) {
        dayStorage[mealType] = entry.map((snackEntry) => ({
          id: snackEntry.meal.id,
          portions: snackEntry.portions,
        }));
      } else {
        dayStorage[mealType] = {
          id: (entry.meal as Meal).id,
          portions: entry.portions,
        };
      }
    });

    simplified[day] = dayStorage;
  });

  return simplified;
}
