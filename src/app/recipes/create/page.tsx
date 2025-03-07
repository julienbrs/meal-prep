"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Meal, RecipeIngredient } from "@/types/meal";
import { FoodItem } from "@/types/ingredient";
import { loadFoodItems, addMeal } from "@/services/dataservice";
import {
  calculateRecipeNutrition,
  calculateRecipeCost,
} from "@/utils/nutritionCalculator";
import { preloadFoodItems } from "@/utils/foodItemFetcher";
import AutoExtractModal from "@/components/create-recipe/AutoExtractModal";

export default function CreateRecipe() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoInput, setAutoInput] = useState("");

  const [recipe, setRecipe] = useState<Partial<Meal>>({
    name: "",
    description: "",
    category: "dinner",
    preparationTime: 30,
    ingredients: [],
    instructions: [""],
  });

  const [newIngredient, setNewIngredient] = useState<Partial<RecipeIngredient>>(
    {
      foodItemId: "",
      amount: 0,
      unit: "g",
    }
  );

  useEffect(() => {
    async function fetchFoodItems() {
      setLoading(true);
      try {
        const items = await loadFoodItems();
        await preloadFoodItems();
        setFoodItems(items);
        setError(null);
      } catch (err) {
        console.error("Failed to load food items:", err);
        setError("Failed to load food items. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchFoodItems();
  }, []);

  const handleAutoExtract = async () => {
    if (!autoInput.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/extract-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: autoInput }),
      });

      const data = await response.json();
      if (data.success) {
        setRecipe(data.recipe);
        setIsAutoMode(false);
      } else {
        setError("Failed to extract recipe. Please try again.");
      }
    } catch (err) {
      console.error("Error extracting recipe:", err);
      setError("An error occurred while extracting the recipe.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({
      ...prev,
      [name]: name === "preparationTime" ? parseInt(value) || 0 : value,
    }));
  };

  const handleIngredientChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewIngredient((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const addIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient.foodItemId || !newIngredient.amount) {
      return;
    }

    const selectedFood = foodItems.find(
      (item) => item.id === newIngredient.foodItemId
    );

    const ingredient: RecipeIngredient = {
      foodItemId: newIngredient.foodItemId as string,
      amount: newIngredient.amount as number,
      unit: newIngredient.unit || selectedFood?.units || "g",
    };

    setRecipe((prev) => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), ingredient],
    }));

    setNewIngredient({
      foodItemId: "",
      amount: 0,
      unit: "g",
    });
  };

  const removeIngredient = (index: number) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleInstructionChange = (index: number, value: string) => {
    setRecipe((prev) => {
      const updatedInstructions = [...(prev.instructions || [])];
      updatedInstructions[index] = value;
      return {
        ...prev,
        instructions: updatedInstructions,
      };
    });
  };

  const addInstructionStep = () => {
    setRecipe((prev) => ({
      ...prev,
      instructions: [...(prev.instructions || []), ""],
    }));
  };

  const removeInstructionStep = (index: number) => {
    setRecipe((prev) => ({
      ...prev,
      instructions: prev.instructions?.filter((_, i) => i !== index) || [],
    }));
  };

  const nutritionPreview = recipe.ingredients?.length
    ? calculateRecipeNutrition(recipe.ingredients as RecipeIngredient[])
    : null;

  const costPreview = recipe.ingredients?.length
    ? calculateRecipeCost(recipe.ingredients as RecipeIngredient[])
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("click");
    e.preventDefault();

    if (
      !recipe.name ||
      !recipe.category ||
      recipe.ingredients?.length === 0 ||
      recipe.instructions?.some((i) => !i)
    ) {
      console.log("recipe:", recipe);
      console.log("error");
      setError(
        "Please fill in all required fields and add at least one ingredient."
      );
      return;
    }

    try {
      setLoading(true);

      const newRecipe: Meal = {
        id: "",
        name: recipe.name as string,
        description: recipe.description || "",
        category: recipe.category as "breakfast" | "lunch" | "dinner" | "snack",
        preparationTime: recipe.preparationTime as number,
        ingredients: recipe.ingredients as RecipeIngredient[],
        instructions: recipe.instructions as string[],
        calculatedNutrition: nutritionPreview || undefined,
        totalCost: costPreview,
      };

      const success = await addMeal(newRecipe);

      if (success) {
        setSuccessMessage("Recipe created successfully!");
        setRecipe({
          name: "",
          description: "",
          category: "dinner",
          preparationTime: 30,
          ingredients: [],
          instructions: [""],
        });

        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError("Failed to create recipe. Please try again.");
      }
    } catch (err) {
      console.error("Error creating recipe:", err);
      setError("An error occurred while creating the recipe.");
    } finally {
      setLoading(false);
    }
  };

  const getFoodItemName = (id: string) => {
    return foodItems.find((item) => item.id === id)?.name || "Unknown item";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="text-green-600 hover:text-green-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Recipes
        </Link>

        <button
          onClick={() => setIsAutoMode(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
        >
          Mode Automatique
        </button>
      </div>

      {isAutoMode && (
        <AutoExtractModal
          onClose={() => setIsAutoMode(false)}
          onExtractSuccess={(data) => {
            console.log("Extracted Data:", data);

            // mapping foodItemId (name) to the actual food item ID from the db
            const mappedIngredients = data.ingredients.map(
              (ingredient: { foodItemId: string; amount: any; unit: any }) => {
                const matchedFood = foodItems.find(
                  (item) =>
                    item.name.toLowerCase() ===
                    ingredient.foodItemId.toLowerCase()
                );
                console.log("matchedFOod:", matchedFood);

                return matchedFood
                  ? {
                      foodItemId: matchedFood.id,
                      amount: ingredient.amount,
                      unit: matchedFood.units,
                    }
                  : {
                      foodItemId: "unknown",
                      amount: ingredient.amount,
                      unit: ingredient.unit,
                    };
              }
            );

            setRecipe({
              ...data,
              ingredients: mappedIngredients,
            });
          }}
        />
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Create New Recipe</h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
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

          {/* Ingredients Section */}
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
              Ingredients
            </h2>

            {/* New Ingredient Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-md font-medium mb-3 text-gray-700">
                Add Ingredient
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="foodItemId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Food Item *
                  </label>
                  <select
                    id="foodItemId"
                    name="foodItemId"
                    value={newIngredient.foodItemId}
                    onChange={handleIngredientChange}
                    className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                  >
                    <option value="">Select an item</option>
                    {foodItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Amount *
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
                    Unit *
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={newIngredient.unit}
                    onChange={handleIngredientChange}
                    className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="piece">Piece</option>
                    <option value="tbsp">Tablespoon (tbsp)</option>
                    <option value="tsp">Teaspoon (tsp)</option>
                    <option value="cup">Cup</option>
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
                  Add Ingredient
                </button>
              </div>
            </div>

            {/* Ingredients List */}
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Item
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
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
                    {recipe.ingredients.map((ingredient, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getFoodItemName(ingredient.foodItemId)}
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
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No ingredients added yet</p>
              </div>
            )}
          </div>

          {/* Instructions Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-emerald-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              Instructions
            </h2>
            <div className="space-y-4">
              {recipe.instructions?.map((instruction, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-shrink-0 bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center mt-1">
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-grow">
                    <textarea
                      value={instruction}
                      onChange={(e) =>
                        handleInstructionChange(index, e.target.value)
                      }
                      rows={2}
                      className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                      placeholder={`Step ${index + 1} instructions...`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeInstructionStep(index)}
                    className="text-red-600 hover:text-red-900 mt-2"
                    disabled={(recipe.instructions?.length ?? 0) <= 1}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={addInstructionStep}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
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
                  Add Step
                </button>
              </div>
            </div>
          </div>

          {/* Nutrition Preview */}
          {nutritionPreview && (
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
                Nutrition Preview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-xl font-bold text-gray-800">
                    {nutritionPreview.calories}
                  </div>
                  <div className="text-sm text-gray-500">Calories</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-xl font-bold text-gray-800">
                    {nutritionPreview.protein}g
                  </div>
                  <div className="text-sm text-gray-500">Protein</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-xl font-bold text-gray-800">
                    {nutritionPreview.carbs}g
                  </div>
                  <div className="text-sm text-gray-500">Carbs</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-xl font-bold text-gray-800">
                    {nutritionPreview.fat}g
                  </div>
                  <div className="text-sm text-gray-500">Fat</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-xl font-bold text-gray-800">
                    ${costPreview}
                  </div>
                  <div className="text-sm text-gray-500">Estimated Cost</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Link
              href="/"
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
