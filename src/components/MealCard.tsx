import React from "react";
import Link from "next/link";
import { Meal } from "../types/meal";

interface MealCardProps {
  meal: Meal;
}

export default function MealCard({ meal }: MealCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        {meal.image ? (
          <img
            src={meal.image}
            alt={meal.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gradient-to-r from-gray-100 to-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-16 h-16 text-gray-400"
            >
              <path d="M11.25 3v4.046a3 3 0 0 0-4.277 4.204H1.5v-6A2.25 2.25 0 0 1 3.75 3h7.5ZM12.75 3h7.5a2.25 2.25 0 0 1 2.25 2.25v6h-5.472A3 3 0 0 0 12.75 7.046V3ZM13.5 12.75h-3a2.25 2.25 0 0 0-2.25 2.25v4.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-4.5a2.25 2.25 0 0 0-2.25-2.25h-4.5Z" />
              <path d="M14.25 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full uppercase tracking-wide shadow-md">
            {meal.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="mb-3">
          <h2 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors duration-200">
            {meal.name}
          </h2>
          <p className="text-gray-600 text-sm line-clamp-2">
            {meal.description}
          </p>
        </div>

        <div className="flex justify-between items-center text-sm mb-4">
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
            <span className="text-gray-600">{meal.preparationTime} mins</span>
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
              {meal.nutrition.calories} cal
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-red-50 rounded-lg p-2 text-center">
            <span className="block text-xs text-red-800 font-medium">
              {meal.nutrition.protein}g
            </span>
            <span className="block text-xs text-red-600">Protein</span>
          </div>
          <div className="bg-yellow-50 rounded-lg p-2 text-center">
            <span className="block text-xs text-yellow-800 font-medium">
              {meal.nutrition.carbs}g
            </span>
            <span className="block text-xs text-yellow-600">Carbs</span>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <span className="block text-xs text-green-800 font-medium">
              {meal.nutrition.fat}g
            </span>
            <span className="block text-xs text-green-600">Fat</span>
          </div>
        </div>

        <Link
          href={`/meals/${meal.id}`}
          className="block w-full text-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-2 rounded-lg transition-all duration-200 transform hover:scale-105 font-medium"
        >
          View Recipe
        </Link>
      </div>
    </div>
  );
}
