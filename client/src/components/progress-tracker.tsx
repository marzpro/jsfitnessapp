import { Progress } from "@/components/ui/progress";

interface ProgressTrackerProps {
  currentDay: number;
  totalDays: number;
}

const ProgressTracker = ({ currentDay, totalDays }: ProgressTrackerProps) => {
  const progressPercentage = (currentDay / totalDays) * 100;

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Day {currentDay}</span>
      <div className="w-40">
        <Progress value={progressPercentage} />
      </div>
      <span className="text-sm text-gray-600">{totalDays} days</span>
    </div>
  );
};

export default ProgressTracker;
