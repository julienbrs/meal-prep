"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MealPlanCard from "../../components/MealPlanCard";
import { Meal } from "../../types/meal";
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
  MealPlanDay,
} from "@/services/dataservice";
import { useFoodItems } from "@/context/FoodItemsContext";

export default function WeeklyPlan() {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const mealTypes = ["Breakfast", "Lunch", "Dinner"];

  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlanState>(
    createEmptyMealPlan(daysOfWeek, mealTypes)
  );
  const [activeDay, setActiveDay] = useState<string>(daysOfWeek[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);
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
          console.error("Error loading meal plan:", err);
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
        console.error("Failed to initialize weekly plan:", err);
        setError("Failed to load data. Please try again later.");
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
        setSavingStatus("Saving...");
        try {
          const success = await saveMealPlan(mealPlan);
          if (success) {
            setSavingStatus("Saved");
            setTimeout(() => {
              setSavingStatus(null);
            }, 2000);
          } else {
            setSavingStatus("Save failed");
          }
        } catch (err) {
          console.error("Error saving meal plan:", err);
          setSavingStatus("Save failed");
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
        <h1 className="text-3xl font-bold text-gray-800">
          My Weekly Meal Plan
        </h1>
        <div className="flex items-center space-x-4">
          {savingStatus && (
            <span
              className={`text-sm ${
                savingStatus === "Saved"
                  ? "text-green-600"
                  : savingStatus === "Saving..."
                  ? "text-gray-500"
                  : "text-red-600"
              }`}
            >
              {savingStatus}
            </span>
          )}
          <Link
            href="/"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            Browse Recipes
          </Link>
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

      <div className="flex overflow-x-auto pb-2 mb-6 hideScrollbar">
        <div className="flex space-x-2">
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

            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-3 rounded-xl flex flex-col items-center transition-all duration-200 whitespace-nowrap min-w-20 
                  ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
              >
                <span
                  className={`text-xs mb-1 ${
                    isActive ? "text-emerald-100" : "text-gray-500"
                  }`}
                >
                  {dayOfMonth}
                </span>
                <span className="font-medium">{day.slice(0, 3)}</span>
                <span
                  className={`text-xs mt-1 ${
                    isActive ? "text-white" : "text-purple-600"
                  }`}
                >
                  {dayTotals.calories} cal
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-emerald-100">
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
          Daily Summary for {activeDay}
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
            <p className="text-red-600">Protein</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 p-4 rounded-xl text-center shadow-sm border border-yellow-200">
            <p className="text-yellow-800 font-bold text-2xl">
              {calculateDayTotals(activeDay).carbs}g
            </p>
            <p className="text-yellow-600">Carbs</p>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-50 p-4 rounded-xl text-center shadow-sm border border-green-200">
            <p className="text-green-800 font-bold text-2xl">
              {calculateDayTotals(activeDay).fat}g
            </p>
            <p className="text-green-600">Fat</p>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-4 rounded-xl text-center shadow-sm border border-blue-200">
            <p className="text-blue-800 font-bold text-2xl">
              ${calculateDayTotals(activeDay).cost}
            </p>
            <p className="text-blue-600">Total Cost</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{activeDay}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mealTypes.map((mealType) => (
            <MealPlanCard
              key={`${activeDay}-${mealType}`}
              day={activeDay}
              mealType={mealType}
              meal={mealPlan[activeDay]?.[mealType] || null}
              meals={meals}
              onAddMeal={addMealToPlan}
              onRemoveMeal={removeMealFromPlan}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
