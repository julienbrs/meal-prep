import React, { useState, useEffect } from "react";
import { useFoodItems } from "@/context/FoodItemsContext";
import { v4 as uuid } from "uuid";
import { RecipeIngredient } from "@/types/meal";
import { calculateRecipeNutrition } from "@/utils/nutritionCalculator";
import { CustomMeal } from "@/types/mealPlan";

interface CustomMealModalProps {
  onSave: (meal: CustomMeal) => void;
  onClose: () => void;
}

export default function CustomMealModal({
  onSave,
  onClose,
}: CustomMealModalProps) {
  const { foodItems } = useFoodItems();

  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [newIng, setNewIng] = useState<RecipeIngredient>({
    foodItemId: "",
    amount: 0,
    unit: "g",
  });

  /* ——— quand on choisit un aliment, proposer g + pièce si dispo ——— */
  const selectedFood = foodItems.find((f) => f.id === newIng.foodItemId);
  useEffect(() => {
    if (selectedFood && selectedFood.units === "piece") {
      setNewIng((p) => ({ ...p, unit: "g" })); // reste en g par défaut
    }
  }, [selectedFood]);

  const addLine = () => {
    if (!newIng.foodItemId || !newIng.amount) return;
    setIngredients([...ingredients, newIng]);
    setNewIng({ foodItemId: "", amount: 0, unit: "g" });
  };

  const nutrition = ingredients.length
    ? calculateRecipeNutrition(ingredients, foodItems)
    : null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        {/* …nom recette… */}

        {/* —— Ligne d’ajout —— */}
        <div className="flex gap-2 mb-2">
          {/* aliment */}
          <select
            className="flex-1 border p-2 rounded"
            value={newIng.foodItemId}
            onChange={(e) =>
              setNewIng({ ...newIng, foodItemId: e.target.value })
            }
          >
            <option value="">— aliment —</option>
            {foodItems.map((fi) => (
              <option key={fi.id} value={fi.id}>
                {fi.name}
              </option>
            ))}
          </select>

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

          {/* unité : g par défaut + “piece” si l’aliment le permet */}
          <select
            className="w-20 border p-2 rounded"
            value={newIng.unit}
            onChange={(e) => setNewIng({ ...newIng, unit: e.target.value })}
          >
            <option value="g">g</option>
            {selectedFood?.units === "piece" && (
              <option value="piece">pièce</option>
            )}
          </select>

          {/* bouton ajouter */}
          <button
            onClick={addLine}
            className="px-3 bg-emerald-600 text-white rounded"
          >
            +
          </button>
        </div>

        {/* liste + aperçu nutritionnels inchangés… */}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border">
            Annuler
          </button>
          <button
            onClick={() =>
              onSave({
                type: "custom",
                tempId: uuid(),
                name: name || "Repas libre",
                ingredients,
              })
            }
            disabled={!ingredients.length}
            className="px-4 py-2 rounded text-white bg-emerald-600 disabled:opacity-40"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
