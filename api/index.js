// This file is a Vercel serverless function that serves our API
import express from 'express';
import { storage } from '../server/storage.js';
import { z } from 'zod';
import { insertProgressSchema } from '../shared/schema.js';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error logging middleware
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  next();
});

// API routes
// Get meals for a specific day
app.get("/api/meals/:day", async (req, res) => {
  const { day } = req.params;
  
  if (!day) {
    return res.status(400).json({ message: "Day parameter is required" });
  }
  
  const meals = await storage.getMealsByDay(day.toLowerCase());
  return res.json(meals);
});

// Get workout for a specific day
app.get("/api/workouts/:day", async (req, res) => {
  const { day } = req.params;
  
  if (!day) {
    return res.status(400).json({ message: "Day parameter is required" });
  }
  
  const workout = await storage.getWorkoutByDay(day.toLowerCase());
  
  if (!workout) {
    return res.status(404).json({ message: "Workout not found" });
  }
  
  // Special handling for workouts based on the day
  const dayToExercisesMap = {
    "monday": [
      { name: "Barbell Squats", repsAndWeight: "4x8–10 (40–50% bodyweight)" },
      { name: "Romanian Deadlifts", repsAndWeight: "3x10–12 (25–35 kg)" },
      { name: "Hip Thrusts", repsAndWeight: "3x12 (40–50 kg)" },
      { name: "Calf Raises", repsAndWeight: "3x15 (Bodyweight or add dumbbells)" },
      { name: "Hanging Leg Raises", repsAndWeight: "3x12" }
    ],
    "tuesday": [
      { name: "Dynamic Warmup", repsAndWeight: "10 minutes" },
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
    const exercises = dayToExercisesMap[dayKey].map((ex, index) => ({
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
  }
  
  return res.json(progress);
});

// Other API routes would be defined here...

// Default handler for Vercel
export default function (req, res) {
  return app(req, res);
}