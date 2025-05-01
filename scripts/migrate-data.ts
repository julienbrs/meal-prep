import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables.");
  process.exit(1);
}

// Define schemas (minimal versions just for migration)
const FoodItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  category: String,
  units: String,
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
});

const RecipeIngredientSchema = new mongoose.Schema({
  foodItemId: String,
  amount: Number,
  unit: String,
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

const MealSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  category: String,
  preparationTime: Number,
  image: String,
  ingredients: [RecipeIngredientSchema],
  instructions: [String],
  calculatedNutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
  },
  totalCost: Number,
});

const MealPlanSchema = new mongoose.Schema({
  id: String,
  planData: mongoose.Schema.Types.Mixed,
});

async function migrateData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB!");

    // Create models
    const FoodItem =
      mongoose.models.FoodItem || mongoose.model("FoodItem", FoodItemSchema);
    const Meal = mongoose.models.Meal || mongoose.model("Meal", MealSchema);
    const MealPlan =
      mongoose.models.MealPlan || mongoose.model("MealPlan", MealPlanSchema);

    // Migrate food items
    const foodItemsPath = path.join(
      process.cwd(),
      "public",
      "data",
      "foodItems.json"
    );
    if (fs.existsSync(foodItemsPath)) {
      console.log("Migrating food items...");
      const foodItemsData = JSON.parse(fs.readFileSync(foodItemsPath, "utf-8"));

      // Clear existing data
      await FoodItem.deleteMany({});

      if (foodItemsData && foodItemsData.length > 0) {
        await FoodItem.insertMany(foodItemsData);
        console.log(
          `Successfully migrated ${foodItemsData.length} food items.`
        );
      } else {
        console.log("No food items to migrate.");
      }
    } else {
      console.log("Food items file not found.");
    }

    // Migrate meals
    const mealsPath = path.join(process.cwd(), "public", "data", "meals.json");
    if (fs.existsSync(mealsPath)) {
      console.log("Migrating meals...");
      const mealsData = JSON.parse(fs.readFileSync(mealsPath, "utf-8"));

      // Clear existing data
      await Meal.deleteMany({});

      if (mealsData && mealsData.length > 0) {
        await Meal.insertMany(mealsData);
        console.log(`Successfully migrated ${mealsData.length} meals.`);
      } else {
        console.log("No meals to migrate.");
      }
    } else {
      console.log("Meals file not found.");
    }

    // Migrate meal plans
    const mealPlansPath = path.join(
      process.cwd(),
      "public",
      "data",
      "mealPlans.json"
    );
    if (fs.existsSync(mealPlansPath)) {
      console.log("Migrating meal plans...");
      const mealPlansData = JSON.parse(fs.readFileSync(mealPlansPath, "utf-8"));

      // Clear existing data
      await MealPlan.deleteMany({});

      if (mealPlansData && Object.keys(mealPlansData).length > 0) {
        // Convert object to array of documents
        const mealPlanDocs = Object.keys(mealPlansData).map((id) => ({
          id,
          planData: mealPlansData[id],
        }));

        await MealPlan.insertMany(mealPlanDocs);
        console.log(`Successfully migrated ${mealPlanDocs.length} meal plans.`);
      } else {
        console.log("No meal plans to migrate.");
      }
    } else {
      console.log("Meal plans file not found.");
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

// Run the migration
migrateData();
