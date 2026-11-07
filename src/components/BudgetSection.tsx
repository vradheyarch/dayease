import React, { useState } from 'react';
import { ExpenseItem } from '../types';
import {
  DollarSign, Plus, Trash2, PieChart, TrendingDown,
  Calendar, CreditCard
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';

interface BudgetSectionProps {
  monthlyBudget: number;
  expenses: ExpenseItem[];
  onUpdateBudget: (newBudget: number) => void;
  onAddExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORIES = ['Groceries', 'Housing', 'Dining', 'Transport', 'Health', 'Fun', 'Utilities'];

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: '#10b981', // emerald
  Housing: '#3b82f6',   // blue
  Dining: '#f59e0b',    // amber
  Transport: '#06b6d4', // cyan
  Health: '#8b5cf6',    // purple
  Fun: '#ec4899',       // pink
  Utilities: '#64748b', // slate
};

export const BudgetSection: React.FC<BudgetSectionProps> = ({
  monthlyBudget,
  expenses,
  onUpdateBudget,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  // Expense form
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);
  const spentPct = Math.min(100, Math.round((totalSpent / monthlyBudget) * 100));

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  CATEGORIES.forEach((cat) => (categoryTotals[cat] = 0));
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: title.trim(),
      amount: numAmount,
      category,
      date,
    };

    onAddExpense(newExpense);
    soundEngine.playChime('gentle');
    setTitle('');
    setAmount('');
    setIsAdding(false);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(budgetInput);
    if (!isNaN(num) && num > 0) {
      onUpdateBudget(num);
      setIsEditingBudget(false);
      soundEngine.playChime('gentle');
    }
  };

  // SVG Donut calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (spentPct / 100) * circumference;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Expense Tracking & Monthly Budget
          </h2>
          <p className="text-xs text-slate-400">
            Keep clear oversight of spending categories and your remaining safe balance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Log Expense'}</span>
        </button>
      </div>

      {/* Main Budget Dashboard Card */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-6 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart visual */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
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

              <div className="absolute flex flex-col items-center text-center">
                <span className="text-2xl font-extrabold text-white">{spentPct}%</span>
                <span className="text-xs text-slate-400">of budget spent</span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-xs text-slate-400">Monthly Budget Cap: </span>
              {isEditingBudget ? (
                <form onSubmit={handleSaveBudget} className="inline-flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="w-24 bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-xs text-white"
                  />
                  <button type="submit" className="text-xs text-emerald-400 font-semibold">
                    Save
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsEditingBudget(true)}
                  className="font-bold text-slate-200 hover:text-emerald-300 underline ml-1 text-xs"
                >
                  ${monthlyBudget.toFixed(2)} (edit)
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="md:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-xs text-emerald-300 font-semibold">Remaining to Spend</span>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1">${remainingBudget.toFixed(2)}</p>
                <span className="text-[10px] text-slate-400">For the rest of this month</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs text-slate-400 font-semibold">Total Spent So Far</span>
                <p className="text-2xl font-extrabold text-slate-200 mt-1">${totalSpent.toFixed(2)}</p>
                <span className="text-[10px] text-slate-400">{expenses.length} logged transactions</span>
              </div>
            </div>

            {/* Category Distribution Pills */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-slate-300">Spending by Category:</span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const amt = categoryTotals[cat] || 0;
                  if (amt === 0) return null;
                  return (
                    <div
                      key={cat}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex items-center gap-2"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      />
                      <span className="text-slate-300">{cat}:</span>
                      <span className="font-bold text-white">${amt.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Form */}
      {isAdding && (
        <form
          onSubmit={handleSaveExpense}
          className="rounded-3xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-2xl backdrop-blur-md space-y-3 animate-fadeIn"
        >
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Log an Expense
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-300 font-semibold">Description / Merchant</label>
              <input
                type="text"
                required
                placeholder="e.g. Trader Joe's Groceries"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-semibold">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
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
              Record Expense
            </button>
          </div>
        </form>
      )}

      {/* Expenses History List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white">Recent Transactions</h3>
        <div className="space-y-2">
          {expenses.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#10b981' }}
                />
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold text-white">-${item.amount.toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => onDeleteExpense(item.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
