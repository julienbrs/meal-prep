import React, { useState } from "react";
import { Combobox } from "@headlessui/react";
import { Meal } from "@/types/meal";
import { useFoodItems } from "@/context/FoodItemsContext";
import { SnackEntry, isCatalogMeal } from "@/types/mealPlan";

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
  const { foodItems } = useFoodItems(); // ← utile pour l’avenir si tu veux afficher des détails
  const [query, setQuery] = useState("");

  const filteredMeals =
    query.trim() === ""
      ? allMeals
      : allMeals.filter((m) =>
          m.name.toLowerCase().includes(query.toLowerCase())
        );

  const handleAddSnack = (mealId: string) => {
    const meal = allMeals.find((m) => m.id === mealId);
    if (!meal) return;
    onAddSnack(day, { meal, portions: 1 });
    setQuery(""); // reset après ajout
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ---- Choisir un snack ---- */}
      <Combobox
        value={""}
        onChange={(value: string) => {
          if (value) handleAddSnack(value);
        }}
      >
        <div className="relative">
          <Combobox.Input
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Ajouter un snack..."
            onChange={(e) => setQuery(e.target.value)}
          />
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {filteredMeals.length === 0 && (
              <Combobox.Option
                value=""
                disabled
                className="cursor-default select-none px-4 py-2 text-gray-700"
              >
                Aucun snack trouvé
              </Combobox.Option>
            )}
            {filteredMeals.map((m) => (
              <Combobox.Option
                key={m.id}
                value={m.id}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                    active ? "bg-emerald-600 text-white" : "text-gray-900"
                  }`
                }
              >
                {m.name}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </div>
      </Combobox>

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
