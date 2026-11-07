export type ThemeType = 'rain' | 'waterfall' | 'river' | 'mist' | 'sunset' | 'clean';

export type PriorityType = 'high' | 'medium' | 'low';

export type TaskRecurrence = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  priority: PriorityType;
  dueDate: string;
  dueTime: string;
  recurring: TaskRecurrence;
  subtasks: SubTask[];
  completed: boolean;
  notes?: string;
  // Specific alert triggers enabled prior to deadline: 6, 8, 12, 24, 48, 72, 96, 120
  alertHoursBefore: number[];
  alarmEnabled: boolean;
  order: number;
}

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  expiryDate: string; // YYYY-MM-DD
}

export interface Recipe {
  id: string;
  title: string;
  prepTime: string;
  calories?: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
}

export interface PlannedMeal {
  id: string;
  day: 'Today' | 'Tomorrow' | 'Upcoming';
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  recipeTitle: string;
  prepTime: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export interface ChoreItem {
  id: string;
  title: string;
  assignedTo: string;
  avatarColor: string;
  recurrence: string;
  completedToday: boolean;
}

export interface MedicationItem {
  id: string;
  name: string;
  time: string;
  dosage: string;
  takenToday: boolean;
}

export interface AudioNote {
  id: string;
  title: string;
  audioBlobUrl?: string;
  recordedAt: string;
  durationSeconds: number;
  tag: 'Personal' | 'Work' | 'Ideas' | 'Todo' | 'Quick';
  transcript: string;
  summary?: string;
  cloudBackedUp: boolean;
}

export interface EnabledFeatures {
  tasks: boolean;
  meals: boolean;
  budget: boolean;
  chores: boolean;
  wellness: boolean;
  focus: boolean;
  audioNotes: boolean;
}
