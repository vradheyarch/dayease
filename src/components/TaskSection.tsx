import React, { useState } from 'react';
import { TaskItem, PriorityType, TaskRecurrence } from '../types';
import {
  CheckCircle2, Circle, Clock, Plus, Trash2, BellRing,
  Filter, Calendar, RotateCcw
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

interface TaskSectionProps {
  tasks: TaskItem[];
  onAddTask: (task: TaskItem) => void;
  onUpdateTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
  onOpenAlertModal: (task: TaskItem) => void;
}

export const TaskSection: React.FC<TaskSectionProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onOpenAlertModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'high'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isAdding, setIsAdding] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');
  const [newPriority, setNewPriority] = useState<PriorityType>('medium');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueTime, setNewDueTime] = useState('17:00');
  const [newRecurring, setNewRecurring] = useState<TaskRecurrence>('none');
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [newSubtasks, setNewSubtasks] = useState<string[]>([]);
  const [newNotes, setNewNotes] = useState('');

  const categories = ['All', 'Work', 'Personal', 'Home', 'Health'];

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setNewSubtasks([...newSubtasks, newSubtaskInput.trim()]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtask = (idx: number) => {
    setNewSubtasks(newSubtasks.filter((_, i) => i !== idx));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const task: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      dueDate: newDueDate,
      dueTime: newDueTime,
      recurring: newRecurring,
      completed: false,
      order: tasks.length,
      alarmEnabled: true,
      alertHoursBefore: [24, 12, 6], // default early warnings
      notes: newNotes.trim() || undefined,
      subtasks: newSubtasks.map((st, i) => ({
        id: `st-${Date.now()}-${i}`,
        title: st,
        completed: false,
      })),
    };

    onAddTask(task);
    soundEngine.playChime('gentle');
    setIsAdding(false);
    setNewTitle('');
    setNewSubtasks([]);
    setNewNotes('');
  };

  const handleToggleTask = (task: TaskItem) => {
    const updated = { ...task, completed: !task.completed };
    onUpdateTask(updated);
    if (!task.completed) {
      soundEngine.playChime('complete');
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleToggleSubtask = (task: TaskItem, subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
    soundEngine.playChime('gentle');
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (filter === 'high' && t.priority !== 'high') return false;
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            Tasks & Reminders
          </h2>
          <p className="text-xs text-slate-400">
            Set due times, recurring schedules, and configure alert warnings up to 120 hours in advance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'New Task'}</span>
        </button>
      </div>

      {/* Add Task Expandable Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="rounded-3xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-2xl backdrop-blur-md space-y-4 animate-fadeIn"
        >
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" /> Create New Everyday Task
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Task Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Renew auto insurance policy"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Home">Home</option>
                  <option value="Health">Health</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as PriorityType)}
                  className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="low">Low Priority (Green)</option>
                  <option value="medium">Medium Priority (Amber)</option>
                  <option value="high">High Priority (Rose)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Recurring Schedule</label>
                <select
                  value={newRecurring}
                  onChange={(e) => setNewRecurring(e.target.value as TaskRecurrence)}
                  className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Every day</option>
                  <option value="weekdays">Every weekday (Mon-Fri)</option>
                  <option value="weekly">Every week</option>
                  <option value="monthly">Every month</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Due Time</label>
                <input
                  type="time"
                  value={newDueTime}
                  onChange={(e) => setNewDueTime(e.target.value)}
                  className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Subtasks Builder */}
            <div>
              <label className="text-xs font-semibold text-slate-300">Sub-Tasks / Checklist</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add a step (press enter or click add)..."
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 rounded-xl text-white"
                >
                  Add Step
                </button>
              </div>

              {newSubtasks.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {newSubtasks.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300"
                    >
                      <span>• {st}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(i)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
            >
              Save Task with Early Alerts
            </button>
          </div>
        </form>
      )}

      {/* Filters & Categories */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
          {(['all', 'pending', 'completed', 'high'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                filter === mode
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 text-xs rounded-xl border transition-colors ${
                categoryFilter === cat
                  ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                  : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-slate-900/40 border border-slate-800 p-6 text-slate-400 text-xs">
            No matching tasks found.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
            const totalSubtasks = task.subtasks.length;
            const progressPct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

            return (
              <div
                key={task.id}
                className={`rounded-3xl border transition-all p-5 shadow-lg backdrop-blur-md ${
                  task.completed
                    ? 'bg-slate-900/50 border-slate-800/80 opacity-60'
                    : 'bg-slate-900/80 border-slate-700/70 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-400 hover:text-emerald-400" />
                      )}
                    </button>

                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-base font-bold ${
                            task.completed ? 'line-through text-slate-400' : 'text-white'
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

                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                          {task.category}
                        </span>

                        {task.recurring !== 'none' && (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            <RotateCcw className="w-3 h-3" />
                            {task.recurring}
                          </span>
                        )}
                      </div>

                      {/* Due info & Alert Warning Badge */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-sky-400" />
                          Due: {task.dueDate} at {task.dueTime}
                        </span>

                        {/* Alert Badges */}
                        {task.alarmEnabled && task.alertHoursBefore && task.alertHoursBefore.length > 0 && (
                          <button
                            type="button"
                            onClick={() => onOpenAlertModal(task)}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors"
                            title="Click to adjust alert timeline"
                          >
                            <BellRing className="w-3 h-3 text-amber-400" />
                            <span>
                              Alerts: {task.alertHoursBefore.map((h) => `${h}h`).join(', ')} before
                            </span>
                          </button>
                        )}
                      </div>

                      {task.notes && <p className="text-xs text-slate-400 italic">{task.notes}</p>}

                      {/* Subtasks Progress Bar & Checklist */}
                      {totalSubtasks > 0 && (
                        <div className="pt-2 space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>
                              Subtasks: {completedSubtasks} of {totalSubtasks} completed
                            </span>
                            <span className="font-semibold">{progressPct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>

                          <div className="space-y-1 pt-1">
                            {task.subtasks.map((st) => (
                              <div
                                key={st.id}
                                onClick={() => handleToggleSubtask(task, st.id)}
                                className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
                              >
                                {st.completed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-slate-500" />
                                )}
                                <span className={st.completed ? 'line-through text-slate-500' : ''}>
                                  {st.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Alert Config & Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenAlertModal(task)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/50 transition-colors"
                      title="Set Alert Reminders (6, 8, 12, 24, 48, 72, 96, 120 hours)"
                    >
                      <BellRing className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
