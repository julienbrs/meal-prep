import React, { useState } from "react";
import AlertDialog from "@/components/AlertDialog";
import { useUser } from "@/context/UserContext";
import { clearUserWeekMealPlan } from "@/services/dataservice";

interface MealPlanClearButtonProps {
  daysOfWeek: string[];
  mealTypes: string[];
  weekDate: Date;
  onClearComplete: () => void;
}

const MealPlanClearButton: React.FC<MealPlanClearButtonProps> = ({
  daysOfWeek,
  mealTypes,
  weekDate,
  onClearComplete,
}) => {
  const { currentUser } = useUser();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearPlan = async () => {
    setIsClearing(true);
    try {
      const success = await clearUserWeekMealPlan(
        currentUser.id,
        weekDate,
        daysOfWeek,
        mealTypes
      );

      if (success) {
        onClearComplete();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du plan de repas:", error);
    } finally {
      setIsClearing(false);
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsConfirmDialogOpen(true)}
        className="p-6 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <AlertDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleClearPlan}
        title="Supprimer tous les repas de cette semaine"
        description={`Êtes-vous sûr de vouloir supprimer tous les repas du plan de ${currentUser.name} pour cette semaine ? Cette action ne peut pas être annulée.`}
        confirmLabel="Supprimer tous les repas"
        cancelLabel="Annuler"
        loading={isClearing}
      />
    </>
  );
};

export default MealPlanClearButton;
