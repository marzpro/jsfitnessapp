import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

interface WorkoutCardProps {
  workout: {
    type: string;
    exercises: Array<{
      id: number;
      name: string;
      repsAndWeight: string;
    }>;
  };
  isCompleted: boolean;
  onComplete: (completed: boolean) => void;
}

const WorkoutCard = ({ workout, isCompleted, onComplete }: WorkoutCardProps) => {
  const [checked, setChecked] = useState(isCompleted);
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);
  
  const handleChange = (checked: boolean) => {
    setChecked(checked);
    onComplete(checked);
  };

  const startWorkout = () => {
    setShowWorkoutDetails(true);
    // If the workout is started, we can optionally mark it as in progress
    if (!checked) {
      console.log("Starting workout:", workout.type);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-4 border-b flex items-center">
        <i className="fas fa-dumbbell text-purple-500 mr-2"></i>
        <h3 className="text-lg font-semibold text-gray-800">Workout</h3>
        <span className="ml-auto px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">45-60 min</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">{workout.type}</h4>
          <div className="flex items-center">
            <Checkbox 
              id={`workout-${workout.type}`} 
              checked={checked}
              onCheckedChange={handleChange}
              className="text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor={`workout-${workout.type}`} className="ml-2 text-sm text-gray-500">
              Mark as completed
            </label>
          </div>
        </div>
        
        {showWorkoutDetails || workout.exercises?.length > 0 ? (
          <div className="mt-4">
            <h5 className="font-medium text-gray-800 mb-2">Workout Details:</h5>
            <ul className="space-y-3 text-sm text-gray-600">
              {workout.exercises?.map((exercise) => (
                <li key={exercise.id} className="flex items-start">
                  <i className="fas fa-check-circle text-purple-500 mt-1 flex-shrink-0"></i>
                  <span className="ml-2">{exercise.name} – {exercise.repsAndWeight}</span>
                </li>
              ))}
              {(!workout.exercises || workout.exercises.length === 0) && (
                <li className="text-center text-gray-500">No specific exercises. Follow the workout type instructions.</li>
              )}
            </ul>
          </div>
        ) : null}
        
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Today's Progress</span>
            <span className="text-sm font-medium text-gray-600">
              {checked ? "1/1" : "0/1"} complete
            </span>
          </div>
          <div className="mt-1 relative pt-1">
            <Progress 
              value={checked ? 100 : 0} 
              fill="bg-purple-500" 
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-center">
          <Button 
            className="bg-purple-500 hover:bg-purple-700"
            onClick={startWorkout}
          >
            <i className="fas fa-play mr-2"></i>
            {showWorkoutDetails ? 'Workout Details' : 'Start Workout'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
