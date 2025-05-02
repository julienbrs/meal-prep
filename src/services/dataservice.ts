import { FoodItem } from "@/types/ingredient";
import { Meal } from "@/types/meal";
import {
  calculateRecipeNutrition,
  calculateRecipeCost,
} from "@/utils/nutritionCalculator";

export interface MealPlanDay {
  [key: string]: Meal | null;
}

export interface MealPlanState {
  [key: string]: MealPlanDay;
}

export interface MealPlans {
  [key: string]: MealPlanState;
}

// Client-side caches to minimize API calls
let foodItemsCache: FoodItem[] | null = null;
let mealsCache: Meal[] | null = null;
let mealPlansCache: MealPlans | null = null;

// Clear caches for food items
export function clearFoodItemsCache(): void {
  foodItemsCache = null;
}

// Clear caches for meals
export function clearMealsCache(): void {
  mealsCache = null;
}

// Clear caches for meal plans
export function clearMealPlansCache(): void {
  mealPlansCache = null;
}

// Helper function to fetch data from API
async function fetchFromApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = window.location.origin;
  const response = await fetch(`${baseUrl}/api/${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return (await response.json()) as T;
}

// Food Items API Functions
export async function loadFoodItems(): Promise<FoodItem[]> {
  if (foodItemsCache) {
    return foodItemsCache;
  }

  try {
    const data = await fetchFromApi<FoodItem[]>("food-items");
    foodItemsCache = data;
    return data;
  } catch (error) {
    console.error("Error loading food items:", error);
    return [];
  }
}

export async function addFoodItem(item: FoodItem): Promise<boolean> {
  try {
    if (!item.id) {
      item.id = generateId();
    }

    const response = await fetchFromApi<{ success: boolean; item: FoodItem }>(
      "food-items",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      }
    );

    if (response.success) {
      clearFoodItemsCache();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error adding food item:", error);
    return false;
  }
}

export async function updateFoodItem(item: FoodItem): Promise<boolean> {
  try {
    const response = await fetchFromApi<{ success: boolean }>(
      `food-items/${item.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      }
    );

    if (response.success) {
      clearFoodItemsCache();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating food item:", error);
    return false;
  }
}

export async function deleteFoodItem(id: string): Promise<boolean> {
  try {
    const response = await fetchFromApi<{ success: boolean }>(
      `food-items/${id}`,
      {
        method: "DELETE",
      }
    );

    if (response.success) {
      clearFoodItemsCache();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting food item:", error);
    return false;
  }
}

// Meals API Functions
export async function loadMeals(): Promise<Meal[]> {
  if (mealsCache) {
    return mealsCache;
  }

  try {
    const data = await fetchFromApi<Meal[]>("meals");
    mealsCache = data;
    return data;
  } catch (error) {
    console.error("Error loading meals:", error);
    return [];
  }
}

export async function addMeal(
  meal: Meal,
  foodItems: FoodItem[]
): Promise<boolean> {
  try {
    if (!meal.id) {
      meal.id = generateId();
    }

    if (!meal.createdBy) {
      meal.createdBy = "clara";
    }

    // Convert "To taste" to 0 for database compatibility
    if (meal.ingredients) {
      meal.ingredients = meal.ingredients.map((ingredient) => {
        if (
          typeof ingredient.amount === "string" &&
          ingredient.amount === "To taste"
        ) {
          return {
            ...ingredient,
            amount: 0, // Set to 0 instead of keeping as string
          };
        }
        return ingredient;
      });
    }

    // Calculate nutrition and cost if not already provided
    if (!meal.calculatedNutrition) {
      meal.calculatedNutrition = calculateRecipeNutrition(
        meal.ingredients,
        foodItems
      );
    }

    if (!meal.totalCost) {
      meal.totalCost = calculateRecipeCost(meal.ingredients, foodItems);
    }

    const response = await fetchFromApi<{ success: boolean; meal: Meal }>(
      "meals",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(meal),
      }
    );

    if (response.success) {
      clearMealsCache();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error adding meal:", error);
    return false;
  }
}

export async function updateMeal(
  meal: Meal,
  foodItems: FoodItem[]
): Promise<boolean> {
  try {
    // Recalculate nutrition and cost
    meal.calculatedNutrition = calculateRecipeNutrition(
      meal.ingredients,
      foodItems
    );
    meal.totalCost = calculateRecipeCost(meal.ingredients, foodItems);

    const response = await fetchFromApi<{ success: boolean }>(
      `meals/${meal.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(meal),
      }
    );

    if (response.success) {
      clearMealsCache();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating meal:", error);
    return false;
  }
}

export async function deleteMeal(id: string): Promise<boolean> {
  try {
    const response = await fetchFromApi<{ success: boolean }>(`meals/${id}`, {
      method: "DELETE",
    });

    if (response.success) {
      clearMealsCache();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting meal:", error);
    return false;
  }
}

// Meal Plans API Functions
export async function loadMealPlans(): Promise<MealPlans> {
  if (mealPlansCache) {
    return mealPlansCache;
  }

  try {
    const data = await fetchFromApi<MealPlans>("mealPlans");
    mealPlansCache = data;
    return data;
  } catch (error) {
    console.error("Error loading meal plans:", error);
    return { default: {} };
  }
}

export async function loadMealPlan(
  id: string = "default"
): Promise<MealPlanState> {
  try {
    const response = await fetchFromApi<MealPlanState>(`mealPlans/${id}`);
    return response;
  } catch (error) {
    console.error(`Error loading meal plan ${id}:`, error);

    // If plan doesn't exist, try to get all plans and extract the one we want
    try {
      const allPlans = await loadMealPlans();
      return allPlans[id] || {};
    } catch {
      return {};
    }
  }
}

export async function saveMealPlan(
  mealPlan: MealPlanState,
  id: string = "default"
): Promise<boolean> {
  try {
    const response = await fetchFromApi<{ success: boolean }>(
      `mealPlans/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mealPlan),
      }
    );

    if (response.success) {
      clearMealPlansCache();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error saving meal plan:", error);
    return false;
  }
}

export async function hydrateMealPlan(
  mealPlan: MealPlanState
): Promise<MealPlanState> {
  try {
    const meals = await loadMeals();
    const hydratedPlan: MealPlanState = {};

    Object.keys(mealPlan).forEach((day) => {
      hydratedPlan[day] = {};

      Object.keys(mealPlan[day]).forEach((mealType) => {
        const mealData = mealPlan[day][mealType];

        if (mealData && typeof mealData === "object" && "id" in mealData) {
          // Find the corresponding meal in our loaded meals
          const meal = meals.find((m) => m.id === mealData.id);
          hydratedPlan[day][mealType] = meal || null;
        } else {
          hydratedPlan[day][mealType] = null;
        }
      });
    });

    return hydratedPlan;
  } catch (error) {
    console.error("Error hydrating meal plan:", error);
    return mealPlan;
  }
}

export function createEmptyMealPlan(
  daysOfWeek: string[],
  mealTypes: string[]
): MealPlanState {
  const plan: MealPlanState = {};
  daysOfWeek.forEach((day) => {
    plan[day] = {};
    mealTypes.forEach((mealType) => {
      plan[day][mealType] = null;
    });
  });
  return plan;
}

// Helper function to generate unique IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
