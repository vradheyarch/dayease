import { TaskItem, PantryItem, Recipe, PlannedMeal, ShoppingItem, ExpenseItem, ChoreItem, MedicationItem, AudioNote, EnabledFeatures } from '../types';

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'Submit quarterly budget proposal',
    category: 'Work',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dueTime: '15:00',
    recurring: 'none',
    completed: false,
    order: 0,
    alarmEnabled: true,
    alertHoursBefore: [6, 12, 24],
    notes: 'Verify final expenses with finance team before submission.',
    subtasks: [
      { id: 'st-1', title: 'Review department breakdown', completed: true },
      { id: 'st-2', title: 'Export PDF summary sheet', completed: true },
      { id: 'st-3', title: 'Send to senior director', completed: false },
    ],
  },
  {
    id: 't-2',
    title: 'Pick up prescription & dental floss',
    category: 'Health',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '17:30',
    recurring: 'none',
    completed: false,
    order: 1,
    alarmEnabled: true,
    alertHoursBefore: [8],
    notes: 'Pharmacy closes at 6:30 PM.',
    subtasks: [
      { id: 'st-4', title: 'Call pharmacy ahead', completed: true },
      { id: 'st-5', title: 'Collect receipt for HSA', completed: false },
    ],
  },
  {
    id: 't-3',
    title: 'Water patio succulents & indoor monstera',
    category: 'Home',
    priority: 'low',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '19:00',
    recurring: 'weekly',
    completed: true,
    order: 2,
    alarmEnabled: false,
    alertHoursBefore: [24],
    subtasks: [
      { id: 'st-6', title: 'Check soil moisture', completed: true },
      { id: 'st-7', title: 'Mist monstera leaves', completed: true },
    ],
  },
  {
    id: 't-4',
    title: 'Car maintenance inspection',
    category: 'Personal',
    priority: 'medium',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    dueTime: '10:00',
    recurring: 'none',
    completed: false,
    order: 3,
    alarmEnabled: true,
    alertHoursBefore: [24, 48, 72],
    notes: 'Tire rotation and oil check.',
    subtasks: [
      { id: 'st-8', title: 'Check warranty booklet', completed: false },
    ],
  },
];

export const INITIAL_PANTRY: PantryItem[] = [
  { id: 'p-1', name: 'Fresh Organic Spinach', category: 'Produce', quantity: '1 bag', expiryDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0] },
  { id: 'p-2', name: 'Greek Yogurt (Plain)', category: 'Dairy', quantity: '500g', expiryDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0] }, // nearing expiry!
  { id: 'p-3', name: 'Ripe Avocados', category: 'Produce', quantity: '3 pcs', expiryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] },
  { id: 'p-4', name: 'Whole Grain Sourdough', category: 'Bakery', quantity: '1 loaf', expiryDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0] },
  { id: 'p-5', name: 'Eggs (Pasture-Raised)', category: 'Dairy', quantity: '8 eggs', expiryDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0] },
  { id: 'p-6', name: 'Extra Virgin Olive Oil', category: 'Pantry', quantity: '1 bottle', expiryDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0] },
  { id: 'p-7', name: 'Cherry Tomatoes', category: 'Produce', quantity: '1 box', expiryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0] },
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'r-1',
    title: 'Warm Spinach & Avocado Sourdough Toast',
    prepTime: '12 mins',
    calories: '340 kcal',
    tags: ['Uses Expiring Food', 'High Fiber', 'Vegetarian'],
    ingredients: ['Whole Grain Sourdough', 'Fresh Organic Spinach', 'Ripe Avocados', 'Eggs (Pasture-Raised)', 'Extra Virgin Olive Oil'],
    instructions: [
      'Toast sourdough slices until golden and crisp.',
      'Lightly sauté spinach with a drop of olive oil for 90 seconds.',
      'Poach or soft-boil the egg to your liking.',
      'Mash avocado onto toast, top with warm spinach, egg, salt & black pepper.',
    ],
  },
  {
    id: 'r-2',
    title: 'Honey Berry Greek Yogurt Parfait',
    prepTime: '5 mins',
    calories: '280 kcal',
    tags: ['Quick Prep', 'Protein Rich', 'Dessert/Snack'],
    ingredients: ['Greek Yogurt (Plain)', 'Fresh Organic Spinach', 'Honey or Berries'],
    instructions: [
      'Scoop Greek yogurt into a chilled bowl or glass.',
      'Swirl with local wildflower honey or fresh berries.',
      'Top with a sprinkle of crushed walnuts or granola.',
    ],
  },
  {
    id: 'r-3',
    title: 'Rustic Shakshuka with Poached Eggs',
    prepTime: '20 mins',
    calories: '410 kcal',
    tags: ['Comfort Food', 'Family Favorite', 'One-Pan'],
    ingredients: ['Eggs (Pasture-Raised)', 'Cherry Tomatoes', 'Extra Virgin Olive Oil', 'Fresh Organic Spinach'],
    instructions: [
      'Simmer crushed cherry tomatoes with garlic, cumin, and olive oil in a skillet.',
      'Stir in spinach until wilted.',
      'Create small wells in sauce and crack eggs directly in.',
      'Cover with lid and simmer until whites are just set and yolks are runny.',
    ],
  },
];

export const INITIAL_MEALS: PlannedMeal[] = [
  { id: 'm-1', day: 'Today', mealType: 'Breakfast', recipeTitle: 'Warm Spinach & Avocado Sourdough Toast', prepTime: '12 mins' },
  { id: 'm-2', day: 'Today', mealType: 'Lunch', recipeTitle: 'Mediterranean Grain Bowl with Greens', prepTime: '15 mins' },
  { id: 'm-3', day: 'Today', mealType: 'Dinner', recipeTitle: 'Rustic Shakshuka with Poached Eggs', prepTime: '20 mins' },
  { id: 'm-4', day: 'Tomorrow', mealType: 'Breakfast', recipeTitle: 'Honey Berry Greek Yogurt Parfait', prepTime: '5 mins' },
];

export const INITIAL_SHOPPING: ShoppingItem[] = [
  { id: 's-1', name: 'Almond milk (unsweetened)', category: 'Dairy & Alternatives', quantity: '1 carton', checked: false },
  { id: 's-2', name: 'Rolled oats', category: 'Pantry', quantity: '1 bag', checked: true },
  { id: 's-3', name: 'Fresh basil & mint', category: 'Produce', quantity: '1 bunch', checked: false },
  { id: 's-4', name: 'Wild salmon fillets', category: 'Meat & Seafood', quantity: '2 fillets', checked: false },
];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: 'e-1', title: 'Weekly Farmers Market', amount: 64.50, category: 'Groceries', date: '2026-11-05' },
  { id: 'e-2', title: 'Public Transit Pass', amount: 45.00, category: 'Transport', date: '2026-11-04' },
  { id: 'e-3', title: 'Neighborhood Café & Bakery', amount: 14.80, category: 'Dining', date: '2026-11-06' },
  { id: 'e-4', title: 'Fiber Home Internet', amount: 70.00, category: 'Utilities', date: '2026-11-01' },
  { id: 'e-5', title: 'Pharmacy prescriptions', amount: 28.50, category: 'Health', date: '2026-11-03' },
  { id: 'e-6', title: 'Weekend Movie & Streaming', amount: 22.00, category: 'Fun', date: '2026-11-02' },
];

export const INITIAL_CHORES: ChoreItem[] = [
  { id: 'c-1', title: 'Clean kitchen countertops & stove', assignedTo: 'Maya', avatarColor: 'bg-rose-500', recurrence: 'Every Day', completedToday: true },
  { id: 'c-2', title: 'Take out compost & recycling bin', assignedTo: 'Alex', avatarColor: 'bg-blue-500', recurrence: 'Every 2 Days', completedToday: false },
  { id: 'c-3', title: 'Vacuum living room rug', assignedTo: 'Sam', avatarColor: 'bg-emerald-500', recurrence: 'Weekly', completedToday: false },
  { id: 'c-4', title: 'Wipe bathroom mirrors & sink', assignedTo: 'Jordan', avatarColor: 'bg-amber-500', recurrence: 'Weekly', completedToday: false },
];

export const INITIAL_MEDICATIONS: MedicationItem[] = [
  { id: 'med-1', name: 'Vitamin D3 + K2', time: '08:30 AM', dosage: '2000 IU (1 capsule)', takenToday: true },
  { id: 'med-2', name: 'Magnesium Glycinate', time: '09:30 PM', dosage: '200 mg', takenToday: false },
  { id: 'med-3', name: 'Omega-3 Fish Oil', time: '01:00 PM', dosage: '1 softgel with lunch', takenToday: true },
];

export const INITIAL_AUDIO_NOTES: AudioNote[] = [
  {
    id: 'an-1',
    title: 'Weekend grocery & dinner party idea',
    recordedAt: 'Yesterday at 4:15 PM',
    durationSeconds: 38,
    tag: 'Ideas',
    transcript: 'Remember to pick up roasted pine nuts and fresh rosemary for Saturday dinner. Also ask Jordan if they want to make the pear galette.',
    summary: '• Get pine nuts & rosemary for Saturday dinner\n• Coordinate pear galette with Jordan',
    cloudBackedUp: true,
  },
  {
    id: 'an-2',
    title: 'DayEase feature brainstorm: early alerts',
    recordedAt: 'Today at 10:20 AM',
    durationSeconds: 46,
    tag: 'Work',
    transcript: 'The 6-hour to 120-hour alert timeline is super helpful for big project milestones. Need to verify that the sound chime is soothing rather than startling.',
    summary: '• 6 to 120-hour alert timeline validated for milestone tasks\n• Keep chime notification tone gentle',
    cloudBackedUp: true,
  },
  {
    id: 'an-3',
    title: 'Dr. Martinez appointment prep notes',
    recordedAt: 'Nov 04 at 11:00 AM',
    durationSeconds: 29,
    tag: 'Personal',
    transcript: 'Ask about the seasonal allergy prescription refill and request a copy of the recent blood panel report.',
    summary: '• Check allergy refill\n• Request blood panel copy',
    cloudBackedUp: false,
  },
];

export const DEFAULT_FEATURES: EnabledFeatures = {
  tasks: true,
  meals: true,
  budget: true,
  chores: true,
  wellness: true,
  focus: true,
  audioNotes: true,
};
