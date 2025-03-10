export interface FoodItem {
  id: string;
  name: string;
  category: string;
  units: UnitType;
  nutritionPer100g: NutritionInfo;
  price: number;
  priceUnit: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  fiber?: number; // in grams
  sugar?: number; // in grams
}

export type UnitType = "g" | "ml" | "piece" | "tbsp" | "tsp" | "cup";
