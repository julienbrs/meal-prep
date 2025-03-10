"use client";

import { useState, useEffect } from "react";
import MealCard from "../components/MealCard";
import Link from "next/link";
import { Meal } from "../types/meal";
import { loadMeals } from "@/services/dataservice";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMeals() {
      setIsLoading(true);
      try {
        const data = await loadMeals();
        setMeals(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load meals:", err);
        setError("Failed to load meals. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMeals();
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
      <div className="w-full p-10 bg-[#ffdbb6] rounded-[20px] flex justify-start items-center gap-10">
        <div className="flex-1 flex flex-col justify-start items-start gap-2.5">
          <div className="text-[#004033] text-[40px] font-semibold font-inter">
            Surprise me!
          </div>
          <div className="text-gray-700 text-base font-normal font-inter">
            Get a randomly generated meal plan for the week—quick, easy, and
            hassle-free!
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
            Auto-generate my meals
          </span>
        </button>
      </div>

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
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
            <p className="text-sm text-emerald-600 mt-1">
              Evening satisfaction
            </p>
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
            <h3 className="font-semibold text-green-800 mb-2">Mix and Match</h3>
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
