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
}

const FoodItemsContext = createContext<FoodItemsContextType | undefined>(
  undefined
);

export function FoodItemsProvider({ children }: { children: React.ReactNode }) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    async function loadFoodItems() {
      console.log("🔄 Initializing FoodItemsContext...");
      await preloadFoodItems();
      const items = await getAllFoodItems();
      setFoodItems(items);
    }

    loadFoodItems().catch((error) =>
      console.error("❌ Error loading food items:", error)
    );
  }, []);

  const reloadFoodItems = async () => {
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
  };

  return (
    <FoodItemsContext.Provider value={{ foodItems, reloadFoodItems }}>
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
