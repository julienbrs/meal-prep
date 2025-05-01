"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Meal, RecipeIngredient } from "@/types/meal";
import { loadFoodItems, addMeal } from "@/services/dataservice";
import {
  calculateRecipeNutrition,
  calculateRecipeCost,
} from "@/utils/nutritionCalculator";
import { preloadFoodItems } from "@/utils/foodItemFetcher";
import { useFoodItems } from "@/context/FoodItemsContext";
import BasicInformation from "@/components/create-recipe/BasicInformation";
import IngredientsSection from "@/components/create-recipe/IngredientsSection";
import InstructionsSection from "@/components/create-recipe/InstructionsSection";
import NutritionPreview from "@/components/create-recipe/NutritionPreview";
import AutoExtractSection from "@/components/create-recipe/AutoExtractSection";
import ImageUpload from "@/components/ImageUpload";

export default function CreateRecipe() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [_, setImageFile] = useState<File | null>(null);
  const {
    foodItems,
    reloadFoodItems,
    isLoading: foodItemsLoading,
    error: foodItemsError,
  } = useFoodItems();

  const [recipe, setRecipe] = useState<Partial<Meal>>({
    name: "",
    description: "",
    category: "dinner",
    preparationTime: 30,
    ingredients: [],
    instructions: [""],
    image: "",
  });

  const [newIngredient, setNewIngredient] = useState<Partial<RecipeIngredient>>(
    {
      foodItemId: "",
      amount: 0,
      unit: "g",
    }
  );

  // -------------------------
  // Handlers
  // -------------------------
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

  const handleImageChange = (file: File | null, path: string | null) => {
    setImageFile(file);
    if (path) {
      setRecipe((prev) => ({
        ...prev,
        image: path, // Store the path instead of base64
      }));
    } else {
      setRecipe((prev) => ({
        ...prev,
        image: "",
      }));
    }
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

  const getFoodItemName = (id: string) => {
    const result =
      foodItems.find((item) => item.id === id)?.name || "Unknown item";

    if (result === "Unknown item") {
      console.warn(`⚠️ Could not find food item for ID: ${id}`);
    }

    return result;
  };

  // -------------------------
  // Nutrition & Cost
  // -------------------------
  const nutritionPreview = recipe.ingredients?.length
    ? calculateRecipeNutrition(
        recipe.ingredients as RecipeIngredient[],
        foodItems
      )
    : null;

  const costPreview = recipe.ingredients?.length
    ? calculateRecipeCost(recipe.ingredients as RecipeIngredient[], foodItems)
    : 0;

  // -------------------------
  // Submit
  // -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !recipe.name ||
      !recipe.category ||
      recipe.ingredients?.length === 0 ||
      recipe.instructions?.some((i) => !i)
    ) {
      setError(
        "Please fill in all required fields and add at least one ingredient."
      );
      return;
    }

    try {
      setLoading(true);

      // Here you would typically handle image upload to your server or storage
      // and get back a URL to store in the recipe
      // For now, we'll just use the data URL that's stored in recipe.image

      const newRecipe: Meal = {
        id: "",
        name: recipe.name as string,
        description: recipe.description || "",
        category: recipe.category as
          | "breakfast"
          | "lunch"
          | "dinner"
          | "snack"
          | "appetizer",
        preparationTime: recipe.preparationTime as number,
        ingredients: recipe.ingredients as RecipeIngredient[],
        instructions: recipe.instructions as string[],
        calculatedNutrition: nutritionPreview || undefined,
        totalCost: costPreview,
        image: recipe.image || "",
      };

      const success = await addMeal(newRecipe, foodItems);

      if (success) {
        console.log("✅ New meal added. Refreshing food items...");
        await reloadFoodItems();

        setSuccessMessage("Recipe created successfully!");
        setRecipe({
          name: "",
          description: "",
          category: "dinner",
          preparationTime: 30,
          ingredients: [],
          instructions: [""],
          image: "",
        });
        setImageFile(null);

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

  // -------------------------
  // Auto Mode
  // -------------------------
  const handleAutoExtractSuccess = async (data: any) => {
    console.log("Frontend: Extracted Data:", data);

    await preloadFoodItems();
    const updatedFoodItems = await loadFoodItems();

    if (!data.ingredients || data.ingredients.length === 0) {
      console.error("⚠️ No ingredients found in extracted data!");
      return;
    }

    // Map ingredients
    const mappedIngredients: RecipeIngredient[] = data.ingredients.map(
      (ingredient: any) => {
        let matchedFood = updatedFoodItems.find(
          (item) => item.name.toLowerCase() === ingredient.name.toLowerCase()
        );

        if (!matchedFood) {
          console.warn(
            `⚠️ Ingredient "${ingredient.name}" not found in DB, using fallback ID.`
          );
          matchedFood = {
            id: ingredient.name.toLowerCase().replace(/\s+/g, "-"),
            name: ingredient.name,
            units: ingredient.unit || "g",
            nutritionPer100g: ingredient.nutritionPer100g || {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
            },
            price: ingredient.price || 0,
            priceUnit: ingredient.priceUnit || "per 100g",
            category: "dinner",
          };
        }

        const unit = ingredient.unit || matchedFood.units || "g";

        return {
          foodItemId: matchedFood.id,
          name: matchedFood.name,
          amount: ingredient.amount,
          unit: unit,
          nutritionPer100g: matchedFood.nutritionPer100g,
          price: matchedFood.price,
          priceUnit: matchedFood.priceUnit,
        };
      }
    );

    setRecipe((prev) => ({
      ...prev,
      name: data.name,
      description: data.description,
      ingredients: mappedIngredients,
      instructions: data.steps || [],
      category: data.category || "dinner",
    }));
  };

  // -------------------------
  // Render
  // -------------------------
  if (foodItemsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-emerald-600">Loading food items...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/recipes-list"
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
          onClick={async () => {
            console.log("Manually refreshing food items...");
            await reloadFoodItems();
          }}
          className="bg-white text-emerald-600 hover:text-emerald-700 px-4 py-2 rounded-lg shadow"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Create New Recipe</h1>
        </div>
        {foodItemsError && (
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
                <p className="text-sm text-red-700">{foodItemsError}</p>
              </div>
            </div>
          </div>
        )}

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
          {/* Auto Extract Section */}
          <AutoExtractSection onExtractSuccess={handleAutoExtractSuccess} />

          {/* Image Upload */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">
              Recipe Image
            </h2>
            <ImageUpload
              onImageChange={handleImageChange}
              initialImage={recipe.image as string}
              className="mt-2"
            />
          </div>

          {/* Basic Information */}
          <BasicInformation
            recipe={recipe}
            handleRecipeChange={handleRecipeChange}
          />

          {/* Ingredients Section */}
          <IngredientsSection
            recipeIngredients={recipe.ingredients as RecipeIngredient[]}
            newIngredient={newIngredient}
            foodItems={foodItems}
            addIngredient={addIngredient}
            removeIngredient={removeIngredient}
            handleIngredientChange={handleIngredientChange}
            getFoodItemName={getFoodItemName}
          />

          {/* Instructions Section */}
          <InstructionsSection
            instructions={recipe.instructions || [""]}
            addInstructionStep={addInstructionStep}
            removeInstructionStep={removeInstructionStep}
            handleInstructionChange={handleInstructionChange}
          />

          {/* Nutrition Preview */}
          <NutritionPreview
            nutritionPreview={nutritionPreview}
            costPreview={costPreview}
          />

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
