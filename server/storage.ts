import {
  users, type User, type InsertUser,
  meals, type Meal, type InsertMeal,
  workouts, type Workout, type InsertWorkout,
  exercises, type Exercise, type InsertExercise,
  progress, type Progress, type InsertProgress,
  reminders, type Reminder, type InsertReminder,
  notificationSettings, type NotificationSettings, type InsertNotificationSettings
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Meal methods
  getMeals(dayNumber: number): Promise<Meal[]>;
  getMealsByDay(day: string): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  
  // Workout methods
  getWorkout(dayNumber: number): Promise<Workout | undefined>;
  getWorkoutByDay(day: string): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  
  // Exercise methods
  getExercisesByWorkoutId(workoutId: number): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  
  // Progress methods
  getProgressByUserAndDay(userId: number, dayNumber: number): Promise<Progress | undefined>;
  createProgress(progress: InsertProgress): Promise<Progress>;
  updateProgress(id: number, progress: Partial<InsertProgress>): Promise<Progress>;
  
  // Reminders methods
  getRemindersByUser(userId: number): Promise<Reminder[]>;
  getReminderById(id: number): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder>;
  deleteReminder(id: number): Promise<boolean>;
  
  // Notification settings methods
  getNotificationSettingsByUser(userId: number): Promise<NotificationSettings | undefined>;
  createNotificationSettings(settings: InsertNotificationSettings): Promise<NotificationSettings>;
  updateNotificationSettings(userId: number, settings: Partial<InsertNotificationSettings>): Promise<NotificationSettings>;
  
  // Utility methods for mapping day numbers to days
  getDayMappingByNumber(dayNumber: number): Promise<{ day: string; date: string } | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meals: Map<number, Meal>;
  private workouts: Map<number, Workout>;
  private exercises: Map<number, Exercise>;
  private progresses: Map<number, Progress>;
  private reminders: Map<number, Reminder>;
  private notificationSettings: Map<number, NotificationSettings>;
  
  private userId: number;
  private mealId: number;
  private workoutId: number;
  private exerciseId: number;
  private progressId: number;
  private reminderId: number;
  private notificationSettingsId: number;

  constructor() {
    this.users = new Map();
    this.meals = new Map();
    this.workouts = new Map();
    this.exercises = new Map();
    this.progresses = new Map();
    
    this.userId = 1;
    this.mealId = 1;
    this.workoutId = 1;
    this.exerciseId = 1;
    this.progressId = 1;
    
    // Initialize with the meal and workout plan data (this would normally come from a database)
    // We need to use an IIFE to allow async in constructor
    (async () => {
      await this.initializeMealPlan();
      console.log("Meal plan initialized with all data");
    })();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Meal methods
  async getMeals(dayNumber: number): Promise<Meal[]> {
    return Array.from(this.meals.values()).filter(
      (meal) => meal.dayNumber === dayNumber,
    );
  }

  async getMealsByDay(day: string): Promise<Meal[]> {
    return Array.from(this.meals.values()).filter(
      (meal) => meal.day === day,
    );
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const id = this.mealId++;
    const newMeal: Meal = { ...meal, id };
    this.meals.set(id, newMeal);
    return newMeal;
  }

  // Workout methods
  async getWorkout(dayNumber: number): Promise<Workout | undefined> {
    return Array.from(this.workouts.values()).find(
      (workout) => workout.dayNumber === dayNumber,
    );
  }

  async getWorkoutByDay(day: string): Promise<Workout | undefined> {
    return Array.from(this.workouts.values()).find(
      (workout) => workout.day === day,
    );
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const id = this.workoutId++;
    const newWorkout: Workout = { ...workout, id };
    this.workouts.set(id, newWorkout);
    return newWorkout;
  }

  // Exercise methods
  async getExercisesByWorkoutId(workoutId: number): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(
      (exercise) => exercise.workoutId === workoutId,
    );
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = this.exerciseId++;
    // Make sure workoutId is explicitly included
    const newExercise: Exercise = { 
      ...exercise, 
      id,
      workoutId: exercise.workoutId
    };
    console.log(`Created exercise with ID: ${id}, workoutId: ${newExercise.workoutId}`);
    this.exercises.set(id, newExercise);
    return newExercise;
  }

  // Progress methods
  async getProgressByUserAndDay(userId: number, dayNumber: number): Promise<Progress | undefined> {
    return Array.from(this.progresses.values()).find(
      (progress) => progress.userId === userId && progress.dayNumber === dayNumber,
    );
  }

  async createProgress(progress: InsertProgress): Promise<Progress> {
    const id = this.progressId++;
    const newProgress: Progress = { 
      id, 
      createdAt: new Date(),
      dayNumber: progress.dayNumber,
      userId: progress.userId,
      date: progress.date,
      mealCompletions: progress.mealCompletions || '[]',
      workoutCompleted: progress.workoutCompleted || false,
      exerciseCompletions: progress.exerciseCompletions || '[]',
      notes: progress.notes || null
    };
    this.progresses.set(id, newProgress);
    return newProgress;
  }

  async updateProgress(id: number, progress: Partial<InsertProgress>): Promise<Progress> {
    const existingProgress = this.progresses.get(id);
    if (!existingProgress) {
      throw new Error(`Progress with id ${id} not found`);
    }
    
    const updatedProgress: Progress = { ...existingProgress, ...progress };
    this.progresses.set(id, updatedProgress);
    return updatedProgress;
  }

  // Initialize with the meal and workout plan data
  private async initializeMealPlan() {
    // Monday - Day 1
    await this.createMeal({
      day: "monday",
      time: "12:00 PM",
      description: "1 Cappuccino (low-cal milk)",
      calories: 100,
      dayNumber: 1
    });
    await this.createMeal({
      day: "monday",
      time: "1:00 PM",
      description: "2 Scrambled Eggs (150 kcal) + 150g Beef Patty (350 kcal) + 1 tbsp Olive Oil (50 kcal)",
      calories: 500,
      dayNumber: 1
    });
    await this.createMeal({
      day: "monday",
      time: "7:00 PM",
      description: "150g Chicken Thighs (350 kcal) + 100g Full-Fat Yogurt (150 kcal)",
      calories: 500,
      dayNumber: 1
    });

    // Create Monday workout and resolve the promise to get the workout with ID
    const mondayWorkout = await this.createWorkout({
      day: "monday",
      type: "Lower Body & Core",
      dayNumber: 1
    });

    // Now mondayWorkout.id is available
    await this.createExercise({
      workoutId: mondayWorkout.id,
      name: "Warm-up Cardio",
      repsAndWeight: "10 min moderate intensity"
    });
    
    await this.createExercise({
      workoutId: mondayWorkout.id,
      name: "Barbell Squats",
      repsAndWeight: "4x8–10 (40–50% bodyweight)"
    });
    await this.createExercise({
      workoutId: mondayWorkout.id,
      name: "Romanian Deadlifts",
      repsAndWeight: "3x10–12 (25–35 kg)"
    });
    await this.createExercise({
      workoutId: mondayWorkout.id,
      name: "Hip Thrusts",
      repsAndWeight: "3x12 (40–50 kg)"
    });
    await this.createExercise({
      workoutId: mondayWorkout.id,
      name: "Calf Raises",
      repsAndWeight: "3x15 (Bodyweight or add dumbbells)"
    });
    await this.createExercise({
      workoutId: mondayWorkout.id,
      name: "Hanging Leg Raises",
      repsAndWeight: "3x12"
    });

    // Tuesday - Day 2
    this.createMeal({
      day: "tuesday",
      time: "12:00 PM",
      description: "1 Cappuccino",
      calories: 100,
      dayNumber: 2
    });
    this.createMeal({
      day: "tuesday",
      time: "1:00 PM",
      description: "2 Boiled Eggs (150 kcal) + 150g Grilled Chicken Breast (300 kcal) + 1 tbsp Olive Oil (50 kcal)",
      calories: 500,
      dayNumber: 2
    });
    this.createMeal({
      day: "tuesday",
      time: "7:00 PM",
      description: "150g Salmon (400 kcal) + 1 Egg White Omelette (100 kcal)",
      calories: 500,
      dayNumber: 2
    });

    const tuesdayWorkout = await this.createWorkout({
      day: "tuesday",
      type: "Upper Body & Arms",
      dayNumber: 2
    });

    await this.createExercise({
      workoutId: tuesdayWorkout.id,
      name: "Warm-up Cardio",
      repsAndWeight: "10 min moderate intensity"
    });
    
    await this.createExercise({
      workoutId: tuesdayWorkout.id,
      name: "Barbell Bench Press",
      repsAndWeight: "4x8–10 (30–40 kg)"
    });
    await this.createExercise({
      workoutId: tuesdayWorkout.id,
      name: "Seated Dumbbell Shoulder Press",
      repsAndWeight: "3x10 (7–10 kg each)"
    });
    await this.createExercise({
      workoutId: tuesdayWorkout.id,
      name: "Lat Pulldown",
      repsAndWeight: "3x12 (25–35 kg)"
    });
    await this.createExercise({
      workoutId: tuesdayWorkout.id,
      name: "Bicep Curls",
      repsAndWeight: "3x12 (6–8 kg each)"
    });
    await this.createExercise({
      workoutId: tuesdayWorkout.id,
      name: "Triceps Dips",
      repsAndWeight: "3x12 (Bodyweight or assisted)"
    });

    // Wednesday - Day 3
    this.createMeal({
      day: "wednesday",
      time: "12:00 PM",
      description: "1 Cappuccino",
      calories: 100,
      dayNumber: 3
    });
    this.createMeal({
      day: "wednesday",
      time: "1:00 PM",
      description: "150g Lean Beef (300 kcal) + 2 Fried Eggs (150 kcal) + 1 tbsp Olive Oil (50 kcal)",
      calories: 500,
      dayNumber: 3
    });
    this.createMeal({
      day: "wednesday",
      time: "7:00 PM",
      description: "150g Hake (300 kcal) + 1 Boiled Egg (70 kcal) + 1 tbsp Olive Oil (50 kcal) + 1/2 cup Yogurt (80 kcal)",
      calories: 500,
      dayNumber: 3
    });

    const wednesdayWorkout = await this.createWorkout({
      day: "wednesday",
      type: "Glutes & Hamstrings",
      dayNumber: 3
    });

    await this.createExercise({
      workoutId: wednesdayWorkout.id,
      name: "Warm-up Cardio",
      repsAndWeight: "10 min moderate intensity"
    });
    
    await this.createExercise({
      workoutId: wednesdayWorkout.id,
      name: "Deadlifts",
      repsAndWeight: "4x8 (40–50% bodyweight)"
    });
    await this.createExercise({
      workoutId: wednesdayWorkout.id,
      name: "Bulgarian Split Squats",
      repsAndWeight: "3x10 per leg (Bodyweight or 8–10 kg dumbbells)"
    });
    await this.createExercise({
      workoutId: wednesdayWorkout.id,
      name: "Glute Bridges",
      repsAndWeight: "3x12 (30–40 kg)"
    });
    await this.createExercise({
      workoutId: wednesdayWorkout.id,
      name: "Hamstring Curls (Machine)",
      repsAndWeight: "3x12 (20–30 kg)"
    });

    // Thursday - Day 4
    this.createMeal({
      day: "thursday",
      time: "12:00 PM",
      description: "1 Cappuccino",
      calories: 100,
      dayNumber: 4
    });
    this.createMeal({
      day: "thursday",
      time: "1:00 PM",
      description: "150g Chicken Breast (300 kcal) + 2 Scrambled Eggs (150 kcal) + 1 tbsp Olive Oil (50 kcal)",
      calories: 500,
      dayNumber: 4
    });
    this.createMeal({
      day: "thursday",
      time: "7:00 PM",
      description: "150g Beef Patty (350 kcal) + 100g Yogurt (150 kcal)",
      calories: 500,
      dayNumber: 4
    });

    const thursdayWorkout = await this.createWorkout({
      day: "thursday",
      type: "Full Body Strength",
      dayNumber: 4
    });

    await this.createExercise({
      workoutId: thursdayWorkout.id,
      name: "Warm-up Cardio",
      repsAndWeight: "10 min moderate intensity"
    });
    
    await this.createExercise({
      workoutId: thursdayWorkout.id,
      name: "Back Squats",
      repsAndWeight: "4x8 (40–50% bodyweight)"
    });
    await this.createExercise({
      workoutId: thursdayWorkout.id,
      name: "Deadlifts",
      repsAndWeight: "3x8 (40–50% bodyweight)"
    });
    await this.createExercise({
      workoutId: thursdayWorkout.id,
      name: "Pull-Ups",
      repsAndWeight: "3x8 (Assisted if needed)"
    });
    await this.createExercise({
      workoutId: thursdayWorkout.id,
      name: "Bent Over Rows",
      repsAndWeight: "3x10 (20–30 kg total)"
    });
    await this.createExercise({
      workoutId: thursdayWorkout.id,
      name: "Planks",
      repsAndWeight: "3x1 min hold"
    });

    // Friday - Day 5
    this.createMeal({
      day: "friday",
      time: "12:00 PM",
      description: "1 Cappuccino + 1 Glass of Wine",
      calories: 220,
      dayNumber: 5
    });
    this.createMeal({
      day: "friday",
      time: "1:00 PM",
      description: "Skipped to balance dinner calories",
      calories: 0,
      dayNumber: 5
    });
    this.createMeal({
      day: "friday",
      time: "7:00 PM",
      description: "Sushi: 2 Salmon Roses (140 kcal) + 8 Prawn California Rolls (720 kcal) + Soy Sauce & Wasabi (40 kcal)",
      calories: 900,
      dayNumber: 5
    });

    // Need to await this to get the ID
    const fridayWorkout = await this.createWorkout({
      day: "friday",
      type: "Running (30–45 min)",
      dayNumber: 5
    });

    console.log("Created Friday workout with ID:", fridayWorkout.id);
    
    // Now we can safely use the ID
    await this.createExercise({
      workoutId: fridayWorkout.id,
      name: "Warm-up Cardio",
      repsAndWeight: "10 min light intensity"
    });
    
    await this.createExercise({
      workoutId: fridayWorkout.id,
      name: "Steady-State Run (Moderate Pace)",
      repsAndWeight: "5-6 km"
    });

    await this.createExercise({
      workoutId: fridayWorkout.id,
      name: "HIIT Sprints",
      repsAndWeight: "10 rounds: 30 sec sprint / 1 min walk"
    });

    // Saturday - Day 6
    this.createMeal({
      day: "saturday",
      time: "12:00 PM",
      description: "1 Cappuccino + 1 Glass of Wine",
      calories: 220,
      dayNumber: 6
    });
    this.createMeal({
      day: "saturday",
      time: "1:00 PM",
      description: "Naughty nutter or self made smoothie bowl",
      calories: 500,
      dayNumber: 6
    });
    this.createMeal({
      day: "saturday",
      time: "7:00 PM",
      description: "150g Lean Beef (250 kcal) + 150g Roasted Zucchini (100 kcal) + 1 tbsp Olive Oil (100 kcal). Popcorn 1/2. Or dark chock 6 pieces.",
      calories: 450,
      dayNumber: 6
    });

    // Active recovery on Saturday
    const saturdayWorkout = await this.createWorkout({
      day: "saturday",
      type: "Rest Day (Active Recovery)",
      dayNumber: 6
    });
    
    await this.createExercise({
      workoutId: saturdayWorkout.id,
      name: "Light Cardio Walk",
      repsAndWeight: "10-15 min at comfortable pace"
    });
    
    await this.createExercise({
      workoutId: saturdayWorkout.id,
      name: "Gentle Stretching",
      repsAndWeight: "Full body, 15-20 min"
    });

    // Sunday - Day 7
    this.createMeal({
      day: "sunday",
      time: "12:00 PM",
      description: "1 Cappuccino",
      calories: 100,
      dayNumber: 7
    });
    this.createMeal({
      day: "sunday",
      time: "1:00 PM",
      description: "150g Turkey Breast (200 kcal) + 150g Grilled Peppers (120 kcal) + 1 tbsp Olive Oil (120 kcal)",
      calories: 440,
      dayNumber: 7
    });
    this.createMeal({
      day: "sunday",
      time: "7:00 PM",
      description: "Chicken salad from spar",
      calories: 500,
      dayNumber: 7
    });

    // Active recovery on Sunday
    const sundayWorkout = await this.createWorkout({
      day: "sunday",
      type: "Rest Day (Active Recovery)",
      dayNumber: 7
    });
    
    await this.createExercise({
      workoutId: sundayWorkout.id,
      name: "Light Cardio Walk",
      repsAndWeight: "10-15 min at comfortable pace"
    });
    
    await this.createExercise({
      workoutId: sundayWorkout.id,
      name: "Gentle Stretching",
      repsAndWeight: "Full body, 15-20 min"
    });
  }
}

export const storage = new MemStorage();
