import { FoodItem } from "@/types/ingredient";
import { Meal } from "@/types/meal";
import {
  calculateRecipeNutrition,
  calculateRecipeCost,
} from "@/utils/nutritionCalculator";
import { loadJsonData, saveJsonData } from "@/utils/jsonLoader";

export interface MealPlanDay {
  [key: string]: Meal | null;
}

export interface MealPlanState {
  [key: string]: MealPlanDay;
}

export interface MealPlans {
  [key: string]: MealPlanState;
}

let foodItemsCache: FoodItem[] | null = null;
let mealsCache: Meal[] | null = null;
let mealPlansCache: MealPlans | null = null;

export async function loadFoodItems(): Promise<FoodItem[]> {
  try {
    return await loadJsonData<FoodItem[]>("foodItems");
  } catch (error) {
    console.error("Error loading food items:", error);
    return [];
  }
}

// Function to save food items
export async function saveFoodItems(items: FoodItem[]): Promise<boolean> {
  try {
    const success = await saveJsonData("food-items", items);

    if (success) {
      foodItemsCache = items;
    }

    return success;
  } catch (error) {
    console.error("Error saving food items:", error);
    return false;
  }
}

export async function loadMeals(): Promise<Meal[]> {
  if (mealsCache) {
    return mealsCache;
  }

  try {
    const data = await loadJsonData<Meal[]>("meals");
    mealsCache = data;
    return data;
  } catch (error) {
    console.error("Error loading meals:", error);
    return [];
  }
}

export async function saveMeals(meals: Meal[]): Promise<boolean> {
  try {
    const success = await saveJsonData("meals", meals);

    if (success) {
      mealsCache = meals;
    }

    return success;
  } catch (error) {
    console.error("Error saving meals:", error);
    return false;
  }
}

export async function loadMealPlans(): Promise<MealPlans> {
  if (mealPlansCache) {
    return mealPlansCache;
  }

  try {
    const data = await loadJsonData<MealPlans>("mealPlans");
    mealPlansCache = data;
    return data;
  } catch (error) {
    console.error("Error loading meal plans:", error);
    return { default: {} };
  }
}

export async function saveMealPlans(mealPlans: MealPlans): Promise<boolean> {
  try {
    const success = await saveJsonData("mealPlans", mealPlans);

    if (success) {
      mealPlansCache = mealPlans;
    }

    return success;
  } catch (error) {
    console.error("Error saving meal plans:", error);
    return false;
  }
}

export async function loadMealPlan(
  id: string = "default"
): Promise<MealPlanState> {
  const mealPlans = await loadMealPlans();
  return mealPlans[id] || {};
}

// Function to save a specific meal plan
export async function saveMealPlan(
  mealPlan: MealPlanState,
  id: string = "default"
): Promise<boolean> {
  try {
    const mealPlans = await loadMealPlans();
    mealPlans[id] = mealPlan;
    return saveMealPlans(mealPlans);
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

export async function addFoodItem(item: FoodItem): Promise<boolean> {
  const items = await loadFoodItems();

  if (!item.id) {
    item.id = generateId();
  } else if (items.some((i) => i.id === item.id)) {
    item.id = generateId();
  }

  const updatedItems = [...items, item];
  return saveFoodItems(updatedItems);
}

export async function updateFoodItem(item: FoodItem): Promise<boolean> {
  const items = await loadFoodItems();
  const index = items.findIndex((i) => i.id === item.id);

  if (index === -1) {
    return false;
  }

  items[index] = item;
  return saveFoodItems(items);
}

// Function to delete a food item
export async function deleteFoodItem(id: string): Promise<boolean> {
  const items = await loadFoodItems();
  const filteredItems = items.filter((i) => i.id !== id);

  if (filteredItems.length === items.length) {
    return false;
  }

  return saveFoodItems(filteredItems);
}

export async function addMeal(meal: Meal): Promise<boolean> {
  const meals = await loadMeals();

  if (!meal.id) {
    meal.id = generateId();
  } else if (meals.some((m) => m.id === meal.id)) {
    meal.id = generateId();
  }

  if (!meal.calculatedNutrition) {
    meal.calculatedNutrition = calculateRecipeNutrition(meal.ingredients);
  }

  if (!meal.totalCost) {
    meal.totalCost = calculateRecipeCost(meal.ingredients);
  }

  const updatedMeals = [...meals, meal];
  return saveMeals(updatedMeals);
}

export async function updateMeal(meal: Meal): Promise<boolean> {
  const meals = await loadMeals();
  const index = meals.findIndex((m) => m.id === meal.id);

  if (index === -1) {
    return false;
  }

  meal.calculatedNutrition = calculateRecipeNutrition(meal.ingredients);
  meal.totalCost = calculateRecipeCost(meal.ingredients);

  meals[index] = meal;
  return saveMeals(meals);
}

export async function deleteMeal(id: string): Promise<boolean> {
  const meals = await loadMeals();
  const filteredMeals = meals.filter((m) => m.id !== id);

  if (filteredMeals.length === meals.length) {
    return false;
  }

  return saveMeals(filteredMeals);
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

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function clearCache(): void {
  foodItemsCache = null;
  mealsCache = null;
  mealPlansCache = null;
}
