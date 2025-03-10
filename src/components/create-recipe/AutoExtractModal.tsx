"use client";
import React, { useState } from "react";
import CreateFoodItemModal from "./CreateFoodItemModal";

export default function AutoExtractModal({
  onClose,
  onExtractSuccess,
}: {
  onClose: () => void;
  onExtractSuccess: (data: any) => void;
}) {
  const [recipeText, setRecipeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingIngredients, setMissingIngredients] = useState<any[]>([]);
  const [isFoodItemModalOpen, setIsFoodItemModalOpen] = useState(false);

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
          setIsFoodItemModalOpen(true); // 🔴 Show popup to create missing food items
        } else {
          onExtractSuccess(result.data);
          onClose();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-2">Paste a recipe here</h2>
        <textarea
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          className="w-full p-2 border rounded-md"
          rows={6}
          placeholder="Copy paste a recipe here..."
        ></textarea>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleExtract}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600"
            disabled={loading}
          >
            {loading ? "Extracting..." : "Extract"}
          </button>
        </div>
      </div>

      {isFoodItemModalOpen && (
        <CreateFoodItemModal
          missingIngredients={missingIngredients}
          onClose={() => setIsFoodItemModalOpen(false)}
          onComplete={() => {
            setIsFoodItemModalOpen(false);
            handleExtract(); // 🔄 Re-extract the recipe after adding ingredients
          }}
        />
      )}
    </div>
  );
}
