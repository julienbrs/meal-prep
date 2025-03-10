"use client";
import React, { useState } from "react";
import CreateFoodItemModal from "./CreateFoodItemModal";

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
          setRecipeText(""); // Clear the input after successful extraction
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
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
      <h2 className="text-lg font-semibold mb-2 text-blue-700">
        Auto Extract Recipe
      </h2>
      <div className="flex flex-col md:flex-row gap-3">
        <textarea
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          className="flex-grow p-2 border rounded-md"
          rows={3}
          placeholder="Copy paste a recipe here..."
        ></textarea>
        <button
          onClick={handleExtract}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 md:self-end"
          disabled={loading}
        >
          {loading ? "Extracting..." : "Extract"}
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {isFoodItemModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CreateFoodItemModal
            missingIngredients={missingIngredients}
            onClose={() => setIsFoodItemModalOpen(false)}
            onComplete={() => {
              setIsFoodItemModalOpen(false);
              handleExtract();
            }}
          />
        </div>
      )}
    </div>
  );
}
