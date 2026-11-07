import React, { useState } from 'react';
import { ChoreItem } from '../types';
import {
  Users, Plus, CheckCircle2, Circle, RefreshCw, Trash2
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

interface ChoresSectionProps {
  chores: ChoreItem[];
  onAddChore: (chore: ChoreItem) => void;
  onToggleChore: (id: string) => void;
  onRotateChores: () => void;
  onDeleteChore: (id: string) => void;
}

const HOUSEHOLD_MEMBERS = [
  { name: 'Maya', color: 'bg-rose-500' },
  { name: 'Alex', color: 'bg-blue-500' },
  { name: 'Sam', color: 'bg-emerald-500' },
  { name: 'Jordan', color: 'bg-amber-500' },
];

export const ChoresSection: React.FC<ChoresSectionProps> = ({
  chores,
  onAddChore,
  onToggleChore,
  onRotateChores,
  onDeleteChore,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('Maya');
  const [recurrence, setRecurrence] = useState('Every Day');

  const handleSaveChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const member = HOUSEHOLD_MEMBERS.find((m) => m.name === assignedTo) || HOUSEHOLD_MEMBERS[0];

    const newChore: ChoreItem = {
      id: `chore-${Date.now()}`,
      title: title.trim(),
      assignedTo: member.name,
      avatarColor: member.color,
      recurrence,
      completedToday: false,
    };

    onAddChore(newChore);
    soundEngine.playChime('gentle');
    setTitle('');
    setIsAdding(false);
  };

  const handleToggle = (id: string, completed: boolean) => {
    onToggleChore(id);
    if (!completed) {
      soundEngine.playChime('complete');
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
  };

  const handleRotate = () => {
    onRotateChores();
    soundEngine.playChime('gentle');
  };

  const completedCount = chores.filter((c) => c.completedToday).length;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            Household Chores & Roommate Hub
          </h2>
          <p className="text-xs text-slate-400">
            Keep living spaces harmonious with recurring tasks and balanced household rotations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={handleRotate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            title="Rotate assignments to next household member"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Rotate Duties</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Cancel' : 'New Chore'}</span>
          </button>
        </div>
      </div>

      {/* Progress Banner */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-4 shadow-xl backdrop-blur-md flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Today's Household Progress
          </span>
          <p className="text-base font-bold text-white">
            {completedCount} of {chores.length} chores completed today
          </p>
        </div>
        <div className="flex -space-x-2">
          {HOUSEHOLD_MEMBERS.map((m) => (
            <div
              key={m.name}
              className={`w-8 h-8 rounded-full ${m.color} text-white text-xs font-bold flex items-center justify-center border-2 border-slate-900`}
              title={m.name}
            >
              {m.name.charAt(0)}
            </div>
          ))}
        </div>
      </div>

      {/* Add Chore Form */}
      {isAdding && (
        <form
          onSubmit={handleSaveChore}
          className="rounded-3xl bg-slate-900 border border-slate-700 p-5 space-y-3 animate-fadeIn"
        >
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" /> Add Household Chore
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-semibold">Chore Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Deep clean refrigerator shelves"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-semibold">Assign To</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {HOUSEHOLD_MEMBERS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-300 font-semibold">Recurrence</label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Every Day">Every Day</option>
                <option value="Every 2 Days">Every 2 Days</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-500 text-slate-950 rounded-xl"
            >
              Add Chore
            </button>
          </div>
        </form>
      )}

      {/* Chores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {chores.map((chore) => (
          <div
            key={chore.id}
            className={`p-4 rounded-3xl border transition-all flex items-center justify-between ${
              chore.completedToday
                ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                : 'bg-slate-900/80 border-slate-700/70 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleToggle(chore.id, chore.completedToday)}
                className="text-slate-400 hover:text-emerald-400 transition-colors"
              >
                {chore.completedToday ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 hover:text-emerald-400" />
                )}
              </button>

              <div className="space-y-1">
                <h4 className={`text-sm font-semibold ${chore.completedToday ? 'line-through text-slate-400' : 'text-white'}`}>
                  {chore.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${chore.avatarColor}`}>
                    {chore.assignedTo}
                  </span>
                  <span>•</span>
                  <span>{chore.recurrence}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDeleteChore(chore.id)}
              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
