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
    category: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack", "appetizer"],
      required: true,
    },
    preparationTime: { type: Number, default: 30 },
    image: { type: String },
    ingredients: [RecipeIngredientSchema],
    instructions: [String],
    calculatedNutrition: NutritionInfoSchema,
    totalCost: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Meal || mongoose.model("Meal", MealSchema);
