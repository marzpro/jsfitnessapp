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
    const meals = await storage.getMealsByDay(day.toLowerCase());
    return res.json(meals);
  });

  // Get workout for a specific day
  app.get("/api/workouts/:day", async (req, res) => {
    const { day } = req.params;
    const workout = await storage.getWorkoutByDay(day.toLowerCase());
    
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    
    // Get exercises for this workout
    const exercises = await storage.getExercisesByWorkoutId(workout.id);
    
    return res.json({ 
      ...workout,
      exercises
    });
  });

  // Get progress for a specific day
  app.get("/api/progress/:dayNumber", async (req, res) => {
    const dayNumber = parseInt(req.params.dayNumber);
    
    if (isNaN(dayNumber)) {
      return res.status(400).json({ message: "Invalid day number" });
    }
    
    // For simplicity, we'll use a hardcoded user ID of 1
    const userId = 1;
    
    let progress = await storage.getProgressByUserAndDay(userId, dayNumber);
    
    if (!progress) {
      // Create new progress for this day if it doesn't exist
      progress = await storage.createProgress({
        userId,
        dayNumber,
        date: new Date(),
        mealCompletions: JSON.stringify([]),
        workoutCompleted: false,
        notes: ""
      });
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
        progress = await storage.createProgress({
          userId,
          dayNumber,
          date: new Date(),
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
      progress = await storage.createProgress({
        userId,
        dayNumber,
        date: new Date(),
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
        dayProgress = await storage.createProgress({
          userId,
          dayNumber,
          date: new Date(),
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
