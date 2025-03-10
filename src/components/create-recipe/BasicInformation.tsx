"use client";
import React from "react";
import { Meal } from "@/types/meal";

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
        Basic Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Recipe Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={recipe.name}
            onChange={handleRecipeChange}
            required
            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            placeholder="e.g., Avocado Toast with Poached Eggs"
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={recipe.category}
            onChange={handleRecipeChange}
            required
            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        {/* Prep Time */}
        <div>
          <label
            htmlFor="preparationTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Preparation Time (minutes) *
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
            placeholder="A brief description of your recipe..."
          />
        </div>
      </div>
    </div>
  );
}
