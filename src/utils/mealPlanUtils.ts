import { MealPlanState } from "@/services/dataservice";

// Convert a meal plan to a simple storable format with just IDs
export function simplifyMealPlanForStorage(mealPlan: MealPlanState): any {
  const simplifiedPlan: any = {};

  Object.keys(mealPlan).forEach((day) => {
    simplifiedPlan[day] = {};

    Object.keys(mealPlan[day]).forEach((mealType) => {
      const meal = mealPlan[day][mealType];
      if (meal && meal.id) {
        // Only store the meal ID
        simplifiedPlan[day][mealType] = { id: meal.id };
      } else {
        simplifiedPlan[day][mealType] = null;
      }
    });
  });

  return simplifiedPlan;
}
