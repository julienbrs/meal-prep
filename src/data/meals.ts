import { Meal } from "@/types/meal";
import {
  calculateRecipeNutrition,
  calculateRecipeCost,
} from "@/utils/nutritionCalculator";

export const createMeals = (): Meal[] => {
  const meals: Meal[] = [
    {
      id: "1",
      name: "Avocado Toast with Egg",
      description:
        "A nutritious breakfast with whole grain toast, avocado, and a perfectly poached egg.",
      category: "breakfast",
      preparationTime: 15,
      image: "/images/avocado-toast.png",
      ingredients: [
        { foodItemId: "grain-1", amount: 2, unit: "slice" },
        { foodItemId: "veg-1", amount: 1, unit: "piece" },
        { foodItemId: "protein-3", amount: 2, unit: "piece" },
        { foodItemId: "spice-1", amount: 1, unit: "g" },
        { foodItemId: "spice-2", amount: 1, unit: "g" },
      ],
      instructions: [
        "Toast the bread until golden and firm.",
        "While the bread is toasting, mash the avocado in a small bowl and season with salt and pepper.",
        "Poach the eggs by bringing a pot of water to a simmer, adding a splash of vinegar, and cracking the eggs into the water. Cook for 3-4 minutes.",
        "Spread the mashed avocado on the toasted bread.",
        "Top with the poached eggs, a sprinkle of salt, pepper, and red pepper flakes.",
      ],
    },
    {
      id: "2",
      name: "Grilled Chicken Salad",
      description:
        "A light, protein-packed salad with grilled chicken, mixed greens, and a tangy vinaigrette.",
      category: "lunch",
      preparationTime: 25,
      image: "/images/chicken-salad.jpg",
      ingredients: [
        { foodItemId: "protein-1", amount: 150, unit: "g" },
        { foodItemId: "veg-3", amount: 200, unit: "g" },
        { foodItemId: "fruit-1", amount: 100, unit: "g" },
        { foodItemId: "veg-4", amount: 100, unit: "g" },
        { foodItemId: "fat-1", amount: 15, unit: "ml" },
        { foodItemId: "cond-1", amount: 10, unit: "ml" },
        { foodItemId: "spice-1", amount: 1, unit: "g" },
        { foodItemId: "spice-2", amount: 1, unit: "g" },
      ],
      instructions: [
        "Season the chicken breast with salt and pepper.",
        "Grill the chicken for 6-7 minutes per side until cooked through.",
        "Wash and chop the mixed greens, halve the cherry tomatoes, and dice the cucumber.",
        "In a small bowl, whisk together olive oil, balsamic vinegar, salt, and pepper to make the dressing.",
        "Combine the greens, tomatoes, and cucumber in a large bowl.",
        "Slice the grilled chicken and place on top of the salad.",
        "Drizzle with the dressing just before serving.",
      ],
    },
    {
      id: "3",
      name: "Salmon with Roasted Vegetables",
      description:
        "Oven-baked salmon fillet with a medley of seasonal roasted vegetables.",
      category: "dinner",
      preparationTime: 40,
      image: "/images/salmon-vegetables.jpg",
      ingredients: [
        { foodItemId: "protein-2", amount: 180, unit: "g" },
        { foodItemId: "veg-2", amount: 150, unit: "g" },
        { foodItemId: "veg-5", amount: 100, unit: "g" },
        { foodItemId: "fat-1", amount: 30, unit: "ml" },
        { foodItemId: "spice-1", amount: 2, unit: "g" },
        { foodItemId: "spice-2", amount: 1, unit: "g" },
      ],
      instructions: [
        "Preheat the oven to 400°F (200°C).",
        "Chop all vegetables into bite-sized pieces.",
        "Toss vegetables with 1 tbsp olive oil, half the salt and pepper, and dried herbs.",
        "Spread vegetables on a baking sheet and roast for 15 minutes.",
        "Season salmon with remaining salt, pepper, and 1 tbsp olive oil.",
        "Place salmon on the baking sheet with the partially roasted vegetables.",
        "Bake for an additional 12-15 minutes until salmon is cooked through and vegetables are tender.",
      ],
    },
  ];

  return meals.map((meal) => {
    return {
      ...meal,
      calculatedNutrition: calculateRecipeNutrition(meal.ingredients),
      totalCost: calculateRecipeCost(meal.ingredients),
    };
  });
};

export const sampleMeals = createMeals();
