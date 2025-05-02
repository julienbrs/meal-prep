"use client";
import React from "react";
import { Meal } from "@/types/meal";
import { useUser } from "@/context/UserContext";

interface BasicInformationProps {
  recipe: Partial<Meal>;
  handleRecipeChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

export default function BasicInformation({
  recipe,
  handleRecipeChange,
}: BasicInformationProps) {
  const { currentUser, users } = useUser();
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
            value={recipe.name}
            onChange={handleRecipeChange}
            required
            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            placeholder="ex: Toast à l'avocat avec Œufs pochés"
          />
        </div>

        {/* Catégorie */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Catégorie *
          </label>
          <select
            id="category"
            name="category"
            value={recipe.category}
            onChange={handleRecipeChange}
            required
            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
          >
            <option value="breakfast">Petit-déjeuner</option>
            <option value="lunch">Déjeuner</option>
            <option value="dinner">Dîner</option>
            <option value="snack">Collation</option>
          </select>
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
            value={recipe.preparationTime}
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
            value={recipe.description}
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
