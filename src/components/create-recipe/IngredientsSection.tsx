"use client";
import React, { useState, useEffect, useRef } from "react";
import { RecipeIngredient } from "@/types/meal";
import { FoodItem } from "@/types/ingredient";

interface IngredientsSectionProps {
  recipeIngredients: RecipeIngredient[];
  newIngredient: Partial<RecipeIngredient>;
  foodItems: FoodItem[];
  addIngredient: (e: React.FormEvent) => void;
  removeIngredient: (index: number) => void;
  handleIngredientChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  getFoodItemName: (id: string) => string;
}

export default function IngredientsSection({
  recipeIngredients,
  newIngredient,
  foodItems,
  addIngredient,
  removeIngredient,
  handleIngredientChange,
  getFoodItemName,
}: IngredientsSectionProps) {
  // État pour stocker le texte de recherche
  const [searchText, setSearchText] = useState("");
  // État pour contrôler si la liste déroulante est visible
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Référence pour fermer le dropdown quand on clique ailleurs
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Trier les ingrédients par ordre alphabétique
  const sortedFoodItems = [...foodItems].sort((a, b) =>
    a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
  );

  // Filtrer les ingrédients en fonction du texte de recherche
  const filteredFoodItems = sortedFoodItems.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Gérer le changement dans le champ de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setIsDropdownOpen(true);
  };

  // Gérer la sélection d'un ingrédient dans la liste déroulante
  const handleSelectIngredient = (itemId: string, itemName: string) => {
    // Simuler un événement de changement pour être compatible avec handleIngredientChange
    const event = {
      target: {
        name: "foodItemId",
        value: itemId,
      },
    } as React.ChangeEvent<HTMLSelectElement>;

    handleIngredientChange(event);
    setSearchText(itemName);
    setIsDropdownOpen(false);
  };

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mettre à jour le texte de recherche quand un nouvel ingrédient est sélectionné
  useEffect(() => {
    if (newIngredient.foodItemId) {
      const selectedItem = foodItems.find(
        (item) => item.id === newIngredient.foodItemId
      );
      if (selectedItem) {
        setSearchText(selectedItem.name);
      }
    } else {
      setSearchText("");
    }
  }, [newIngredient.foodItemId, foodItems]);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-emerald-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
        Ingrédients
      </h2>

      {/* Formulaire pour Nouvel Ingrédient */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="text-md font-medium mb-3 text-gray-700">
          Ajouter un Ingrédient
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative" ref={dropdownRef}>
            <label
              htmlFor="ingredientSearch"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Aliment *
            </label>
            <input
              type="text"
              id="ingredientSearch"
              name="ingredientSearch"
              value={searchText}
              onChange={handleSearchChange}
              onClick={() => setIsDropdownOpen(true)}
              placeholder="Rechercher un aliment..."
              className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            />

            {/* Liste déroulante des ingrédients filtrés */}
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {filteredFoodItems.length > 0 ? (
                  filteredFoodItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectIngredient(item.id, item.name)}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                    >
                      {item.name}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 py-2 px-3">
                    Aucun aliment trouvé
                  </div>
                )}
              </div>
            )}

            {/* Champ caché pour stocker l'ID de l'ingrédient sélectionné */}
            <input
              type="hidden"
              id="foodItemId"
              name="foodItemId"
              value={newIngredient.foodItemId || ""}
            />
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Quantité *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={newIngredient.amount || ""}
              onChange={handleIngredientChange}
              min="0"
              step="0.1"
              className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label
              htmlFor="unit"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Unité *
            </label>
            <select
              id="unit"
              name="unit"
              value={newIngredient.unit}
              onChange={handleIngredientChange}
              className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            >
              <option value="g">Grammes (g)</option>
              <option value="ml">Millilitres (ml)</option>
              <option value="piece">Pièce</option>
              <option value="tbsp">Cuillère à soupe (c. à s.)</option>
              <option value="tsp">Cuillère à café (c. à c.)</option>
              <option value="cup">Tasse</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={addIngredient}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            disabled={!newIngredient.foodItemId || !newIngredient.amount}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Ajouter l'Ingrédient
          </button>
        </div>
      </div>

      {/* Liste des Ingrédients */}
      {recipeIngredients && recipeIngredients.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Aliment
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Quantité
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {recipeIngredients.map((ingredient, index) => (
                <tr
                  key={index}
                  className={ingredient.aiGenerated ? "bg-yellow-50" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 relative">
                    {getFoodItemName(ingredient.foodItemId)}
                    {ingredient.aiGenerated && (
                      <span className="ml-2 text-yellow-600 cursor-pointer relative group">
                        (IA)
                        <div className="absolute hidden group-hover:block bg-white border shadow-lg p-2 rounded-md text-xs text-gray-700 w-64 z-10">
                          Ingrédient généré par IA.
                          <br />
                          <strong>Prix estimé:</strong>{" "}
                          {ingredient.price?.toFixed(2)} {ingredient.priceUnit}{" "}
                          <br />
                          <strong>Nutrition (pour 100g):</strong>
                          {ingredient.nutritionPer100g
                            ? JSON.stringify(ingredient.nutritionPer100g)
                            : "Inconnu"}
                        </div>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ingredient.amount} {ingredient.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            Aucun ingrédient ajouté pour l'instant
          </p>
        </div>
      )}
    </div>
  );
}
