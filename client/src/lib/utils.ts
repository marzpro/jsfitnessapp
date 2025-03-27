import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to display day name and date number
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric"
  });
}

// Format date range (e.g., March 31 - April 6, 2023)
export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${startDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric"
  })} - ${endDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  })}`;
}

// Map day number (1-40) to week number (1-6)
export function dayNumberToWeekNumber(dayNumber: number): number {
  return Math.ceil(dayNumber / 7);
}

// Map day number (1-40) to day of week (0-6, where 0 is Monday)
export function dayNumberToDayOfWeek(dayNumber: number): number {
  return (dayNumber - 1) % 7;
}

// Map day of week (0-6) to day name (Monday, Tuesday, etc.)
export const dayNames = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];

// Get day name from day number
export function getDayName(dayNumber: number): string {
  const dayIndex = dayNumberToDayOfWeek(dayNumber);
  return dayNames[dayIndex];
}

// Calculate the date for a specific day number, starting from March 31, 2023
export function getDateFromDayNumber(dayNumber: number): Date {
  const startDate = new Date("2023-03-31");
  const dayDate = new Date(startDate);
  dayDate.setDate(startDate.getDate() + dayNumber - 1);
  return dayDate;
}

// Calculate total calories for an array of meals
export function calculateTotalCalories(meals: Array<{ calories: number }>): number {
  return meals.reduce((total, meal) => total + meal.calories, 0);
}

// Parse JSON string safely
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    return fallback;
  }
}
