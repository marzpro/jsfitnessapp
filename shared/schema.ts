import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (kept from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Meal schema
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  day: text("day").notNull(), // e.g., "monday", "tuesday"
  time: text("time").notNull(), // e.g., "12:00 PM"
  description: text("description").notNull(),
  calories: integer("calories").notNull(),
  dayNumber: integer("day_number").notNull(), // 1-40
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
});

export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof meals.$inferSelect;

// Workout schema
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  day: text("day").notNull(), // e.g., "monday", "tuesday"
  type: text("type").notNull(), // e.g., "Lower Body & Core"
  dayNumber: integer("day_number").notNull(), // 1-40
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
});

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;

// Exercise schema
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull(),
  name: text("name").notNull(),
  repsAndWeight: text("reps_and_weight").notNull(),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

// User progress schema
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dayNumber: integer("day_number").notNull(), // 1-40
  date: text("date").notNull(), // Storing as ISO string YYYY-MM-DD
  mealCompletions: text("meal_completions").notNull(), // JSON string of meal IDs that are completed
  workoutCompleted: boolean("workout_completed").notNull().default(false),
  exerciseCompletions: text("exercise_completions").notNull().default('[]'), // JSON string of exercise IDs that are completed
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProgressSchema = createInsertSchema(progress).omit({
  id: true,
  createdAt: true,
});

export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progress.$inferSelect;
