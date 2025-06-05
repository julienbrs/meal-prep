"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Meal, RecipeIngredient } from "@/types/meal";
import { loadMeals, updateMeal } from "@/services/dataservice";
import {
  calculateRecipeNutrition,
  calculateRecipeCost,
} from "@/utils/nutritionCalculator";
import { useFoodItems } from "@/context/FoodItemsContext";
import BasicInformation from "@/components/create-recipe/BasicInformation";
import IngredientsSection from "@/components/create-recipe/IngredientsSection";
import InstructionsSection from "@/components/create-recipe/InstructionsSection";
import NutritionPreview from "@/components/create-recipe/NutritionPreview";
import ImageUpload from "@/components/ImageUpload";
import { useUser } from "@/context/UserContext";

type MealCategory = "breakfast" | "lunch" | "dinner" | "snack" | "appetizer";

export default function EditRecipe() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [_, setImageFile] = useState<File | null>(null);
  const [showAddFoodItemModal, setShowAddFoodItemModal] = useState(false);
  const { currentUser } = useUser();
  const {
    foodItems,
    reloadFoodItems,
    isLoading: foodItemsLoading,
    error: foodItemsError,
  } = useFoodItems();

  const [recipe, setRecipe] = useState<Partial<Meal>>({
    name: "",
    description: "",
    categories: ["dinner" as MealCategory],
    preparationTime: 30,
    ingredients: [],
    instructions: [""],
    image: "",
    createdBy: currentUser.id,
  });

  const [newIngredient, setNewIngredient] = useState<Partial<RecipeIngredient>>(
    {
      foodItemId: "",
      amount: 0,
      unit: "g",
    }
  );

  const handleAddFoodItem = () => {
    setShowAddFoodItemModal(true);
  };

  // Charger la recette existante
  useEffect(() => {
    async function loadExistingRecipe() {
      setInitialLoading(true);
      try {
        const meals = await loadMeals();
        const existingMeal = meals.find((m) => m.id === id);

        if (existingMeal) {
          setRecipe({
            ...existingMeal,
            preparationTime: existingMeal.preparationTime || 30,
          });
        } else {
          setError("Recette non trouvée");
        }
      } catch (err) {
        console.error("Erreur lors du chargement de la recette:", err);
        setError("Impossible de charger la recette");
      } finally {
        setInitialLoading(false);
      }
    }

    if (id) {
      loadExistingRecipe();
    }
  }, [id]);

  // Tous les handlers restent identiques à CreateRecipe
  const handleRecipeChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setRecipe((prev) => ({
      ...prev,
      [name]:
        name === "preparationTime"
          ? value === ""
            ? ""
            : parseInt(value) || 0 // Permettre une chaîne vide temporairement
          : value,
    }));
  };

  const handleCategoriesChange = (selectedCategories: MealCategory[]) => {
    setRecipe((prev) => ({
      ...prev,
      categories: selectedCategories,
    }));
  };

  const handleImageChange = (file: File | null, path: string | null) => {
    setImageFile(file);
    if (path) {
      setRecipe((prev) => ({
        ...prev,
        image: path,
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
    return foodItems.find((item) => item.id === id)?.name || "Élément inconnu";
  };

  const nutritionPreview = recipe.ingredients?.length
    ? calculateRecipeNutrition(
        recipe.ingredients as RecipeIngredient[],
        foodItems
      )
    : null;

  const costPreview = recipe.ingredients?.length
    ? calculateRecipeCost(recipe.ingredients as RecipeIngredient[], foodItems)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !recipe.name ||
      !recipe.categories?.length ||
      recipe.ingredients?.length === 0 ||
      recipe.instructions?.some((i) => !i)
    ) {
      setError(
        "Veuillez remplir tous les champs obligatoires et ajouter au moins un ingrédient."
      );
      return;
    }

    try {
      setLoading(true);

      const updatedRecipe: Meal = {
        ...(recipe as Meal),
        id: id, // Garder l'ID existant
        calculatedNutrition: nutritionPreview || undefined,
        totalCost: costPreview,
      };

      const success = await updateMeal(updatedRecipe, foodItems);

      if (success) {
        console.log("✅ Recette mise à jour. Actualisation des aliments...");
        await reloadFoodItems();

        setSuccessMessage("Recette mise à jour avec succès !");

        setTimeout(() => {
          router.push(`/meals/${id}`);
        }, 2000);
      } else {
        setError("Échec de la mise à jour de la recette. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la recette:", err);
      setError(
        "Une erreur s'est produite lors de la mise à jour de la recette."
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading || foodItemsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-emerald-600">
          Chargement de la recette...
        </span>
      </div>
    );
  }

  if (error && !recipe.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
        <Link
          href="/recipes-list"
          className="text-emerald-600 hover:text-emerald-800"
        >
          Retour aux recettes
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href={`/meals/${id}`}
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
          Retour à la Recette
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">
            Modifier "{recipe.name}"
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          {/* Image Upload */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">
              Image de la Recette
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
            handleCategoriesChange={handleCategoriesChange}
          />

          {/* Ingredients Section */}
          <IngredientsSection
            recipeIngredients={recipe.ingredients as RecipeIngredient[]}
            newIngredient={newIngredient}
            foodItems={foodItems}
            addIngredient={addIngredient}
            removeIngredient={removeIngredient}
            handleIngredientChange={handleIngredientChange}
            onAddFoodItem={handleAddFoodItem}
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
              href={`/meals/${id}`}
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Annuler
            </Link>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Mise à jour en cours..." : "Mettre à jour la Recette"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
