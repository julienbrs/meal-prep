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
  loadMealPlan,
  saveMealPlan,
  hydrateMealPlan,
  createEmptyMealPlan,
  MealPlanState,
} from "@/services/dataservice";
import { useFoodItems } from "@/context/FoodItemsContext";

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

  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlanState>(
    createEmptyMealPlan(daysOfWeek, mealTypes)
  );
  const [activeDay, setActiveDay] = useState<string>(daysOfWeek[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_, setSavingStatus] = useState<string | null>(null);
  const { foodItems } = useFoodItems();

  useEffect(() => {
    async function initialize() {
      setLoading(true);

      try {
        const mealsData = await loadMeals();
        setMeals(mealsData);

        let mealPlanData: MealPlanState;

        try {
          mealPlanData = await loadMealPlan();

          if (Object.keys(mealPlanData).length === 0) {
            mealPlanData = createEmptyMealPlan(daysOfWeek, mealTypes);
          }

          const hydratedPlan = await hydrateMealPlan(mealPlanData);
          setMealPlan(hydratedPlan);
        } catch (err) {
          console.error("Erreur lors du chargement du plan de repas:", err);
          setMealPlan(createEmptyMealPlan(daysOfWeek, mealTypes));
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
  }, []);

  useEffect(() => {
    if (loading) return;

    if (Object.keys(mealPlan).length > 0) {
      const saveData = async () => {
        setSavingStatus("Enregistrement...");
        try {
          const success = await saveMealPlan(mealPlan);
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
  }, [mealPlan, loading]);

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
              Surprenez-moi !
            </div>
            <div className="text-gray-700 text-base font-normal font-inter">
              Obtenez un plan de repas généré aléatoirement pour la semaine —
              rapide, facile et sans tracas !
            </div>
          </div>
          <button className="px-8 py-4 rounded-lg border border-[#004033] flex justify-center items-center gap-2">
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
              Générer mes repas automatiquement
            </span>
          </button>
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
          {activeDay}{" "}
          {/* You might want to format this like "Mardi 4, Mars" TODO */}
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
