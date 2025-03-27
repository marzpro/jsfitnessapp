// This file contains the processed data from the meal plan
// It's used to map day numbers to their respective week day and to generate the initial plan

export type DayMapping = {
  dayNumber: number;
  day: string;
  date: Date;
}

// The meal plan starts on Monday, March 31, 2023
const startDate = new Date("2023-03-31");

// Map day numbers (1-40) to day names and dates
export const generateDayMappings = (): DayMapping[] => {
  const mappings: DayMapping[] = [];
  
  for (let dayNumber = 1; dayNumber <= 40; dayNumber++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + dayNumber - 1);
    
    // Get day name (0 = Sunday, 1 = Monday, etc.)
    const dayIndex = dayDate.getDay();
    // Convert to our format (0 = Monday, 1 = Tuesday, etc.)
    const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    
    const dayNames = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday"
    ];
    
    mappings.push({
      dayNumber,
      day: dayNames[adjustedDayIndex],
      date: dayDate
    });
  }
  
  return mappings;
};

// Generate days for a specific week (1-6)
export const getWeekDays = (weekNumber: number): DayMapping[] => {
  const mappings = generateDayMappings();
  const startDay = (weekNumber - 1) * 7;
  return mappings.slice(startDay, startDay + 7);
};

// Get the date range for a specific week (e.g., "March 31 - April 6, 2023")
export const getWeekDateRange = (weekNumber: number): string => {
  const weekDays = getWeekDays(weekNumber);
  const firstDay = weekDays[0];
  const lastDay = weekDays[weekDays.length - 1];
  
  return `${firstDay.date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric"
  })} - ${lastDay.date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  })}`;
};

// Calculate the current week based on the current date
export const getCurrentWeek = (): number => {
  const now = new Date();
  const endDate = new Date("2023-05-09");
  
  // If before start date, return week 1
  if (now < startDate) {
    return 1;
  }
  
  // If after end date, return week 6
  if (now > endDate) {
    return 6;
  }
  
  // Calculate days since start
  const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentWeek = Math.floor(daysSinceStart / 7) + 1;
  
  return Math.min(currentWeek, 6);
};

// Calculate the current day number based on the current date
export const getCurrentDayNumber = (): number => {
  const now = new Date();
  const endDate = new Date("2023-05-09");
  
  // If before start date, return day 1
  if (now < startDate) {
    return 1;
  }
  
  // If after end date, return day 40
  if (now > endDate) {
    return 40;
  }
  
  // Calculate days since start
  const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.min(daysSinceStart, 40);
};
