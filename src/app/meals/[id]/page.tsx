"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { sampleMeals } from "../../../data/meals";

export default function MealDetails() {
  const params = useParams();
  const id = params.id as string;

  const meal = sampleMeals.find((m) => m.id === id);

  if (!meal) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Meal Not Found
        </h1>
        <p className="mb-6">The meal you&apos;re looking for doesn&apos;t exist.</p>
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
              // Utilisation d'un div avec background-image pour un contrôle précis
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${meal.image})` }}
              ></div>
            ) : (
              // Logo d'avocat comme image par défaut
              <div className="h-full flex items-center justify-center bg-gray-100">
                <div className="w-32 h-32 relative">
                  <div className="absolute inset-0 bg-lime-200 rounded-full"></div>
                  <div className="absolute inset-2 bg-lime-300 rounded-full opacity-70"></div>
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gray-700 rounded-full"></div>
                  <div className="absolute top-1/3 left-1/3 w-1/4 h-1/4 bg-lime-100 rounded-full opacity-60"></div>
                  {/* Feuille sur le dessus de l'avocat */}
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
            <div className="flex items-center text-gray-700 mb-4">
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
                    {meal.nutrition.calories}
                  </p>
                  <p className="text-sm text-gray-600">Calories</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-red-100">
                  <p className="text-2xl font-bold text-red-600">
                    {meal.nutrition.protein}g
                  </p>
                  <p className="text-sm text-gray-600">Protein</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-yellow-100">
                  <p className="text-2xl font-bold text-yellow-600">
                    {meal.nutrition.carbs}g
                  </p>
                  <p className="text-sm text-gray-600">Carbs</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-600">
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
                      {ingredient.name}
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
