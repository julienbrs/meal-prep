"use client";
import React, { useState, useEffect } from "react";
import { addFoodItem } from "@/services/dataservice";
import { UnitType } from "@/types/ingredient";

export default function CreateFoodItemModal({
  missingIngredients,
  onClose,
  onComplete,
}: {
  missingIngredients: any[];
  onClose: () => void;
  onComplete: () => void;
}) {
  const [foodItems, setFoodItems] = useState(
    missingIngredients.map((ing) => {
      const unit =
        ing.unit &&
        ["g", "ml", "piece", "tbsp", "tsp", "cup"].includes(ing.unit)
          ? (ing.unit as UnitType)
          : "g";

      return {
        id: ing.name.toLowerCase().replace(/\s+/g, "-"),
        name: ing.name,
        category: "misc", // Default to misc, user will select proper category
        units: unit,
        price: 0,
        priceUnit: unit === "piece" ? "per piece" : "per 100g",
        nutritionPer100g: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
        },
      };
    })
  );

  useEffect(() => {
    foodItems.forEach((item, index) => {
      if (item.units === "piece" && item.priceUnit !== "per piece") {
        handleChange(index, "priceUnit", "per piece");
      } else if (item.units !== "piece" && item.priceUnit === "per piece") {
        handleChange(index, "priceUnit", "per 100g");
      }
    });
  }, [foodItems.map((item) => item.units).join(",")]);

  const handleChange = (index: number, field: string, value: any) => {
    setFoodItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleNutritionChange = (index: number, field: string, value: any) => {
    setFoodItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index
          ? {
              ...item,
              nutritionPer100g: {
                ...item.nutritionPer100g,
                [field]: parseFloat(value) || 0,
              },
            }
          : item
      )
    );
  };

  const handleSave = async () => {
    for (const item of foodItems) {
      await addFoodItem(item);
    }
    onComplete();
  };

  const getNutritionLabel = (index: number): string => {
    const item = foodItems[index];
    return item.units === "piece"
      ? "Nutrition (per piece)"
      : "Nutrition (per 100g)";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Create Missing Food Items ({foodItems.length})
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-gray-600 mb-4 border-l-4 border-green-500 pl-3 py-2 bg-green-50 rounded">
            These ingredients were not found in your food database. Please
            complete the information below to add them.
          </p>

          {foodItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full inline-flex items-center justify-center text-sm mr-2">
                    {index + 1}
                  </span>
                  {item.name}
                </h3>
                {foodItems.length > 1 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Item {index + 1} of {foodItems.length}
                  </span>
                )}
              </div>

              {/* Name & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={item.category}
                    onChange={(e) =>
                      handleChange(index, "category", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="misc">Misc</option>
                    <option value="vegetable">Vegetable</option>
                    <option value="fruit">Fruit</option>
                    <option value="dairy">Dairy</option>
                    <option value="protein">Protein</option>
                    <option value="meat">Meat</option>
                    <option value="grain">Grain</option>
                    <option value="spice">Spice</option>
                    <option value="condiment">Condiment</option>
                    <option value="fat">Fat</option>
                  </select>
                </div>
              </div>

              {/* Units & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Units
                  </label>
                  <select
                    value={item.units}
                    onChange={(e) =>
                      handleChange(index, "units", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="piece">Piece</option>
                    <option value="tbsp">Tablespoon (tbsp)</option>
                    <option value="tsp">Teaspoon (tsp)</option>
                    <option value="cup">Cup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {item.units === "piece"
                      ? "Price per piece ($)"
                      : "Price per 100g ($)"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handleChange(index, "price", parseFloat(e.target.value))
                      }
                      className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Nutrition Information */}
              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  {getNutritionLabel(index)}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  {[
                    { name: "calories", label: "Calories" },
                    { name: "protein", label: "Protein (g)" },
                    { name: "carbs", label: "Carbs (g)" },
                    { name: "fat", label: "Fat (g)" },
                    { name: "fiber", label: "Fiber (g)" },
                    { name: "sugar", label: "Sugar (g)" },
                  ].map((nutrient) => (
                    <div key={nutrient.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {nutrient.label}
                      </label>
                      <input
                        type="number"
                        value={
                          item.nutritionPer100g[
                            nutrient.name as keyof typeof item.nutritionPer100g
                          ]
                        }
                        onChange={(e) =>
                          handleNutritionChange(
                            index,
                            nutrient.name,
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with action buttons */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200 sticky bottom-0 z-10 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all transform hover:scale-105"
          >
            Save All Items
          </button>
        </div>
      </div>
    </div>
  );
}
