import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWeekDateRange } from "@/data/meal-plan-data";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { safeJsonParse } from "@/lib/utils";

interface WeeklySummaryProps {
  weekNumber: number;
  onClose: () => void;
}

const WeeklySummary = ({ weekNumber, onClose }: WeeklySummaryProps) => {
  // Query for weekly progress data
  const { data: weeklyProgress, isLoading } = useQuery({
    queryKey: ['/api/weekly-summary', weekNumber.toString()],
    retry: false,
    queryFn: async () => {
      const response = await fetch(`/api/weekly-summary/${weekNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weekly summary');
      }
      return response.json();
    }
  });

  // Calculate meal completion percentage
  const calculateMealCompletion = () => {
    if (!weeklyProgress) return { completed: 0, total: 21, percentage: 0 };
    
    let totalMealsCompleted = 0;
    const totalMeals = 21; // 3 meals per day for 7 days
    
    weeklyProgress.forEach((day: any) => {
      const completions = safeJsonParse<number[]>(day.mealCompletions, []);
      totalMealsCompleted += completions.length;
    });
    
    return {
      completed: totalMealsCompleted,
      total: totalMeals,
      percentage: (totalMealsCompleted / totalMeals) * 100
    };
  };
  
  // Calculate workout completion percentage
  const calculateWorkoutCompletion = () => {
    if (!weeklyProgress) return { completed: 0, total: 5, percentage: 0 };
    
    let totalWorkoutsCompleted = 0;
    let totalWorkouts = 0;
    
    weeklyProgress.forEach((day: any) => {
      // We'll count Saturday and Sunday as non-workout days (unless they're marked as completed)
      const isWeekend = ["saturday", "sunday"].includes(day.day);
      if (!isWeekend || day.workoutCompleted) {
        totalWorkouts++;
        if (day.workoutCompleted) {
          totalWorkoutsCompleted++;
        }
      }
    });
    
    return {
      completed: totalWorkoutsCompleted,
      total: totalWorkouts,
      percentage: (totalWorkoutsCompleted / totalWorkouts) * 100
    };
  };
  
  // Calculate daily walk completion percentage
  const calculateDailyWalkCompletion = () => {
    if (!weeklyProgress) return { completed: 0, total: 7, percentage: 0 };
    
    let totalWalksCompleted = 0;
    const totalDays = 7; // All 7 days of the week should have a daily walk
    
    weeklyProgress.forEach((day: any) => {
      if (day.dailyWalkCompleted) {
        totalWalksCompleted++;
      }
    });
    
    return {
      completed: totalWalksCompleted,
      total: totalDays,
      percentage: (totalWalksCompleted / totalDays) * 100
    };
  };
  
  const mealCompletion = calculateMealCompletion();
  const workoutCompletion = calculateWorkoutCompletion();
  const walkCompletion = calculateDailyWalkCompletion();

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.id === 'weeklySummaryModal') {
        onClose();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center" id="weeklySummaryModal">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Weekly Summary - Week {weekNumber}</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Loading summary data...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Weekly Meal Compliance</h4>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Meals Consumed</span>
                      <span className="text-sm font-medium">{mealCompletion.completed}/{mealCompletion.total}</span>
                    </div>
                    <Progress 
                      value={mealCompletion.percentage} 
                      className="mb-4"
                      fill="bg-orange-500"
                    />
                    <p className="text-sm text-gray-600">
                      You've consumed {Math.round(mealCompletion.percentage)}% of your planned meals this week.
                      {mealCompletion.percentage >= 70 ? " Great job!" : " Keep going!"}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Weekly Workout Completion</h4>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Workouts Completed</span>
                      <span className="text-sm font-medium">{workoutCompletion.completed}/{workoutCompletion.total}</span>
                    </div>
                    <Progress 
                      value={workoutCompletion.percentage} 
                      className="mb-4"
                      fill="bg-purple-500"
                    />
                    <p className="text-sm text-gray-600">
                      You've completed {Math.round(workoutCompletion.percentage)}% of your workouts this week.
                      {workoutCompletion.percentage >= 80 ? " Keep it up!" : " You can do it!"}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Daily 4 km Walks</h4>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Walks Completed</span>
                      <span className="text-sm font-medium">{walkCompletion.completed}/{walkCompletion.total}</span>
                    </div>
                    <Progress 
                      value={walkCompletion.percentage} 
                      className="mb-4"
                      fill="bg-blue-500"
                    />
                    <p className="text-sm text-gray-600">
                      You've completed {Math.round(walkCompletion.percentage)}% of your daily walks this week.
                      {walkCompletion.percentage >= 70 ? " Excellent!" : " Keep walking!"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Weekly Progress Overview</h4>
                <div className="bg-gray-100 rounded-lg p-4 h-48 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <i className="fas fa-chart-line text-4xl mb-2"></i>
                    <p>Weekly progress visualization would appear here</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button className="w-full">
                  <i className="fas fa-download mr-2"></i>
                  Export Weekly Report
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;
