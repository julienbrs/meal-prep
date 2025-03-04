export interface Meal {
    id: string;
    name: string;
    description: string;
    category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    preparationTime: number; // in minutes
    image?: string;
    ingredients: Ingredient[];
    instructions: string[];
    nutrition: NutritionInfo;
  }
  
  export interface Ingredient {
    name: string;
    amount: number;
    unit: string;
  }
  
  export interface NutritionInfo {
    calories: number;
    protein: number; // in grams
    carbs: number; // in grams
    fat: number; // in grams
    fiber?: number; // in grams
    sugar?: number; // in grams
  }