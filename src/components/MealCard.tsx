import React from "react";
import Link from "next/link";
import { Meal } from "../types/meal";

interface MealCardProps {
  meal: Meal;
}

export default function MealCard({ meal }: MealCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="h-48 bg-gray-200">
        {meal.image ? (
          <img
            src={meal.image}
            alt={meal.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No image available
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-gray-800">{meal.name}</h2>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full capitalize">
            {meal.category}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {meal.description}
        </p>
        <div className="flex justify-between items-center text-sm mb-4">
          <span className="text-gray-500">{meal.preparationTime} mins</span>
          <span className="font-semibold text-purple-600">
            {meal.nutrition.calories} cal
          </span>
        </div>
        <div className="flex justify-between text-xs mb-4">
          <span className="bg-red-50 text-red-700 px-2 py-1 rounded">
            P: {meal.nutrition.protein}g
          </span>
          <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
            C: {meal.nutrition.carbs}g
          </span>
          <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
            F: {meal.nutrition.fat}g
          </span>
        </div>
        <Link
          href={`/meals/${meal.id}`}
          className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
