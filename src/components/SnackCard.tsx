import React, { useState } from "react";
import { Meal } from "../types/meal";
import { useFoodItems } from "@/context/FoodItemsContext";

export interface SnackEntry {
  meal: Meal;
  portions: number;
}

interface SnackCardProps {
  day: string;
  snackList: SnackEntry[]; // la liste actuelle des snacks pour ce jour
  allMeals: Meal[];         // pour pouvoir en choisir dans la dropdown
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
  const { foodItems } = useFoodItems();
  const [selectedMealId, setSelectedMealId] = useState<string>("");

  // Lorsqu’on choisit un snack dans la dropdown, on l’ajoute (avec 1 portion par défaut)
  const handleAdd = () => {
    if (!selectedMealId) return;
    const meal = allMeals.find((m) => m.id === selectedMealId);
    if (!meal) return;
    const defaultPortion = meal.preferredPortions?.[/* userId */ ""] || 1;
    onAddSnack(day, { meal, portions: defaultPortion });
    setSelectedMealId("");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 1) Dropdown pour ajouter un nouveau snack */}
      <div className="flex items-center gap-2">
        <select
          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
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
          className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
        >
          ➕
        </button>
      </div>

      {/* 2) Liste de tous les snacks déjà ajoutés pour ce jour */}
      <ul className="max-h-48 overflow-y-auto space-y-2">
        {snackList.length === 0 && (
          <li className="text-gray-500 text-sm">Aucun snack ajouté</li>
        )}
        {snackList.map((entry, idx) => (
          <li
            key={`${entry.meal.id}-${idx}`}
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

            {/* Bouton pour retirer ce snack */}
            <button
              onClick={() => onRemoveSnack(day, idx)}
              className="text-red-500 hover:text-red-700"
              title="Retirer ce snack"
            >
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
        ))}
      </ul>
    </div>
  );
}
