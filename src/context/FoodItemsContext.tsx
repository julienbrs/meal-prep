"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  preloadFoodItems,
  getAllFoodItems,
  clearFoodItemsCache,
} from "@/utils/foodItemFetcher";
import { FoodItem } from "@/types/ingredient";

interface FoodItemsContextType {
  foodItems: FoodItem[];
  reloadFoodItems: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const FoodItemsContext = createContext<FoodItemsContextType | undefined>(
  undefined
);

export function FoodItemsProvider({ children }: { children: React.ReactNode }) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFoodItems() {
      setIsLoading(true);
      setError(null);
      try {
        console.log("🔄 Initializing FoodItemsContext...");
        await preloadFoodItems();
        const items = await getAllFoodItems();
        setFoodItems(items);
      } catch (error) {
        console.error("❌ Error loading food items:", error);
        setError("Failed to load food items. Please try again later.");
        // Set empty array as fallback
        setFoodItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadFoodItems();
  }, []);

  const reloadFoodItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      clearFoodItemsCache();
      console.log("🔄 Reloading food items...");
      await preloadFoodItems();
      const items = await getAllFoodItems();

      setFoodItems((prevItems) => {
        if (JSON.stringify(prevItems) !== JSON.stringify(items)) {
          console.log("✅ Food items updated:", items);
          return items;
        }
        return prevItems;
      });
    } catch (error) {
      console.error("❌ Error reloading food items:", error);
      setError("Failed to reload food items. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FoodItemsContext.Provider
      value={{ foodItems, reloadFoodItems, isLoading, error }}
    >
      {children}
    </FoodItemsContext.Provider>
  );
}

export function useFoodItems() {
  const context = useContext(FoodItemsContext);
  if (!context) {
    throw new Error("useFoodItems must be used within a FoodItemsProvider");
  }
  return context;
}
