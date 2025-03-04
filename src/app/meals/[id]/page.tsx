"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { sampleMeals } from "../../../data/meals";

export default function MealDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const meal = sampleMeals.find((m) => m.id === id);

  if (!meal) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Meal Not Found
        </h1>
        <p className="mb-6">The meal you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-block mb-6 text-blue-500 hover:text-blue-700"
      >
        &larr; Back to All Recipes
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 bg-gray-200 h-64 md:h-auto">
            <div className="h-full flex items-center justify-center text-gray-500">
              {meal.image ? (
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>No image available</span>
              )}
            </div>
          </div>
          <div className="md:w-1/2 p-6">
            <div className="uppercase tracking-wide text-sm text-green-500 font-semibold">
              {meal.category}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mt-2 mb-4">
              {meal.name}
            </h1>
            <p className="text-gray-600 mb-4">{meal.description}</p>
            <p className="text-gray-700 mb-4">
              <span className="font-semibold">Preparation Time:</span>{" "}
              {meal.preparationTime} minutes
            </p>

            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                Nutrition Information
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {meal.nutrition.calories}
                  </p>
                  <p className="text-sm text-gray-600">Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {meal.nutrition.protein}g
                  </p>
                  <p className="text-sm text-gray-600">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {meal.nutrition.carbs}g
                  </p>
                  <p className="text-sm text-gray-600">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {meal.nutrition.fat}g
                  </p>
                  <p className="text-sm text-gray-600">Fat</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="md:flex">
            <div className="md:w-1/2 md:pr-8 mb-6 md:mb-0">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Ingredients
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                {meal.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-gray-700">
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Instructions
              </h2>
              <ol className="list-decimal pl-6 space-y-2">
                {meal.instructions.map((step, index) => (
                  <li key={index} className="text-gray-700">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
