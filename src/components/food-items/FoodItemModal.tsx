import React, { useState, useEffect } from "react";
import { FoodItem, UnitType } from "@/types/ingredient";

interface FoodItemModalProps {
  item?: FoodItem;
  onSave: (item: FoodItem) => void;
  onClose: () => void;
}

const FoodItemModal: React.FC<FoodItemModalProps> = ({
  item,
  onSave,
  onClose,
}) => {
  const [foodItem, setFoodItem] = useState<FoodItem>(
    item || {
      id: "",
      name: "",
      category: "",
      units: "g" as UnitType,
      nutritionPer100g: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
      },
      price: 0,
      priceUnit: "per 100g",
    }
  );

  useEffect(() => {
    // Update priceUnit when units change
    if (foodItem.units === "piece" && foodItem.priceUnit !== "per piece") {
      setFoodItem((prev) => ({ ...prev, priceUnit: "per piece" }));
    } else if (
      foodItem.units !== "piece" &&
      foodItem.priceUnit === "per piece"
    ) {
      setFoodItem((prev) => ({ ...prev, priceUnit: "per 100g" }));
    }
  }, [foodItem.units]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: string
  ) => {
    const value =
      e.target.type === "number"
        ? parseFloat(e.target.value) || 0
        : e.target.value;

    setFoodItem((prev) => ({ ...prev, [key]: value }));
  };

  const handleNutritionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    nutrient: string
  ) => {
    const value = parseFloat(e.target.value) || 0;

    setFoodItem((prev) => ({
      ...prev,
      nutritionPer100g: {
        ...prev.nutritionPer100g,
        [nutrient]: value,
      },
    }));
  };

  const categories = [
    { value: "vegetable", label: "Vegetable" },
    { value: "fruit", label: "Fruit" },
    { value: "dairy", label: "Dairy" },
    { value: "protein", label: "Protein" },
    { value: "meat", label: "Meat" },
    { value: "grain", label: "Grain" },
    { value: "spice", label: "Spice" },
    { value: "condiment", label: "Condiment" },
    { value: "fat", label: "Fat" },
    { value: "misc", label: "Misc" },
  ];

  const units: { value: UnitType; label: string }[] = [
    { value: "g", label: "Grams (g)" },
    { value: "ml", label: "Milliliters (ml)" },
    { value: "piece", label: "Piece" },
    { value: "tbsp", label: "Tablespoon (tbsp)" },
    { value: "tsp", label: "Teaspoon (tsp)" },
    { value: "cup", label: "Cup" },
  ];

  const getNutritionLabel = (): string => {
    return foodItem.units === "piece"
      ? "Nutrition (per piece)"
      : "Nutrition (per 100g)";
  };

  return (
    <div className="fixed inset-y-0 right-0 flex z-50">
      <div className="w-screen max-w-2xl bg-white shadow-lg flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex justify-between items-center">
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
            {item ? `Edit ${item.name}` : "Add New Food Item"}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={foodItem.name}
                  onChange={(e) => handleInputChange(e, "name")}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={foodItem.category}
                  onChange={(e) => handleInputChange(e, "category")}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Units & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Units
                </label>
                <select
                  value={foodItem.units}
                  onChange={(e) => handleInputChange(e, "units")}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {foodItem.units === "piece"
                    ? "Price per piece ($)"
                    : "Price per 100g ($)"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    value={foodItem.price}
                    onChange={(e) => handleInputChange(e, "price")}
                    className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Nutrition Information */}
            <div>
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
                {getNutritionLabel()}
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
                        foodItem.nutritionPer100g[
                          nutrient.name as keyof typeof foodItem.nutritionPer100g
                        ]
                      }
                      onChange={(e) => handleNutritionChange(e, nutrient.name)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      min="0"
                      step="0.1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(foodItem)}
            disabled={!foodItem.name || !foodItem.category}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {item ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodItemModal;
