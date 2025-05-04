import mongoose from "mongoose";

const FoodItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    units: {
      type: String,
      enum: ["g", "ml", "piece", "tbsp", "tsp", "cup"],
      default: "g",
    },
    nutritionPer100g: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
    },
    price: { type: Number, default: 0 },
    priceUnit: { type: String, default: "per 100g" },
    weightPerPiece: { type: Number },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.FoodItem ||
  mongoose.model("FoodItem", FoodItemSchema);
