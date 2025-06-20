import React, { useState } from "react";
import { Meal } from "@/types/meal";
import { useFoodItems } from "@/context/FoodItemsContext";
import { SnackEntry, isCatalogMeal } from "@/types/mealPlan"; // ⬅️

interface SnackCardProps {
  day: string;
  snackList: SnackEntry[];
  allMeals: Meal[];
  onAddSnack: (day: string, snack: SnackEntry) => void;
  onRemoveSnack: (day: string, index: number) => void;
}

export default function SnackCard({
  day,
  snackList,
  allMeals,
  onAddSnack,
  onRemoveSnack,
}: SnackCardProps) {
  const { foodItems } = useFoodItems(); // ← encore utilisé plus tard ?
  const [selectedMealId, setSelectedMealId] = useState("");

  const handleAdd = () => {
    if (!selectedMealId) return;
    const meal = allMeals.find((m) => m.id === selectedMealId);
    if (!meal) return;
    onAddSnack(day, { meal, portions: 1 });
    setSelectedMealId("");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ---- Choisir un snack ---- */}
      <div className="flex items-center gap-2">
        <select
          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
          value={selectedMealId}
          onChange={(e) => setSelectedMealId(e.target.value)}
        >
          <option value="" disabled>
            Ajouter un snack...
          </option>
          {allMeals.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
        >
          ➕
        </button>
      </div>

      {/* ---- Liste des snacks ---- */}
      <ul className="max-h-48 overflow-y-auto space-y-2">
        {snackList.length === 0 && (
          <li className="text-gray-500 text-sm">Aucun snack ajouté</li>
        )}

        {snackList.map((entry, idx) => {
          const key = isCatalogMeal(entry.meal)
            ? entry.meal.id
            : entry.meal.tempId;

          return (
            <li
              key={`${key}-${idx}`}
              className="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-3 py-2"
            >
              <div className="flex-1">
                <p className="text-gray-800 font-medium text-sm">
                  {entry.meal.name}
                </p>
                <p className="text-gray-500 text-xs">
                  {entry.portions} portion{entry.portions > 1 ? "s" : ""}
                </p>
              </div>

              <button
                onClick={() => onRemoveSnack(day, idx)}
                className="text-red-500 hover:text-red-700"
                title="Retirer ce snack"
              >
                {/* icône poubelle */}
                <svg
                  width="18"
                  height="20"
                  viewBox="0 0 18 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
