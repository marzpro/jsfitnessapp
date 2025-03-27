import { DayMapping } from "@/data/meal-plan-data";
import { cn } from "@/lib/utils";

interface DateNavigationProps {
  currentWeek: number;
  weekDays: DayMapping[];
  dateRange: string;
  currentDayNumber: number;
  onDaySelect: (dayNumber: number) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

const DateNavigation = ({
  currentWeek,
  weekDays,
  dateRange,
  currentDayNumber,
  onDaySelect,
  onPrevWeek,
  onNextWeek
}: DateNavigationProps) => {
  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onPrevWeek}
            disabled={currentWeek === 1}
            aria-label="Previous week"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2 className="text-xl font-semibold text-center text-gray-800">{dateRange}</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onNextWeek}
            disabled={currentWeek === 6}
            aria-label="Next week"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        
        {/* Day tabs */}
        <div className="flex overflow-x-auto pb-1 gap-1 sm:gap-0">
          {weekDays.map((dayInfo) => {
            const isActive = dayInfo.dayNumber === currentDayNumber;
            const dayName = dayInfo.day.charAt(0).toUpperCase() + dayInfo.day.slice(1, 3);
            const dayDate = dayInfo.date.getDate();
            
            return (
              <button
                key={dayInfo.dayNumber}
                className={cn(
                  "flex-1 py-2 px-1 text-sm font-medium rounded-t-lg border-b-2 min-w-[4rem] flex flex-col items-center transition-colors duration-150 focus:outline-none",
                  isActive
                    ? "border-primary bg-primary bg-opacity-5 text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
                onClick={() => onDaySelect(dayInfo.dayNumber)}
              >
                <span>{dayName}</span>
                <span className="text-xs">{dayDate}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DateNavigation;
