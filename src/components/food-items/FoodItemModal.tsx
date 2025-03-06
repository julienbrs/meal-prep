import React, { useState } from "react";
import { FoodItem } from "@/types/ingredient";

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
      units: "g",
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

  // Common categories for food items
  const commonCategories = [
    "protein",
    "grain",
    "vegetable",
    "fruit",
    "dairy",
    "fat",
    "spice",
    "condiment",
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-green-500 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {item ? `Edit ${item.name}` : "Add New Food Item"}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-100">
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
        <div className="p-6">
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={foodItem.name}
                onChange={(e) => handleInputChange(e, "name")}
              />
            </div>

            {/* Category Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={foodItem.category}
                onChange={(e) => handleInputChange(e, "category")}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {commonCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Units and Price Fields */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Units
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={foodItem.units}
                  onChange={(e) => handleInputChange(e, "units")}
                />
              </div>

              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-2 pl-7 border border-gray-300 rounded"
                    value={foodItem.price}
                    onChange={(e) => handleInputChange(e, "price")}
                  />
                </div>
              </div>
            </div>

            {/* Price Unit Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Unit
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={foodItem.priceUnit}
                onChange={(e) => handleInputChange(e, "priceUnit")}
                placeholder="e.g., per 100g"
              />
            </div>

            {/* Nutrition Section */}
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-green-500"
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
                Nutrition (per 100g)
              </h3>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories (Kcal)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={foodItem.nutritionPer100g.calories}
                    onChange={(e) => handleNutritionChange(e, "calories")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Protein (G)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={foodItem.nutritionPer100g.protein}
                    onChange={(e) => handleNutritionChange(e, "protein")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carbs (G)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={foodItem.nutritionPer100g.carbs}
                    onChange={(e) => handleNutritionChange(e, "carbs")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fat (G)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={foodItem.nutritionPer100g.fat}
                    onChange={(e) => handleNutritionChange(e, "fat")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiber (G)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={foodItem.nutritionPer100g.fiber}
                    onChange={(e) => handleNutritionChange(e, "fiber")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sugar (G)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={foodItem.nutritionPer100g.sugar}
                    onChange={(e) => handleNutritionChange(e, "sugar")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(foodItem)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={!foodItem.name || !foodItem.category}
          >
            {item ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodItemModal;
