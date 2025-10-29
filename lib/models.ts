// Models.ts 
// Purpose: TypeScript data models for the Relax Mode mobile application


// Each "Activity" represents a single task the user has performed within a routine.
// Example: Clean the house, Walk the dog, Read a book, etc.
export type Activity = { 
  id: string;            // Unique identifier for the activity
  name: string;          // Activity name displayed to the user
  timestamp: number;     // Time when the activity was last completed (as a Unix timestamp)
};

// "Routine" represents a full session made up of multiple activities.
// Example: Morning Routine, Workout Routine, Study Session, etc.

export type Routine = { 
  id: string;            // identifier for the routine
  name: string;          // Routine name (e.g., "Morning Routine")
  days: number[];        // Days of the week (0 = Sun, 1 = Mon, ..., 6 = Sat)
  activities: Activity[]; // Array of activities included in this routine

  // Optional daily reminder settings for routines
  time?: string;         // Optional reminder time (24-hour format)
  scene?: "morning" | "afternoon" | "evening"; 
  // Used to set the mood or theme of the routine (for visuals/sounds)
};

// "Streak" tracks how many consecutive days the user has completed routines or quests.
// Example: 5-day streak for completing the Morning Routine.
export type Streak = { 
  count: number;          // Total consecutive days completed
  level: number;          // Level based on streak length (e.g., +1 level every 7 days)
  lastCompleted: string;  // Date of the last completed routine (ISO format)
};