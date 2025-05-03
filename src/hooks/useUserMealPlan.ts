import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import {
  MealPlanState,
  loadUserMealPlan,
  saveUserMealPlan,
  hydrateMealPlan,
  createEmptyMealPlan,
} from "@/services/dataservice";

export function useUserMealPlan(daysOfWeek: string[], mealTypes: string[]) {
  const { currentUser } = useUser();
  const [mealPlan, setMealPlan] = useState<MealPlanState>(
    createEmptyMealPlan(daysOfWeek, mealTypes)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  // Load meal plan for the current user
  useEffect(() => {
    async function fetchUserMealPlan() {
      setLoading(true);
      try {
        // Load the meal plan for the current user
        let userMealPlan = await loadUserMealPlan(
          currentUser.id,
          daysOfWeek,
          mealTypes
        );

        // Hydrate the meal plan with actual meal objects
        if (Object.keys(userMealPlan).length > 0) {
          const hydratedPlan = await hydrateMealPlan(userMealPlan);
          setMealPlan(hydratedPlan);
        } else {
          setMealPlan(createEmptyMealPlan(daysOfWeek, mealTypes));
        }

        setError(null);
      } catch (err) {
        console.error("Failed to load user meal plan:", err);
        setError("Failed to load meal plan. Please try again later.");
        // Set default empty plan as fallback
        setMealPlan(createEmptyMealPlan(daysOfWeek, mealTypes));
      } finally {
        setLoading(false);
      }
    }

    fetchUserMealPlan();
  }, [currentUser.id, daysOfWeek, mealTypes]);

  // Save meal plan whenever it changes
  useEffect(() => {
    if (loading) return;

    if (Object.keys(mealPlan).length > 0) {
      const saveData = async () => {
        setSaving("Saving...");
        try {
          const success = await saveUserMealPlan(currentUser.id, mealPlan);

          if (success) {
            setSaving("Saved");
            setTimeout(() => {
              setSaving(null);
            }, 2000);
          } else {
            setSaving("Failed to save");
          }
        } catch (err) {
          console.error("Error saving user meal plan:", err);
          setSaving("Failed to save");
        }
      };

      const timeoutId = setTimeout(() => {
        saveData();
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [mealPlan, loading, currentUser.id]);

  // Function to update the meal plan
  const updateMealPlan = (newMealPlan: MealPlanState) => {
    setMealPlan(newMealPlan);
  };

  return {
    mealPlan,
    updateMealPlan,
    loading,
    error,
    saving,
    userId: currentUser.id,
  };
}
