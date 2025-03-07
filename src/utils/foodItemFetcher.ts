import { FoodItem } from "@/types/ingredient";
import { loadFoodItems } from "@/services/dataservice";

// Cache for loaded food items
let foodItemsCache: FoodItem[] | null = null;

// Function to ensure food items are loaded
async function ensureFoodItemsLoaded(): Promise<FoodItem[]> {
  if (!foodItemsCache) {
    foodItemsCache = await loadFoodItems();
  }
  return foodItemsCache;
}

// Get a food item by ID
export async function getFoodItemById(
  id: string
): Promise<FoodItem | undefined> {
  const items = await ensureFoodItemsLoaded();
  return items.find((item) => item.id === id);
}

export function getFoodItemByIdSync(id: string): FoodItem | undefined {
  if (!foodItemsCache) {
    console.warn("⚠️ Food items cache empty, forcing reload...");
    
    throw new Error(
      "Food items not loaded. Try refreshing or waiting a moment."
    );
  }
  return foodItemsCache.find((item) => item.id === id);
}

export async function searchFoodItems(query: string): Promise<FoodItem[]> {
  const items = await ensureFoodItemsLoaded();
  const lowerCaseQuery = query.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerCaseQuery) ||
      item.category.toLowerCase().includes(lowerCaseQuery)
  );
}

// Get food items by category
export async function getFoodItemsByCategory(
  category: string
): Promise<FoodItem[]> {
  const items = await ensureFoodItemsLoaded();
  return items.filter((item) => item.category === category);
}

// Get all food items
export async function getAllFoodItems(): Promise<FoodItem[]> {
  return ensureFoodItemsLoaded();
}

// Clear the cache (useful when items are updated)
export function clearFoodItemsCache(): void {
  foodItemsCache = null;
}

// Preload food items (useful for initialization)
export async function preloadFoodItems(): Promise<void> {
  await ensureFoodItemsLoaded();
}
