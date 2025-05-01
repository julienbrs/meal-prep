import { FoodItem } from "@/types/ingredient";
import { loadFoodItems } from "@/services/dataservice";

// Cache for loaded food items
let foodItemsCache: FoodItem[] | null = null;

// Function to ensure food items are loaded
async function ensureFoodItemsLoaded(): Promise<FoodItem[]> {
  try {
    if (!foodItemsCache) {
      foodItemsCache = await loadFoodItems();
    }
    return foodItemsCache;
  } catch (error) {
    console.error("Error in ensureFoodItemsLoaded:", error);
    return [];
  }
}

// Get a food item by ID
export async function getFoodItemById(
  id: string
): Promise<FoodItem | undefined> {
  try {
    const items = await ensureFoodItemsLoaded();
    return items.find((item) => item.id === id);
  } catch (error) {
    console.error("Error in getFoodItemById:", error);
    return undefined;
  }
}

export function getFoodItemByIdSync(id: string): FoodItem | undefined {
  if (!foodItemsCache) {
    console.warn("⚠️ Food items cache empty, forcing reload...");
    return undefined;
  }
  return foodItemsCache.find((item) => item.id === id);
}

export async function searchFoodItems(query: string): Promise<FoodItem[]> {
  try {
    const items = await ensureFoodItemsLoaded();
    const lowerCaseQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerCaseQuery) ||
        item.category.toLowerCase().includes(lowerCaseQuery)
    );
  } catch (error) {
    console.error("Error in searchFoodItems:", error);
    return [];
  }
}

// Get food items by category
export async function getFoodItemsByCategory(
  category: string
): Promise<FoodItem[]> {
  try {
    const items = await ensureFoodItemsLoaded();
    return items.filter((item) => item.category === category);
  } catch (error) {
    console.error("Error in getFoodItemsByCategory:", error);
    return [];
  }
}

// Get all food items
export async function getAllFoodItems(): Promise<FoodItem[]> {
  try {
    return ensureFoodItemsLoaded();
  } catch (error) {
    console.error("Error in getAllFoodItems:", error);
    return [];
  }
}

// Clear the cache (useful when items are updated)
export function clearFoodItemsCache(): void {
  foodItemsCache = null;
}

// Preload food items (useful for initialization)
export async function preloadFoodItems(): Promise<void> {
  try {
    await ensureFoodItemsLoaded();
  } catch (error) {
    console.error("Error in preloadFoodItems:", error);
  }
}
