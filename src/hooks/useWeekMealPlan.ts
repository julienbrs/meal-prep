import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import {
  loadUserWeekMealPlan,
  saveUserWeekMealPlan,
  hydrateMealPlan,
  createEmptyMealPlan,
  getWeekStartDate,
  formatDateToYYYYMMDD,
} from "@/services/dataservice";
import {
  MealPlanEntry,
  SnackEntry,
  MealPlanState,
  DayPlan,
} from "@/types/mealPlan";

export function useWeekMealPlan(daysOfWeek: string[], mealTypes: string[]) {
  const { currentUser } = useUser();

  // 1) date du début de semaine (lundi par défaut)
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(
    getWeekStartDate(new Date())
  );

  // 2) état du mealPlan (structure DayPlan pour chaque jour)
  const [mealPlan, setMealPlan] = useState<MealPlanState>(
    createEmptyMealPlan(daysOfWeek, mealTypes)
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  // Pour détecter si on est en train de charger pour la première fois
  const isLoadingRef = useRef<boolean>(true);

  // Pour comparer local / serveur et éviter les enregistrements redondants
  const mealPlanRef = useRef<MealPlanState>(mealPlan);
  const lastSavedMealPlanRef = useRef<string>("");

  // Pour retarder l’enregistrement automatique (debounce)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Changer de semaine sans perdre la structure du hook
  const changeWeek = (newWeekDate: Date) => {
    const weekStart = getWeekStartDate(newWeekDate);
    setCurrentWeekDate(weekStart);
  };

  // ─── useEffect chargé de récupérer ou créer le plan sur le serveur ───
  useEffect(() => {
    setLoading(true);
    isLoadingRef.current = true;

    // Clé unique pour l’API (id-utilisateur + date-début-semaine)
    const weekKey = `${currentUser.id}-${formatDateToYYYYMMDD(
      currentWeekDate
    )}`;

    async function fetchUserWeekMealPlan() {
      try {
        // 1) On tente de récupérer le plan enregistré
        const userWeekMealPlan = await loadUserWeekMealPlan(
          currentUser.id,
          currentWeekDate,
          daysOfWeek,
          mealTypes
        );

        let hydratedPlan: MealPlanState;

        // 2) Si on a déjà un objet renvoyé par l’API, on l’hydrate
        if (Object.keys(userWeekMealPlan).length > 0) {
          hydratedPlan = await hydrateMealPlan(userWeekMealPlan);
        } else {
          // Sinon, on crée un plan vide
          hydratedPlan = createEmptyMealPlan(daysOfWeek, mealTypes);
        }

        // ── Normalisation des portions si jamais elles sont manquantes
        //    - Pour un mealType ≠ "Snack", `entry` est MealPlanEntry ou null
        //    - Pour mealType === "Snack", `entry` est un tableau SnackEntry[]
        Object.values(hydratedPlan).forEach((dayObj: DayPlan) => {
          Object.entries(dayObj).forEach(([mt, entry]) => {
            if (mt === "Snack") {
              // Si c’est un tableau de SnackEntry, on boucle
              const snackArray = (entry as SnackEntry[]) || [];
              snackArray.forEach((sn: SnackEntry) => {
                // Si snack a portions manquante, on applique préférence
                if (!sn.portions) {
                  const userPref =
                    sn.meal.preferredPortions?.[currentUser.id] || 1;
                  sn.portions = userPref;
                }
              });
            } else {
              // mt ≠ "Snack" ⇒ entry est MealPlanEntry ou null
              const normalEntry = entry as MealPlanEntry | null;
              if (normalEntry) {
                const userPref =
                  normalEntry.meal.preferredPortions?.[currentUser.id] || 1;
                normalEntry.portions = normalEntry.portions || userPref;
              }
            }
          });
        });

        // On met à jour le state
        setMealPlan(hydratedPlan);
        mealPlanRef.current = hydratedPlan;
        lastSavedMealPlanRef.current = JSON.stringify(hydratedPlan);
        setError(null);
      } catch (err) {
        console.error("Failed to load user week meal plan:", err);
        setError("Failed to load meal plan. Please try again later.");

        // On retombe sur un plan vide en cas d’erreur
        const emptyPlan = createEmptyMealPlan(daysOfWeek, mealTypes);
        setMealPlan(emptyPlan);
        mealPlanRef.current = emptyPlan;
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    }

    fetchUserWeekMealPlan();

    // Nettoyage si changement de semaine avant fin du chargement
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

  // ─── useEffect chargé d’enregistrer automatiquement les modifications ───
  useEffect(() => {
    // Si on est encore en train de charger, on ne déclenche pas l’enregistrement.
    if (loading || isLoadingRef.current) return;

    const mealPlanString = JSON.stringify(mealPlan);
    if (mealPlanString === lastSavedMealPlanRef.current) return;

    // On efface tout timeout en cours pour “debounce”
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaving("Enregistrement...");

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const weekKey = `${currentUser.id}-${formatDateToYYYYMMDD(
          currentWeekDate
        )}`;
        const success = await saveUserWeekMealPlan(
          currentUser.id,
          currentWeekDate,
          mealPlan
        );

        if (success) {
          lastSavedMealPlanRef.current = mealPlanString;
          setSaving("Enregistré");
          setTimeout(() => setSaving(null), 2000);
        } else {
          setSaving("Échec de l'enregistrement");
        }
      } catch (err) {
        console.error("Error saving user week meal plan:", err);
        setSaving("Échec de l'enregistrement");
      } finally {
        saveTimeoutRef.current = null;
      }
    }, 2000);
  }, [mealPlan, currentUser.id, currentWeekDate]);

  // Fonction pour mettre à jour le mealPlan (en passant un updater fonctionnel ou un nouvel objet)
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
