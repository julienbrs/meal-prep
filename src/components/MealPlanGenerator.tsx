import React, { useState } from "react";
import { Meal } from "@/types/meal";
import { useFoodItems } from "@/context/FoodItemsContext";
import { MealPlanState } from "@/types/mealPlan";
import AlertDialog from "@/components/AlertDialog";

interface MealPlanGeneratorProps {
  meals: Meal[];
  mealPlan: MealPlanState;
  updateMealPlan: (plan: MealPlanState) => void;
  daysOfWeek: string[];
  mealTypes: string[];
  weekDate: Date;
}

const MealPlanGenerator: React.FC<MealPlanGeneratorProps> = ({
  meals,
  mealPlan,
  updateMealPlan,
  daysOfWeek,
  mealTypes,
  weekDate,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<MealPlanState | null>(
    null
  );
  const { foodItems } = useFoodItems();

  // Check if the meal plan has any meals assigned
  const isPlanFull = () => {
    let hasMeals = false;

    for (const day of daysOfWeek) {
      for (const mealType of mealTypes) {
        if (mealPlan[day]?.[mealType]) {
          hasMeals = true;
          break;
        }
      }
      if (hasMeals) break;
    }

    return hasMeals;
  };

  // Count empty slots in the meal plan
  const countEmptySlots = () => {
    let emptyCount = 0;

    for (const day of daysOfWeek) {
      for (const mealType of mealTypes) {
        if (!mealPlan[day]?.[mealType]) {
          emptyCount++;
        }
      }
    }

    return emptyCount;
  };

  // Generate a meal plan based on meal categories
  const generateMealPlan = () => {
    setIsGenerating(true);

    try {
      // Create a copy of the current meal plan
      const newPlan = JSON.parse(JSON.stringify(mealPlan)) as MealPlanState;

      // Categorize meals by type
      const categorizedMeals: Record<string, Meal[]> = {};

      // Map meal categories to our meal types
      const categoryMapping: Record<string, string> = {
        breakfast: "Petit-déjeuner",
        lunch: "Déjeuner",
        dinner: "Dîner",
        snack: "Collation",
        appetizer: "Entrée",
      };

      // Group meals by category
      meals.forEach((meal) => {
        if (meal.categories && meal.categories.length > 0) {
          meal.categories.forEach((category) => {
            const mealType = categoryMapping[category];
            if (mealType && mealTypes.includes(mealType)) {
              if (!categorizedMeals[mealType]) {
                categorizedMeals[mealType] = [];
              }
              categorizedMeals[mealType].push(meal);
            }
          });
        }
      });

      // For each day and meal type, if empty, assign a random meal of appropriate category
      daysOfWeek.forEach((day) => {
        if (!newPlan[day]) {
          newPlan[day] = {};
        }

        mealTypes.forEach((mealType) => {
          // Skip if a meal is already assigned
          if (newPlan[day][mealType]) {
            return;
          }

          // Get meals matching this meal type
          const availableMeals = categorizedMeals[mealType] || [];

          if (availableMeals.length > 0) {
            // Select a random meal
            const randomIndex = Math.floor(
              Math.random() * availableMeals.length
            );
            const chosen = availableMeals[randomIndex];

            if (mealType === "Snack") {
              // Pour "Snack", on stocke un tableau de SnackEntry[]
              newPlan[day][mealType] = [{ meal: chosen, portions: 1 }];
            } else {
              // Pour les autres repas, on stocke un MealPlanEntry
              newPlan[day][mealType] = { meal: chosen, portions: 1 };
            }

            // Remove the meal to avoid duplicates in the same week
            if (availableMeals.length > mealTypes.length) {
              availableMeals.splice(randomIndex, 1);
            }
          }
        });
      });

      // If the plan has meals, we need confirmation before overwriting
      if (isPlanFull()) {
        setGeneratedPlan(newPlan);
        setIsConfirmDialogOpen(true);
      } else {
        // Otherwise, just update the plan
        updateMealPlan(newPlan);
      }
    } catch (error) {
      console.error("Error generating meal plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmGenerate = () => {
    if (generatedPlan) {
      updateMealPlan(generatedPlan);
      setGeneratedPlan(null);
    }
    setIsConfirmDialogOpen(false);
  };

  const emptySlots = countEmptySlots();
  const totalSlots = daysOfWeek.length * mealTypes.length;

  return (
    <>
      <button
        onClick={generateMealPlan}
        disabled={isGenerating}
        className="px-8 py-4 rounded-lg border border-[#004033] flex justify-center items-center gap-2 hover:bg-gray-50 transition-all duration-200"
      >
        <svg
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="MagicWand">
            <path
              id="Vector"
              d="M4.49998 6.5C4.49998 6.30109 4.579 6.11032 4.71965 5.96967C4.8603 5.82902 5.05107 5.75 5.24998 5.75H6.74998V4.25C6.74998 4.05109 6.829 3.86032 6.96965 3.71967C7.1103 3.57902 7.30107 3.5 7.49998 3.5C7.69889 3.5 7.88966 3.57902 8.03031 3.71967C8.17096 3.86032 8.24998 4.05109 8.24998 4.25V5.75H9.74998C9.94889 5.75 10.1397 5.82902 10.2803 5.96967C10.421 6.11032 10.5 6.30109 10.5 6.5C10.5 6.69891 10.421 6.88968 10.2803 7.03033C10.1397 7.17098 9.94889 7.25 9.74998 7.25H8.24998V8.75C8.24998 8.94891 8.17096 9.13968 8.03031 9.28033C7.88966 9.42098 7.69889 9.5 7.49998 9.5C7.30107 9.5 7.1103 9.42098 6.96965 9.28033C6.829 9.13968 6.74998 8.94891 6.74998 8.75V7.25H5.24998C5.05107 7.25 4.8603 7.17098 4.71965 7.03033C4.579 6.88968 4.49998 6.69891 4.49998 6.5ZM17.25 18.5H16.5V17.75C16.5 17.5511 16.421 17.3603 16.2803 17.2197C16.1397 17.079 15.9489 17 15.75 17C15.5511 17 15.3603 17.079 15.2196 17.2197C15.079 17.3603 15 17.5511 15 17.75V18.5H14.25C14.0511 18.5 13.8603 18.579 13.7196 18.7197C13.579 18.8603 13.5 19.0511 13.5 19.25C13.5 19.4489 13.579 19.6397 13.7196 19.7803C13.8603 19.921 14.0511 20 14.25 20H15V20.75C15 20.9489 15.079 21.1397 15.2196 21.2803C15.3603 21.421 15.5511 21.5 15.75 21.5C15.9489 21.5 16.1397 21.421 16.2803 21.2803C16.421 21.1397 16.5 20.9489 16.5 20.75V20H17.25C17.4489 20 17.6397 19.921 17.7803 19.7803C17.921 19.6397 18 19.4489 18 19.25C18 19.0511 17.921 18.8603 17.7803 18.7197C17.6397 18.579 17.4489 18.5 17.25 18.5ZM22.5 14H21V12.5C21 12.3011 20.921 12.1103 20.7803 11.9697C20.6397 11.829 20.4489 11.75 20.25 11.75C20.0511 11.75 19.8603 11.829 19.7196 11.9697C19.579 12.1103 19.5 12.3011 19.5 12.5V14H18C17.8011 14 17.6103 14.079 17.4696 14.2197C17.329 14.3603 17.25 14.5511 17.25 14.75C17.25 14.9489 17.329 15.1397 17.4696 15.2803C17.6103 15.421 17.8011 15.5 18 15.5H19.5V17C19.5 17.1989 19.579 17.3897 19.7196 17.5303C19.8603 17.671 20.0511 17.75 20.25 17.75C20.4489 17.75 20.6397 17.671 20.7803 17.5303C20.921 17.3897 21 17.1989 21 17V15.5H22.5C22.6989 15.5 22.8897 15.421 23.0303 15.2803C23.171 15.1397 23.25 14.9489 23.25 14.75C23.25 14.5511 23.171 14.3603 23.0303 14.2197C22.8897 14.079 22.6989 14 22.5 14ZM20.5603 8L7.49998 21.0603C7.2187 21.3414 6.83732 21.4993 6.43967 21.4993C6.04201 21.4993 5.66063 21.3414 5.37935 21.0603L3.43873 19.1216C3.2994 18.9823 3.18888 18.8169 3.11348 18.6349C3.03808 18.4529 2.99927 18.2578 2.99927 18.0608C2.99927 17.8638 3.03808 17.6687 3.11348 17.4867C3.18888 17.3047 3.2994 17.1393 3.43873 17L16.5 3.93969C16.6393 3.80036 16.8046 3.68984 16.9867 3.61444C17.1687 3.53904 17.3637 3.50023 17.5608 3.50023C17.7578 3.50023 17.9529 3.53904 18.1349 3.61444C18.3169 3.68984 18.4822 3.80036 18.6215 3.93969L20.5603 5.87844C20.6996 6.01773 20.8101 6.1831 20.8855 6.36511C20.9609 6.54713 20.9998 6.74221 20.9998 6.93922C20.9998 7.13623 20.9609 7.33131 20.8855 7.51332C20.8101 7.69533 20.6996 7.86071 20.5603 8ZM15.4387 11L13.5 9.06031L4.49998 18.0603L6.43873 20L15.4387 11ZM19.5 6.93969L17.5603 5L14.5603 8L16.5 9.93969L19.5 6.93969Z"
              fill="#004033"
            />
          </g>
        </svg>
        <span className="text-[#004033] text-base font-semibold font-inter">
          {isGenerating
            ? "Génération en cours..."
            : "Générer mes repas automatiquement"}
        </span>
      </button>

      <AlertDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmGenerate}
        title="Remplacer le plan de repas"
        description={`Votre plan contient déjà des repas (${
          totalSlots - emptySlots
        }/${totalSlots} repas). Êtes-vous sûr de vouloir générer un nouveau plan ? Les repas existants seront conservés.`}
        confirmLabel="Générer"
        cancelLabel="Annuler"
      />
    </>
  );
};

export default MealPlanGenerator;
