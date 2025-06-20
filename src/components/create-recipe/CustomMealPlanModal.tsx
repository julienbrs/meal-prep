// components/create-recipe/CustomMealModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { Combobox } from "@headlessui/react";
import { useFoodItems } from "@/context/FoodItemsContext";
import { RecipeIngredient } from "@/types/meal";
import { calculateRecipeNutrition } from "@/utils/nutritionCalculator";
import { CustomMeal } from "@/types/mealPlan";

interface Props {
  onSave: (meal: CustomMeal) => void;
  onClose: () => void;
}

export default function CustomMealModal({ onSave, onClose }: Props) {
  /* —————————————————————————————————————————— state ——————————————————————————————————— */
  const { foodItems } = useFoodItems();
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [newIng, setNewIng] = useState<RecipeIngredient>({
    foodItemId: "",
    amount: 0,
    unit: "g",
  });

  /* ——————————————————————————————————— helpers ——————————————————————————————————— */
  const filteredFood =
    query === ""
      ? foodItems // ➜ liste complète quand input vide
      : foodItems.filter((f) =>
          f.name.toLowerCase().includes(query.toLowerCase())
        );

  const selectedFood = foodItems.find((f) => f.id === newIng.foodItemId);

  useEffect(() => {
    // si l’aliment utilise “piece”, on garde “g” par défaut mais on affiche aussi “piece”
    if (selectedFood && selectedFood.units === "piece") {
      setNewIng((p) => ({ ...p, unit: "g" }));
    }
  }, [selectedFood]);

  const addLine = () => {
    if (!newIng.foodItemId || !newIng.amount) return;
    setIngredients([...ingredients, newIng]);
    setNewIng({ foodItemId: "", amount: 0, unit: "g" });
    setQuery("");
  };

  /* —————————————————————————————————————————— render —————————————————————————————————— */
  const nutrition =
    ingredients.length > 0
      ? calculateRecipeNutrition(ingredients, foodItems)
      : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
        {/* —— Titre —— */}
        <input
          className="w-full mb-4 p-2 border rounded text-lg font-semibold"
          placeholder="Nom du snack…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* —— Ligne d’ajout —— */}
        <div className="flex gap-2 mb-4">
          {/* aliment */}
          <div className="relative flex-1">
            <Combobox
              value={newIng.foodItemId}
              onChange={(id: string) =>
                setNewIng((p) => ({ ...p, foodItemId: id }))
              }
            >
              <Combobox.Input
                className="w-full border p-2 rounded"
                placeholder="Rechercher un aliment…"
                displayValue={(id: string) =>
                  foodItems.find((f) => f.id === id)?.name || ""
                }
                onChange={(e) => setQuery(e.target.value)}
              />
              {/* on garde l’overflow visible + z-index élevé pour éviter la coupure */}
              <Combobox.Options className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                {filteredFood.length === 0 && (
                  <li className="px-4 py-2 text-gray-700 cursor-default select-none">
                    Aucun aliment
                  </li>
                )}

                {filteredFood.map((fi) => (
                  <Combobox.Option
                    key={fi.id}
                    value={fi.id}
                    className={({ active }) =>
                      `cursor-pointer select-none py-2 pl-3 pr-9 ${
                        active ? "bg-emerald-600 text-white" : "text-gray-900"
                      }`
                    }
                  >
                    {fi.name}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Combobox>
          </div>

          {/* quantité */}
          <input
            type="number"
            min="0"
            className="w-24 border p-2 rounded"
            placeholder="qté"
            value={newIng.amount || ""}
            onChange={(e) =>
              setNewIng({ ...newIng, amount: parseFloat(e.target.value) })
            }
          />

          {/* unité */}
          <select
            className="w-24 border p-2 rounded"
            value={newIng.unit}
            onChange={(e) => setNewIng({ ...newIng, unit: e.target.value })}
          >
            <option value="g">g</option>
            {selectedFood?.units === "piece" && (
              <option value="piece">pièce</option>
            )}
          </select>

          {/* bouton + */}
          <button
            onClick={addLine}
            className="px-3 bg-emerald-600 text-white rounded"
            title="Ajouter l’ingrédient"
          >
            +
          </button>
        </div>

        {/* —— Liste des ingrédients —— */}
        {ingredients.length > 0 && (
          <ul className="mb-4 max-h-40 overflow-y-auto">
            {ingredients.map((ing, idx) => (
              <li key={idx} className="text-sm flex justify-between py-1">
                <span>
                  {
                    foodItems.find((f) => f.id === ing.foodItemId)
                      ?.name /* nom */
                  }
                </span>
                <span>
                  {ing.amount}
                  {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* —— Aperçu nutrition —— */}
        {nutrition && (
          <p className="text-xs text-gray-500 mb-4">
            ≈ {nutrition.calories} kcal | {nutrition.protein} g P |{" "}
            {nutrition.carbs} g G | {nutrition.fat} g L
          </p>
        )}

        {/* —— Actions —— */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border">
            Annuler
          </button>
          <button
            disabled={ingredients.length === 0}
            onClick={() =>
              onSave({
                type: "custom",
                tempId: uuid(),
                name: name || "Snack libre",
                ingredients,
              })
            }
            className="px-4 py-2 rounded text-white bg-emerald-600 disabled:opacity-40"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
