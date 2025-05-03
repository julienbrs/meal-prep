import { useState, useEffect } from "react";

interface WeekSelectorProps {
  currentWeekDate: Date;
  onWeekChange: (date: Date) => void;
}

const WeekSelector = ({ currentWeekDate, onWeekChange }: WeekSelectorProps) => {
  const formatWeekDisplay = (date: Date): string => {
    const startOfWeek = new Date(date);
    // Ajuster pour commencer le lundi (en JavaScript, 0 = dimanche)
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Formater les dates
    const formatDate = (d: Date): string => {
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
    };

    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  };

  const [weekDisplay, setWeekDisplay] = useState<string>(
    formatWeekDisplay(currentWeekDate)
  );

  useEffect(() => {
    setWeekDisplay(formatWeekDisplay(currentWeekDate));
  }, [currentWeekDate]);

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekDate);
    newDate.setDate(newDate.getDate() - 7);
    onWeekChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekDate);
    newDate.setDate(newDate.getDate() + 7);
    onWeekChange(newDate);
  };

  const handleCurrentWeek = () => {
    onWeekChange(new Date());
  };

  return (
    <div className="flex items-center justify-center space-x-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={handlePreviousWeek}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Semaine précédente"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div className="flex flex-col items-center">
        <div className="text-sm font-medium text-gray-800">{weekDisplay}</div>
        <button
          onClick={handleCurrentWeek}
          className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
        >
          Semaine actuelle
        </button>
      </div>

      <button
        onClick={handleNextWeek}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Semaine suivante"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default WeekSelector;
