"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { sampleMeals } from "../../data/meals";
import MealPlanCard from "../../components/MealPlanCard";
import { Meal } from "../../types/meal";

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

  // Initialize empty meal plan
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

  // Load saved meal plan from localStorage on component mount
  useEffect(() => {
    const savedPlan = localStorage.getItem("mealPlan");
    if (savedPlan) {
      setMealPlan(JSON.parse(savedPlan));
    }
  }, []);

  // Save meal plan to localStorage whenever it changes
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

  // Calculate total weekly nutrition
  const calculateWeeklyNutrition = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    Object.values(mealPlan).forEach((day) => {
      Object.values(day).forEach((meal) => {
        if (meal) {
          totalCalories += meal.nutrition.calories;
          totalProtein += meal.nutrition.protein;
          totalCarbs += meal.nutrition.carbs;
          totalFat += meal.nutrition.fat;
        }
      });
    });

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
    };
  };

  const weeklyNutrition = calculateWeeklyNutrition();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          My Weekly Meal Plan
        </h1>
        <Link
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Recipes
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Weekly Nutrition Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-100 p-4 rounded-lg text-center">
            <p className="text-purple-800 font-bold text-xl">
              {weeklyNutrition.calories}
            </p>
            <p className="text-purple-600">Total Calories</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg text-center">
            <p className="text-red-800 font-bold text-xl">
              {weeklyNutrition.protein}g
            </p>
            <p className="text-red-600">Total Protein</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg text-center">
            <p className="text-yellow-800 font-bold text-xl">
              {weeklyNutrition.carbs}g
            </p>
            <p className="text-yellow-600">Total Carbs</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <p className="text-green-800 font-bold text-xl">
              {weeklyNutrition.fat}g
            </p>
            <p className="text-green-600">Total Fat</p>
          </div>
        </div>
      </div>

      {daysOfWeek.map((day) => (
        <div key={day} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{day}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mealTypes.map((mealType) => (
              <MealPlanCard
                key={`${day}-${mealType}`}
                day={day}
                mealType={mealType}
                meal={mealPlan[day][mealType]}
                meals={sampleMeals}
                onAddMeal={addMealToPlan}
                onRemoveMeal={removeMealFromPlan}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
