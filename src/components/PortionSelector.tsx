// src/components/PortionSelector.tsx
import React, { useState, useRef, useEffect } from "react";
import { Meal } from "@/types/meal";
import { useUser } from "@/context/UserContext";
import { useFoodItems } from "@/context/FoodItemsContext";

interface PortionSelectorProps {
  meal: Meal;
  onPortionChange: (portions: number) => void;
  onSavePreference?: (portions: number) => void;
  className?: string;
}

export default function PortionSelector({
  meal,
  onPortionChange,
  onSavePreference,
  className = "",
}: PortionSelectorProps) {
  const { currentUser } = useUser();
  const { reloadFoodItems } = useFoodItems();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Obtenir la portion préférée de l'utilisateur ou 1 par défaut
  const getUserPreferredPortions = (): number => {
    return meal.preferredPortions?.[currentUser.id] || 1;
  };

  const [currentPortions, setCurrentPortions] = useState<number>(
    getUserPreferredPortions()
  );

  useEffect(() => {
    onPortionChange(currentPortions);
  }, [currentPortions, onPortionChange]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setInputValue(currentPortions.toString());
    setIsEditing(true);
  };

  const handleSubmit = async () => {
    const newValue = parseFloat(inputValue);
    if (!isNaN(newValue) && newValue > 0 && newValue <= 10) {
      const roundedValue = Math.round(newValue * 100) / 100;
      setCurrentPortions(roundedValue);

      // Auto-save preference if different from current preference
      if (onSavePreference && roundedValue !== getUserPreferredPortions()) {
        await onSavePreference(roundedValue);
        const { clearMealsCache } = await import("@/services/dataservice");
        clearMealsCache();
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSubmit();
  };

  const formatPortions = (portions: number): string => {
    return portions === 1 ? "1 portion" : `${portions} portions`;
  };

  return (
    <div className={`flex items-center ${className}`}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          min="0.1"
          max="10"
          step="0.1"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-16 px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      ) : (
        <button
          onClick={handleClick}
          className="flex items-center hover:bg-gray-100 px-2 py-1 rounded transition-colors"
          title="Cliquer pour modifier les portions"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 text-blue-500 mr-1"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-semibold text-blue-600">
            {formatPortions(currentPortions)}
          </span>
        </button>
      )}
    </div>
  );
}
