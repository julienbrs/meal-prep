import { foodItems } from "@/data/foodItems";
import { FoodItem } from "@/types/ingredient";

export function getFoodItemById(id: string): FoodItem | undefined {
  return foodItems.find((item) => item.id === id);
}

export function searchFoodItems(query: string): FoodItem[] {
  const lowerCaseQuery = query.toLowerCase();
  return foodItems.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerCaseQuery) ||
      item.category.toLowerCase().includes(lowerCaseQuery)
  );
}

export function getFoodItemsByCategory(category: string): FoodItem[] {
  return foodItems.filter((item) => item.category === category);
}
