import React, { useState, useEffect } from "react";
import { addFoodItem } from "@/services/dataservice";
import { UnitType } from "@/types/ingredient";
import { useFoodItems } from "@/context/FoodItemsContext";

export default function CreateFoodItemModal({
  missingIngredients,
  onClose,
  onComplete,
}: {
  missingIngredients: any[];
  onClose: () => void;
  onComplete: () => void;
}) {
  const [isAutofilling, setIsAutofilling] = useState(false);
  const { reloadFoodItems } = useFoodItems();

  const handleAutoFill = async () => {
    setIsAutofilling(true);
    try {
      const response = await fetch("/api/auto-fill-food-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodItems }),
      });

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setFoodItems(result.data);
      } else {
        console.error(
          "Échec du remplissage automatique des éléments:",
          result.error
        );
      }
    } catch (err) {
      console.error("Erreur durant le remplissage automatique:", err);
    } finally {
      setIsAutofilling(false);
    }
  };

  const [foodItems, setFoodItems] = useState(
    missingIngredients.map((ing) => {
      const unit =
        ing.unit &&
        ["g", "ml", "piece", "tbsp", "tsp", "cup"].includes(ing.unit)
          ? (ing.unit as UnitType)
          : "g";

      return {
        id: ing.name.toLowerCase().replace(/\s+/g, "-"),
        name: ing.name,
        category: "misc", // Par défaut à misc, l'utilisateur sélectionnera la catégorie appropriée
        units: unit,
        price: "",
        priceUnit: unit === "piece" ? "par pièce" : "pour 100g",
        weightPerPiece: unit === "piece" ? "150" : "", // Valeur par défaut pour les aliments à la pièce
        nutritionPer100g: {
          calories: "",
          protein: "",
          carbs: "",
          fat: "",
          fiber: "",
          sugar: "",
        },
      };
    })
  );

  useEffect(() => {
    foodItems.forEach((item, index) => {
      if (item.units === "piece" && item.priceUnit !== "par pièce") {
        handleChange(index, "priceUnit", "par pièce");
      } else if (item.units !== "piece" && item.priceUnit === "par pièce") {
        handleChange(index, "priceUnit", "pour 100g");
      }
    });
  }, [foodItems.map((item) => item.units).join(",")]);

  const handleChange = (index: number, field: string, value: any) => {
    setFoodItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleNutritionChange = (
    index: number,
    field: string,
    value: string
  ) => {
    // Validation pour n'accepter que des nombres
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setFoodItems((prevItems) =>
        prevItems.map((item, i) =>
          i === index
            ? {
                ...item,
                nutritionPer100g: {
                  ...item.nutritionPer100g,
                  [field]: value,
                },
              }
            : item
        )
      );
    }
  };

  const handlePriceChange = (index: number, value: string) => {
    // Validation pour n'accepter que des nombres
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      handleChange(index, "price", value);
    }
  };

  const handleWeightPerPieceChange = (index: number, value: string) => {
    // Validation pour n'accepter que des nombres
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      handleChange(index, "weightPerPiece", value);
    }
  };

  const handleSave = async () => {
    try {
      // Convertir les valeurs vides en 0 avant l'enregistrement
      const preparedItems = foodItems.map((item) => ({
        ...item,
        price: item.price === "" ? 0 : parseFloat(item.price),
        weightPerPiece:
          item.weightPerPiece === ""
            ? item.units === "piece"
              ? 100
              : 0 // Valeur par défaut si unité est "piece"
            : parseFloat(item.weightPerPiece || "0"),
        nutritionPer100g: {
          calories:
            item.nutritionPer100g.calories === ""
              ? 0
              : parseFloat(item.nutritionPer100g.calories),
          protein:
            item.nutritionPer100g.protein === ""
              ? 0
              : parseFloat(item.nutritionPer100g.protein),
          carbs:
            item.nutritionPer100g.carbs === ""
              ? 0
              : parseFloat(item.nutritionPer100g.carbs),
          fat:
            item.nutritionPer100g.fat === ""
              ? 0
              : parseFloat(item.nutritionPer100g.fat),
          fiber:
            item.nutritionPer100g.fiber === ""
              ? 0
              : parseFloat(item.nutritionPer100g.fiber),
          sugar:
            item.nutritionPer100g.sugar === ""
              ? 0
              : parseFloat(item.nutritionPer100g.sugar),
        },
      }));

      for (const item of preparedItems) {
        await addFoodItem(item);
      }
      await reloadFoodItems();
      onComplete();
    } catch (error) {
      console.error("Erreur lors de la création des aliments:", error);
    }
  };

  const getNutritionLabel = (index: number): string => {
    return "Nutrition (pour 100g)";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
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
            Créer les Aliments Manquants ({foodItems.length})
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

        {/* Zone de contenu défilable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-gray-600 mb-4 border-l-4 border-green-500 pl-3 py-2 bg-green-50 rounded">
            Ces ingrédients n'ont pas été trouvés dans votre base de données
            alimentaire. Veuillez compléter les informations ci-dessous pour les
            ajouter.
          </p>

          {foodItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full inline-flex items-center justify-center text-sm mr-2">
                    {index + 1}
                  </span>
                  {item.name}
                </h3>
                {foodItems.length > 1 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Élément {index + 1} sur {foodItems.length}
                  </span>
                )}
              </div>

              {/* Nom & Catégorie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={item.category}
                    onChange={(e) =>
                      handleChange(index, "category", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="misc">Divers</option>
                    <option value="vegetable">Légume</option>
                    <option value="fruit">Fruit</option>
                    <option value="dairy">Produit laitier</option>
                    <option value="protein">Protéine</option>
                    <option value="meat">Viande</option>
                    <option value="fish">Poisson</option>
                    <option value="grain">Céréale</option>
                    <option value="starch">Féculent</option>
                    <option value="legume">Légumineuse</option>
                    <option value="spice">Épice</option>
                    <option value="herb">Herbe aromatique</option>
                    <option value="condiment">Condiment</option>
                    <option value="sauce">Sauce</option>
                    <option value="fat">Matière grasse</option>
                    <option value="sweet">Sucre et douceurs</option>
                    <option value="beverage">Boisson</option>
                    <option value="nut">Fruit à coque</option>
                    <option value="processed">Aliment transformé</option>
                    <option value="baking">Ingrédient de pâtisserie</option>
                  </select>
                </div>
              </div>

              {/* Unités & Prix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unités
                  </label>
                  <select
                    value={item.units}
                    onChange={(e) =>
                      handleChange(index, "units", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="g">Grammes (g)</option>
                    <option value="ml">Millilitres (ml)</option>
                    <option value="piece">Pièce</option>
                    <option value="tbsp">Cuillère à soupe (c. à s.)</option>
                    <option value="tsp">Cuillère à café (c. à c.)</option>
                    <option value="cup">Tasse</option>
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
                      value={item.price}
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Weight Per Piece - Seulement affiché si l'unité est "piece" */}
              {item.units === "piece" && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poids moyen par pièce (en grammes)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={item.weightPerPiece || ""}
                      onChange={(e) =>
                        handleWeightPerPieceChange(index, e.target.value)
                      }
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

              {/* Informations Nutritionnelles */}
              <div className="mt-4">
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
                  {getNutritionLabel(index)}
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
                          item.nutritionPer100g[
                            nutrient.name as keyof typeof item.nutritionPer100g
                          ]
                        }
                        onChange={(e) =>
                          handleNutritionChange(
                            index,
                            nutrient.name,
                            e.target.value
                          )
                        }
                        placeholder="0.0"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder-gray-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pied de page avec boutons d'action */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200 sticky bottom-0 z-10 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleAutoFill}
              className="px-4 py-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
            >
              {isAutofilling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-700" />
                  Remplissage auto...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9zm9.5 2a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Remplir auto
                </>
              )}
            </button>
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all transform hover:scale-105"
          >
            Enregistrer tous les éléments
          </button>
        </div>
      </div>
    </div>
  );
}
