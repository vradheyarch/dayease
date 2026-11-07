import React, { useState } from 'react';
import { TaskItem } from '../types';
import { Bell, Clock, Check, X, Volume2, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';

interface TaskAlertModalProps {
  task: TaskItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, alertHours: number[], alarmEnabled: boolean) => void;
}

const AVAILABLE_INTERVALS = [120, 96, 72, 48, 24, 12, 8, 6];

export const TaskAlertModal: React.FC<TaskAlertModalProps> = ({ task, isOpen, onClose, onSave }) => {
  const [selectedHours, setSelectedHours] = useState<number[]>(task.alertHoursBefore || [24, 12]);
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(task.alarmEnabled ?? true);
  const [testedSound, setTestedSound] = useState(false);

  if (!isOpen) return null;

  // Compute deadline date
  const deadlineDate = new Date(`${task.dueDate}T${task.dueTime || '12:00'}`);
  const isDeadlineValid = !isNaN(deadlineDate.getTime());

  const calculateAlertTime = (hoursBefore: number) => {
    if (!isDeadlineValid) return '';
    const alertTime = new Date(deadlineDate.getTime() - hoursBefore * 3600 * 1000);
    return alertTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const toggleInterval = (hours: number) => {
    if (selectedHours.includes(hours)) {
      setSelectedHours(selectedHours.filter((h) => h !== hours));
    } else {
      setSelectedHours([...selectedHours, hours].sort((a, b) => b - a));
    }
  };

  const handleTestChime = () => {
    soundEngine.playChime('alert');
    setTestedSound(true);
    setTimeout(() => setTestedSound(false), 1200);
  };

  const handleApply = () => {
    onSave(task.id, selectedHours, alarmEnabled);
    onClose();
  };

  const selectPreset = (type: 'all' | 'standard' | 'urgent' | 'clear') => {
    if (type === 'all') {
      setSelectedHours([...AVAILABLE_INTERVALS]);
    } else if (type === 'standard') {
      setSelectedHours([48, 24, 12]);
    } else if (type === 'urgent') {
      setSelectedHours([12, 8, 6]);
    } else {
      setSelectedHours([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900/95 border border-slate-700/80 p-6 shadow-2xl text-slate-100 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Task Alerts & Early Warnings</h2>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Alarm Toggle & Task Deadline Bar */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Deadline</span>
              <p className="text-sm font-semibold text-slate-200">
                {isDeadlineValid
                  ? deadlineDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : `${task.dueDate} at ${task.dueTime}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              type="button"
              onClick={handleTestChime}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                testedSound
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{testedSound ? 'Chiming...' : 'Test Sound'}</span>
            </button>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={alarmEnabled}
                onChange={(e) => setAlarmEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative"></div>
              <span className="text-xs font-medium text-slate-300">Alerts {alarmEnabled ? 'On' : 'Off'}</span>
            </label>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Presets:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => selectPreset('standard')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              Standard (48h, 24h, 12h)
            </button>
            <button
              type="button"
              onClick={() => selectPreset('urgent')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              Urgent (12h, 8h, 6h)
            </button>
            <button
              type="button"
              onClick={() => selectPreset('all')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              All (6-120h)
            </button>
            <button
              type="button"
              onClick={() => selectPreset('clear')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Visual Timeline of Alerts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Interactive Alert Timeline ({selectedHours.length} active)
            </h3>
            <span className="text-xs text-slate-400">Click any milestone to toggle</span>
          </div>

          <div className="relative pl-6 space-y-3.5 before:absolute before:left-[17px] before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-sky-500/40 before:via-emerald-500/40 before:to-rose-500/60">
            {AVAILABLE_INTERVALS.map((hours) => {
              const isSelected = selectedHours.includes(hours);
              const formattedDate = calculateAlertTime(hours);
              const isClose = hours <= 12;

              return (
                <div
                  key={hours}
                  onClick={() => toggleInterval(hours)}
                  className={`group relative flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? isClose
                        ? 'bg-rose-500/15 border-rose-500/40 shadow-sm'
                        : 'bg-sky-500/15 border-sky-500/40 shadow-sm'
                      : 'bg-slate-800/40 border-slate-800/80 hover:bg-slate-800/70 hover:border-slate-700 opacity-60 hover:opacity-90'
                  }`}
                >
                  {/* Timeline Dot Indicator */}
                  <div
                    className={`absolute -left-[30px] w-4 h-4 rounded-full border-2 transition-transform group-hover:scale-125 flex items-center justify-center ${
                      isSelected
                        ? isClose
                          ? 'bg-rose-500 border-rose-300 ring-4 ring-rose-500/20'
                          : 'bg-sky-500 border-sky-300 ring-4 ring-sky-500/20'
                        : 'bg-slate-800 border-slate-600'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isSelected
                            ? isClose
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-sky-500/20 text-sky-300'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {hours}h Before
                      </span>
                      <span className="text-xs text-slate-300 font-medium">
                        {hours === 120
                          ? '5 days prior'
                          : hours === 96
                          ? '4 days prior'
                          : hours === 72
                          ? '3 days prior'
                          : hours === 48
                          ? '2 days prior'
                          : hours === 24
                          ? '1 day prior'
                          : `${hours} hours prior`}
                      </span>
                    </div>

                    {formattedDate && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Trigger: {formattedDate}
                      </span>
                    )}
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : 'border-slate-700 bg-slate-800 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}

            {/* Target Deadline Final Marker */}
            <div className="relative flex items-center gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div className="absolute -left-[30px] w-4 h-4 rounded-full bg-amber-400 border-2 border-white ring-4 ring-amber-400/20" />
              <div className="flex-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Final Deadline Hour</span>
                <p className="text-xs text-slate-300">Task is due right here. Good luck!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save Alert Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
