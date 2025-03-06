"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { sampleMeals } from "../../data/meals";
import MealPlanCard from "../../components/MealPlanCard";
import { Meal } from "../../types/meal";
import {
  calculateRecipeCost,
  calculateRecipeNutrition,
} from "@/utils/nutritionCalculator";

interface MealPlanDay {
  [key: string]: Meal | null;
}

interface MealPlanState {
  [key: string]: MealPlanDay;
}

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

  const getEmptyPlan = (): MealPlanState => {
    const plan: MealPlanState = {};
    daysOfWeek.forEach((day) => {
      plan[day] = {
        Breakfast: null,
        Lunch: null,
        Dinner: null,
      };
    });
    return plan;
  };

  const [mealPlan, setMealPlan] = useState<MealPlanState>(getEmptyPlan());
  const [activeDay, setActiveDay] = useState<string>(daysOfWeek[0]);

  useEffect(() => {
    const savedPlan = localStorage.getItem("mealPlan");
    if (savedPlan) {
      setMealPlan(JSON.parse(savedPlan));
    }

    const today = new Date().getDay();
    const adjustedDay = today === 0 ? 6 : today - 1;
    if (adjustedDay >= 0 && adjustedDay < daysOfWeek.length) {
      setActiveDay(daysOfWeek[adjustedDay]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
  }, [mealPlan]);

  const addMealToPlan = (day: string, mealType: string, mealId: string) => {
    const meal = sampleMeals.find((m) => m.id === mealId);
    if (meal) {
      setMealPlan((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [mealType]: meal,
        },
      }));
    }
  };

  const removeMealFromPlan = (day: string, mealType: string) => {
    setMealPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: null,
      },
    }));
  };

  // Calculate day's nutrition and cost
  const calculateDayTotals = (day: string) => {
    let dayCalories = 0;
    let dayProtein = 0;
    let dayCarbs = 0;
    let dayFat = 0;
    let dayCost = 0;

    Object.values(mealPlan[day]).forEach((meal) => {
      if (meal) {
        const nutrition =
          meal.calculatedNutrition ||
          calculateRecipeNutrition(meal.ingredients);
        const cost = meal.totalCost || calculateRecipeCost(meal.ingredients);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          My Weekly Meal Plan
        </h1>
        <Link
          href="/"
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
        >
          Browse Recipes
        </Link>
      </div>

      <div className="flex overflow-x-auto pb-2 mb-6 hideScrollbar">
        <div className="flex space-x-2">
          {daysOfWeek.map((day) => {
            const isActive = day === activeDay;
            const dayTotals = calculateDayTotals(day);
            const dayOfMonth =
              new Date().getDate() -
              (new Date().getDay() - daysOfWeek.indexOf(day) - 1);

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
              meal={mealPlan[activeDay][mealType]}
              meals={sampleMeals}
              onAddMeal={addMealToPlan}
              onRemoveMeal={removeMealFromPlan}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
