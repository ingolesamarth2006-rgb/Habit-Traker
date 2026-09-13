# Habit Tracker

<div align="center">

### Build consistency. Track progress. Improve every day.

A modern habit tracking web application built to make daily consistency simple, visual, and motivating.

<br>

![HTML5](https://img.shields.io/badge/HTML5-Frontend-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Logic-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![LocalStorage](https://img.shields.io/badge/Data-LocalStorage-4CAF50?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge)

<br>

**Plan → Track → Complete → Reflect → Repeat**

</div>

---

## About the Project

**Habit Tracker** is a personal productivity web application designed to help users build consistency by tracking important habits every day.

Instead of making habit tracking complicated, the project focuses on one simple question:

> **Did I show up today?**

The application provides a visual and interactive system for managing daily habits, recording completion, navigating between days, and viewing progress over time.

---

## Purpose

Consistency is difficult when progress is invisible.

Habit Tracker turns everyday actions into visible progress.

Examples:

```text
Study Java          ✓
Exercise            ✓
Read                ✗
Drink Water         ✓
Meditation          ✓
```

Each completed habit becomes part of a longer history rather than disappearing at the end of the day.

---

## Features

### Daily Habit Tracking

Track habits individually for each day.

```text
TODAY

✓ Java Study
✓ Workout
○ Reading
✓ Water
○ Meditation
```

Completion data is stored separately for each date.

---

### Add Custom Habits

Users can create habits based on their own routine instead of being limited to predefined options.

Examples:

- Coding
- Reading
- Exercise
- Meditation
- Learning
- Hydration
- Sleep routine

---

### Interactive Completion

Habits can be marked as completed directly from the tracker.

The interface updates immediately when a habit is completed or unchecked.

---

### Date-Based History

Habit completion belongs to the day on which it was recorded.

```text
Monday
Java      ✓
Workout   ✓

Tuesday
Java      ✓
Workout   ✗

Wednesday
Java      ✓
Workout   ✓
```

This allows past progress to remain visible.

---

### Day Navigation

Users can move between different dates and review their previous habit activity.

```text
← Previous Day

September 13

Next Day →
```

This makes the tracker useful as both a daily tool and a progress history.

---

### Daily Progress

The system calculates completion based on the habits tracked for the selected day.

Example:

```text
Completed

4 / 6 Habits

█████████████░░░░░

67%
```

This gives an immediate overview of the day.

---

### Persistent Local Data

Habit information is stored using browser **LocalStorage**.

That means refreshing or reopening the page does not automatically erase progress.

```text
Browser
   │
   ▼
LocalStorage
   │
   ├── Habits
   ├── Daily completion
   └── Historical records
```

No backend is currently required.

---

## How It Works

```text
Create Habit
      │
      ▼
Habit appears in tracker
      │
      ▼
Select current date
      │
      ▼
Complete habit
      │
      ▼
Save completion
      │
      ▼
Update daily progress
      │
      ▼
Store history in LocalStorage
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Interface, layout and visual design |
| JavaScript | Application logic and interactions |
| LocalStorage | Browser-side data persistence |

No external framework is required for the current version.

---

## Project Structure

```text
Habit-Tracker/
│
├── assets/
│
├── tracker.html
├── tracker.css
├── tracker.js
│
├── day.html
├── day.css
├── day.js
│
└── README.md
```

The structure may evolve as new features are added.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ingolesamarth2006-rgb/Habit-Tracker.git
```

### 2. Enter the project directory

```bash
cd Habit-Tracker
```

### 3. Open it in VS Code

```bash
code .
```

### 4. Run the application

For the best experience, use **VS Code Live Server**.

Example:

```text
http://127.0.0.1:5500/
```

---

## Important LocalStorage Note

The current version stores user data in browser LocalStorage.

LocalStorage is connected to the website origin.

For example:

```text
http://127.0.0.1:5500
```

and

```text
http://localhost:5500
```

can have different LocalStorage data.

So while developing, it is recommended to continue using the same origin consistently.

---

## Current Architecture

```text
┌─────────────────────────────┐
│           USER              │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│      HTML / CSS UI          │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│        JavaScript           │
│                             │
│  • Habit management         │
│  • Date handling            │
│  • Completion logic         │
│  • Progress calculation     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│       LocalStorage          │
│                             │
│  Habits + Daily History     │
└─────────────────────────────┘
```

---

## Design Philosophy

The application is designed around three principles.

### Simple

Habit tracking should take seconds rather than becoming another task itself.

### Visual

Progress should be immediately understandable.

### Persistent

Yesterday's progress should remain part of your history instead of disappearing when a new day starts.

---

## Development Roadmap

### Version 1 — Core Tracker

- [x] Habit creation
- [x] Daily habit tracking
- [x] Habit completion
- [x] Date navigation
- [x] LocalStorage persistence
- [x] Daily progress calculation
- [x] Historical daily records

### Version 2 — Better Insights

- [ ] Habit streak system
- [ ] Weekly overview
- [ ] Monthly overview
- [ ] Habit-specific statistics
- [ ] Calendar heatmap
- [ ] Completion charts
- [ ] Consistency analytics

### Version 3 — Advanced System

- [ ] Habit categories
- [ ] Flexible schedules
- [ ] Habit goals
- [ ] Notes for individual habits
- [ ] Search and filtering
- [ ] Export / import data
- [ ] Backup system

### Version 4 — Full Stack

```text
Frontend
   │
   ▼
REST API
   │
   ▼
Java + Spring Boot
   │
   ▼
PostgreSQL
```

Planned improvements:

- [ ] Backend persistence
- [ ] User authentication
- [ ] User accounts
- [ ] Cloud synchronization
- [ ] Multi-device access
- [ ] Automatic backups

---

## Future Analytics

A future version can transform habit history into useful insights.

```text
THIS WEEK

Java Study
███████  7 / 7

Workout
█████░░  5 / 7

Reading
████░░░  4 / 7
```

Possible analytics include:

```text
Completion Rate
Best Habit
Weakest Habit
Current Streak
Longest Streak
Weekly Consistency
Monthly Consistency
```

The goal is to show meaningful patterns rather than meaningless productivity scores.

---

## Why I Built This

Habit Tracker is both a personal productivity tool and a software development project.

It provides practical experience with:

```text
HTML
  ↓
CSS
  ↓
JavaScript
  ↓
DOM Manipulation
  ↓
State Management
  ↓
LocalStorage
  ↓
Date-Based Data
  ↓
Application Architecture
```

Future versions will also help explore backend development and databases.

---

## Developer

**Samarth**

GitHub: [@ingolesamarth2006-rgb](https://github.com/ingolesamarth2006-rgb)

---

## Contributing

This is currently a personal project, but suggestions and improvements are welcome.

You can:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit the changes
5. Open a pull request

---

## Project Status

> **Active Development**

The application is continuously being improved with better UI, tracking features, analytics and persistence.

---

<div align="center">

# Small actions become big results.

### Don't depend on motivation. Build consistency.

**Habit Tracker**

`Show Up → Complete → Repeat → Grow`

</div>
