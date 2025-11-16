#
# Relax-Mode-App
#
Team 16 relaxation, cleaning, and routine-tracking mobile app prototype designed using React Native / Expo-based UI.

#
### Features:
#

- A **Levels/Achievements** screen based on completed quests.
- An **Analytics** screen that shows cleaning and relaxation activity plus overall stats.
- A **Routines** systems that lets user create routines with scheduled reminders and complete them via a step-by-step "path" view.
- A **Routine Tracker** flow that awards progress when a routine is completed.

## Overview

### Levels/Achievements

- Shows the user's **current levell** and **progress bar** based on total number of complete quests.
- Levels are computed from the 'completedQuests' value stored in 'AsyncStorage'
- Different ranges of completed quests map to different levels (e.g., 0-2 → Level 1, 3-6 → Level 2, etc.)

### Analytics

- Reads log entries of user events such as cleaning and relaxation sessions from `AsyncStorage` (`LOG_KEY = "logEntries"`).
- Each log entry contains:
  - `id`: unique identifier
  - `type`: `"clean"` or `"relax"`
  - `timestamp`: Unix time (ms)
- Displays:
  - Total number of logged sessions.
  - Number of cleaning vs relaxation sessions.
  - A short **insight** message based on relative cleaning vs relax activity.
- Also displays an **Overall Stats** card loaded from `levels` storage, with:
  - `totalRelaxMinutes`
  - `totalCleaningMinutes`
  - `weeklyStreaksCompleted`
- All UI is styled via the app’s theme context (`ThemeContext`) for light/dark consistency.

### Routines

- Users can:
  - Create routines with:
    - Name
    - Days of week (Sun–Sat)
    - Time of day (`HH:MM`)
    - A list of routine items (steps), each with a title and optional duration.
  - Edit existing routines.
  - Delete routines.
  - Manually start a routine by tapping “Start”.
- Routines are persisted in `AsyncStorage` via `lib/storage/routines.ts`.

### Routine model

## Running the UI

### Requirements:
- Node.ks: Recommend Node 18+
- npm or yarn
- Expo CLI
- Supported Platforms:
    - iOS (via Expo Go app)
    - Android (via Expo Go app)
    - Web (via Expo web)

## Limitations

- No real push notifications (yet)
    - Not using OS-level scheduled notifications due to issues with Expo Go, for the time being reminders are implemented via in-app checks
- Local storage only
    - All data is stored in AsyncStorage
- Basic XP mapping
    - Routine completion currently adds fixed amounts of totalRelaxMinutes and totalCleaningMinutes rather than calculating from item durations
