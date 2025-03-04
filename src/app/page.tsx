import { sampleMeals } from "../data/meals";
import MealCard from "../components/MealCard";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Meal Recipes</h1>
        <Link
          href="/weekly-plan"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          View Weekly Plan
        </Link>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <input
            type="text"
            placeholder="Search recipes..."
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="w-full md:w-1/3">
          <select
            className="w-full p-3 border border-gray-300 rounded-lg"
            defaultValue=""
          >
            <option value="">All Categories</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleMeals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>
    </div>
  );
}
