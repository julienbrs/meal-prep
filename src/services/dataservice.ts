import { FoodItem } from "@/types/ingredient";
import { Meal } from "@/types/meal";
import {
  calculateRecipeNutrition,
  calculateRecipeCost,
} from "@/utils/nutritionCalculator";

// Cache for the data
let foodItemsCache: FoodItem[] | null = null;
let mealsCache: Meal[] | null = null;

// Function to load food items
export async function loadFoodItems(): Promise<FoodItem[]> {
  if (foodItemsCache) {
    return foodItemsCache;
  }

  try {
    const response = await fetch("/data/foodItems.json");
    if (!response.ok) {
      throw new Error(`Failed to load food items: ${response.status}`);
    }

    const data = await response.json();
    foodItemsCache = data;
    return data;
  } catch (error) {
    console.error("Error loading food items:", error);
    return [];
  }
}

// Function to save food items
export async function saveFoodItems(items: FoodItem[]): Promise<boolean> {
  try {
    const response = await fetch("/api/food-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      console.log("response saveFoodItems:", response);
      throw new Error(`Failed to save food items: ${response.status}`);
    }

    // Update cache
    foodItemsCache = items;
    return true;
  } catch (error) {
    console.error("Error saving food items:", error);
    return false;
  }
}

// Function to load meals
export async function loadMeals(): Promise<Meal[]> {
  if (mealsCache) {
    return mealsCache;
  }

  try {
    const response = await fetch("/data/meals.json");
    if (!response.ok) {
      console.log("response loadmeals:", response);
      throw new Error(`Failed to load meals: ${response.status}`);
    }

    const data = await response.json();
    mealsCache = data;
    return data;
  } catch (error) {
    console.error("Error loading meals:", error);
    return [];
  }
}

// Function to save meals
export async function saveMeals(meals: Meal[]): Promise<boolean> {
  try {
    const response = await fetch("/api/meals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meals),
    });

    if (!response.ok) {
      throw new Error(`Failed to save meals: ${response.status}`);
    }

    // Update cache
    mealsCache = meals;
    return true;
  } catch (error) {
    console.error("Error saving meals:", error);
    return false;
  }
}

// Function to add a new food item
export async function addFoodItem(item: FoodItem): Promise<boolean> {
  const items = await loadFoodItems();

  // Ensure the ID is unique
  if (!item.id) {
    item.id = generateId();
  } else if (items.some((i) => i.id === item.id)) {
    // If ID already exists, generate a new one
    item.id = generateId();
  }

  const updatedItems = [...items, item];
  return saveFoodItems(updatedItems);
}

// Function to update an existing food item
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
    return false; // No item was found with the provided ID
  }

  return saveFoodItems(filteredItems);
}

// Function to add a new meal
export async function addMeal(meal: Meal): Promise<boolean> {
  const meals = await loadMeals();

  // Ensure the ID is unique
  if (!meal.id) {
    meal.id = generateId();
  } else if (meals.some((m) => m.id === meal.id)) {
    // If ID already exists, generate a new one
    meal.id = generateId();
  }

  // Calculate nutrition and cost if not provided
  if (!meal.calculatedNutrition) {
    meal.calculatedNutrition = calculateRecipeNutrition(meal.ingredients);
  }

  if (!meal.totalCost) {
    meal.totalCost = calculateRecipeCost(meal.ingredients);
  }

  const updatedMeals = [...meals, meal];
  return saveMeals(updatedMeals);
}

// Function to update an existing meal
export async function updateMeal(meal: Meal): Promise<boolean> {
  const meals = await loadMeals();
  const index = meals.findIndex((m) => m.id === meal.id);

  if (index === -1) {
    return false;
  }

  // Recalculate nutrition and cost
  meal.calculatedNutrition = calculateRecipeNutrition(meal.ingredients);
  meal.totalCost = calculateRecipeCost(meal.ingredients);

  meals[index] = meal;
  return saveMeals(meals);
}

// Function to delete a meal
export async function deleteMeal(id: string): Promise<boolean> {
  const meals = await loadMeals();
  const filteredMeals = meals.filter((m) => m.id !== id);

  if (filteredMeals.length === meals.length) {
    return false; // No meal was found with the provided ID
  }

  return saveMeals(filteredMeals);
}

// Helper function to generate a unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Clear cache (useful for testing or when you want to force a refresh)
export function clearCache(): void {
  foodItemsCache = null;
  mealsCache = null;
}
