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
    
    // Special handling for Friday workout since exercises aren't being mapped properly
    if (day.toLowerCase() === "friday") {
      console.log("Special handling for Friday workout");
      return res.json({
        ...workout,
        exercises: [
          {
            id: 100,
            workoutId: workout.id,
            name: "Steady-State Run (Moderate Pace)",
            repsAndWeight: "5-6 km"
          },
          {
            id: 101,
            workoutId: workout.id,
            name: "HIIT Sprints",
            repsAndWeight: "10 rounds: 30 sec sprint / 1 min walk"
          }
        ]
      });
    }
    
    // Get exercises for this workout
    const exercises = await storage.getExercisesByWorkoutId(workout.id);
    console.log(`Found workout with ${exercises.length} exercises for day: ${day}`);
    console.log(`Workout ID: ${workout.id}, Looking for exercises with workoutId: ${workout.id}`);
    console.log(`All exercises:`, Array.from((storage as any).exercises.values()));
    
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
          notes: ""
        });
      }
      
      weeklyProgress.push(dayProgress);
    }
    
    return res.json(weeklyProgress);
  });

  const httpServer = createServer(app);
  return httpServer;
}
