import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { getCurrentDayNumber, getCurrentWeek, getWeekDays, getWeekDateRange } from "@/data/meal-plan-data";
import { getDayName } from "@/lib/utils";
import ProgressTracker from "@/components/progress-tracker";
import DateNavigation from "@/components/date-navigation";
import MealCard from "@/components/meal-card";
import WorkoutCard from "@/components/workout-card";
import NotesSection from "@/components/notes-section";
import WeeklySummary from "@/components/weekly-summary";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const { toast } = useToast();
  const [currentDayNumber, setCurrentDayNumber] = useState(getCurrentDayNumber());
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  
  // Query for the meals of the current day
  const { data: meals, isLoading: mealsLoading } = useQuery({
    queryKey: ['/api/meals', getDayName(currentDayNumber)],
    retry: false,
    queryFn: async () => {
      const response = await fetch(`/api/meals/${getDayName(currentDayNumber)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meals');
      }
      return response.json();
    }
  });
  
  // Query for the workout of the current day
  const { data: workoutData, isLoading: workoutLoading } = useQuery({
    queryKey: ['/api/workouts', getDayName(currentDayNumber)], 
    retry: false,
    queryFn: async () => {
      const response = await fetch(`/api/workouts/${getDayName(currentDayNumber)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workout');
      }
      return response.json();
    }
  });
  
  // Query for the progress of the current day
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/progress', currentDayNumber.toString()],
    retry: false,
    queryFn: async () => {
      const response = await fetch(`/api/progress/${currentDayNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      return response.json();
    }
  });
  
  // Mutation for updating progress
  const updateProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/progress/${currentDayNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update progress');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress', currentDayNumber.toString()] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating notes
  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      const response = await fetch(`/api/notes/${currentDayNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update notes');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress', currentDayNumber.toString()] });
      toast({
        title: "Success",
        description: "Notes saved successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle day selection
  const handleDaySelect = (dayNumber: number) => {
    setCurrentDayNumber(dayNumber);
  };
  
  // Handle meal completion
  const handleMealComplete = (mealId: number, completed: boolean) => {
    if (!progressData) return;
    
    const mealCompletions = progressData.mealCompletions ? JSON.parse(progressData.mealCompletions) : [];
    
    let updatedMealCompletions;
    if (completed) {
      // Add meal ID if not already in the array
      updatedMealCompletions = [...mealCompletions, mealId];
    } else {
      // Remove meal ID if in the array
      updatedMealCompletions = mealCompletions.filter((id: number) => id !== mealId);
    }
    
    updateProgressMutation.mutate({
      mealCompletions: JSON.stringify(updatedMealCompletions)
    });
  };
  
  // Handle workout completion
  const handleWorkoutComplete = (completed: boolean) => {
    updateProgressMutation.mutate({
      workoutCompleted: completed
    });
  };
  
  // Handle notes update
  const handleSaveNotes = (notes: string) => {
    updateNotesMutation.mutate(notes);
  };
  
  // Handle week navigation
  const handlePrevWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
      // Set current day to the first day of the week
      setCurrentDayNumber((currentWeek - 2) * 7 + 1);
    }
  };
  
  const handleNextWeek = () => {
    if (currentWeek < 6) {
      setCurrentWeek(currentWeek + 1);
      // Set current day to the first day of the week
      setCurrentDayNumber((currentWeek) * 7 + 1);
    }
  };
  
  // Calculate the meal completions
  const mealCompletions = progressData?.mealCompletions 
    ? JSON.parse(progressData.mealCompletions) 
    : [];
  
  // Calculate total calories for the day
  const totalCalories = meals?.reduce((acc: number, meal: any) => acc + meal.calories, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <i className="fas fa-utensils text-orange-500 mr-2"></i>
              <i className="fas fa-dumbbell text-purple-500 mr-2"></i>
              <h1 className="text-xl font-semibold text-gray-800">40-Day Meal & Workout Plan</h1>
            </div>
            <div>
              <ProgressTracker 
                currentDay={currentDayNumber} 
                totalDays={40} 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Date Navigation */}
        <DateNavigation 
          currentWeek={currentWeek}
          weekDays={getWeekDays(currentWeek)}
          dateRange={getWeekDateRange(currentWeek)}
          currentDayNumber={currentDayNumber}
          onDaySelect={handleDaySelect}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
        />

        {/* Day Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Meals Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b flex items-center">
                <i className="fas fa-utensils text-orange-500 mr-2"></i>
                <h3 className="text-lg font-semibold text-gray-800">Meals</h3>
                <span className="ml-auto px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
                  {totalCalories} kcal
                </span>
              </div>
              <div className="p-4 divide-y">
                {mealsLoading ? (
                  <div className="py-10 text-center text-gray-500">Loading meals...</div>
                ) : meals?.length ? (
                  meals.map((meal: any) => (
                    <MealCard 
                      key={meal.id}
                      meal={meal}
                      isCompleted={mealCompletions.includes(meal.id)}
                      onComplete={(completed) => handleMealComplete(meal.id, completed)}
                    />
                  ))
                ) : (
                  <div className="py-10 text-center text-gray-500">No meals found for this day</div>
                )}
              </div>
            </div>
          </div>

          {/* Workout Section */}
          <div className="lg:col-span-1">
            {workoutLoading ? (
              <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
                Loading workout...
              </div>
            ) : workoutData ? (
              <WorkoutCard 
                workout={workoutData}
                isCompleted={progressData?.workoutCompleted || false}
                onComplete={handleWorkoutComplete}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
                No workout found for this day
              </div>
            )}
          </div>
        </div>

        {/* Daily Notes Section */}
        <NotesSection 
          notes={progressData?.notes || ""}
          onSave={handleSaveNotes}
          isLoading={progressLoading}
          isSaving={updateNotesMutation.isPending}
        />
      </main>

      {/* Weekly Summary Modal */}
      {showWeeklySummary && (
        <WeeklySummary 
          weekNumber={currentWeek}
          onClose={() => setShowWeeklySummary(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">40-Day Meal & Workout Plan • March 31 - May 9</p>
            <div className="mt-3 sm:mt-0 flex space-x-4">
              <button 
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary hover:text-indigo-700 focus:outline-none"
                onClick={() => setShowWeeklySummary(true)}
              >
                <i className="fas fa-chart-pie mr-1"></i>
                Weekly Summary
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
