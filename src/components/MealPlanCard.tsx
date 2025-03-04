// src/components/MealPlanCard.tsx
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

  // Background colors based on meal type
  const getBgColor = () => {
    switch (mealType) {
      case "Breakfast":
        return "bg-amber-50 border-amber-200";
      case "Lunch":
        return "bg-emerald-50 border-emerald-200";
      case "Dinner":
        return "bg-emerald-50 border-emerald-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  // Header colors based on meal type
  const getHeaderColor = () => {
    switch (mealType) {
      case "Breakfast":
        return "bg-amber-100 text-amber-800";
      case "Lunch":
        return "bg-emerald-100 text-emerald-800";
      case "Dinner":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Button colors based on meal type
  const getButtonColor = () => {
    switch (mealType) {
      case "Breakfast":
        return "text-amber-600 hover:text-amber-800 hover:bg-amber-100";
      case "Lunch":
        return "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100";
      case "Dinner":
        return "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100";
      default:
        return "text-gray-600 hover:text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div
      className={`rounded-xl shadow-md overflow-hidden border ${getBgColor()} transition-all duration-200 hover:shadow-lg`}
    >
      <div className={`p-3 border-b ${getHeaderColor()}`}>
        <h3 className="font-bold flex items-center">
          {mealType === "Breakfast" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 mr-1"
            >
              <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
              <path
                fillRule="evenodd"
                d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {mealType === "Lunch" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 mr-1"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {mealType === "Dinner" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 mr-1"
            >
              <path
                fillRule="evenodd"
                d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {mealType}
        </h3>
      </div>

      {!meal && !isSelecting ? (
        <div className="p-4 flex items-center justify-center min-h-40">
          <button
            onClick={() => setIsSelecting(true)}
            className={`rounded-full px-4 py-2 ${getButtonColor()} transition-colors duration-200 flex items-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 mr-1"
            >
              <path
                fillRule="evenodd"
                d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                clipRule="evenodd"
              />
            </svg>
            Add meal
          </button>
        </div>
      ) : isSelecting ? (
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select a meal:
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
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
            className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1 rounded hover:bg-gray-100 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 mb-1">{meal?.name}</h4>
              <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                {meal?.description}
              </div>
            </div>
            <button
              onClick={() => onRemoveMeal(day, mealType)}
              className="ml-2 text-red-500 hover:text-red-700 text-sm p-1 hover:bg-red-50 rounded-full transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="flex justify-between items-center text-sm mb-3">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-gray-500 mr-1"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-600">
                {meal?.preparationTime} mins
              </span>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-purple-500 mr-1"
              >
                <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648l8.628 5.033Z" />
              </svg>
              <span className="font-semibold text-purple-600">
                {meal?.nutrition.calories} cal
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-red-50 rounded-lg p-1 text-center">
              <span className="block text-xs text-red-800 font-medium">
                {meal?.nutrition.protein}g
              </span>
              <span className="block text-xs text-red-600">Protein</span>
            </div>
            <div className="bg-yellow-50 rounded-lg p-1 text-center">
              <span className="block text-xs text-yellow-800 font-medium">
                {meal?.nutrition.carbs}g
              </span>
              <span className="block text-xs text-yellow-600">Carbs</span>
            </div>
            <div className="bg-green-50 rounded-lg p-1 text-center">
              <span className="block text-xs text-green-800 font-medium">
                {meal?.nutrition.fat}g
              </span>
              <span className="block text-xs text-green-600">Fat</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
