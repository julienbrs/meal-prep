import React, { useState } from "react";
import { Meal } from "../types/meal";

interface MealPlanCardProps {
  day: string;
  mealType: string;
  meal: Meal | null;
  meals: Meal[];
  onAddMeal: (day: string, mealType: string, mealId: string) => void;
  onRemoveMeal: (day: string, mealType: string) => void;
}

export default function MealPlanCard({
  day,
  mealType,
  meal,
  meals,
  onAddMeal,
  onRemoveMeal,
}: MealPlanCardProps) {
  const [isSelecting, setIsSelecting] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-bold text-gray-800">{mealType}</h3>
      </div>

      {!meal && !isSelecting ? (
        <div className="p-4 flex items-center justify-center min-h-40">
          <button
            onClick={() => setIsSelecting(true)}
            className="text-blue-500 hover:text-blue-700"
          >
            + Add meal
          </button>
        </div>
      ) : isSelecting ? (
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select a meal:
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              onChange={(e) => {
                onAddMeal(day, mealType, e.target.value);
                setIsSelecting(false);
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Choose a meal...
              </option>
              {meals.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setIsSelecting(false)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-gray-800">{meal?.name}</h4>
            <button
              onClick={() => onRemoveMeal(day, mealType)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {meal?.description?.substring(0, 80)}...
          </div>
          <div className="flex justify-between text-xs">
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
              {meal?.nutrition?.calories} cal
            </span>
            <span className="bg-red-50 text-red-700 px-2 py-1 rounded">
              P: {meal?.nutrition.protein}g
            </span>
            <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
              F: {meal?.nutrition.fat}g
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
