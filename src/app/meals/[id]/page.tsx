"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  calculateRecipeNutrition,
  calculateRecipeCost,
} from "@/utils/nutritionCalculator";
import { getFoodItemById } from "@/utils/foodItemFetcher";
import { loadMeals } from "@/services/dataservice";
import { Meal } from "@/types/meal";
import { useFoodItems } from "@/context/FoodItemsContext";

export default function MealDetails() {
  const params = useParams();
  const id = params.id as string;

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [foodItemNames, setFoodItemNames] = useState<Record<string, string>>(
    {}
  );
  const { foodItems } = useFoodItems();

  useEffect(() => {
    async function fetchMeal() {
      setLoading(true);
      try {
        const meals = await loadMeals();
        const foundMeal = meals.find((m) => m.id === id);
        setMeal(foundMeal || null);
      } catch (err) {
        console.error("Error loading meal:", err);
        setError("Failed to load meal details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchMeal();
  }, [id]);

  // Load food item names in a separate useEffect
  useEffect(() => {
    if (!meal || foodItems.length === 0) return;

    const names: Record<string, string> = {};
    meal.ingredients.forEach((ingredient) => {
      const foodItem = foodItems.find(
        (item) => item.id === ingredient.foodItemId
      );
      if (foodItem) {
        names[ingredient.foodItemId] = foodItem.name;
      }
    });

    setFoodItemNames(names);
  }, [meal, foodItems]);

  const nutrition =
    meal?.calculatedNutrition ||
    (meal ? calculateRecipeNutrition(meal.ingredients, foodItems) : null);
  const cost =
    meal?.totalCost ||
    (meal ? calculateRecipeCost(meal.ingredients, foodItems) : null);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p>{error}</p>
        </div>
        <Link
          href="/"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Back to Recipes
        </Link>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Meal Not Found
        </h1>
        <p className="mb-6">
          The meal you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
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
        className="inline-block mb-6 text-emerald-500 hover:text-emerald-700 transition-colors duration-200 flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 mr-1"
        >
          <path
            fillRule="evenodd"
            d="M7.28 7.72a.75.75 0 0 1 0 1.06l-2.47 2.47H21a.75.75 0 0 1 0 1.5H4.81l2.47 2.47a.75.75 0 1 1-1.06 1.06l-3.75-3.75a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
        Back to All Recipes
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="md:flex">
          <div className="md:w-1/2 bg-gray-200 h-80 md:h-auto relative">
            {meal.image ? (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${meal.image})` }}
              ></div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-100">
                <div className="w-32 h-32 relative">
                  <div className="absolute inset-0 bg-lime-200 rounded-full"></div>
                  <div className="absolute inset-2 bg-lime-300 rounded-full opacity-70"></div>
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gray-700 rounded-full"></div>
                  <div className="absolute top-1/3 left-1/3 w-1/4 h-1/4 bg-lime-100 rounded-full opacity-60"></div>
                  <div className="absolute -top-4 left-1/2 w-3 h-6 bg-lime-500 rounded-full -rotate-12 transform -translate-x-1/2"></div>
                </div>
              </div>
            )}
          </div>
          <div className="md:w-1/2 p-6">
            <div className="inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wide font-semibold bg-emerald-100 text-emerald-700 mb-2">
              {meal.category}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mt-2 mb-4">
              {meal.name}
            </h1>
            <p className="text-gray-600 mb-4">{meal.description}</p>

            <div className="flex justify-between items-center text-sm mb-4">
              <div className="flex items-center text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-emerald-500 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">Preparation Time:</span>
                <span className="ml-2">{meal.preparationTime} minutes</span>
              </div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-emerald-500 mr-1"
                >
                  <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a4.124 4.124 0 001.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 00-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 00.933-1.175l-.415-.33a3.836 3.836 0 00-1.719-.755V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold text-emerald-600">${cost}</span>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-100">
              <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 mr-2 text-purple-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                Nutrition Information
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-purple-100">
                  <p className="text-2xl font-bold text-purple-600">
                    {nutrition?.calories}
                  </p>
                  <p className="text-sm text-gray-600">Calories</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-red-100">
                  <p className="text-2xl font-bold text-red-600">
                    {nutrition?.protein}g
                  </p>
                  <p className="text-sm text-gray-600">Protein</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-yellow-100">
                  <p className="text-2xl font-bold text-yellow-600">
                    {nutrition?.carbs}g
                  </p>
                  <p className="text-sm text-gray-600">Carbs</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-600">
                    {nutrition?.fat}g
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
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 mr-2 text-emerald-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm4.5 7.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0V12Zm2.25-3a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0V9.75A.75.75 0 0 1 13.5 9Zm3.75-1.5a.75.75 0 0 0-1.5 0v9a.75.75 0 0 0 1.5 0v-9Z"
                    clipRule="evenodd"
                  />
                </svg>
                Ingredients
              </h2>
              <ul className="space-y-2">
                {meal.ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex items-start text-gray-700 py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full text-emerald-700 flex items-center justify-center font-bold mr-3 mt-0.5">
                      <span className="text-xs">{index + 1}</span>
                    </div>
                    <span>
                      <span className="font-medium">
                        {ingredient.amount} {ingredient.unit}
                      </span>{" "}
                      {foodItemNames[ingredient.foodItemId] || "Loading..."}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 mr-2 text-emerald-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z"
                    clipRule="evenodd"
                  />
                </svg>
                Instructions
              </h2>
              <ol className="space-y-4">
                {meal.instructions.map((step, index) => (
                  <li key={index} className="text-gray-700">
                    <div className="flex">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full text-white flex items-center justify-center font-bold mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                        {step}
                      </div>
                    </div>
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
