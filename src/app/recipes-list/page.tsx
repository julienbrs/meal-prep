"use client";

import { useState, useEffect } from "react";
import MealCard from "@/components/MealCard";
import Link from "next/link";
import { Meal } from "@/types/meal";
import { loadMeals } from "@/services/dataservice";
import { useUser } from "@/context/UserContext";

export default function Home() {
  const { users } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState("");

  useEffect(() => {
    async function fetchMeals() {
      setIsLoading(true);
      try {
        const data = await loadMeals();
        setMeals(data);
        setError(null);
      } catch (err) {
        console.error("Échec du chargement des repas:", err);
        setError(
          "Échec du chargement des repas. Veuillez réessayer plus tard."
        );
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

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserFilter(e.target.value);
  };

  const filteredMeals = meals.filter((meal) => {
    return (
      meal.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === "" || meal.category === categoryFilter) &&
      (userFilter === "" || meal.createdBy === userFilter)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="w-full p-10 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[20px] border border-amber-200 shadow-sm mb-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex-1 flex flex-col gap-4">
            <h1 className="text-[#004033] text-[40px] font-semibold font-inter">
              Gérez Votre Cuisine
            </h1>
            <p className="text-gray-700 text-lg font-normal">
              Explorez vos ingrédients, créez de nouvelles recettes et organisez
              efficacement votre planification de repas
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/food-items"
              className="px-8 py-4 rounded-lg border-2 border-[#004033] bg-white flex justify-center items-center gap-2 hover:bg-gray-50 transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-[#004033]"
              >
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59z" />
              </svg>
              <span className="text-[#004033] text-base font-semibold font-inter whitespace-nowrap">
                Voir les Ingrédients
              </span>
            </Link>
            <Link
              href="/recipes/create"
              className="px-8 py-4 rounded-lg bg-[#F85B1D] flex justify-center items-center gap-2 hover:bg-[#e54d10] transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white"
              >
                <path
                  fillRule="evenodd"
                  d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-white text-base font-semibold font-inter whitespace-nowrap">
                Créer une Recette
              </span>
            </Link>
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

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des recettes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={searchTerm}
                onChange={handleSearch}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="md:w-1/4">
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={categoryFilter}
              onChange={handleCategoryChange}
            >
              <option value="">Toutes les Catégories</option>
              <option value="breakfast">Petit-déjeuner</option>
              <option value="lunch">Déjeuner</option>
              <option value="dinner">Dîner</option>
              <option value="snack">En-cas</option>
            </select>
          </div>
          <div className="md:w-1/4">
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={userFilter}
              onChange={handleUserChange}
            >
              <option value="">Tous les Créateurs</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Meals Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredMeals.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Aucune recette trouvée
          </h3>
          <p className="mt-1 text-gray-500">
            Essayez d'ajuster vos critères de recherche ou de filtrage
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}

      {/* Categories Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Parcourir par Catégorie
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              name: "Petit-déjeuner",
              href: "/?category=breakfast",
              color: "amber",
              description: "Bien commencer la journée",
              icon: (
                <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              ),
            },
            {
              name: "Déjeuner",
              href: "/?category=lunch",
              color: "emerald",
              description: "Recharge d'énergie à midi",
              icon: (
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                  clipRule="evenodd"
                />
              ),
            },
            {
              name: "Dîner",
              href: "/?category=dinner",
              color: "blue",
              description: "Satisfaction du soir",
              icon: (
                <path
                  fillRule="evenodd"
                  d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                  clipRule="evenodd"
                />
              ),
            },
            {
              name: "En-cas",
              href: "/?category=snack",
              color: "rose",
              description: "Petites bouchées rapides",
              icon: (
                <path d="M15 1.784l-.796.796a1.125 1.125 0 101.591 0L15 1.784zM12 1.784l-.796.796a1.125 1.125 0 101.591 0L12 1.784zM9 1.784l-.796.796a1.125 1.125 0 101.591 0L9 1.784z" />
              ),
            },
          ].map((category) => (
            <Link
              key={category.name}
              href={category.href}
              onClick={() => setCategoryFilter(category.name.toLowerCase())}
              className={`bg-${category.color}-50 hover:bg-${category.color}-100 border border-${category.color}-200 rounded-xl p-6 text-center transition-colors duration-200`}
            >
              <div
                className={`w-16 h-16 bg-${category.color}-200 rounded-full flex items-center justify-center mx-auto mb-3`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`w-8 h-8 text-${category.color}-600`}
                >
                  {category.icon}
                </svg>
              </div>
              <h3
                className={`font-semibold text-${category.color}-800 text-lg mb-1`}
              >
                {category.name}
              </h3>
              <p className={`text-${category.color}-600 text-sm`}>
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
