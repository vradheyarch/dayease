import React, { useState, useEffect, useRef } from 'react';
import { MedicationItem, TaskItem } from '../types';
import {
  Droplet, Pill, Activity, Play, Pause, RotateCcw, Plus,
  CheckCircle2, Circle, Trash2, Volume2, VolumeX, Sparkles
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

interface WellnessFocusSectionProps {
  waterIntake: number;
  waterTarget: number;
  medications: MedicationItem[];
  tasks: TaskItem[];
  onUpdateWater: (val: number) => void;
  onToggleMedication: (id: string) => void;
  onAddMedication: (item: MedicationItem) => void;
  onDeleteMedication: (id: string) => void;
}

export const WellnessFocusSection: React.FC<WellnessFocusSectionProps> = ({
  waterIntake,
  waterTarget,
  medications,
  tasks,
  onUpdateWater,
  onToggleMedication,
  onAddMedication,
  onDeleteMedication,
}) => {
  const [activeTab, setActiveTab] = useState<'focus' | 'wellness'>('focus');

  // Focus Timer State
  const [timerPreset, setTimerPreset] = useState<number>(25 * 60); // 25 mins
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [focusTaskNote, setFocusTaskNote] = useState<string>('');
  const [completedSessions, setCompletedSessions] = useState<number>(3);
  const [ambientSound, setAmbientSound] = useState<'rain' | 'river' | 'waterfall' | 'whitenoise' | 'none'>('none');

  // Stretch Exercise Break State
  const [activeStretch, setActiveStretch] = useState<{ name: string; duration: number } | null>(null);
  const [stretchTimeLeft, setStretchTimeLeft] = useState<number>(0);
  const [isStretchRunning, setIsStretchRunning] = useState<boolean>(false);

  // Medication form state
  const [isAddingMed, setIsAddingMed] = useState(false);
  const [medName, setMedName] = useState('');
  const [medTime, setMedTime] = useState('08:00 AM');
  const [medDosage, setMedDosage] = useState('1 pill');

  const timerIntervalRef = useRef<number | null>(null);
  const stretchIntervalRef = useRef<number | null>(null);

  // Focus Timer interval effect
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            soundEngine.playChime('complete');
            soundEngine.stopAmbient();
            setAmbientSound('none');
            setCompletedSessions((c) => c + 1);
            confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  // Stretch Break interval effect
  useEffect(() => {
    if (isStretchRunning && stretchTimeLeft > 0) {
      stretchIntervalRef.current = window.setInterval(() => {
        setStretchTimeLeft((prev) => {
          if (prev <= 1) {
            setIsStretchRunning(false);
            soundEngine.playChime('complete');
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (stretchIntervalRef.current) clearInterval(stretchIntervalRef.current);
    }
    return () => {
      if (stretchIntervalRef.current) clearInterval(stretchIntervalRef.current);
    };
  }, [isStretchRunning, stretchTimeLeft]);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    soundEngine.playChime('gentle');
    if (ambientSound !== 'none') {
      soundEngine.playAmbient(ambientSound, 0.25);
    }
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    soundEngine.stopAmbient();
  };

  const handleResetTimer = (presetSeconds: number) => {
    setIsTimerRunning(false);
    setTimeLeft(presetSeconds);
    setTimerPreset(presetSeconds);
    soundEngine.stopAmbient();
  };

  const handleAmbientChange = (type: 'rain' | 'river' | 'waterfall' | 'whitenoise' | 'none') => {
    setAmbientSound(type);
    if (type === 'none') {
      soundEngine.stopAmbient();
    } else if (isTimerRunning) {
      soundEngine.playAmbient(type, 0.25);
    }
  };

  const startGuidedStretch = (name: string, seconds: number) => {
    setActiveStretch({ name, duration: seconds });
    setStretchTimeLeft(seconds);
    setIsStretchRunning(true);
    soundEngine.playChime('gentle');
  };

  const handleCreateMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    const newMed: MedicationItem = {
      id: `med-${Date.now()}`,
      name: medName.trim(),
      time: medTime,
      dosage: medDosage.trim(),
      takenToday: false,
    };

    onAddMedication(newMed);
    soundEngine.playChime('gentle');
    setMedName('');
    setIsAddingMed(false);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Wellness Reminders & Focus Sessions
          </h2>
          <p className="text-xs text-slate-400">
            Nurture your daily well-being with water, medications, gentle breaks, and distraction-free focus.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-2xl border border-slate-800 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('focus')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'focus'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Focus Timer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wellness')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'wellness'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hydration & Meds
          </button>
        </div>
      </div>

      {/* FOCUS TAB */}
      {activeTab === 'focus' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Pomodoro Timer Engine */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-900/80 border border-slate-700/70 p-6 shadow-xl backdrop-blur-md flex flex-col items-center justify-center space-y-6">
            {/* Presets */}
            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
              <button
                type="button"
                onClick={() => handleResetTimer(25 * 60)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  timerPreset === 25 * 60 ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                25m Focus
              </button>
              <button
                type="button"
                onClick={() => handleResetTimer(50 * 60)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  timerPreset === 50 * 60 ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                50m Deep Work
              </button>
              <button
                type="button"
                onClick={() => handleResetTimer(5 * 60)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  timerPreset === 5 * 60 ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                5m Quick Break
              </button>
            </div>

            {/* Radial Clock Visualization */}
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-emerald-400 transition-all duration-500 ease-linear"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - timeLeft / timerPreset)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold font-mono text-white tracking-wider">
                  {formatTimer(timeLeft)}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  {isTimerRunning ? 'Session in progress' : 'Ready when you are'}
                </span>
              </div>
            </div>

            {/* Play/Pause/Reset Controls */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleResetTimer(timerPreset)}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {!isTimerRunning ? (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  <span>Begin Focus Session</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseTimer}
                  className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Timer</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Task at Hand & Ambient Soundscapes */}
          <div className="lg:col-span-5 space-y-5">
            {/* Task at Hand Note */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-5 shadow-xl backdrop-blur-md space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Current Task at Hand
              </h3>
              <p className="text-xs text-slate-400">
                Select from your priority list or write down what you are immersing yourself in:
              </p>

              <input
                type="text"
                placeholder="e.g. Draft quarterly budget analysis..."
                value={focusTaskNote}
                onChange={(e) => setFocusTaskNote(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              {tasks.filter((t) => !t.completed).length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] text-slate-400">Or pick active task:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {tasks
                      .filter((t) => !t.completed)
                      .slice(0, 3)
                      .map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFocusTaskNote(t.title)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 truncate max-w-[200px]"
                        >
                          {t.title}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ambient Soundscapes for Focus */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-5 shadow-xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  Focus Soundscape
                </h3>
                {ambientSound !== 'none' && (
                  <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                    Playing: {ambientSound}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Procedural nature audio that plays gently during your focus session.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'rain', label: 'Rainfall', icon: '🌧️' },
                  { id: 'river', label: 'Gentle River', icon: '🌊' },
                  { id: 'waterfall', label: 'Waterfall', icon: '💧' },
                  { id: 'whitenoise', label: 'Soft White Noise', icon: '💨' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      handleAmbientChange(ambientSound === item.id ? 'none' : (item.id as any))
                    }
                    className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      ambientSound === item.id
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-200 shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {ambientSound !== 'none' && (
                <button
                  type="button"
                  onClick={() => handleAmbientChange('none')}
                  className="w-full py-1.5 text-xs text-slate-400 hover:text-rose-400 flex items-center justify-center gap-1"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Mute Soundscape</span>
                </button>
              )}
            </div>

            {/* Session Stats */}
            <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Sessions completed today:</span>
              <span className="font-bold text-white text-sm">{completedSessions} blocks (75 mins total)</span>
            </div>
          </div>
        </div>
      )}

      {/* WELLNESS TAB */}
      {activeTab === 'wellness' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hydration Tracker */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                  <Droplet className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Daily Hydration</h3>
                  <p className="text-xs text-slate-400">Recommended: 8 glasses (approx. 2 liters)</p>
                </div>
              </div>
              <span className="text-lg font-extrabold text-cyan-300">
                {waterIntake} / {waterTarget}
              </span>
            </div>

            {/* Glasses Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2">
              {Array.from({ length: waterTarget }).map((_, i) => {
                const filled = i < waterIntake;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onUpdateWater(filled ? i : i + 1)}
                    className={`h-14 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      filled
                        ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-800/40 border-slate-700/40 text-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <Droplet className={`w-4 h-4 ${filled ? 'fill-cyan-400' : ''}`} />
                    <span className="text-[10px] font-mono">#{i + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guided Stretch Breaks */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Short Movement Breaks</h3>
                <p className="text-xs text-slate-400">Relieve eye strain and shoulder tension during desk work.</p>
              </div>
            </div>

            {/* Active Stretch Timer Modal / Bar */}
            {activeStretch && stretchTimeLeft > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300">{activeStretch.name}</span>
                  <span className="font-mono font-bold text-white text-sm">{formatTimer(stretchTimeLeft)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-1000"
                    style={{ width: `${(stretchTimeLeft / activeStretch.duration) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-300 italic">
                  Breathe deeply, drop your shoulders away from ears, and hold gently.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {[
                { title: 'Neck & Trapezius Release', duration: 60, desc: 'Gentle side tilt and chin tucks' },
                { title: '20-20-20 Eye Rest', duration: 30, desc: 'Look 20 feet away to relax ciliary muscles' },
                { title: 'Spine & Chest Opener', duration: 120, desc: 'Interlace hands behind back and arch lightly' },
              ].map((s) => (
                <div
                  key={s.title}
                  className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{s.title}</h4>
                    <p className="text-[11px] text-slate-400">{s.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startGuidedStretch(s.title, s.duration)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold"
                  >
                    Start ({s.duration}s)
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Medication & Supplements */}
          <div className="md:col-span-2 rounded-3xl bg-slate-900/80 border border-slate-700/70 p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Daily Medications & Supplements</h3>
                  <p className="text-xs text-slate-400">Timely reminders for health essentials.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingMed(!isAddingMed)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingMed ? 'Cancel' : 'Add Medication'}</span>
              </button>
            </div>

            {/* Add Med Form */}
            {isAddingMed && (
              <form
                onSubmit={handleCreateMedication}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3 animate-fadeIn"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold">Medication Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vitamin B12, Allergy relief"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-semibold">Scheduled Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM"
                      value={medTime}
                      onChange={(e) => setMedTime(e.target.value)}
                      className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-semibold">Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 capsule with food"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingMed(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-purple-500 text-white rounded-xl"
                  >
                    Save Reminder
                  </button>
                </div>
              </form>
            )}

            {/* Medications List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    med.takenToday
                      ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                      : 'bg-slate-900/80 border-slate-700/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleMedication(med.id)}
                      className="text-slate-400 hover:text-purple-400"
                    >
                      {med.takenToday ? (
                        <CheckCircle2 className="w-5 h-5 text-purple-400 fill-purple-400/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <div>
                      <h4 className={`text-sm font-semibold ${med.takenToday ? 'line-through text-slate-400' : 'text-white'}`}>
                        {med.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {med.time} • {med.dosage}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteMedication(med.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
