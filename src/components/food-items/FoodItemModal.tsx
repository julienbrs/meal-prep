import React, { useState, useEffect } from "react";
import { FoodItem, UnitType, NutritionInfo } from "@/types/ingredient";

// Define an interface for the modal's internal state
interface FoodItemFormState {
  id: string;
  name: string;
  category: string;
  units: UnitType;
  nutritionPer100g: {
    calories: number | string;
    protein: number | string;
    carbs: number | string;
    fat: number | string;
    fiber: number | string;
    sugar: number | string;
  };
  price: number | string;
  priceUnit: string;
  weightPerPiece?: number | string;
}

interface FoodItemModalProps {
  item?: FoodItem;
  onSave: (item: FoodItem) => void;
  onClose: () => void;
  isDuplicate?: boolean; // Nouvelle prop pour indiquer la duplication
}

const FoodItemModal: React.FC<FoodItemModalProps> = ({
  item,
  onSave,
  onClose,
  isDuplicate = false, // Valeur par défaut à false
}) => {
  const [foodItem, setFoodItem] = useState<FoodItemFormState>(
    item
      ? convertToFormState(item)
      : {
          id: "",
          name: "",
          category: "",
          units: "g" as UnitType,
          nutritionPer100g: {
            calories: "",
            protein: "",
            carbs: "",
            fat: "",
            fiber: "",
            sugar: "",
          },
          price: "",
          priceUnit: "pour 100g",
          weightPerPiece: "",
        }
  );

  // Helper function to convert FoodItem to FormState
  function convertToFormState(item: FoodItem): FoodItemFormState {
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      units: item.units,
      nutritionPer100g: {
        calories: item.nutritionPer100g.calories,
        protein: item.nutritionPer100g.protein,
        carbs: item.nutritionPer100g.carbs,
        fat: item.nutritionPer100g.fat,
        fiber: item.nutritionPer100g.fiber || "",
        sugar: item.nutritionPer100g.sugar || "",
      },
      price: item.price,
      priceUnit: item.priceUnit,
      weightPerPiece: item.weightPerPiece || "",
    };
  }

  useEffect(() => {
    // Update priceUnit when units change
    if (foodItem.units === "piece" && foodItem.priceUnit !== "par pièce") {
      setFoodItem((prev) => ({ ...prev, priceUnit: "par pièce" }));
    } else if (
      foodItem.units !== "piece" &&
      foodItem.priceUnit === "par pièce"
    ) {
      setFoodItem((prev) => ({ ...prev, priceUnit: "pour 100g" }));
    }
  }, [foodItem.units]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: string
  ) => {
    const value = e.target.value;

    // Si c'est un champ numérique, valider qu'il ne contient que des nombres
    if (key === "price" || key === "weightPerPiece") {
      if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setFoodItem((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setFoodItem((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleNutritionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    nutrient: string
  ) => {
    const value = e.target.value;

    // Valider que la valeur est un nombre ou vide
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setFoodItem((prev) => ({
        ...prev,
        nutritionPer100g: {
          ...prev.nutritionPer100g,
          [nutrient]: value,
        },
      }));
    }
  };

  const categories = [
    { value: "vegetable", label: "Légume" },
    { value: "fruit", label: "Fruit" },
    { value: "dairy", label: "Produit laitier" },
    { value: "protein", label: "Protéine" },
    { value: "meat", label: "Viande" },
    { value: "fish", label: "Poisson" },
    { value: "grain", label: "Céréale" },
    { value: "starch", label: "Féculent" },
    { value: "legume", label: "Légumineuse" },
    { value: "spice", label: "Épice" },
    { value: "herb", label: "Herbe aromatique" },
    { value: "condiment", label: "Condiment" },
    { value: "sauce", label: "Sauce" },
    { value: "fat", label: "Matière grasse" },
    { value: "sweet", label: "Sucre et douceurs" },
    { value: "beverage", label: "Boisson" },
    { value: "nut", label: "Fruit à coque" },
    { value: "processed", label: "Aliment transformé" },
    { value: "baking", label: "Ingrédient de pâtisserie" },
    { value: "misc", label: "Divers" },
  ];

  const units: { value: UnitType; label: string }[] = [
    { value: "g", label: "Grammes (g)" },
    { value: "ml", label: "Millilitres (ml)" },
    { value: "piece", label: "Pièce" },
    { value: "tbsp", label: "Cuillère à soupe (c. à s.)" },
    { value: "tsp", label: "Cuillère à café (c. à c.)" },
    { value: "cup", label: "Tasse" },
  ];

  const getNutritionLabel = (): string => {
    return "Nutrition (pour 100g)";
  };

  const handleSave = () => {
    // Convert form state to FoodItem type with proper data types
    const preparedItem: FoodItem = {
      id: foodItem.id,
      name: foodItem.name,
      category: foodItem.category,
      units: foodItem.units,
      price: convertToNumber(foodItem.price, 0),
      priceUnit: foodItem.priceUnit,
      weightPerPiece:
        foodItem.units === "piece"
          ? convertToNumber(foodItem.weightPerPiece, 100)
          : foodItem.weightPerPiece !== undefined &&
            foodItem.weightPerPiece !== ""
          ? convertToNumber(foodItem.weightPerPiece, 0)
          : undefined,
      nutritionPer100g: {
        calories: convertToNumber(foodItem.nutritionPer100g.calories, 0),
        protein: convertToNumber(foodItem.nutritionPer100g.protein, 0),
        carbs: convertToNumber(foodItem.nutritionPer100g.carbs, 0),
        fat: convertToNumber(foodItem.nutritionPer100g.fat, 0),
        fiber: convertToNumber(foodItem.nutritionPer100g.fiber, 0),
        sugar: convertToNumber(foodItem.nutritionPer100g.sugar, 0),
      },
    };

    onSave(preparedItem);
  };

  // Helper function to convert string or undefined values to numbers
  function convertToNumber(
    value: string | number | undefined,
    defaultValue: number
  ): number {
    if (value === undefined || value === "") {
      return defaultValue;
    }
    return typeof value === "string" ? parseFloat(value) : value;
  }

  return (
    <div className="fixed inset-y-0 right-0 flex z-50">
      <div className="w-screen max-w-2xl bg-white shadow-lg flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {isDuplicate
              ? `Dupliquer ${item?.name || ""}`
              : item
              ? `Modifier ${item.name}`
              : "Ajouter un Nouvel Aliment"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={foodItem.name}
                  onChange={(e) => handleInputChange(e, "name")}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  value={foodItem.category}
                  onChange={(e) => handleInputChange(e, "category")}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="" disabled>
                    Sélectionner une catégorie
                  </option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Units & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unités
                </label>
                <select
                  value={foodItem.units}
                  onChange={(e) => handleInputChange(e, "units")}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix pour 100g (€)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">€</span>
                  </div>
                  <input
                    type="text"
                    value={foodItem.price}
                    onChange={(e) => handleInputChange(e, "price")}
                    placeholder="0.00"
                    className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Weight Per Piece - Seulement affiché si l'unité est "piece" */}
            {foodItem.units === "piece" && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poids moyen par pièce (en grammes)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={foodItem.weightPerPiece || ""}
                    onChange={(e) => handleInputChange(e, "weightPerPiece")}
                    placeholder="ex: 150 pour une pomme moyenne"
                    className="w-full p-2 border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors placeholder-amber-300 bg-white"
                  />
                  <div className="mt-1 text-sm text-amber-600">
                    Cette valeur sera utilisée pour calculer les informations
                    nutritionnelles équivalentes à 100g.
                  </div>
                </div>
              </div>
            )}

            {/* Nutrition Information */}
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                {getNutritionLabel()}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                {[
                  { name: "calories", label: "Calories" },
                  { name: "protein", label: "Protéines (g)" },
                  { name: "carbs", label: "Glucides (g)" },
                  { name: "fat", label: "Lipides (g)" },
                  { name: "fiber", label: "Fibres (g)" },
                  { name: "sugar", label: "Sucres (g)" },
                ].map((nutrient) => (
                  <div key={nutrient.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {nutrient.label}
                    </label>
                    <input
                      type="text"
                      value={
                        foodItem.nutritionPer100g[
                          nutrient.name as keyof typeof foodItem.nutritionPer100g
                        ]
                      }
                      onChange={(e) => handleNutritionChange(e, nutrient.name)}
                      placeholder="0.0"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder-gray-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!foodItem.name || !foodItem.category}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isDuplicate ? "Créer une copie" : item ? "Mettre à jour" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodItemModal;
