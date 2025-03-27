import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface MealCardProps {
  meal: {
    id: number;
    time: string;
    description: string;
    calories: number;
  };
  isCompleted: boolean;
  onComplete: (completed: boolean) => void;
}

const MealCard = ({ meal, isCompleted, onComplete }: MealCardProps) => {
  const [checked, setChecked] = useState(isCompleted);
  
  const handleChange = (checked: boolean) => {
    setChecked(checked);
    onComplete(checked);
  };

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
        </div>
        <div className="ml-3 flex-grow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{meal.time}</span>
            <span className="text-sm text-gray-600 font-medium">{meal.calories} kcal</span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{meal.description}</p>
          <div className="mt-1 flex items-center">
            <Checkbox 
              id={`meal-${meal.id}`} 
              checked={checked}
              onCheckedChange={handleChange}
              className="text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor={`meal-${meal.id}`} className="ml-2 text-sm text-gray-500">
              Mark as consumed
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCard;
