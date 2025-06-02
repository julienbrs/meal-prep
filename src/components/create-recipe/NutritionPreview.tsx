"use client";
import React from "react";
import { NutritionInfo } from "@/types/ingredient";

interface NutritionPreviewProps {
  nutritionPreview: NutritionInfo | null;
  costPreview: number;
}

export default function NutritionPreview({
  nutritionPreview,
  costPreview,
}: NutritionPreviewProps) {
  if (!nutritionPreview) return null;

  return (
    <div className="mb-8 bg-gray-50 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-emerald-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        Aperçu Nutritionnel
      </h2>

      {/* On met 7 colonnes pour inclure calories, protéines, glucides, lipides, fibres, sucres et coût */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-center">
        {/* Calories */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-xl font-bold text-gray-800">
            {nutritionPreview.calories}
          </div>
          <div className="text-sm text-gray-500">Calories</div>
        </div>

        {/* Protéines */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-xl font-bold text-gray-800">
            {nutritionPreview.protein} g
          </div>
          <div className="text-sm text-gray-500">Protéines</div>
        </div>

        {/* Glucides */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-xl font-bold text-gray-800">
            {nutritionPreview.carbs} g
          </div>
          <div className="text-sm text-gray-500">Glucides</div>
        </div>

        {/* Lipides */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-xl font-bold text-gray-800">
            {nutritionPreview.fat} g
          </div>
          <div className="text-sm text-gray-500">Lipides</div>
        </div>

        {/* Fibres */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-xl font-bold text-gray-800">
            {nutritionPreview.fiber} g
          </div>
          <div className="text-sm text-gray-500">Fibres</div>
        </div>

        {/* Sucres */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-xl font-bold text-gray-800">
            {nutritionPreview.sugar} g
          </div>
          <div className="text-sm text-gray-500">Sucres</div>
        </div>

        {/* Coût estimé */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-xl font-bold text-gray-800">{costPreview} €</div>
          <div className="text-sm text-gray-500">Coût estimé</div>
        </div>
      </div>
    </div>
  );
}
