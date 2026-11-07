import React from 'react';
import {
  TaskItem, PlannedMeal, ExpenseItem, ChoreItem, MedicationItem, PantryItem,
  EnabledFeatures, ThemeType
} from '../types';
import {
  CheckCircle2, Circle, Clock, AlertTriangle, Utensils, ShoppingBag,
  Droplet, Pill, Activity, Plus, Minus, ArrowRight,
  TrendingDown, DollarSign, Users, ChevronUp, ChevronDown, BellRing, Sparkles, Volume2
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

interface TodayDashboardProps {
  tasks: TaskItem[];
  meals: PlannedMeal[];
  expenses: ExpenseItem[];
  monthlyBudget: number;
  chores: ChoreItem[];
  medications: MedicationItem[];
  pantry: PantryItem[];
  waterIntake: number;
  waterTarget: number;
  enabledFeatures: EnabledFeatures;
  activeTheme: ThemeType;
  onUpdateWater: (amount: number) => void;
  onToggleMedication: (id: string) => void;
  onToggleTask: (id: string) => void;
  onReorderTask: (index: number, direction: 'up' | 'down') => void;
  onOpenTaskAlerts: (task: TaskItem) => void;
  onNavigateTab: (tab: string) => void;
  onStartFocus: () => void;
  onQuickRecordAudio: () => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  tasks,
  meals,
  expenses,
  monthlyBudget,
  chores,
  medications,
  pantry,
  waterIntake,
  waterTarget,
  enabledFeatures,
  activeTheme,
  onUpdateWater,
  onToggleMedication,
  onToggleTask,
  onReorderTask,
  onOpenTaskAlerts,
  onNavigateTab,
  onStartFocus,
  onQuickRecordAudio,
}) => {
  // Sort tasks by order
  const todayTasks = [...tasks].sort((a, b) => a.order - b.order);
  const pendingTasks = todayTasks.filter((t) => !t.completed);
  const completedTasks = todayTasks.filter((t) => t.completed);

  // Compute budget
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);
  const spentPct = Math.min(100, Math.round((totalSpent / monthlyBudget) * 100));

  // Items nearing expiry (within 3 days)
  const expiringPantryItems = pantry.filter((item) => {
    const diffDays = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });

  // Next meal
  const nextMeal = meals.find((m) => m.day === 'Today') || meals[0];

  const handleWaterStep = (delta: number) => {
    const nextVal = Math.max(0, waterIntake + delta);
    onUpdateWater(nextVal);
    soundEngine.playChime('gentle');
    if (nextVal >= waterTarget && waterIntake < waterTarget) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    }
  };

  const handleTaskDone = (id: string, currentlyCompleted: boolean) => {
    onToggleTask(id);
    if (!currentlyCompleted) {
      soundEngine.playChime('complete');
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    }
  };

  // SVG Donut calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (spentPct / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Friendly Encouraging Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900/60 via-slate-900/70 to-emerald-900/60 border border-white/10 p-6 shadow-xl backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Theme: <span className="capitalize font-medium text-white">{activeTheme}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back to <span className="text-emerald-400">DayEase</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              {pendingTasks.length > 0
                ? `You have ${pendingTasks.length} tasks and ${expiringPantryItems.length} pantry items to glance at today. Take it one gentle step at a time.`
                : "You're all caught up on primary tasks for today! Enjoy your calm evening."}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onQuickRecordAudio}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 hover:bg-rose-500/30 text-xs font-semibold transition-all shadow-md active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-rose-400" />
              <span>Voice Note</span>
            </button>
            <button
              type="button"
              onClick={onStartFocus}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <Activity className="w-4 h-4" />
              <span>25m Focus</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wellness & Hydration Tracker Strip */}
      {enabledFeatures.wellness && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Water Intake */}
          <div className="rounded-3xl bg-slate-900/70 border border-slate-700/60 p-4 shadow-lg backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <Droplet className="w-5 h-5 fill-cyan-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Hydration Goal</span>
                <p className="text-lg font-bold text-white">
                  {waterIntake} <span className="text-xs text-slate-400 font-normal">/ {waterTarget} glasses</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => handleWaterStep(-1)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
                title="Decrease 1 glass"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleWaterStep(1)}
                className="p-1 text-cyan-300 hover:text-white rounded-lg hover:bg-cyan-600/40 transition-colors"
                title="Drink 1 glass"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Daily Medications */}
          <div className="rounded-3xl bg-slate-900/70 border border-slate-700/60 p-4 shadow-lg backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Daily Medications</span>
                <p className="text-sm font-bold text-white">
                  {medications.filter((m) => m.takenToday).length} of {medications.length} taken
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('wellness')}
              className="text-xs font-semibold text-purple-300 hover:text-purple-200 flex items-center gap-1 bg-purple-500/10 px-2.5 py-1.5 rounded-xl border border-purple-500/20"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Guided Stretch Break */}
          <div className="rounded-3xl bg-slate-900/70 border border-slate-700/60 p-4 shadow-lg backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Gentle Break</span>
                <p className="text-sm font-bold text-white">2-min Neck Stretch</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('wellness')}
              className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20"
            >
              Start
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Tasks & (Meal + Budget) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tasks (7 cols) */}
        {enabledFeatures.tasks && (
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Today's Priority Tasks
                </h2>
                <p className="text-xs text-slate-400">Tap bell to configure warning alarms from 6h to 120h.</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('tasks')}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <span>Manage Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Task Cards List */}
            <div className="space-y-3">
              {todayTasks.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm">
                  No tasks scheduled. Add one to stay effortlessly on track!
                </div>
              ) : (
                todayTasks.map((task, idx) => {
                  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
                  const totalSubtasks = task.subtasks.length;
                  const progressPct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

                  return (
                    <div
                      key={task.id}
                      className={`relative rounded-3xl border transition-all p-4 shadow-lg backdrop-blur-md ${
                        task.completed
                          ? 'bg-slate-900/50 border-slate-800/80 opacity-60'
                          : 'bg-slate-900/80 border-slate-700/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleTaskDone(task.id, task.completed)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-400 hover:text-emerald-400" />
                            )}
                          </button>

                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3
                                className={`text-sm font-semibold ${
                                  task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                                }`}
                              >
                                {task.title}
                              </h3>

                              {/* Priority Badge */}
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  task.priority === 'high'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : task.priority === 'medium'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {task.priority}
                              </span>

                              {/* Category Badge */}
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                                {task.category}
                              </span>
                            </div>

                            {/* Due Date & Subtasks Info */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center gap-1 text-slate-300">
                                <Clock className="w-3.5 h-3.5 text-sky-400" />
                                {task.dueDate} at {task.dueTime}
                              </span>

                              {totalSubtasks > 0 && (
                                <span className="text-[11px] text-slate-400">
                                  {completedSubtasks}/{totalSubtasks} subtasks ({progressPct}%)
                                </span>
                              )}
                            </div>

                            {/* Subtask Progress Bar */}
                            {totalSubtasks > 0 && (
                              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300 rounded-full"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Alert Modal Trigger & Reorder Buttons */}
                        <div className="flex items-center gap-1.5 self-start">
                          {/* Alert configuration trigger */}
                          <button
                            type="button"
                            onClick={() => onOpenTaskAlerts(task)}
                            className={`p-1.5 rounded-xl border transition-all ${
                              task.alarmEnabled && task.alertHoursBefore?.length > 0
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm'
                                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                            }`}
                            title="Configure alert triggers (6-120 hours prior)"
                          >
                            <BellRing className="w-4 h-4" />
                          </button>

                          {/* Reordering */}
                          <div className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => onReorderTask(idx, 'up')}
                              disabled={idx === 0}
                              className="p-0.5 text-slate-500 hover:text-slate-300 disabled:opacity-20 transition-colors"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onReorderTask(idx, 'down')}
                              disabled={idx === todayTasks.length - 1}
                              className="p-0.5 text-slate-500 hover:text-slate-300 disabled:opacity-20 transition-colors"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Right Column: Meal Planning & Budget Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Meal Planning Card */}
          {enabledFeatures.meals && (
            <div className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-5 shadow-xl backdrop-blur-md space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Meal Planning</h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('meals')}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>Pantry & Meals</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Expiring Ingredients Alert */}
              {expiringPantryItems.length > 0 && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong className="font-semibold text-amber-300">{expiringPantryItems[0].name}</strong> is nearing
                    expiry. Use it in today's recipe!
                  </span>
                </div>
              )}

              {/* Next Scheduled Meal */}
              {nextMeal && (
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium text-amber-300">{nextMeal.mealType} Today</span>
                    <span>{nextMeal.prepTime}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-100">{nextMeal.recipeTitle}</p>
                </div>
              )}

              {/* Quick Link to Shopping List */}
              <button
                type="button"
                onClick={() => onNavigateTab('meals')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Grocery Shopping List</span>
              </button>
            </div>
          )}

          {/* Budget Summary Card with D3 / SVG Donut Chart */}
          {enabledFeatures.budget && (
            <div className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-5 shadow-xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Monthly Budget</h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('budget')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Full Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Donut Chart & Numbers */}
              <div className="flex items-center justify-between gap-4">
                {/* SVG Donut */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      className="stroke-slate-800"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    {/* Filled progress */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      className="stroke-emerald-400 transition-all duration-1000 ease-out"
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xs font-bold text-white">{spentPct}%</span>
                    <span className="text-[9px] text-slate-400">spent</span>
                  </div>
                </div>

                {/* Balance Info */}
                <div className="space-y-1.5 flex-1">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Safe to Spend</span>
                    <p className="text-xl font-extrabold text-emerald-300">${remainingBudget.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
                    <span>Spent: ${totalSpent.toFixed(2)}</span>
                    <span>Cap: ${monthlyBudget}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Household Chores Snapshot */}
          {enabledFeatures.chores && (
            <div className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-4 shadow-xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-white">Household Chores</h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('chores')}
                  className="text-xs text-sky-400 hover:text-sky-300"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {chores.slice(0, 3).map((chore) => (
                  <div
                    key={chore.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs"
                  >
                    <span className={chore.completedToday ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {chore.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${chore.avatarColor}`}>
                      {chore.assignedTo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
