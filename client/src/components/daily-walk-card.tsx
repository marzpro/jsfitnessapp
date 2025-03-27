import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, X, MapPin, Route } from "lucide-react";

interface DailyWalkCardProps {
  isCompleted: boolean;
  onComplete: (completed: boolean) => void;
}

const DailyWalkCard = ({ isCompleted, onComplete }: DailyWalkCardProps) => {
  return (
    <Card className="mb-4 overflow-hidden border-gray-200 transition-all hover:shadow-md">
      <CardHeader className={`flex flex-row items-center gap-3 ${isCompleted ? 'bg-green-50' : 'bg-blue-50'}`}>
        <div className="flex-1">
          <CardTitle className="flex items-center text-lg font-medium">
            <Route className="mr-2 h-5 w-5 text-blue-500" />
            Daily 4 km Walk
          </CardTitle>
        </div>
        <Badge variant="outline" className={isCompleted ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {isCompleted ? 'Completed' : 'Pending'}
        </Badge>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex items-center mb-2 text-gray-600">
          <Clock className="mr-2 h-4 w-4" />
          <span>Approximate time: 40-50 minutes</span>
        </div>
        <div className="flex items-center mb-4 text-gray-600">
          <MapPin className="mr-2 h-4 w-4" />
          <span>Distance: 4 kilometers</span>
        </div>
        
        <CardDescription className="text-sm text-gray-500 mt-2">
          Walking is a low-impact exercise that helps improve cardiovascular health, maintain weight, 
          and boost mood. Aim to complete your 4 km walk each day at a moderate pace.
        </CardDescription>
      </CardContent>
      
      <CardFooter className="flex justify-between p-4 bg-gray-50">
        <Button 
          variant={isCompleted ? "outline" : "default"}
          className={`w-full ${isCompleted ? 'hover:bg-gray-200' : 'bg-primary hover:bg-primary/90'}`}
          onClick={() => onComplete(!isCompleted)}
        >
          {isCompleted ? (
            <>
              <X className="mr-2 h-4 w-4" /> Mark as Incomplete
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" /> Mark as Complete
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DailyWalkCard;