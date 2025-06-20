// components/MealPlanCard.tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Meal } from "@/types/meal";
import { CustomMeal, isCatalogMeal } from "@/types/mealPlan";
import { calculateRecipeNutrition } from "@/utils/nutritionCalculator";
import { useFoodItems } from "@/context/FoodItemsContext";
import CustomMealModal from "./create-recipe/CustomMealPlanModal";
import { FoodItem } from "@/types/ingredient";

// ———————————————————————————————————————————————————————————————————————
// Helpers
// ———————————————————————————————————————————————————————————————————————
const isCustom = (m: Meal | CustomMeal | null): m is CustomMeal =>
  !!m && (m as CustomMeal).type === "custom";

// ———————————————————————————————————————————————————————————————————————
// Props
// ———————————————————————————————————————————————————————————————————————
interface MealPlanCardProps {
  day: string;
  mealType: string;
  meal: Meal | CustomMeal | null;
  portions: number;
  meals: Meal[];
  onAddMeal: (day: string, mealType: string, meal: string | CustomMeal) => void;
  onRemoveMeal: (day: string, mealType: string) => void;
  onPortionChange: (day: string, mealType: string, newPortions: number) => void;
}

// ———————————————————————————————————————————————————————————————————————
// Component
// ———————————————————————————————————————————————————————————————————————
export default function MealPlanCard({
  day,
  mealType,
  meal,
  portions,
  meals,
  onAddMeal,
  onRemoveMeal,
  onPortionChange,
}: MealPlanCardProps) {
  const { foodItems } = useFoodItems();

  /* état local du champ “Portions” */
  const [portionInput, setPortionInput] = useState(portions.toString());
  const [showCustomModal, setShowCustomModal] = useState(false);

  useEffect(() => setPortionInput(portions.toString()), [portions]);

  const buildTooltip = (meal: CustomMeal, foodItems: FoodItem[]) =>
    meal.ingredients
      .map((ing) => {
        const name =
          foodItems.find((f) => f.id === ing.foodItemId)?.name ??
          ing.foodItemId;
        return `${name}: ${ing.amount}${ing.unit}`;
      })
      .join("\n");

  const handlePortionBlur = () => {
    const parsed = parseFloat(portionInput.replace(",", "."));
    if (!isNaN(parsed) && parsed > 0) {
      if (parsed !== portions) onPortionChange(day, mealType, parsed);
      setPortionInput(parsed.toString());
    } else {
      setPortionInput(portions.toString());
    }
  };

  /* Nutrition pour 1 portion */
  const nutritionPerPortion = meal
    ? isCatalogMeal(meal) && meal.calculatedNutrition
      ? meal.calculatedNutrition
      : calculateRecipeNutrition(meal.ingredients, foodItems, 1)
    : null;

  /* Nutrition × portions */
  const nutrition = nutritionPerPortion
    ? {
        calories: Math.round(nutritionPerPortion.calories * portions),
        protein: +(nutritionPerPortion.protein * portions).toFixed(1),
        carbs: +(nutritionPerPortion.carbs * portions).toFixed(1),
        fat: +(nutritionPerPortion.fat * portions).toFixed(1),
      }
    : null;

  // ————————————————————————————————————————————————————————————————

  return (
    <div className="self-stretch flex-1 p-4 bg-neutral-50 flex flex-col gap-5 min-h-[240px]">
      {/* —————————————————— AUCUN REPAS SÉLECTIONNÉ —————————————————— */}
      {!meal && (
        <>
          <select
            className="w-full p-2 mb-2 rounded-lg ring-1 ring-gray-300 focus:ring-2 focus:ring-orange-500"
            defaultValue=""
            onChange={(e) =>
              e.target.value && onAddMeal(day, mealType, e.target.value)
            }
          >
            <option value="" disabled>
              Choisir un repas…
            </option>
            {meals.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowCustomModal(true)}
            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg ring-1 ring-emerald-300 hover:bg-emerald-100"
          >
            Créer un repas libre
          </button>
        </>
      )}
      {/* ——— REPAS SÉLECTIONNÉ ——— */}
      {meal && (
        <>
          {/* En-tête : nom + bouton retirer */}
          <div className="flex justify-between items-start">
            {/* ▶︎ Nom du repas (avec tooltip si custom) */}
            <div className="pr-2 flex-1 relative group">
              {isCustom(meal) ? (
                <>
                  <span className="text-lg font-semibold text-[#1f2a37] cursor-help">
                    {meal.name}
                  </span>

                  {/* Tooltip */}
                  <div
                    className="
          absolute z-50 left-0 mt-1
          w-max max-w-xs whitespace-pre
          rounded-lg bg-gray-800 text-white text-xs
          px-2 py-1 shadow-lg
          opacity-0 group-hover:opacity-100
          transition-opacity duration-150
          pointer-events-none
        "
                  >
                    {buildTooltip(meal, foodItems)}
                  </div>
                </>
              ) : (
                <Link
                  href={`/meals/${meal.id}`}
                  className="text-lg font-semibold text-[#1f2a37] hover:underline"
                >
                  {meal.name}
                </Link>
              )}
            </div>

            {/* ▶︎ Bouton supprimer */}
            <button
              onClick={() => onRemoveMeal(day, mealType)}
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-600"
              title="Retirer ce repas"
            >
              <svg
                width="18"
                height="20"
                viewBox="0 0 18 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 5L15.1327 17.1425C15.0579 18.1891 14.187 19 13.1378 19H4.86224C3.81296 19 2.94208 18.1891 2.86732 17.1425L2 5M7 9V15M11 9V15M12 5V2C12 1.44772 11.5523 1 11 1H7C6.44772 1 6 1.44772 6 2V5M1 5H17"
                  stroke="#4B5563"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Portions */}
          <div className="flex items-center gap-2">
            <label
              htmlFor={`portions-${day}-${mealType}`}
              className="text-sm text-gray-700"
            >
              Portions :
            </label>
            <input
              id={`portions-${day}-${mealType}`}
              value={portionInput}
              onChange={(e) => setPortionInput(e.target.value)}
              onBlur={handlePortionBlur}
              className="w-20 p-1 border border-gray-300 rounded text-center"
            />
          </div>

          {/* Temps + calories */}
          <div className="inline-flex items-center gap-5">
            <div className="flex items-center gap-1 text-xs text-gray-700">
              {/* horloge */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 5.333V8l2 2M14 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
                  stroke="#4B5563"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isCustom(meal) ? "0" : meal.preparationTime} min
            </div>

            {nutrition && (
              <div className="flex items-center gap-1 text-xs font-bold text-purple-600">
                {/* flamme */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12a7.75 7.75 0 1 1 15.5 0a7.75 7.75 0 0 1-15.5 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                {nutrition.calories} cal
              </div>
            )}
          </div>

          {/* Macros */}
          {nutrition && (
            <div className="flex gap-2 mt-2 w-full">
              {[
                {
                  label: "protéines",
                  key: "protein",
                  value: nutrition.protein,
                },
                { label: "glucides", key: "carbs", value: nutrition.carbs },
                { label: "lipides", key: "fat", value: nutrition.fat },
              ].map(({ label, key, value }) => (
                <div
                  key={key}
                  className="flex-1 flex flex-col items-center py-3 px-4 bg-white border border-gray-300 rounded-lg text-sm"
                >
                  <span>{value} g</span>
                  <span className="text-xs text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal “repas libre” */}
      {showCustomModal && (
        <CustomMealModal
          onSave={(custom: any) => {
            onAddMeal(day, mealType, custom);
            setShowCustomModal(false);
          }}
          onClose={() => setShowCustomModal(false)}
        />
      )}
    </div>
  );
}
