"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import MealPlanCard from "@/components/MealPlanCard";
import { Meal } from "@/types/meal";
import {
  calculateRecipeCost,
  calculateRecipeNutrition,
} from "@/utils/nutritionCalculator";
import {
  loadMeals,
  loadUserMealPlan,
  saveUserMealPlan,
  hydrateMealPlan,
  createEmptyMealPlan,
  MealPlanState,
} from "@/services/dataservice";
import { useFoodItems } from "@/context/FoodItemsContext";
import { useUser } from "@/context/UserContext";
import MealPlanGenerator from "@/components/MealPlanGenerator";
import MealPlanClearButton from "@/components/MealPlanClearButton";

export default function WeeklyPlan() {
  const daysOfWeek = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];
  const mealTypes = ["Petit-déjeuner", "Déjeuner", "Dîner"];
  const { currentUser } = useUser();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlanState>(
    createEmptyMealPlan(daysOfWeek, mealTypes)
  );
  const [activeDay, setActiveDay] = useState<string>(daysOfWeek[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);
  const { foodItems } = useFoodItems();

  const handleClearComplete = async () => {
    try {
      const emptyPlan = createEmptyMealPlan(daysOfWeek, mealTypes);
      setMealPlan(emptyPlan);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la réinitialisation du plan:", err);
      setError(
        "Échec de la réinitialisation du plan. Veuillez réessayer plus tard."
      );
    }
  };

  useEffect(() => {
    async function initialize() {
      setLoading(true);

      try {
        const mealsData = await loadMeals();
        setMeals(mealsData);

        // Load meal plan for current user
        const userMealPlan = await loadUserMealPlan(
          currentUser.id,
          daysOfWeek,
          mealTypes
        );

        if (Object.keys(userMealPlan).length === 0) {
          // If no plan exists for this user, create a new empty one
          setMealPlan(createEmptyMealPlan(daysOfWeek, mealTypes));
        } else {
          // Hydrate the plan with actual meal objects
          const hydratedPlan = await hydrateMealPlan(userMealPlan);
          setMealPlan(hydratedPlan);
        }

        // Set active day to current day of the week
        const today = new Date().getDay();
        const adjustedDay = today === 0 ? 6 : today - 1; // Convert Sunday (0) to 6
        if (adjustedDay >= 0 && adjustedDay < daysOfWeek.length) {
          setActiveDay(daysOfWeek[adjustedDay]);
        }

        setError(null);
      } catch (err) {
        console.error("Échec d'initialisation du plan hebdomadaire:", err);
        setError(
          "Échec du chargement des données. Veuillez réessayer plus tard."
        );
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [currentUser.id]); // Re-initialize when user changes

  useEffect(() => {
    if (loading) return;

    if (Object.keys(mealPlan).length > 0) {
      const saveData = async () => {
        setSavingStatus("Enregistrement...");
        try {
          // Save meal plan for current user
          const success = await saveUserMealPlan(currentUser.id, mealPlan);
          if (success) {
            setSavingStatus("Enregistré");
            setTimeout(() => {
              setSavingStatus(null);
            }, 2000);
          } else {
            setSavingStatus("Échec de l'enregistrement");
          }
        } catch (err) {
          console.error(
            "Erreur lors de l'enregistrement du plan de repas:",
            err
          );
          setSavingStatus("Échec de l'enregistrement");
        }
      };

      const timeoutId = setTimeout(() => {
        saveData();
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [mealPlan, loading, currentUser.id]); // Include currentUser.id in dependencies

  const addMealToPlan = (day: string, mealType: string, mealId: string) => {
    const meal = meals.find((m) => m.id === mealId);
    if (meal) {
      setMealPlan((prev) => {
        const newPlan = {
          ...prev,
          [day]: {
            ...prev[day],
            [mealType]: meal,
          },
        };
        return newPlan;
      });
    }
  };

  const removeMealFromPlan = (day: string, mealType: string) => {
    setMealPlan((prev) => {
      const newPlan = {
        ...prev,
        [day]: {
          ...prev[day],
          [mealType]: null,
        },
      };
      return newPlan;
    });
  };

  const calculateDayTotals = (day: string) => {
    if (!mealPlan || !mealPlan[day]) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        cost: 0,
      };
    }

    let dayCalories = 0;
    let dayProtein = 0;
    let dayCarbs = 0;
    let dayFat = 0;
    let dayCost = 0;

    Object.values(mealPlan[day]).forEach((meal) => {
      if (meal) {
        const nutrition =
          meal.calculatedNutrition ||
          calculateRecipeNutrition(meal.ingredients, foodItems);
        const cost =
          meal.totalCost || calculateRecipeCost(meal.ingredients, foodItems);

        dayCalories += nutrition.calories;
        dayProtein += nutrition.protein;
        dayCarbs += nutrition.carbs;
        dayFat += nutrition.fat;
        dayCost += cost;
      }
    });

    return {
      calories: Math.round(dayCalories),
      protein: Number(dayProtein.toFixed(1)),
      carbs: Number(dayCarbs.toFixed(1)),
      fat: Number(dayFat.toFixed(1)),
      cost: Number(dayCost.toFixed(2)),
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="w-full p-10 bg-[#ffdbb6] rounded-[20px] flex justify-start items-center gap-10">
          <div className="flex-1 flex flex-col justify-start items-start gap-2.5">
            <div className="text-[#004033] text-[40px] font-semibold font-inter">
              Surprenez-moi, {currentUser.name} !
            </div>
            <div className="text-gray-700 text-base font-normal font-inter">
              Obtenez un plan de repas généré aléatoirement pour la semaine —
              rapide, facile et sans tracas !
            </div>
          </div>
          <div className="flex gap-3">
            <MealPlanGenerator
              meals={meals}
              mealPlan={mealPlan}
              updateMealPlan={setMealPlan}
              daysOfWeek={daysOfWeek}
              mealTypes={mealTypes}
            />
            <MealPlanClearButton
              daysOfWeek={daysOfWeek}
              mealTypes={mealTypes}
              onClearComplete={handleClearComplete}
            />
          </div>
        </div>
      </div>

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      {/* Display saving status notification */}
      {savingStatus && (
        <div className="fixed bottom-4 right-4 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg shadow-md z-50">
          {savingStatus}
        </div>
      )}

      <div className="flex overflow-x-auto pb-2 mb-6 hideScrollbar pt-1 pl-1">
        <div className="inline-flex justify-start items-center gap-3">
          {daysOfWeek.map((day) => {
            const isActive = day === activeDay;
            const dayTotals = calculateDayTotals(day);
            const now = new Date();
            const today = now.getDay();
            const currentDayIdx = daysOfWeek.indexOf(day);
            const todayIdx = today === 0 ? 6 : today - 1;
            let diff = currentDayIdx - todayIdx;
            if (diff < 0) diff += 7;
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() + diff);
            const dayOfMonth = targetDate.getDate();

            const calorieColor =
              dayTotals.calories >= 2000 ? "text-red-500" : "text-emerald-600";

            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`w-20 px-4 py-3 rounded-lg flex flex-col justify-start items-center gap-0 transition-all duration-200
            ${
              isActive
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
            }`}
              >
                <span
                  className={`self-stretch text-center text-xs
              ${isActive ? "text-white" : "text-gray-700"}`}
                >
                  {dayOfMonth}
                </span>
                <span
                  className={`self-stretch text-center text-base
              ${isActive ? "text-white" : "text-gray-700"}`}
                >
                  {day.slice(0, 3)}
                </span>
                <span
                  className={`text-xs font-bold
              ${isActive ? "text-white" : calorieColor}`}
                >
                  {dayTotals.calories} cal
                </span>
              </button>
            );
          })}
        </div>

        <div className="self-center w-9 h-9 bg-white rounded-lg ring-1 ring-gray-300 flex items-center justify-center ml-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="Calendar Icon">
              <g id="Vector">
                <path
                  d="M19.2 4.8H17.4V3.9C17.4 3.66131 17.3052 3.43239 17.1364 3.2636C16.9676 3.09482 16.7387 3 16.5 3C16.2613 3 16.0324 3.09482 15.8636 3.2636C15.6948 3.43239 15.6 3.66131 15.6 3.9V4.8H12.9V3.9C12.9 3.66131 12.8052 3.43239 12.6364 3.2636C12.4676 3.09482 12.2387 3 12 3C11.7613 3 11.5324 3.09482 11.3636 3.2636C11.1948 3.43239 11.1 3.66131 11.1 3.9V4.8H8.4V3.9C8.4 3.66131 8.30518 3.43239 8.1364 3.2636C7.96761 3.09482 7.73869 3 7.5 3C7.26131 3 7.03239 3.09482 6.8636 3.2636C6.69482 3.43239 6.6 3.66131 6.6 3.9V4.8H4.8C4.32261 4.8 3.86477 4.98964 3.52721 5.32721C3.18964 5.66477 3 6.12261 3 6.6V19.2C3 19.6774 3.18964 20.1352 3.52721 20.4728C3.86477 20.8104 4.32261 21 4.8 21H19.2C19.6774 21 20.1352 20.8104 20.4728 20.4728C20.8104 20.1352 21 19.6774 21 19.2V6.6C21 6.12261 20.8104 5.66477 20.4728 5.32721C20.1352 4.98964 19.6774 4.8 19.2 4.8ZM6.6 6.6C6.6 6.83869 6.69482 7.06761 6.8636 7.2364C7.03239 7.40518 7.26131 7.5 7.5 7.5C7.73869 7.5 7.96761 7.40518 8.1364 7.2364C8.30518 7.06761 8.4 6.83869 8.4 6.6H11.1C11.1 6.83869 11.1948 7.06761 11.3636 7.2364C11.5324 7.40518 11.7613 7.5 12 7.5C12.2387 7.5 12.4676 7.40518 12.6364 7.2364C12.8052 7.06761 12.9 6.83869 12.9 6.6H15.6C15.6 6.83869 15.6948 7.06761 15.8636 7.2364C16.0324 7.40518 16.2613 7.5 16.5 7.5C16.7387 7.5 16.9676 7.40518 17.1364 7.2364C17.3052 7.06761 17.4 6.83869 17.4 6.6H19.2V8.4H4.8V6.6H6.6ZM4.8 19.2V10.2H19.2V19.2H4.8Z"
                  fill="#F85B1D"
                />
                <path
                  d="M7.95 12H7.05C6.80147 12 6.6 12.2015 6.6 12.45V13.35C6.6 13.5985 6.80147 13.8 7.05 13.8H7.95C8.19853 13.8 8.4 13.5985 8.4 13.35V12.45C8.4 12.2015 8.19853 12 7.95 12Z"
                  fill="#F85B1D"
                />
                <path
                  d="M7.95 15.6H7.05C6.80147 15.6 6.6 15.8015 6.6 16.05V16.95C6.6 17.1985 6.80147 17.4 7.05 17.4H7.95C8.19853 17.4 8.4 17.1985 8.4 16.95V16.05C8.4 15.8015 8.19853 15.6 7.95 15.6Z"
                  fill="#F85B1D"
                />
                <path
                  d="M12.45 12H11.55C11.3015 12 11.1 12.2015 11.1 12.45V13.35C11.1 13.5985 11.3015 13.8 11.55 13.8H12.45C12.6985 13.8 12.9 13.5985 12.9 13.35V12.45C12.9 12.2015 12.6985 12 12.45 12Z"
                  fill="#F85B1D"
                />
                <path
                  d="M12.45 15.6H11.55C11.3015 15.6 11.1 15.8015 11.1 16.05V16.95C11.1 17.1985 11.3015 17.4 11.55 17.4H12.45C12.6985 17.4 12.9 17.1985 12.9 16.95V16.05C12.9 15.8015 12.6985 15.6 12.45 15.6Z"
                  fill="#F85B1D"
                />
                <path
                  d="M16.95 12H16.05C15.8015 12 15.6 12.2015 15.6 12.45V13.35C15.6 13.5985 15.8015 13.8 16.05 13.8H16.95C17.1985 13.8 17.4 13.5985 17.4 13.35V12.45C17.4 12.2015 17.1985 12 16.95 12Z"
                  fill="#F85B1D"
                />
                <path
                  d="M16.95 15.6H16.05C15.8015 15.6 15.6 15.8015 15.6 16.05V16.95C15.6 17.1985 15.8015 17.4 16.05 17.4H16.95C17.1985 17.4 17.4 17.1985 17.4 16.95V16.05C17.4 15.8015 17.1985 15.6 16.95 15.6Z"
                  fill="#F85B1D"
                />
              </g>
            </g>
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-300">
        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 mr-2 text-emerald-600"
          >
            <path
              fillRule="evenodd"
              d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z"
              clipRule="evenodd"
            />
          </svg>
          Résumé quotidien pour {activeDay}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-4 rounded-xl text-center shadow-sm border border-purple-200">
            <p className="text-purple-800 font-bold text-2xl">
              {calculateDayTotals(activeDay).calories}
            </p>
            <p className="text-purple-600">Calories</p>
          </div>
          <div className="bg-gradient-to-br from-red-100 to-red-50 p-4 rounded-xl text-center shadow-sm border border-red-200">
            <p className="text-red-800 font-bold text-2xl">
              {calculateDayTotals(activeDay).protein}g
            </p>
            <p className="text-red-600">Protéines</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 p-4 rounded-xl text-center shadow-sm border border-yellow-200">
            <p className="text-yellow-800 font-bold text-2xl">
              {calculateDayTotals(activeDay).carbs}g
            </p>
            <p className="text-yellow-600">Glucides</p>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-50 p-4 rounded-xl text-center shadow-sm border border-green-200">
            <p className="text-green-800 font-bold text-2xl">
              {calculateDayTotals(activeDay).fat}g
            </p>
            <p className="text-green-600">Lipides</p>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-4 rounded-xl text-center shadow-sm border border-blue-200">
            <p className="text-blue-800 font-bold text-2xl">
              ${calculateDayTotals(activeDay).cost}
            </p>
            <p className="text-blue-600">Coût Total</p>
          </div>
        </div>
      </div>

      <div className="w-full px-10 py-8 bg-white rounded-[20px] outline-1 outline-offset-[-1px] outline-gray-300">
        <div className="self-stretch justify-center text-[#004033] text-[32px] font-semibold font-['Inter']">
          {activeDay}
        </div>
        <div className="self-stretch inline-flex justify-start items-center gap-5 mt-8">
          {mealTypes.map((mealType) => {
            // Define background colors for each meal type
            const headerBgColor =
              mealType === "Petit-déjeuner"
                ? "bg-[#f3d4f0]"
                : mealType === "Déjeuner"
                ? "bg-[#ffeba8]"
                : "bg-[#d4ddf4]";

            return (
              <div
                key={`${activeDay}-${mealType}`}
                className="flex-1 rounded-[20px] outline-1 outline-offset-[-1px] outline-gray-300 inline-flex flex-col justify-start items-start overflow-hidden"
              >
                <div
                  className={`self-stretch px-5 py-3 ${headerBgColor} inline-flex justify-start items-center gap-2`}
                >
                  <Image
                    src={
                      mealType === "Petit-déjeuner"
                        ? "/icons/breakfast.png"
                        : mealType === "Déjeuner"
                        ? "/icons/lunch.png"
                        : "/icons/dinner.png"
                    }
                    alt={`${mealType} icon`}
                    width={24}
                    height={24}
                  />
                  <div className="justify-center text-[#004033] text-2xl font-semibold font-['Inter']">
                    {mealType}
                  </div>
                </div>
                <div className="self-stretch p-4 bg-neutral-50 flex flex-col justify-start items-start gap-5">
                  <MealPlanCard
                    day={activeDay}
                    mealType={mealType}
                    meal={mealPlan[activeDay]?.[mealType] || null}
                    meals={meals}
                    onAddMeal={addMealToPlan}
                    onRemoveMeal={removeMealFromPlan}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
