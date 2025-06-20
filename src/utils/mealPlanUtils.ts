import { isCatalogMeal, MealPlanState } from "@/types/mealPlan";
import { Meal } from "@/types/meal";

export function simplifyMealPlanForStorage(plan: MealPlanState) {
  const simplified: Record<string, any> = {};

  Object.entries(plan).forEach(([day, dayObj]) => {
    const dayStorage: Record<string, any> = {};

    Object.entries(dayObj).forEach(([mealType, entry]) => {
      if (!entry) {
        dayStorage[mealType] = null;
      } else if (Array.isArray(entry)) {
        // Cas : snacks = tableau de SnackEntry
        dayStorage[mealType] = entry.map((snackEntry) => ({
          id: isCatalogMeal(snackEntry.meal)
            ? snackEntry.meal.id
            : snackEntry.meal.tempId,
          portions: snackEntry.portions,
        }));
      } else {
        // Cas : repas normal (MealPlanEntry)
        dayStorage[mealType] = {
          id: isCatalogMeal(entry.meal) ? entry.meal.id : entry.meal.tempId,
          portions: entry.portions,
        };
      }
    });

    simplified[day] = dayStorage;
  });

  return simplified;
}
