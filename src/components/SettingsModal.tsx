import React from 'react';
import { ThemeType, EnabledFeatures } from '../types';
import {
  X, Check, Sparkles, Volume2, Bell, Sliders, Palette, CheckSquare
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeType;
  onSelectTheme: (theme: ThemeType) => void;
  enabledFeatures: EnabledFeatures;
  onToggleFeature: (featureKey: keyof EnabledFeatures) => void;
}

const THEMES: Array<{
  id: ThemeType;
  name: string;
  desc: string;
  icon: string;
  gradient: string;
}> = [
  {
    id: 'rain',
    name: 'Falling Rain',
    desc: 'Gentle raindrops & misty ripples for deep calm focus',
    icon: '🌧️',
    gradient: 'from-sky-900 to-slate-900',
  },
  {
    id: 'waterfall',
    name: 'Flowing Waterfall',
    desc: 'Cascading forest currents with rising cool mist',
    icon: '💧',
    gradient: 'from-teal-900 to-emerald-950',
  },
  {
    id: 'river',
    name: 'Gentle River',
    desc: 'Tranquil water caustics with floating leaves',
    icon: '🌊',
    gradient: 'from-cyan-900 to-blue-950',
  },
  {
    id: 'mist',
    name: 'Forest Mist',
    desc: 'Soft drifting morning clouds across quiet evergreen ridges',
    icon: '🌲',
    gradient: 'from-slate-800 to-teal-950',
  },
  {
    id: 'sunset',
    name: 'Golden Sunset',
    desc: 'Warm soothing amber horizon with soft twilight glow',
    icon: '🌅',
    gradient: 'from-amber-900 to-indigo-950',
  },
  {
    id: 'clean',
    name: 'Clean Slate Glass',
    desc: 'Ultra minimal frosted dark glass without particle effects',
    icon: '🪟',
    gradient: 'from-slate-900 to-slate-950',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  enabledFeatures,
  onToggleFeature,
}) => {
  if (!isOpen) return null;

  const testAlertSound = () => {
    soundEngine.playChime('alert');
  };

  const testGentleChime = () => {
    soundEngine.playChime('gentle');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500/15 border border-sky-500/20 text-sky-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">DayEase Customization</h2>
              <p className="text-xs text-slate-400">Customize your themes, active features, and soothing sounds.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Theme Selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Soothing Nature Themes</h3>
          </div>
          <p className="text-xs text-slate-400">
            Animated backdrops designed to reduce everyday stress while keeping all text razor-sharp.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEMES.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme.id);
                    soundEngine.playChime('gentle');
                  }}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 bg-gradient-to-br ${theme.gradient} ${
                    isSelected
                      ? 'border-emerald-400 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-700/60 hover:border-slate-500 opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="text-2xl select-none">{theme.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{theme.name}</h4>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">{theme.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Feature Customization */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Choose Your Features</h3>
          </div>
          <p className="text-xs text-slate-400">
            Turn modules on or off so DayEase is as streamlined or full-featured as your day demands.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { key: 'tasks', label: 'Daily Tasks & Alerts', desc: 'Priorities, recurring times, 6-120h alarms' },
              { key: 'meals', label: 'Meal Planning & Pantry', desc: 'Recipe matcher & expiry date warnings' },
              { key: 'budget', label: 'Monthly Budget & Expenses', desc: 'Spending donut & category ledger' },
              { key: 'chores', label: 'Household Chores', desc: 'Roommate assignments & duty rotation' },
              { key: 'wellness', label: 'Wellness & Breaks', desc: 'Hydration goal, medications, desk stretches' },
              { key: 'focus', label: 'Focus Timer', desc: 'Pomodoro countdown with ambient soundscapes' },
              { key: 'audioNotes', label: 'Audio Voice Notes', desc: 'Microphone recorder, waveform, transcripts' },
            ].map((f) => {
              const enabled = enabledFeatures[f.key as keyof EnabledFeatures];
              return (
                <div
                  key={f.key}
                  onClick={() => onToggleFeature(f.key as keyof EnabledFeatures)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    enabled
                      ? 'bg-slate-800/70 border-sky-500/40 text-slate-200'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-semibold text-white">{f.label}</h4>
                    <p className="text-[10px] text-slate-400">{f.desc}</p>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      enabled
                        ? 'bg-sky-500 border-sky-400 text-white'
                        : 'border-slate-700 bg-slate-800 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Notification Chime & Sounds */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Gentle Audio Chimes</h3>
          </div>
          <p className="text-xs text-slate-400">
            Preview the calming bell frequencies used for alerts and task completions.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={testGentleChime}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2"
            >
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Test Gentle Chime</span>
            </button>
            <button
              type="button"
              onClick={testAlertSound}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Warning Alert</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
