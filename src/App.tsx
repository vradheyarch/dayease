import React, { useState, useEffect } from 'react';
import {
  ThemeType, TaskItem, PantryItem, Recipe, PlannedMeal, ShoppingItem,
  ExpenseItem, ChoreItem, MedicationItem, AudioNote, EnabledFeatures
} from './types';
import {
  INITIAL_TASKS, INITIAL_PANTRY, INITIAL_RECIPES, INITIAL_MEALS,
  INITIAL_SHOPPING, INITIAL_EXPENSES, INITIAL_CHORES, INITIAL_MEDICATIONS,
  INITIAL_AUDIO_NOTES, DEFAULT_FEATURES
} from './data/initialData';
import { NatureBackground } from './components/NatureBackground';
import { TodayDashboard } from './components/TodayDashboard';
import { TaskSection } from './components/TaskSection';
import { MealSection } from './components/MealSection';
import { BudgetSection } from './components/BudgetSection';
import { ChoresSection } from './components/ChoresSection';
import { WellnessFocusSection } from './components/WellnessFocusSection';
import { AudioSection } from './components/AudioSection';
import { TaskAlertModal } from './components/TaskAlertModal';
import { SettingsModal } from './components/SettingsModal';
import { soundEngine } from './utils/audioSynth';
import {
  Sun, CheckSquare, Utensils, DollarSign, Users, Activity,
  Mic, Settings, Volume2, VolumeX, Sparkles, Heart
} from 'lucide-react';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('today');

  // Theme & Ambient Sound
  const [theme, setTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem('dayease_theme') as ThemeType) || 'rain';
  });
  const [isAmbientSoundActive, setIsAmbientSoundActive] = useState(false);

  // Core Data State (with localStorage persistence)
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('dayease_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem('dayease_pantry');
    return saved ? JSON.parse(saved) : INITIAL_PANTRY;
  });

  const [recipes] = useState<Recipe[]>(INITIAL_RECIPES);

  const [meals, setMeals] = useState<PlannedMeal[]>(() => {
    const saved = localStorage.getItem('dayease_meals');
    return saved ? JSON.parse(saved) : INITIAL_MEALS;
  });

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('dayease_shopping');
    return saved ? JSON.parse(saved) : INITIAL_SHOPPING;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('dayease_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem('dayease_budget_cap');
    return saved ? JSON.parse(saved) : 2400;
  });

  const [chores, setChores] = useState<ChoreItem[]>(() => {
    const saved = localStorage.getItem('dayease_chores');
    return saved ? JSON.parse(saved) : INITIAL_CHORES;
  });

  const [medications, setMedications] = useState<MedicationItem[]>(() => {
    const saved = localStorage.getItem('dayease_medications');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  const [audioNotes, setAudioNotes] = useState<AudioNote[]>(() => {
    const saved = localStorage.getItem('dayease_audionotes');
    return saved ? JSON.parse(saved) : INITIAL_AUDIO_NOTES;
  });

  const [waterIntake, setWaterIntake] = useState<number>(() => {
    const saved = localStorage.getItem('dayease_water');
    return saved ? JSON.parse(saved) : 5;
  });
  const waterTarget = 8;

  const [enabledFeatures, setEnabledFeatures] = useState<EnabledFeatures>(() => {
    const saved = localStorage.getItem('dayease_features');
    return saved ? JSON.parse(saved) : DEFAULT_FEATURES;
  });

  // Modals
  const [alertModalTask, setAlertModalTask] = useState<TaskItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dayease_theme', theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem('dayease_tasks', JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem('dayease_pantry', JSON.stringify(pantry));
  }, [pantry]);
  useEffect(() => {
    localStorage.setItem('dayease_meals', JSON.stringify(meals));
  }, [meals]);
  useEffect(() => {
    localStorage.setItem('dayease_shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);
  useEffect(() => {
    localStorage.setItem('dayease_expenses', JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem('dayease_budget_cap', JSON.stringify(monthlyBudget));
  }, [monthlyBudget]);
  useEffect(() => {
    localStorage.setItem('dayease_chores', JSON.stringify(chores));
  }, [chores]);
  useEffect(() => {
    localStorage.setItem('dayease_medications', JSON.stringify(medications));
  }, [medications]);
  useEffect(() => {
    localStorage.setItem('dayease_audionotes', JSON.stringify(audioNotes));
  }, [audioNotes]);
  useEffect(() => {
    localStorage.setItem('dayease_water', JSON.stringify(waterIntake));
  }, [waterIntake]);
  useEffect(() => {
    localStorage.setItem('dayease_features', JSON.stringify(enabledFeatures));
  }, [enabledFeatures]);

  // Ambient sound toggle
  const toggleAmbientSound = () => {
    if (isAmbientSoundActive) {
      soundEngine.stopAmbient();
      setIsAmbientSoundActive(false);
    } else {
      const soundType = theme === 'rain' ? 'rain' : theme === 'waterfall' ? 'waterfall' : theme === 'river' ? 'river' : 'rain';
      soundEngine.playAmbient(soundType, 0.2);
      setIsAmbientSoundActive(true);
    }
  };

  // Change theme
  const handleSelectTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    if (isAmbientSoundActive) {
      const soundType = newTheme === 'rain' ? 'rain' : newTheme === 'waterfall' ? 'waterfall' : newTheme === 'river' ? 'river' : 'rain';
      soundEngine.playAmbient(soundType, 0.2);
    }
  };

  // Task Handlers
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleReorderTask = (index: number, direction: 'up' | 'down') => {
    const sorted = [...tasks].sort((a, b) => a.order - b.order);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const temp = sorted[index];
    sorted[index] = sorted[targetIdx];
    sorted[targetIdx] = temp;

    const reIndexed = sorted.map((item, idx) => ({ ...item, order: idx }));
    setTasks(reIndexed);
  };

  const handleSaveTaskAlerts = (taskId: string, alertHours: number[], alarmEnabled: boolean) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, alertHoursBefore: alertHours, alarmEnabled } : t
      )
    );
  };

  const handleAddTask = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (updated: TaskItem) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Pantry & Shopping Handlers
  const handleAddPantry = (item: PantryItem) => {
    setPantry((prev) => [item, ...prev]);
  };
  const handleDeletePantry = (id: string) => {
    setPantry((prev) => prev.filter((p) => p.id !== id));
  };
  const handleAddShopping = (item: ShoppingItem) => {
    setShoppingList((prev) => [item, ...prev]);
  };
  const handleToggleShopping = (id: string) => {
    setShoppingList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s))
    );
  };
  const handleDeleteShopping = (id: string) => {
    setShoppingList((prev) => prev.filter((s) => s.id !== id));
  };
  const handleClearCheckedShopping = () => {
    setShoppingList((prev) => prev.filter((s) => !s.checked));
  };
  const handleAddIngredientsToShopping = (ingredients: string[]) => {
    const newItems: ShoppingItem[] = ingredients.map((ing, i) => ({
      id: `s-${Date.now()}-${i}`,
      name: ing,
      category: 'Recipe Essentials',
      quantity: '1 item',
      checked: false,
    }));
    setShoppingList((prev) => [...newItems, ...prev]);
  };

  // Budget Handlers
  const handleAddExpense = (expense: ExpenseItem) => {
    setExpenses((prev) => [expense, ...prev]);
  };
  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Chores Handlers
  const handleAddChore = (chore: ChoreItem) => {
    setChores((prev) => [...prev, chore]);
  };
  const handleToggleChore = (id: string) => {
    setChores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completedToday: !c.completedToday } : c))
    );
  };
  const handleRotateChores = () => {
    const members = ['Maya', 'Alex', 'Sam', 'Jordan'];
    const colors = ['bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
    setChores((prev) =>
      prev.map((chore) => {
        const curIdx = members.indexOf(chore.assignedTo);
        const nextIdx = (curIdx + 1) % members.length;
        return {
          ...chore,
          assignedTo: members[nextIdx],
          avatarColor: colors[nextIdx],
          completedToday: false,
        };
      })
    );
  };
  const handleDeleteChore = (id: string) => {
    setChores((prev) => prev.filter((c) => c.id !== id));
  };

  // Wellness Handlers
  const handleToggleMedication = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, takenToday: !m.takenToday } : m))
    );
  };
  const handleAddMedication = (item: MedicationItem) => {
    setMedications((prev) => [...prev, item]);
  };
  const handleDeleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  // Audio Handlers
  const handleAddAudioNote = (note: AudioNote) => {
    setAudioNotes((prev) => [note, ...prev]);
  };
  const handleDeleteAudioNote = (id: string) => {
    setAudioNotes((prev) => prev.filter((n) => n.id !== id));
  };
  const handleDeleteMultipleAudio = (ids: string[]) => {
    setAudioNotes((prev) => prev.filter((n) => !ids.includes(n.id)));
  };
  const handleUpdateAudioNote = (note: AudioNote) => {
    setAudioNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
  };

  // Feature Toggle
  const handleToggleFeature = (key: keyof EnabledFeatures) => {
    setEnabledFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Navigation Items
  const navItems = [
    { id: 'today', label: 'Today', icon: Sun },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: tasks.filter((t) => !t.completed).length },
    { id: 'meals', label: 'Meals & Pantry', icon: Utensils },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'chores', label: 'Chores', icon: Users },
    { id: 'wellness', label: 'Wellness', icon: Activity },
    { id: 'audio', label: 'Audio Notes', icon: Mic, badge: audioNotes.length },
  ];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Animated nature canvas and soothing dynamic background */}
      <NatureBackground theme={theme} />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/60 border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
            D
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">DayEase</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Gentle Companion
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
              Everyday Life, Meals, Budget, Chores & Wellness in One Calm Place
            </p>
          </div>
        </div>

        {/* Top Header Controls */}
        <div className="flex items-center gap-2">
          {/* Ambient Nature Sound Toggle */}
          <button
            type="button"
            onClick={toggleAmbientSound}
            className={`p-2 rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isAmbientSoundActive
                ? 'bg-sky-500/20 border-sky-400/60 text-sky-200 shadow-md shadow-sky-500/20'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle soothing background nature sound"
          >
            {isAmbientSoundActive ? (
              <>
                <Volume2 className="w-4 h-4 text-sky-400 animate-pulse" />
                <span className="hidden md:inline">Ambient: On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden md:inline">Ambient: Mute</span>
              </>
            )}
          </button>

          {/* Theme Quick Badge / Settings */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs font-semibold"
            title="Customize themes and features"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="capitalize hidden sm:inline">{theme} Theme</span>
            <Settings className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-12">
        {activeTab === 'today' && (
          <TodayDashboard
            tasks={tasks}
            meals={meals}
            expenses={expenses}
            monthlyBudget={monthlyBudget}
            chores={chores}
            medications={medications}
            pantry={pantry}
            waterIntake={waterIntake}
            waterTarget={waterTarget}
            enabledFeatures={enabledFeatures}
            activeTheme={theme}
            onUpdateWater={setWaterIntake}
            onToggleMedication={handleToggleMedication}
            onToggleTask={handleToggleTask}
            onReorderTask={handleReorderTask}
            onOpenTaskAlerts={(task) => setAlertModalTask(task)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onStartFocus={() => setActiveTab('wellness')}
            onQuickRecordAudio={() => setActiveTab('audio')}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskSection
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onOpenAlertModal={(task) => setAlertModalTask(task)}
          />
        )}

        {activeTab === 'meals' && (
          <MealSection
            pantry={pantry}
            recipes={recipes}
            meals={meals}
            shoppingList={shoppingList}
            onAddPantryItem={handleAddPantry}
            onDeletePantryItem={handleDeletePantry}
            onAddShoppingItem={handleAddShopping}
            onToggleShoppingItem={handleToggleShopping}
            onDeleteShoppingItem={handleDeleteShopping}
            onClearCheckedShopping={handleClearCheckedShopping}
            onAddIngredientsToShopping={handleAddIngredientsToShopping}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetSection
            monthlyBudget={monthlyBudget}
            expenses={expenses}
            onUpdateBudget={setMonthlyBudget}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'chores' && (
          <ChoresSection
            chores={chores}
            onAddChore={handleAddChore}
            onToggleChore={handleToggleChore}
            onRotateChores={handleRotateChores}
            onDeleteChore={handleDeleteChore}
          />
        )}

        {activeTab === 'wellness' && (
          <WellnessFocusSection
            waterIntake={waterIntake}
            waterTarget={waterTarget}
            medications={medications}
            tasks={tasks}
            onUpdateWater={setWaterIntake}
            onToggleMedication={handleToggleMedication}
            onAddMedication={handleAddMedication}
            onDeleteMedication={handleDeleteMedication}
          />
        )}

        {activeTab === 'audio' && (
          <AudioSection
            notes={audioNotes}
            onAddNote={handleAddAudioNote}
            onDeleteNote={handleDeleteAudioNote}
            onDeleteMultiple={handleDeleteMultipleAudio}
            onUpdateNote={handleUpdateAudioNote}
          />
        )}
      </main>

      {/* Floating Bottom Navigation Dock (Responsive Mobile & Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/85 backdrop-blur-2xl border-t border-white/10 px-2 sm:px-6 py-2">
        <div className="max-w-3xl mx-auto flex items-center justify-around gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  soundEngine.playChime('gentle');
                }}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 sm:px-4 rounded-2xl transition-all ${
                  isActive
                    ? 'text-emerald-400 font-bold bg-white/5'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-rose-500 text-white min-w-[14px] text-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Task Alert Configuration Modal */}
      {alertModalTask && (
        <TaskAlertModal
          task={alertModalTask}
          isOpen={!!alertModalTask}
          onClose={() => setAlertModalTask(null)}
          onSave={handleSaveTaskAlerts}
        />
      )}

      {/* Settings & Theme Customization Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={theme}
        onSelectTheme={handleSelectTheme}
        enabledFeatures={enabledFeatures}
        onToggleFeature={handleToggleFeature}
      />
    </div>
  );
};
