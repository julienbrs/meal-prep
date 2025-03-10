"use client";
import React from "react";
import { Meal, RecipeIngredient } from "@/types/meal";
import { FoodItem } from "@/types/ingredient";

interface IngredientsSectionProps {
  recipeIngredients: RecipeIngredient[];
  newIngredient: Partial<RecipeIngredient>;
  foodItems: FoodItem[];
  addIngredient: (e: React.FormEvent) => void;
  removeIngredient: (index: number) => void;
  handleIngredientChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  getFoodItemName: (id: string) => string;
}

export default function IngredientsSection({
  recipeIngredients,
  newIngredient,
  foodItems,
  addIngredient,
  removeIngredient,
  handleIngredientChange,
  getFoodItemName,
}: IngredientsSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-emerald-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
        Ingredients
      </h2>

      {/* New Ingredient Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="text-md font-medium mb-3 text-gray-700">
          Add Ingredient
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="foodItemId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Food Item *
            </label>
            <select
              id="foodItemId"
              name="foodItemId"
              value={newIngredient.foodItemId}
              onChange={handleIngredientChange}
              className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            >
              <option value="">Select an item</option>
              {foodItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={newIngredient.amount || ""}
              onChange={handleIngredientChange}
              min="0"
              step="0.1"
              className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label
              htmlFor="unit"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Unit *
            </label>
            <select
              id="unit"
              name="unit"
              value={newIngredient.unit}
              onChange={handleIngredientChange}
              className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            >
              <option value="g">Grams (g)</option>
              <option value="ml">Milliliters (ml)</option>
              <option value="piece">Piece</option>
              <option value="tbsp">Tablespoon (tbsp)</option>
              <option value="tsp">Teaspoon (tsp)</option>
              <option value="cup">Cup</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={addIngredient}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            disabled={!newIngredient.foodItemId || !newIngredient.amount}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Ingredient
          </button>
        </div>
      </div>

      {/* Ingredients List */}
      {recipeIngredients && recipeIngredients.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Item
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {recipeIngredients.map((ingredient, index) => (
                <tr
                  key={index}
                  className={ingredient.aiGenerated ? "bg-yellow-50" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 relative">
                    {getFoodItemName(ingredient.foodItemId)}
                    {ingredient.aiGenerated && (
                      <span className="ml-2 text-yellow-600 cursor-pointer relative group">
                        (AI)
                        <div className="absolute hidden group-hover:block bg-white border shadow-lg p-2 rounded-md text-xs text-gray-700 w-64 z-10">
                          AI-generated ingredient.
                          <br />
                          <strong>Estimated Price:</strong>{" "}
                          {ingredient.price?.toFixed(2)} {ingredient.priceUnit}{" "}
                          <br />
                          <strong>Nutrition (per 100g):</strong>
                          {ingredient.nutritionPer100g
                            ? JSON.stringify(ingredient.nutritionPer100g)
                            : "Unknown"}
                        </div>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ingredient.amount} {ingredient.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No ingredients added yet</p>
        </div>
      )}
    </div>
  );
}
