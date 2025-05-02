"use client";
import React, { useState } from "react";
import CreateFoodItemModal from "./CreateFoodItemModal";
import { useFoodItems } from "@/context/FoodItemsContext";

export default function AutoExtractSection({
  onExtractSuccess,
}: {
  onExtractSuccess: (data: any) => void;
}) {
  const [recipeText, setRecipeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingIngredients, setMissingIngredients] = useState<any[]>([]);
  const [isFoodItemModalOpen, setIsFoodItemModalOpen] = useState(false);
  const { reloadFoodItems } = useFoodItems();

  const handleExtract = async () => {
    if (!recipeText.trim()) {
      setError("Please paste a recipe.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/extract-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeText }),
      });
      const result = await response.json();
      if (result.success) {
        if (result.missingIngredients.length > 0) {
          setMissingIngredients(result.missingIngredients);
          setIsFoodItemModalOpen(true);
        } else {
          onExtractSuccess(result.data);
          setRecipeText("");
        }
      } else {
        setError("Failed to extract recipe. Try again.");
      }
    } catch (err) {
      console.error("Error extracting recipe:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex gap-3">
        <textarea
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          className="flex-grow p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none h-[42px] overflow-y-auto bg-white"
          placeholder="Paste your recipe here..."
        />
        <button
          onClick={handleExtract}
          disabled={loading}
          className="px-6 py-2 bg-[#F85B1D] text-white font-semibold rounded-lg hover:bg-[#e54d10] transition-colors flex items-center gap-2 h-[42px]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Extracting...</span>
            </div>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Extract
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {isFoodItemModalOpen && (
        <CreateFoodItemModal
          missingIngredients={missingIngredients}
          onClose={() => setIsFoodItemModalOpen(false)}
          onComplete={() => {
            setIsFoodItemModalOpen(false);
            handleExtract();
          }}
        />
      )}
    </div>
  );
}
