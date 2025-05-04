import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Meal } from "../types/meal";
import {
  calculateRecipeNutrition,
  calculateRecipeCost,
} from "@/utils/nutritionCalculator";
import { useFoodItems } from "@/context/FoodItemsContext";
import { useUser } from "@/context/UserContext";

interface MealCardProps {
  meal: Meal;
}

export default function MealCard({ meal }: MealCardProps) {
  const { foodItems } = useFoodItems();
  const { users } = useUser();
  const creator = users.find((user) => user.id === meal.createdBy) || users[0];
  const nutrition =
    meal.calculatedNutrition ||
    calculateRecipeNutrition(meal.ingredients, foodItems);
  const cost =
    meal.totalCost || calculateRecipeCost(meal.ingredients, foodItems);

  const getImageSrc = (imagePath: string | undefined): string => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breakfast":
        return "bg-amber-500";
      case "lunch":
        return "bg-emerald-500";
      case "dinner":
        return "bg-blue-500";
      case "snack":
        return "bg-purple-500";
      case "appetizer":
        return "bg-rose-500";
      default:
        return "bg-emerald-500";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "breakfast":
        return "Petit-déjeuner";
      case "lunch":
        return "Déjeuner";
      case "dinner":
        return "Dîner";
      case "snack":
        return "Collation";
      case "appetizer":
        return "Entrée";
      default:
        return category;
    }
  };

  const primaryCategory =
    meal.categories && meal.categories.length > 0
      ? meal.categories[0]
      : "dinner";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        {meal.image ? (
          <Image
            src={getImageSrc(meal.image)}
            alt={meal.name}
            width={400}
            height={192}
            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ width: "100%", height: "100%" }}
            priority
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
          <span
            className={`${getCategoryColor(
              primaryCategory
            )} text-white text-xs px-2 py-1 rounded-full uppercase tracking-wide shadow-md`}
          >
            {getCategoryName(primaryCategory)}
            {meal.categories && meal.categories.length > 1 && (
              <span className="ml-1 bg-white text-gray-800 rounded-full px-1 text-xs">
                +{meal.categories.length - 1}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Afficher toutes les catégories dans une ligne en dessous de l'image si nécessaire */}
      {meal.categories && meal.categories.length > 1 && (
        <div className="flex flex-wrap gap-1 px-4 py-1 bg-gray-50">
          {meal.categories.map((category, index) => (
            <span
              key={index}
              className={`${getCategoryColor(
                category
              )} bg-opacity-20 text-xs px-2 py-0.5 rounded-full`}
            >
              {getCategoryName(category)}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center mt-2 px-5">
        <Image
          src={creator.avatar}
          alt={`Créé par ${creator.name}`}
          width={20}
          height={20}
          className="rounded-full mr-2"
        />
        <span className="text-xs text-gray-500">Créé par {creator.name}</span>
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
              className="w-4 h-4 text-emerald-500 mr-1"
            >
              <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a4.124 4.124 0 001.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 00-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 00.933-1.175l-.415-.33a3.836 3.836 0 00-1.719-.755V6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold text-emerald-600">
              ${cost.toFixed(2)}
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
              {nutrition.calories} cal
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-red-50 rounded-lg p-2 text-center">
            <span className="block text-xs text-red-800 font-medium">
              {nutrition.protein}g
            </span>
            <span className="block text-xs text-red-600">Protéines</span>
          </div>
          <div className="bg-yellow-50 rounded-lg p-2 text-center">
            <span className="block text-xs text-yellow-800 font-medium">
              {nutrition.carbs}g
            </span>
            <span className="block text-xs text-yellow-600">Glucides</span>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <span className="block text-xs text-green-800 font-medium">
              {nutrition.fat}g
            </span>
            <span className="block text-xs text-green-600">Lipides</span>
          </div>
        </div>

        <Link
          href={`/meals/${meal.id}`}
          className="block w-full text-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-2 rounded-lg transition-all duration-200 transform hover:scale-105 font-medium"
        >
          Voir la Recette
        </Link>
      </div>
    </div>
  );
}
