import mongoose from "mongoose";

const MealPlanSchema = new mongoose.Schema(
  {
    id: { type: String, default: "default", unique: true },
    planData: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MealPlan ||
  mongoose.model("MealPlan", MealPlanSchema);
