"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Meal, RecipeIngredient } from "@/types/meal";
import { loadFoodItems, addMeal, addFoodItem } from "@/services/dataservice";
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
import { useUser } from "@/context/UserContext";
import FoodItemModal from "@/components/food-items/FoodItemModal";

// Définir un type pour les catégories autorisées
type MealCategory = "breakfast" | "lunch" | "dinner" | "snack" | "appetizer";

export default function CreateRecipe() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [_, setImageFile] = useState<File | null>(null);
  const { currentUser } = useUser();
  const {
    foodItems,
    reloadFoodItems,
    isLoading: foodItemsLoading,
    error: foodItemsError,
  } = useFoodItems();
  const [isFoodItemModalOpen, setIsFoodItemModalOpen] = useState(false);

  // Mise à jour de l'état initial avec un tableau de catégories
  const [recipe, setRecipe] = useState<Partial<Meal>>({
    name: "",
    description: "",
    categories: ["dinner" as MealCategory], // Tableau au lieu de value unique avec type correct
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

  // Nouveau gestionnaire pour les catégories multiples
  const handleCategoriesChange = (selectedCategories: MealCategory[]) => {
    setRecipe((prev) => ({
      ...prev,
      categories: selectedCategories,
    }));
  };

  const handleSaveFoodItem = async (newItem: any) => {
    try {
      // 1) Envoyer au backend
      await addFoodItem(newItem);
      // 2) Recharger la liste dans le Context
      await reloadFoodItems();
      // 3) Fermer le modal
      setIsFoodItemModalOpen(false);
    } catch (err) {
      console.error("Erreur lors de la création du food item:", err);
      // Vous pouvez afficher un message d’erreur ici si besoin
    }
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
      foodItems.find((item) => item.id === id)?.name || "Élément inconnu";

    if (result === "Élément inconnu") {
      console.warn(`⚠️ Impossible de trouver l'élément pour l'ID: ${id}`);
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
      !recipe.categories?.length || // Vérifier que les catégories ne sont pas vides
      recipe.ingredients?.length === 0
    ) {
      setError(
        "Veuillez remplir tous les champs obligatoires et ajouter au moins un ingrédient."
      );
      return;
    }

    try {
      setLoading(true);

      const newRecipe: Meal = {
        id: "",
        name: recipe.name as string,
        description: recipe.description || "",
        categories: recipe.categories as MealCategory[],
        preparationTime: recipe.preparationTime as number,
        ingredients: recipe.ingredients as RecipeIngredient[],
        instructions: recipe.instructions as string[],
        calculatedNutrition: nutritionPreview || undefined,
        totalCost: costPreview,
        image: recipe.image || "",
        createdBy: recipe.createdBy || currentUser.id,
      };

      const success = await addMeal(newRecipe, foodItems);

      if (success) {
        console.log("✅ Nouveau repas ajouté. Actualisation des aliments...");
        await reloadFoodItems();

        setSuccessMessage("Recette créée avec succès !");
        setRecipe({
          name: "",
          description: "",
          categories: ["dinner" as MealCategory], // Réinitialiser avec une catégorie par défaut
          preparationTime: 30,
          ingredients: [],
          instructions: [""],
          image: "",
          createdBy: currentUser.id,
        });
        setImageFile(null);

        setTimeout(() => {
          router.push("/recipes-list");
        }, 2000);
      } else {
        setError("Échec de la création de la recette. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur lors de la création de la recette:", err);
      setError("Une erreur s'est produite lors de la création de la recette.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Auto Mode
  // -------------------------
  const handleAutoExtractSuccess = async (data: any) => {
    console.log("Frontend: Données extraites:", data);

    await preloadFoodItems();
    const updatedFoodItems = await loadFoodItems();

    if (!data.ingredients || data.ingredients.length === 0) {
      console.error("⚠️ Aucun ingrédient trouvé dans les données extraites !");
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
            `⚠️ Ingrédient "${ingredient.name}" non trouvé dans la base de données, utilisation d'un ID de secours.`
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
            priceUnit: ingredient.priceUnit || "pour 100g",
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

    // Convertir la catégorie simple en tableau avec le bon type
    const categories = data.category
      ? [data.category as MealCategory]
      : ["dinner" as MealCategory];

    setRecipe((prev) => ({
      ...prev,
      name: data.name,
      description: data.description,
      ingredients: mappedIngredients,
      instructions: data.steps || [],
      categories: categories, // Mise à jour pour utiliser le tableau de catégories
    }));
  };

  // -------------------------
  // Render
  // -------------------------
  if (foodItemsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-emerald-600">
          Chargement des aliments...
        </span>
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
          Retour aux Recettes
        </Link>

        <button
          onClick={async () => {
            console.log("Actualisation manuelle des aliments...");
            await reloadFoodItems();
          }}
          className="bg-white text-emerald-600 hover:text-emerald-700 px-4 py-2 rounded-lg shadow"
        >
          Actualiser
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">
            Créer une Nouvelle Recette
          </h1>
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
            getFoodItemName={getFoodItemName}
            onAddFoodItem={() => setIsFoodItemModalOpen(true)}
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
              href="/recipes-list"
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Annuler
            </Link>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Création en cours...
                </div>
              ) : (
                "Créer la Recette"
              )}
            </button>
          </div>
        </form>
        {isFoodItemModalOpen && (
          <FoodItemModal
            onSave={handleSaveFoodItem}
            onClose={() => setIsFoodItemModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
