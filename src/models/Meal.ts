import mongoose from "mongoose";

const RecipeIngredientSchema = new mongoose.Schema({
  foodItemId: { type: String, required: true },
  amount: { type: Number, required: true },
  unit: { type: String, required: true },
  nutritionPer100g: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
  },
  price: Number,
  priceUnit: String,
  aiGenerated: Boolean,
});

const NutritionInfoSchema = new mongoose.Schema({
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  fiber: Number,
  sugar: Number,
});

const MealSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    // Modification du champ category en categories (tableau)
    categories: {
      type: [String],
      enum: ["breakfast", "lunch", "dinner", "snack", "appetizer"],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v.length > 0; // Au moins une catégorie est requise
        },
        message: () => `Au moins une catégorie est requise`,
      },
    },
    preparationTime: { type: Number, default: 30 },
    image: { type: String },
    ingredients: [RecipeIngredientSchema],
    instructions: [String],
    calculatedNutrition: NutritionInfoSchema,
    totalCost: Number,
    createdBy: { type: String, default: "clara" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Meal || mongoose.model("Meal", MealSchema);
