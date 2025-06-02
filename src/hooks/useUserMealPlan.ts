import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import {
  loadUserWeekMealPlan, 
  saveUserWeekMealPlan,
  hydrateMealPlan,
  createEmptyMealPlan,
  getWeekStartDate, 
  formatDateToYYYYMMDD, 
} from "@/services/dataservice";
import { MealPlanState } from "@/types/mealPlan";

export function useWeekMealPlan(daysOfWeek: string[], mealTypes: string[]) {
  const { currentUser } = useUser();
  // Ajouté : état pour stocker la date de la semaine sélectionnée
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(
    getWeekStartDate(new Date())
  );
  const [mealPlan, setMealPlan] = useState<MealPlanState>(
    createEmptyMealPlan(daysOfWeek, mealTypes)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  // Ajouté : fonction pour changer la semaine sélectionnée
  const changeWeek = (newWeekDate: Date) => {
    const weekStart = getWeekStartDate(newWeekDate);
    setCurrentWeekDate(weekStart);
  };

  // Mise à jour : chargement du plan de repas pour l'utilisateur et la semaine courante
  useEffect(() => {
    async function fetchUserWeekMealPlan() {
      setLoading(true);
      try {
        // Modifié : chargement du plan pour l'utilisateur et la semaine
        let userMealPlan = await loadUserWeekMealPlan(
          currentUser.id,
          currentWeekDate, // Ajouté : date de la semaine
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

    fetchUserWeekMealPlan();
  }, [currentUser.id, currentWeekDate, daysOfWeek, mealTypes]); // Ajouté currentWeekDate

  // Mise à jour : sauvegarde du plan de repas pour l'utilisateur et la semaine courante
  useEffect(() => {
    if (loading) return;
    if (Object.keys(mealPlan).length > 0) {
      const saveData = async () => {
        setSaving("Enregistrement...");
        try {
          // Modifié : sauvegarde du plan pour l'utilisateur et la semaine
          const success = await saveUserWeekMealPlan(
            currentUser.id,
            currentWeekDate, // Ajouté : date de la semaine
            mealPlan
          );

          if (success) {
            setSaving("Enregistré");
            setTimeout(() => {
              setSaving(null);
            }, 2000);
          } else {
            setSaving("Échec de l'enregistrement");
          }
        } catch (err) {
          console.error("Error saving user meal plan:", err);
          setSaving("Échec de l'enregistrement");
        }
      };

      const timeoutId = setTimeout(() => {
        saveData();
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [mealPlan, loading, currentUser.id, currentWeekDate]); // Ajouté currentWeekDate

  // Function to update the meal plan
  const updateMealPlan = (newMealPlan: MealPlanState) => {
    setMealPlan(newMealPlan);
  };

  return {
    mealPlan,
    updateMealPlan,
    currentWeekDate, // Ajouté
    changeWeek, // Ajouté
    loading,
    error,
    saving,
    userId: currentUser.id,
  };
}
