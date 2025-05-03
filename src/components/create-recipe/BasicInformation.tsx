"use client";
import React from "react";
import { Meal } from "@/types/meal";
import { useUser } from "@/context/UserContext";

// Définir un type pour les catégories autorisées
type MealCategory = "breakfast" | "lunch" | "dinner" | "snack" | "appetizer";

interface BasicInformationProps {
  recipe: Partial<Meal>;
  handleRecipeChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  // Mettre à jour le type ici pour correspondre à celui de CreateRecipe
  handleCategoriesChange: (selectedCategories: MealCategory[]) => void;
}

export default function BasicInformation({
  recipe,
  handleRecipeChange,
  handleCategoriesChange,
}: BasicInformationProps) {
  const { currentUser, users } = useUser();

  // Catégories disponibles
  const availableCategories = [
    { value: "breakfast" as MealCategory, label: "Petit-déjeuner" },
    { value: "lunch" as MealCategory, label: "Déjeuner" },
    { value: "dinner" as MealCategory, label: "Dîner" },
    { value: "snack" as MealCategory, label: "Collation" },
    { value: "appetizer" as MealCategory, label: "Entrée" },
  ];

  // Gérer les changements de catégories
  const toggleCategory = (category: MealCategory) => {
    const currentCategories = (recipe.categories || []) as MealCategory[];
    let newCategories: MealCategory[];

    if (currentCategories.includes(category)) {
      // Si la catégorie est déjà sélectionnée, on la retire
      // Mais on vérifie qu'il reste au moins une catégorie
      if (currentCategories.length > 1) {
        newCategories = currentCategories.filter((cat) => cat !== category);
      } else {
        // Au moins une catégorie est requise
        return;
      }
    } else {
      // Sinon on l'ajoute
      newCategories = [...currentCategories, category];
    }

    handleCategoriesChange(newCategories);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-emerald-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Informations de Base
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nom de la Recette *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={recipe.name || ""}
            onChange={handleRecipeChange}
            required
            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            placeholder="ex: Toast à l'avocat avec Œufs pochés"
          />
        </div>

        {/* Catégories - Maintenant avec sélection multiple */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catégories * (Au moins une)
          </label>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => toggleCategory(category.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                  ${
                    (recipe.categories || []).includes(category.value)
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          {(recipe.categories || []).length === 0 && (
            <p className="text-red-500 text-xs mt-1">
              Au moins une catégorie est requise
            </p>
          )}
        </div>

        {/* Temps de préparation */}
        <div>
          <label
            htmlFor="preparationTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Temps de Préparation (minutes) *
          </label>
          <input
            type="number"
            id="preparationTime"
            name="preparationTime"
            value={recipe.preparationTime || 30}
            onChange={handleRecipeChange}
            min="1"
            required
            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={recipe.description || ""}
            onChange={handleRecipeChange}
            rows={3}
            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            placeholder="Une brève description de votre recette..."
          />
        </div>
        <div>
          <label
            htmlFor="createdBy"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Créé par *
          </label>
          <select
            id="createdBy"
            name="createdBy"
            value={recipe.createdBy || currentUser.id}
            onChange={handleRecipeChange}
            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
