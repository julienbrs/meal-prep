// app/weekly-plan/page.tsx (ou le fichier où se trouve votre page WeeklyPlan)
"use client";

import { useState, useEffect } from "react";
import { Meal } from "@/types/meal";
import {
  calculateRecipeCost,
  calculateRecipeNutrition,
} from "@/utils/nutritionCalculator";
import { loadMeals, createEmptyMealPlan } from "@/services/dataservice";
import { useFoodItems } from "@/context/FoodItemsContext";
import { useUser } from "@/context/UserContext";

import MealPlanCard from "@/components/MealPlanCard";
import SnackCard from "@/components/SnackCard"; // ← Notre nouveau composant
import {
  CustomMeal,
  isCatalogMeal,
  MealPlanEntry,
  SnackEntry,
} from "@/types/mealPlan";

import MealPlanGenerator from "@/components/MealPlanGenerator";
import MealPlanClearButton from "@/components/MealPlanClearButton";
import WeekSelector from "@/components/WeekSelector";
import { useWeekMealPlan } from "@/hooks/useWeekMealPlan";
import { NutritionInfo } from "@/types/ingredient";

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

  // ─── On ajoute “Snack” en tant que 4ᵉ mealType ───
  const mealTypes = ["Petit-déjeuner", "Déjeuner", "Dîner", "Snack"];

  const { currentUser } = useUser();
  const { foodItems } = useFoodItems();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [activeDay, setActiveDay] = useState<string>(daysOfWeek[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    mealPlan,
    updateMealPlan,
    currentWeekDate,
    changeWeek,
    saving: savingStatus,
  } = useWeekMealPlan(daysOfWeek, mealTypes);

  // ─── Charger toutes les recettes existantes ───
  useEffect(() => {
    async function initialize() {
      setLoading(true);
      try {
        const mealsData = await loadMeals();
        setMeals(mealsData);

        // Sélection automatique du jour “aujourd’hui”
        const today = new Date().getDay();
        const adjustedDay = today === 0 ? 6 : today - 1;
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
  }, [currentUser.id]);

  // ─── Handlers pour Petit-déj / Déj / Dîner ───
  const addMealToPlan = (
    day: string,
    mealType: string,
    input: string | CustomMeal
  ) => {
    if (typeof input === "string") {
      const found = meals.find((m) => m.id === input);
      if (!found) return;
      const defPortion = found.preferredPortions?.[currentUser.id] || 1;
      updateMealPlan((p) => ({
        ...p,
        [day]: { ...p[day], [mealType]: { meal: found, portions: defPortion } },
      }));
    } else {
      /* repas libre => 1 portion par défaut */
      updateMealPlan((p) => ({
        ...p,
        [day]: { ...p[day], [mealType]: { meal: input, portions: 1 } },
      }));
    }
  };

  const getNutrition = (
    meal: Meal | CustomMeal,
    portions: number
  ): NutritionInfo => {
    if (isCatalogMeal(meal) && meal.calculatedNutrition) {
      return {
        calories: meal.calculatedNutrition.calories * portions,
        protein: meal.calculatedNutrition.protein * portions,
        carbs: meal.calculatedNutrition.carbs * portions,
        fat: meal.calculatedNutrition.fat * portions,
      };
    }
    return calculateRecipeNutrition(meal.ingredients, foodItems, portions);
  };

  const getCost = (meal: Meal | CustomMeal, portions: number): number =>
    isCatalogMeal(meal) && meal.totalCost !== undefined
      ? meal.totalCost * portions
      : calculateRecipeCost(meal.ingredients, foodItems, portions);

  const removeMealFromPlan = (day: string, mealType: string) => {
    updateMealPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: null,
      },
    }));
  };

  const handlePortionChange = (
    day: string,
    mealType: string,
    newPortions: number
  ) => {
    updateMealPlan((prev) => {
      const copy = { ...prev };
      const entry = copy[day][mealType] as MealPlanEntry | null;
      if (!entry) return prev;
      entry.portions = newPortions;
      return copy;
    });
  };

  // ─── Handlers pour “Snack” (tableau) ───
  const addSnackToPlan = (day: string, snack: SnackEntry) => {
    updateMealPlan((prev) => {
      const copy = { ...prev };
      const currentArr = Array.isArray(copy[day]["Snack"])
        ? (copy[day]["Snack"] as SnackEntry[])
        : [];
      copy[day] = {
        ...copy[day],
        Snack: [...currentArr, snack],
      };
      return copy;
    });
  };

  const removeSnackFromPlan = (day: string, index: number) => {
    updateMealPlan((prev) => {
      const copy = { ...prev };
      const currentArr = Array.isArray(copy[day]["Snack"])
        ? (copy[day]["Snack"] as SnackEntry[])
        : [];
      currentArr.splice(index, 1);
      copy[day] = {
        ...copy[day],
        Snack: [...currentArr],
      };
      return copy;
    });
  };

  // ─── Calcul des totaux journaliers (inclut la somme de tous les snacks) ───
  const calculateDayTotals = (day: string) => {
    if (!mealPlan?.[day])
      return { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 };

    let cals = 0,
      prot = 0,
      carbs = 0,
      fat = 0,
      cost = 0;

    Object.values(mealPlan[day]).forEach((entry) => {
      if (!entry) return;

      const list = Array.isArray(entry) ? entry : [entry];
      list.forEach(({ meal, portions }) => {
        const n = getNutrition(meal, portions);
        cals += n.calories;
        prot += n.protein;
        carbs += n.carbs;
        fat += n.fat;
        cost += getCost(meal, portions);
      });
    });
    return {
      calories: Math.round(cals),
      protein: +prot.toFixed(1),
      carbs: +carbs.toFixed(1),
      fat: +fat.toFixed(1),
      cost: +cost.toFixed(2),
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
      {/* ─── Bloc “Surprenez-moi” ─── */}
      <div className="flex justify-between items-center mb-8">
        <div className="w-full p-10 bg-[#ffdbb6] rounded-[20px] flex flex-col md:flex-row justify-start items-center gap-6">
          <div className="flex-1 flex flex-col justify-start items-start gap-2.5">
            <div className="text-[#004033] text-[40px] font-semibold font-inter">
              Surprenez-moi, {currentUser.name} !
            </div>
            <div className="text-gray-700 text-base font-normal font-inter">
              Obtenez un plan de repas généré aléatoirement pour la semaine —
              rapide, facile et sans tracas !
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <WeekSelector
              currentWeekDate={currentWeekDate}
              onWeekChange={changeWeek}
            />
            <div className="flex gap-3">
              <MealPlanGenerator
                meals={meals}
                mealPlan={mealPlan}
                updateMealPlan={updateMealPlan}
                daysOfWeek={daysOfWeek}
                mealTypes={mealTypes}
                weekDate={currentWeekDate}
              />
              <MealPlanClearButton
                daysOfWeek={daysOfWeek}
                mealTypes={mealTypes}
                weekDate={currentWeekDate}
                onClearComplete={() => {
                  const emptyPlan = createEmptyMealPlan(daysOfWeek, mealTypes);
                  updateMealPlan(emptyPlan);
                  setError(null);
                }}
              />
            </div>
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

      {savingStatus && (
        <div className="fixed bottom-4 right-4 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg shadow-md z-50">
          {savingStatus}
        </div>
      )}

      {/* ─── Rouleau horizontal des jours ─── */}
      <div className="flex overflow-x-auto pb-2 mb-6 hideScrollbar pt-1 pl-1">
        <div className="inline-flex justify-start items-center gap-3">
          {daysOfWeek.map((day) => {
            const isActive = day === activeDay;
            const dayTotals = calculateDayTotals(day);

            // calcul de la date (numéro) du jour dans la semaine
            const weekStartDate = new Date(currentWeekDate);
            const dayIndex = daysOfWeek.indexOf(day);
            const targetDate = new Date(weekStartDate);
            targetDate.setDate(weekStartDate.getDate() + dayIndex);
            const dayOfMonth = targetDate.getDate();

            const calorieColor =
              dayTotals.calories >= 2000 ? "text-red-500" : "text-emerald-600";

            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`w-20 px-4 py-3 rounded-lg flex flex-col justify-start items-center gap-0 transition-all duration-200 ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`text-xs ${
                    isActive ? "text-white" : "text-gray-700"
                  }`}
                >
                  {dayOfMonth}
                </span>
                <span
                  className={`text-base ${
                    isActive ? "text-white" : "text-gray-700"
                  }`}
                >
                  {day.slice(0, 3)}
                </span>
                <span
                  className={`text-xs font-bold ${
                    isActive ? "text-white" : calorieColor
                  }`}
                >
                  {dayTotals.calories} cal
                </span>
              </button>
            );
          })}

          <div className="self-center w-9 h-9 bg-white rounded-lg ring-1 ring-gray-300 flex items-center justify-center ml-4">
            {/* Icône calendrier (exemple) */}
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
      </div>

      {/* ─── Résumé quotidien ─── */}
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

      {/* ─── 4 cartes côte à côte (25 % chacune) ─── */}
      <div className="w-full px-10 py-8 bg-white rounded-[20px] outline-1 outline-offset-[-1px] outline-gray-300">
        <div className="text-[#004033] text-[32px] font-semibold">
          {activeDay}
        </div>

        <div className="inline-flex justify-start items-start gap-5 mt-8 w-full">
          {mealTypes.map((mealType) => {
            let headerBgColor = "";
            let headerIcon = "";

            if (mealType === "Petit-déjeuner") {
              headerBgColor = "bg-[#f3d4f0]";
              headerIcon = "☕️";
            } else if (mealType === "Déjeuner") {
              headerBgColor = "bg-[#ffeba8]";
              headerIcon = "🌞";
            } else if (mealType === "Dîner") {
              headerBgColor = "bg-[#d4ddf4]";
              headerIcon = "⭐️";
            } else if (mealType === "Snack") {
              headerBgColor = "bg-[#d4f0d8]";
              headerIcon = "🍪";
            }

            return (
              <div
                key={`${activeDay}-${mealType}`}
                className="
                  w-1/4
                  flex
                  flex-col
                  overflow-hidden
                  rounded-[20px]
                  outline-1
                  outline-offset-[-1px]
                  outline-gray-300
                  shadow-sm
                "
              >
                {/* Header coloré + icône */}
                <div
                  className={`
                    ${headerBgColor}
                    px-5 py-3
                    inline-flex
                    items-center
                    gap-2
                  `}
                >
                  <span className="text-[#1f2a37] text-2xl font-semibold font-['Inter']">
                    {headerIcon}{" "}
                  </span>
                  <span className="text-[#1f2a37] text-2xl font-semibold font-['Inter']">
                    {mealType}
                  </span>
                </div>

                {/* Contenu de la carte */}
                <div className="bg-neutral-50 p-4 flex flex-col justify-start items-start gap-5">
                  {mealType === "Snack" ? (
                    <SnackCard
                      day={activeDay}
                      snackList={
                        (mealPlan[activeDay]?.["Snack"] as SnackEntry[]) || []
                      }
                      allMeals={meals}
                      onAddSnack={addSnackToPlan}
                      onRemoveSnack={removeSnackFromPlan}
                    />
                  ) : (
                    <MealPlanCard
                      day={activeDay}
                      mealType={mealType}
                      // On “cast” la valeur en MealPlanEntry puisque mealType ≠ "Snack"
                      meal={
                        (mealPlan[activeDay]?.[mealType] as MealPlanEntry)
                          ?.meal || null
                      }
                      portions={
                        (mealPlan[activeDay]?.[mealType] as MealPlanEntry)
                          ?.portions || 1
                      }
                      meals={meals}
                      onAddMeal={addMealToPlan}
                      onRemoveMeal={removeMealFromPlan}
                      onPortionChange={handlePortionChange}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
