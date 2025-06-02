import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Meal } from "../types/meal";
import { calculateRecipeNutrition } from "@/utils/nutritionCalculator";
import { useFoodItems } from "@/context/FoodItemsContext";

interface MealPlanCardProps {
  day: string;
  mealType: string;
  meal: Meal | null;
  portions: number; // le nombre de portions actuel pour ce jour/repas
  meals: Meal[];
  onAddMeal: (day: string, mealType: string, mealId: string) => void;
  onRemoveMeal: (day: string, mealType: string) => void;
  onPortionChange: (day: string, mealType: string, newPortions: number) => void;
}

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

  // ─── Gestion du champ "portion" en local pour autoriser le texte libre ───
  const [portionInput, setPortionInput] = useState<string>(portions.toString());

  useEffect(() => {
    setPortionInput(portions.toString());
  }, [portions]);

  const handlePortionBlur = () => {
    const normalized = portionInput.replace(",", ".");
    const parsed = parseFloat(normalized);

    if (!isNaN(parsed) && parsed > 0) {
      if (parsed.toString() !== portions.toString()) {
        onPortionChange(day, mealType, parsed);
      }
      setPortionInput(parsed.toString());
    } else {
      setPortionInput(portions.toString());
    }
  };

  // ─── Calcul nutritionnel pour X portions ───
  const nutritionPerPortion = meal?.calculatedNutrition
    ? {
        calories: meal.calculatedNutrition.calories,
        protein: meal.calculatedNutrition.protein,
        carbs: meal.calculatedNutrition.carbs,
        fat: meal.calculatedNutrition.fat,
      }
    : meal
    ? calculateRecipeNutrition(meal.ingredients, foodItems, 1)
    : null;

  const nutrition = nutritionPerPortion
    ? {
        calories: Math.round(nutritionPerPortion.calories * portions),
        protein: Number((nutritionPerPortion.protein * portions).toFixed(1)),
        carbs: Number((nutritionPerPortion.carbs * portions).toFixed(1)),
        fat: Number((nutritionPerPortion.fat * portions).toFixed(1)),
      }
    : null;

  return (
    <div className="self-stretch flex-1 p-4 bg-neutral-50 flex flex-col justify-start items-start gap-5 min-h-[240px]">
      {!meal ? (
        // Si aucun repas n'est sélectionné → on affiche le <select> pour choisir un repas
        <div className="w-full h-full flex flex-col justify-center">
          <select
            className="w-full p-2 rounded-lg ring-1 ring-gray-300 focus:ring-2 focus:ring-orange-500"
            onChange={(e) => {
              if (e.target.value) {
                onAddMeal(day, mealType, e.target.value);
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Choisir un repas...
            </option>
            {meals.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <>
          {/* ─── En‐tête : titre (cliquable) + description + bouton “retirer” ─── */}
          <div className="self-stretch inline-flex justify-between items-start">
            {/* 1) Nom du repas cliquable → redirige vers /meals/[id] */}
            <div className="flex-1 pr-2">
              <Link
                href={`/meals/${meal.id}`}
                className="text-[#1f2a37] text-lg font-semibold font-['Inter'] hover:underline"
              >
                {meal.name}
              </Link>
              {meal.description && (
                <p className="text-gray-700 text-sm font-normal font-['Inter'] line-clamp-2">
                  {meal.description}
                </p>
              )}
            </div>
            {/* 2) Bouton de suppression */}
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

          {/* ─── Ligne “Portions” (champ texte) ─── */}
          <div className="flex items-center gap-2">
            <label
              htmlFor={`portions-${day}-${mealType}`}
              className="text-gray-700 text-sm"
            >
              Portions :
            </label>
            <input
              id={`portions-${day}-${mealType}`}
              type="text"
              value={portionInput}
              onChange={(e) => setPortionInput(e.target.value)}
              onBlur={handlePortionBlur}
              className="w-20 p-1 border border-gray-300 rounded text-center"
            />
          </div>

          {/* ─── Ligne des icônes : temps + calories totales ─── */}
          <div className="inline-flex justify-start items-center gap-5">
            {/* --- Temps de préparation --- */}
            <div className="flex items-center gap-[3px]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 5.33333V8L10 10M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
                  stroke="#4B5563"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-gray-700 text-xs font-normal font-['Inter']">
                {meal.preparationTime} min
              </span>
            </div>

            {/* --- Calories totales pour X portions --- */}
            {nutrition && (
              <div className="flex items-center gap-[3px]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75-9.75-4.365-9.75-9.75Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584Zm0 9.417a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-purple-600 text-xs font-bold font-['Inter']">
                  {nutrition.calories} cal
                </span>
              </div>
            )}
          </div>

          {/* ─── Boîtes "protéines / glucides / lipides" côte à côte ─── */}
          {nutrition && (
            <div className="self-stretch inline-flex justify-start items-stretch gap-2 mt-2">
              {["protein", "carbs", "fat"].map((nutrient) => (
                <div
                  key={nutrient}
                  className="
                    flex                    /* display:flex */
                    flex-col                /* flex-direction:column */
                    items-center            /* align-items:center */
                    gap-0.5                  /* gap: 2px entre texte et icône/label */
                    flex-1                  /* flex:1 0 0 → même largeur pour chaque boîte */
                    basis-0                 /* flex-basis:0 pour que flex-1 fonctionne correctement */
                    py-3 px-4               /* padding: 12px 16px */
                    bg-white                /* fond blanc */
                    border border-gray-300  /* border:1px solid #D1D5DB */
                    rounded-lg              /* border-radius:8px */
                  "
                >
                  {/* Valeur numérique */}
                  <span className="text-gray-700 text-sm font-normal font-['Inter']">
                    {nutrient === "protein" && `${nutrition.protein} g`}
                    {nutrient === "carbs" && `${nutrition.carbs} g`}
                    {nutrient === "fat" && `${nutrition.fat} g`}
                  </span>

                  {/* Icône + label */}
                  <span className="flex items-center text-gray-700 text-xs font-normal font-['Inter']">
                    {nutrient === "protein" && (
                      <>
                        <svg
                          width="13"
                          height="12"
                          viewBox="0 0 13 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-1"
                        >
                          <g id="FishSimple">
                            <path
                              id="Vector"
                              d="M8.31942 3.56252C8.31942 3.67377 8.28643 3.78252 8.22462 3.87502C8.16281 3.96753 8.07496 4.03962 7.97218 4.0822C7.86939 4.12477 7.75629 4.13591 7.64718 4.11421C7.53806 4.0925 7.43784 4.03893 7.35917 3.96026C7.2805 3.8816 7.22693 3.78137 7.20522 3.67225C7.18352 3.56314 7.19466 3.45004 7.23723 3.34726C7.27981 3.24447 7.35191 3.15662 7.44441 3.09481C7.53691 3.03301 7.64566 3.00002 7.75692 3.00002C7.9061 3.00002 8.04917 3.05928 8.15466 3.16477C8.26015 3.27026 8.31942 3.41333 8.31942 3.56252ZM9.79785 7.81736C8.52942 9.08298 6.54379 9.61502 3.8766 9.40877C3.95129 9.96627 4.05598 10.5533 4.19067 11.1699C4.21185 11.267 4.19357 11.3686 4.13987 11.4523C4.08616 11.536 4.00141 11.5949 3.90426 11.6161C3.8778 11.6221 3.85076 11.625 3.82363 11.625C3.73822 11.6249 3.65543 11.5955 3.58894 11.5419C3.52246 11.4883 3.47627 11.4136 3.45801 11.3302C3.30457 10.6292 3.1891 9.96299 3.1116 9.33142C2.48035 9.25361 1.81457 9.13814 1.11426 8.98502C1.01754 8.96333 0.933333 8.90424 0.880058 8.82065C0.826782 8.73706 0.80877 8.63577 0.829958 8.53894C0.851145 8.44211 0.909811 8.3576 0.993127 8.3039C1.07644 8.2502 1.17763 8.23167 1.27457 8.25236C1.89051 8.38673 2.47707 8.49142 3.03426 8.56642C2.82848 5.8997 3.36238 3.91455 4.62801 2.64658C6.67879 0.589704 9.93332 1.1672 10.5647 1.30408C10.7057 1.33481 10.8349 1.40539 10.937 1.50744C11.039 1.60948 11.1096 1.7387 11.1404 1.8797C11.2772 2.51111 11.8552 5.76564 9.79785 7.81736ZM9.09473 7.44752C8.06325 7.2917 7.10883 6.80948 6.37145 6.07158C5.63406 5.33369 5.1525 4.37895 4.99738 3.34736C3.98629 4.48877 3.58504 6.2658 3.79223 8.6508C6.1777 8.85939 7.95473 8.45814 9.09614 7.44752H9.09473ZM10.4072 2.03861C9.64831 1.88171 8.87038 1.8378 8.09863 1.9083C7.14988 2.00205 6.34551 2.27533 5.69629 2.72673C5.72208 3.78534 6.15398 4.79348 6.90257 5.54242C7.65116 6.29136 8.65911 6.72374 9.7177 6.75C10.1686 6.1008 10.4438 5.29689 10.5361 4.34767C10.6063 3.57582 10.5629 2.79785 10.4072 2.03861Z"
                              fill="#374151"
                            />
                          </g>
                        </svg>
                        protéines
                      </>
                    )}

                    {nutrient === "carbs" && (
                      <>
                        <svg
                          width="13"
                          height="12"
                          viewBox="0 0 13 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-1"
                        >
                          <g id="BowlFood">
                            <path
                              id="Vector"
                              d="M10.8333 4.875H10.4409C10.3467 3.85072 9.87318 2.8986 9.11326 2.20538C8.35335 1.51217 7.36185 1.12787 6.33325 1.12787C5.30465 1.12787 4.31316 1.51217 3.55324 2.20538C2.79333 2.8986 2.31982 3.85072 2.2256 4.875H1.83325C1.7338 4.875 1.63841 4.91451 1.56809 4.98483C1.49776 5.05516 1.45825 5.15054 1.45825 5.25C1.4599 6.14181 1.70533 7.01619 2.16799 7.7786C2.63066 8.541 3.29295 9.16241 4.08325 9.57562V9.75C4.08325 9.94891 4.16227 10.1397 4.30292 10.2803C4.44357 10.421 4.63434 10.5 4.83325 10.5H7.83325C8.03216 10.5 8.22293 10.421 8.36358 10.2803C8.50423 10.1397 8.58325 9.94891 8.58325 9.75V9.57562C9.37355 9.16241 10.0358 8.541 10.4985 7.7786C10.9612 7.01619 11.2066 6.14181 11.2083 5.25C11.2083 5.15054 11.1687 5.05516 11.0984 4.98483C11.0281 4.91451 10.9327 4.875 10.8333 4.875ZM9.68669 4.875H7.27638C7.73102 4.19291 8.41885 3.70008 9.21091 3.48891C9.46988 3.91015 9.63236 4.38351 9.68669 4.875ZM8.46513 2.63578C8.55106 2.70609 8.63341 2.78031 8.71216 2.85844C7.71389 3.2096 6.88896 3.93131 6.40825 4.87406H5.02544C5.25982 4.21708 5.69132 3.64847 6.26099 3.24593C6.83065 2.84338 7.51071 2.62653 8.20825 2.625C8.29403 2.625 8.37981 2.62922 8.46513 2.63578ZM6.33325 1.875C6.63417 1.8752 6.93371 1.91572 7.22388 1.99547C6.5172 2.17077 5.86923 2.52925 5.34526 3.03479C4.82128 3.54033 4.43983 4.17506 4.23935 4.875H2.97981C3.07284 4.0504 3.46606 3.28888 4.08452 2.7356C4.70298 2.18232 5.50343 1.87599 6.33325 1.875ZM8.05169 9C7.98628 9.03005 7.9309 9.0783 7.89216 9.13898C7.85343 9.19966 7.83298 9.2702 7.83325 9.34219V9.75H4.83325V9.34219C4.83353 9.2702 4.81308 9.19966 4.77434 9.13898C4.73561 9.0783 4.68023 9.03005 4.61481 9C3.95534 8.69653 3.38729 8.22493 2.96768 7.63254C2.54807 7.04015 2.29166 6.34781 2.22419 5.625H10.4409C10.3736 6.34766 10.1174 7.0399 9.69802 7.63228C9.27867 8.22466 8.7109 8.69634 8.05169 9Z"
                              fill="#374151"
                            />
                          </g>
                        </svg>
                        glucides
                      </>
                    )}

                    {nutrient === "fat" && (
                      <>
                        <svg
                          width="13"
                          height="12"
                          viewBox="0 0 13 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-1"
                        >
                          <g id="IceCream">
                            <path
                              id="Vector"
                              d="M9.97227 4.18922V4.125C9.97227 3.13044 9.57718 2.17661 8.87392 1.47335C8.17066 0.770088 7.21683 0.375 6.22227 0.375C5.22771 0.375 4.27388 0.770088 3.57062 1.47335C2.86736 2.17661 2.47227 3.13044 2.47227 4.125V4.18922C2.22198 4.27762 2.01101 4.45167 1.87666 4.68061C1.74231 4.90954 1.69324 5.17861 1.73813 5.44023C1.78301 5.70185 1.91896 5.93917 2.12193 6.11024C2.3249 6.2813 2.58183 6.37508 2.84727 6.375H3.00477L5.89649 11.4375C5.92926 11.495 5.97666 11.5428 6.03388 11.576C6.09110 11.6093 6.15609 11.6268 6.22227 11.6268C6.28844 11.6268 6.35344 11.6093 6.41066 11.576C6.46788 11.5428 6.51528 11.495 6.54805 11.4375L9.43977 6.375H9.59727C9.86271 6.37508 10.1196 6.2813 10.3226 6.11024C10.5256 5.93917 10.6615 5.70185 10.7064 5.44023C10.7513 5.17861 10.7022 4.90954 10.5679 4.68061C10.4335 4.45167 10.2226 4.27762 9.97227 4.18922ZM6.22227 10.4944L3.86868 6.375H4.77243L6.67414 9.70313L6.22227 10.4944Z"
                              fill="#374151"
                            />
                          </g>
                        </svg>
                        lipides
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
