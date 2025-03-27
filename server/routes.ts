import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefixed with /api
  
  // Get meals for a specific day
  app.get("/api/meals/:day", async (req, res) => {
    const { day } = req.params;
    console.log(`Fetching meals for day: ${day}`);
    
    if (!day) {
      return res.status(400).json({ message: "Day parameter is required" });
    }
    
    const meals = await storage.getMealsByDay(day.toLowerCase());
    console.log(`Found ${meals.length} meals for day: ${day}`);
    return res.json(meals);
  });

  // Get workout for a specific day
  app.get("/api/workouts/:day", async (req, res) => {
    const { day } = req.params;
    console.log(`Fetching workout for day: ${day}`);
    
    if (!day) {
      return res.status(400).json({ message: "Day parameter is required" });
    }
    
    const workout = await storage.getWorkoutByDay(day.toLowerCase());
    
    if (!workout) {
      console.log(`No workout found for day: ${day}`);
      return res.status(404).json({ message: "Workout not found" });
    }
    
    // Special handling for workouts based on the day
    // Define exercise type
    type ExerciseInfo = { name: string; repsAndWeight: string };

    // Add proper index signature to the map
    const dayToExercisesMap: { [key: string]: ExerciseInfo[] } = {
      "monday": [
        { name: "Barbell Squats", repsAndWeight: "4x8–10 (40–50% bodyweight)" },
        { name: "Romanian Deadlifts", repsAndWeight: "3x10–12 (25–35 kg)" },
        { name: "Hip Thrusts", repsAndWeight: "3x12 (40–50 kg)" },
        { name: "Calf Raises", repsAndWeight: "3x15 (Bodyweight or add dumbbells)" },
        { name: "Hanging Leg Raises", repsAndWeight: "3x12" }
      ],
      "tuesday": [
        { name: "Barbell Bench Press", repsAndWeight: "4x8–10 (30–40 kg)" },
        { name: "Seated Dumbbell Shoulder Press", repsAndWeight: "3x10 (7–10 kg each)" },
        { name: "Lat Pulldown", repsAndWeight: "3x12 (25–35 kg)" },
        { name: "Bicep Curls", repsAndWeight: "3x12 (6–8 kg each)" },
        { name: "Triceps Dips", repsAndWeight: "3x12 (Bodyweight or assisted)" }
      ],
      "wednesday": [
        { name: "Deadlifts", repsAndWeight: "4x8 (40–50% bodyweight)" },
        { name: "Bulgarian Split Squats", repsAndWeight: "3x10 per leg (Bodyweight or 8–10 kg dumbbells)" },
        { name: "Glute Bridges", repsAndWeight: "3x12 (30–40 kg)" },
        { name: "Hamstring Curls (Machine)", repsAndWeight: "3x12 (20–30 kg)" }
      ],
      "thursday": [
        { name: "Back Squats", repsAndWeight: "4x8 (40–50% bodyweight)" },
        { name: "Deadlifts", repsAndWeight: "3x8 (40–50% bodyweight)" },
        { name: "Pull-Ups", repsAndWeight: "3x8 (Assisted if needed)" },
        { name: "Bent Over Rows", repsAndWeight: "3x10 (20–30 kg total)" },
        { name: "Planks", repsAndWeight: "3x1 min hold" }
      ],
      "friday": [
        { name: "Steady-State Run (Moderate Pace)", repsAndWeight: "5-6 km" },
        { name: "HIIT Sprints", repsAndWeight: "10 rounds: 30 sec sprint / 1 min walk" }
      ],
      "saturday": [
        { name: "Active Recovery", repsAndWeight: "Light walking, stretching" }
      ],
      "sunday": [
        { name: "Active Recovery", repsAndWeight: "Light walking, stretching" }
      ]
    };
    
    const dayKey = day.toLowerCase();
    if (dayToExercisesMap[dayKey]) {
      console.log(`Special handling for ${day} workout`);
      // Create exercises with proper IDs and workoutIds
      const exercises = dayToExercisesMap[dayKey].map((ex: ExerciseInfo, index: number) => ({
        id: workout.id * 100 + index,
        workoutId: workout.id,
        name: ex.name,
        repsAndWeight: ex.repsAndWeight
      }));
      
      return res.json({
        ...workout,
        exercises
      });
    }
    
    // Fallback to database exercises if day not in our map
    const exercises = await storage.getExercisesByWorkoutId(workout.id);
    console.log(`Found workout with ${exercises.length} exercises for day: ${day}`);
    
    return res.json({ 
      ...workout,
      exercises
    });
  });

  // Get progress for a specific day
  app.get("/api/progress/:dayNumber", async (req, res) => {
    const dayNumber = parseInt(req.params.dayNumber);
    console.log(`Fetching progress for day number: ${req.params.dayNumber}, parsed: ${dayNumber}`);
    
    if (isNaN(dayNumber)) {
      console.log(`Invalid day number: ${req.params.dayNumber}`);
      return res.status(400).json({ message: "Invalid day number" });
    }
    
    // For simplicity, we'll use a hardcoded user ID of 1
    const userId = 1;
    
    let progress = await storage.getProgressByUserAndDay(userId, dayNumber);
    
    if (!progress) {
      console.log(`No progress found for day: ${dayNumber}, creating new progress`);
      // Create new progress for this day if it doesn't exist
      // Convert to string format for the date type in the schema (YYYY-MM-DD)
      const formattedDate = new Date().toISOString().split('T')[0];
      progress = await storage.createProgress({
        userId,
        dayNumber,
        date: formattedDate,
        mealCompletions: JSON.stringify([]),
        workoutCompleted: false,
        exerciseCompletions: JSON.stringify([]),
        notes: ""
      });
    } else {
      console.log(`Found progress for day: ${dayNumber}`);
    }
    
    return res.json(progress);
  });

  // Update progress for a specific day
  app.post("/api/progress/:dayNumber", async (req, res) => {
    const dayNumber = parseInt(req.params.dayNumber);
    
    if (isNaN(dayNumber)) {
      return res.status(400).json({ message: "Invalid day number" });
    }
    
    const updateSchema = insertProgressSchema.partial();
    
    try {
      const data = updateSchema.parse(req.body);
      
      // For simplicity, we'll use a hardcoded user ID of 1
      const userId = 1;
      
      let progress = await storage.getProgressByUserAndDay(userId, dayNumber);
      
      if (!progress) {
        // Create new progress
        const formattedDate = new Date().toISOString().split('T')[0];
        progress = await storage.createProgress({
          userId,
          dayNumber,
          date: formattedDate,
          mealCompletions: data.mealCompletions || JSON.stringify([]),
          workoutCompleted: data.workoutCompleted || false,
          exerciseCompletions: data.exerciseCompletions || JSON.stringify([]),
          notes: data.notes || ""
        });
      } else {
        // Update existing progress
        progress = await storage.updateProgress(progress.id, data);
      }
      
      return res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update notes for a specific day
  app.post("/api/notes/:dayNumber", async (req, res) => {
    const dayNumber = parseInt(req.params.dayNumber);
    
    if (isNaN(dayNumber)) {
      return res.status(400).json({ message: "Invalid day number" });
    }
    
    const { notes } = req.body;
    
    if (typeof notes !== "string") {
      return res.status(400).json({ message: "Notes must be a string" });
    }
    
    // For simplicity, we'll use a hardcoded user ID of 1
    const userId = 1;
    
    let progress = await storage.getProgressByUserAndDay(userId, dayNumber);
    
    if (!progress) {
      // Create new progress
      const formattedDate = new Date().toISOString().split('T')[0];
      progress = await storage.createProgress({
        userId,
        dayNumber,
        date: formattedDate,
        mealCompletions: JSON.stringify([]),
        workoutCompleted: false,
        exerciseCompletions: JSON.stringify([]),
        notes
      });
    } else {
      // Update existing progress
      progress = await storage.updateProgress(progress.id, { notes });
    }
    
    return res.json(progress);
  });

  // Get weekly summary (days in a specific week)
  app.get("/api/weekly-summary/:weekNumber", async (req, res) => {
    const weekNumber = parseInt(req.params.weekNumber);
    
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 6) {
      return res.status(400).json({ message: "Invalid week number" });
    }
    
    // Calculate the day numbers for this week
    const startDay = (weekNumber - 1) * 7 + 1;
    const endDay = startDay + 6;
    
    // For simplicity, we'll use a hardcoded user ID of 1
    const userId = 1;
    
    // Get progress for each day in the week
    const weeklyProgress = [];
    
    for (let dayNumber = startDay; dayNumber <= endDay; dayNumber++) {
      let dayProgress = await storage.getProgressByUserAndDay(userId, dayNumber);
      
      if (!dayProgress) {
        // Create new progress for this day if it doesn't exist
        const formattedDate = new Date().toISOString().split('T')[0];
        dayProgress = await storage.createProgress({
          userId,
          dayNumber,
          date: formattedDate,
          mealCompletions: JSON.stringify([]),
          workoutCompleted: false,
          exerciseCompletions: JSON.stringify([]),
          notes: ""
        });
      }
      
      weeklyProgress.push(dayProgress);
    }
    
    return res.json(weeklyProgress);
  });
  
  // Get progress statistics for all days
  app.get("/api/progress-stats", async (req, res) => {
    // For simplicity, we'll use a hardcoded user ID of 1
    const userId = 1;
    
    const allProgress = [];
    
    // Get progress for all 40 days
    for (let dayNumber = 1; dayNumber <= 40; dayNumber++) {
      let dayProgress = await storage.getProgressByUserAndDay(userId, dayNumber);
      
      if (dayProgress) {
        // Fetch the meals for this day
        const dayMapping = await storage.getDayMappingByNumber(dayNumber);
        if (dayMapping) {
          const meals = await storage.getMealsByDay(dayMapping.day);
          const workout = await storage.getWorkoutByDay(dayMapping.day);

          // Parse the meal completions
          const mealCompletions = JSON.parse(dayProgress.mealCompletions || '[]');
          const exerciseCompletions = JSON.parse(dayProgress.exerciseCompletions || '[]');
          
          // Calculate meal completion rate
          const mealCompletionRate = meals.length > 0 ? mealCompletions.length / meals.length : 0;
          
          // Calculate exercise completion rate if there's a workout
          let exerciseCompletionRate = 0;
          let exerciseCount = 0;
          
          if (workout) {
            // Get exercises for this workout
            const exercises = await storage.getExercisesByWorkoutId(workout.id);
            exerciseCount = exercises.length;
            
            if (exerciseCount > 0) {
              exerciseCompletionRate = exerciseCompletions.length / exerciseCount;
            }
          }
          
          allProgress.push({
            dayNumber: dayProgress.dayNumber,
            date: dayProgress.date,
            mealCompletionRate,
            workoutCompleted: dayProgress.workoutCompleted,
            exerciseCompletionRate,
            weekNumber: Math.ceil(dayNumber / 7)
          });
        }
      }
    }
    
    // Calculate statistics by week
    const weeklyStats = [];
    for (let weekNumber = 1; weekNumber <= 6; weekNumber++) {
      const weekDays = allProgress.filter(day => day.weekNumber === weekNumber);
      
      if (weekDays.length > 0) {
        const totalMealCompletionRate = weekDays.reduce((sum, day) => sum + day.mealCompletionRate, 0) / weekDays.length;
        const workoutCompletionCount = weekDays.filter(day => day.workoutCompleted).length;
        const workoutCompletionRate = weekDays.length > 0 ? workoutCompletionCount / weekDays.length : 0;
        const totalExerciseCompletionRate = weekDays.reduce((sum, day) => sum + day.exerciseCompletionRate, 0) / weekDays.length;
        
        weeklyStats.push({
          weekNumber,
          mealCompletionRate: totalMealCompletionRate,
          workoutCompletionRate,
          exerciseCompletionRate: totalExerciseCompletionRate
        });
      }
    }
    
    return res.json({
      dailyProgress: allProgress,
      weeklyStats
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
