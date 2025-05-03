import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import {
  MealPlanState,
  loadUserWeekMealPlan,
  saveUserWeekMealPlan,
  hydrateMealPlan,
  createEmptyMealPlan,
  getWeekStartDate,
  formatDateToYYYYMMDD,
} from "@/services/dataservice";

export function useWeekMealPlan(daysOfWeek: string[], mealTypes: string[]) {
  const { currentUser } = useUser();
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(
    getWeekStartDate(new Date())
  );
  const [mealPlan, setMealPlan] = useState<MealPlanState>(
    createEmptyMealPlan(daysOfWeek, mealTypes)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  // Important: Add refs to track state without triggering rerenders
  const isLoadingRef = useRef(true);
  const mealPlanRef = useRef<MealPlanState>(mealPlan);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedMealPlanRef = useRef<string>("");

  // Change the current week
  const changeWeek = (newWeekDate: Date) => {
    const weekStart = getWeekStartDate(newWeekDate);
    setCurrentWeekDate(weekStart);
  };

  // Load meal plan for the current user and selected week
  useEffect(() => {
    // Reset loading state when week changes
    setLoading(true);
    isLoadingRef.current = true;

    // Generate a unique key for this week to prevent duplicate loads
    const weekKey = `${currentUser.id}-${formatDateToYYYYMMDD(
      currentWeekDate
    )}`;

    async function fetchUserWeekMealPlan() {
      try {
        console.log(`Loading meal plan: ${weekKey}`);

        // Load the meal plan for the current user and week
        let userWeekMealPlan = await loadUserWeekMealPlan(
          currentUser.id,
          currentWeekDate,
          daysOfWeek,
          mealTypes
        );

        // Only update state if component is still mounted
        let hydratedPlan;

        // Hydrate the meal plan with actual meal objects
        if (Object.keys(userWeekMealPlan).length > 0) {
          hydratedPlan = await hydrateMealPlan(userWeekMealPlan);
        } else {
          hydratedPlan = createEmptyMealPlan(daysOfWeek, mealTypes);
        }

        setMealPlan(hydratedPlan);
        mealPlanRef.current = hydratedPlan;

        // Save the serialized plan for comparison
        lastSavedMealPlanRef.current = JSON.stringify(hydratedPlan);

        setError(null);
      } catch (err) {
        console.error("Failed to load user week meal plan:", err);
        setError("Failed to load meal plan. Please try again later.");

        // Set default empty plan as fallback
        const emptyPlan = createEmptyMealPlan(daysOfWeek, mealTypes);
        setMealPlan(emptyPlan);
        mealPlanRef.current = emptyPlan;
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    }

    fetchUserWeekMealPlan();

    // Cleanup function: cancel any pending save operations
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [
    currentUser.id,
    formatDateToYYYYMMDD(currentWeekDate),
    daysOfWeek.join(","),
    mealTypes.join(","),
  ]);

  // Save meal plan whenever it changes - with proper debouncing
  useEffect(() => {
    // Don't save while loading
    if (loading || isLoadingRef.current) return;

    // Skip the initial render
    const mealPlanString = JSON.stringify(mealPlan);

    // Don't save if nothing has changed
    if (mealPlanString === lastSavedMealPlanRef.current) {
      return;
    }

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set saving status
    setSaving("Enregistrement...");

    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const weekKey = `${currentUser.id}-${formatDateToYYYYMMDD(
          currentWeekDate
        )}`;
        console.log(`Saving meal plan: ${weekKey}`);

        const success = await saveUserWeekMealPlan(
          currentUser.id,
          currentWeekDate,
          mealPlan
        );

        if (success) {
          // Update the last saved plan reference
          lastSavedMealPlanRef.current = mealPlanString;

          setSaving("Enregistré");
          setTimeout(() => {
            setSaving(null);
          }, 2000);
        } else {
          setSaving("Échec de l'enregistrement");
        }
      } catch (err) {
        console.error("Error saving user week meal plan:", err);
        setSaving("Échec de l'enregistrement");
      } finally {
        saveTimeoutRef.current = null;
      }
    }, 2000); // Increased debounce to 2 seconds
  }, [mealPlan, currentUser.id, currentWeekDate]);

  // Function to update the meal plan - use functional updates to avoid dependency issues
  const updateMealPlan = (
    updater: MealPlanState | ((prev: MealPlanState) => MealPlanState)
  ) => {
    if (typeof updater === "function") {
      setMealPlan((prev) => {
        const newPlan = updater(prev);
        mealPlanRef.current = newPlan;
        return newPlan;
      });
    } else {
      setMealPlan(updater);
      mealPlanRef.current = updater;
    }
  };

  return {
    mealPlan,
    updateMealPlan,
    currentWeekDate,
    changeWeek,
    loading,
    error,
    saving,
    userId: currentUser.id,
  };
}
