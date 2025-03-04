"use client";

import { useState, useEffect } from "react";
import { sampleMeals } from "../data/meals";
import MealCard from "../components/MealCard";
import Link from "next/link";
import { Meal } from "../types/meal";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [meals, setMeals] = useState<Meal[]>(sampleMeals);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  const filteredMeals = meals.filter((meal) => {
    return (
      meal.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === "" || meal.category === categoryFilter)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-2xl p-8 mb-10 shadow-lg">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:w-2/3 mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              Plan Your Weekly Meals <br />
              with Delicious Recipes
            </h1>
            <p className="text-emerald-100 mb-6 md:text-lg">
              Stay organized, eat well, and track your nutrition with our
              easy-to-use meal planning tool.
            </p>
            <Link
              href="/weekly-plan"
              className="inline-block bg-white text-emerald-600 px-6 py-3 rounded-lg font-medium shadow-md hover:bg-emerald-50 transition-colors duration-200 transform hover:scale-105"
            >
              Start Planning
            </Link>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <div className="w-48 h-48 bg-white bg-opacity-20 rounded-full p-2 shadow-lg">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                {/* Logo d'avocat stylisé */}
                <div className="w-28 h-28 rounded-full relative">
                  <div className="absolute inset-0 bg-lime-200 rounded-full"></div>
                  <div className="absolute inset-2 bg-lime-300 rounded-full opacity-70"></div>
                  <div className="absolute inset-0 top-1/4 left-1/4 w-1/2 h-1/2 bg-brown-600 rounded-full"></div>
                  <div className="absolute inset-0 top-1/3 left-1/3 w-1/4 h-1/4 bg-lime-100 rounded-full opacity-60"></div>
                  {/* Feuille sur le dessus de l'avocat */}
                  <div className="absolute -top-4 left-1/2 w-4 h-8 bg-lime-500 rounded-full -rotate-12 transform -translate-x-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 mr-2 text-emerald-600"
          >
            <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648l8.628 5.033Z" />
          </svg>
          Browse Recipes
        </h2>
        <Link
          href="/weekly-plan"
          className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center transition-colors duration-200"
        >
          <span>Go to Meal Plan</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 ml-1"
          >
            <path
              fillRule="evenodd"
              d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>

      <div className="mb-8 p-4 bg-white rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-2/3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-gray-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search recipes..."
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              value={categoryFilter}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredMeals.length === 0 ? (
        <div className="text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
          >
            <path
              fillRule="evenodd"
              d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            No recipes found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}

      {/* Featured Categories Section */}
      <div className="mt-16 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Explore by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/?category=breakfast"
            onClick={() => setCategoryFilter("breakfast")}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center hover:bg-amber-100 transition-colors duration-200"
          >
            <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-amber-600"
              >
                <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                <path
                  fillRule="evenodd"
                  d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-amber-800">Breakfast</h3>
            <p className="text-sm text-amber-600 mt-1">Start your day right</p>
          </Link>

          <Link
            href="/?category=lunch"
            onClick={() => setCategoryFilter("lunch")}
            className="bg-green-50 border border-green-200 rounded-xl p-4 text-center hover:bg-green-100 transition-colors duration-200"
          >
            <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-green-600"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-green-800">Lunch</h3>
            <p className="text-sm text-green-600 mt-1">Midday energy boost</p>
          </Link>

          <Link
            href="/?category=dinner"
            onClick={() => setCategoryFilter("dinner")}
            className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center hover:bg-emerald-100 transition-colors duration-200"
          >
            <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-emerald-600"
              >
                <path
                  fillRule="evenodd"
                  d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-emerald-800">Dinner</h3>
            <p className="text-sm text-emerald-600 mt-1">Evening satisfaction</p>
          </Link>

          <Link
            href="/?category=snack"
            onClick={() => setCategoryFilter("snack")}
            className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center hover:bg-rose-100 transition-colors duration-200"
          >
            <div className="w-16 h-16 bg-rose-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-rose-600"
              >
                <path d="M15 1.784l-.796.796a1.125 1.125 0 1 0 1.591 0L15 1.784ZM12 1.784l-.796.796a1.125 1.125 0 1 0 1.591 0L12 1.784ZM9 1.784l-.796.796a1.125 1.125 0 1 0 1.591 0L9 1.784ZM9.75 7.547c.498-.02.998-.035 1.5-.042V6.75a.75.75 0 0 1 1.5 0v.755c.502.007 1.002.021 1.5.042V6.75a.75.75 0 0 1 1.5 0v.88l.307.022c1.55.117 2.693 1.427 2.693 2.946v1.018a62.182 62.182 0 0 0-13.5 0v-1.018c0-1.519 1.143-2.829 2.693-2.946l.307-.022v-.88a.75.75 0 0 1 1.5 0v.797ZM12 12.75c-2.472 0-4.9.184-7.274.54-1.454.217-2.476 1.482-2.476 2.916v.384a4.104 4.104 0 0 1 2.585.364 2.605 2.605 0 0 0 2.33 0 4.104 4.104 0 0 1 3.67 0 2.605 2.605 0 0 0 2.33 0 4.104 4.104 0 0 1 3.67 0 2.605 2.605 0 0 0 2.33 0 4.104 4.104 0 0 1 2.585-.364v-.384c0-1.434-1.022-2.7-2.476-2.917A49.138 49.138 0 0 0 12 12.75ZM21.75 18.131a2.604 2.604 0 0 0-1.915.165 4.104 4.104 0 0 1-3.67 0 2.604 2.604 0 0 0-2.33 0 4.104 4.104 0 0 1-3.67 0 2.604 2.604 0 0 0-2.33 0 4.104 4.104 0 0 1-3.67 0 2.604 2.604 0 0 0-1.915-.165v2.494c0 1.036.84 1.875 1.875 1.875h15.75c1.035 0 1.875-.84 1.875-1.875v-2.494Z" />
              </svg>
            </div>
            <h3 className="font-semibold text-rose-800">Snacks</h3>
            <p className="text-sm text-rose-600 mt-1">Quick bites</p>
          </Link>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 mt-12 mb-8 border border-green-200 shadow-md">
        <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 mr-2 text-green-600"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
              clipRule="evenodd"
            />
          </svg>
          Meal Planning Tips
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-60 rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">
              Prep in Batches
            </h3>
            <p className="text-green-700">
              Dedicate a few hours on the weekend to prep ingredients for the
              week ahead. Chop vegetables, cook grains, and marinate proteins to
              save time on busy weekdays.
            </p>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">
              Mix and Match
            </h3>
            <p className="text-green-700">
              Create versatile meal components that can be used in multiple
              dishes throughout the week to add variety without extra effort.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
