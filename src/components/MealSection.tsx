import React, { useState } from 'react';
import { PantryItem, Recipe, PlannedMeal, ShoppingItem } from '../types';
import {
  Utensils, ShoppingBag, AlertTriangle, Plus, Check, Trash2,
  Sparkles, ChefHat, CheckCircle2, Circle
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

interface MealSectionProps {
  pantry: PantryItem[];
  recipes: Recipe[];
  meals: PlannedMeal[];
  shoppingList: ShoppingItem[];
  onAddPantryItem: (item: PantryItem) => void;
  onDeletePantryItem: (id: string) => void;
  onAddShoppingItem: (item: ShoppingItem) => void;
  onToggleShoppingItem: (id: string) => void;
  onDeleteShoppingItem: (id: string) => void;
  onClearCheckedShopping: () => void;
  onAddIngredientsToShopping: (ingredients: string[]) => void;
}

export const MealSection: React.FC<MealSectionProps> = ({
  pantry,
  recipes,
  meals,
  shoppingList,
  onAddPantryItem,
  onDeletePantryItem,
  onAddShoppingItem,
  onToggleShoppingItem,
  onDeleteShoppingItem,
  onClearCheckedShopping,
  onAddIngredientsToShopping,
}) => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'pantry' | 'planner' | 'shopping'>('recipes');

  // Pantry add state
  const [isAddingPantry, setIsAddingPantry] = useState(false);
  const [pantryName, setPantryName] = useState('');
  const [pantryCategory, setPantryCategory] = useState('Produce');
  const [pantryQty, setPantryQty] = useState('1 pack');
  const [pantryExpiry, setPantryExpiry] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );

  // Shopping add state
  const [newShoppingName, setNewShoppingName] = useState('');
  const [newShoppingQty, setNewShoppingQty] = useState('1');

  // Helper to calculate days until expiry
  const getExpiryDays = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(dateStr);
    exp.setHours(0, 0, 0, 0);
    return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
  };

  const handleCreatePantry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pantryName.trim()) return;

    const item: PantryItem = {
      id: `p-${Date.now()}`,
      name: pantryName.trim(),
      category: pantryCategory,
      quantity: pantryQty.trim() || '1 item',
      expiryDate: pantryExpiry,
    };

    onAddPantryItem(item);
    soundEngine.playChime('gentle');
    setPantryName('');
    setIsAddingPantry(false);
  };

  const handleCreateShopping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShoppingName.trim()) return;

    const item: ShoppingItem = {
      id: `s-${Date.now()}`,
      name: newShoppingName.trim(),
      category: 'General',
      quantity: newShoppingQty.trim() || '1 item',
      checked: false,
    };

    onAddShoppingItem(item);
    soundEngine.playChime('gentle');
    setNewShoppingName('');
  };

  // Recipe matching logic: which recipes have ingredients at home?
  const pantryNamesLower = pantry.map((p) => p.name.toLowerCase());
  const recipesWithMatchScore = recipes.map((rec) => {
    const matchedCount = rec.ingredients.filter((ing) =>
      pantryNamesLower.some((pName) => pName.includes(ing.toLowerCase()) || ing.toLowerCase().includes(pName))
    ).length;
    const matchPct = Math.round((matchedCount / rec.ingredients.length) * 100);
    return { ...rec, matchedCount, matchPct };
  });

  // Sort by highest match first
  recipesWithMatchScore.sort((a, b) => b.matchPct - a.matchPct);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-400" />
            Meal Planning & Pantry
          </h2>
          <p className="text-xs text-slate-400">
            Suggest recipes from your pantry, track nearing expiry dates, and build your grocery list.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('recipes')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'recipes'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Recipe Matcher ({recipes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pantry')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'pantry'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Pantry & Expiry Tracker ({pantry.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shopping')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'shopping'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Shopping List ({shoppingList.filter((s) => !s.checked).length} left)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('planner')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'planner'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Meal Schedule</span>
        </button>
      </div>

      {/* 1. Recipe Matcher Tab */}
      {activeTab === 'recipes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              These recipes match items currently in your pantry! Prioritize ingredients nearing their expiration date.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipesWithMatchScore.map((recipe) => (
              <div
                key={recipe.id}
                className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-5 shadow-lg backdrop-blur-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {recipe.matchPct}% Pantry Match
                    </span>
                    <span className="text-xs text-slate-400">{recipe.prepTime}</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{recipe.title}</h3>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {recipe.tags.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Ingredients Checklist */}
                  <div className="pt-2 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400">Ingredients:</span>
                    <ul className="text-xs space-y-1 text-slate-300">
                      {recipe.ingredients.map((ing) => {
                        const hasIt = pantryNamesLower.some((p) => p.includes(ing.toLowerCase()) || ing.toLowerCase().includes(p));
                        return (
                          <li key={ing} className="flex items-center gap-1.5">
                            {hasIt ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                            )}
                            <span className={hasIt ? 'text-slate-200' : 'text-slate-400'}>{ing}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Steps preview */}
                  <div className="pt-2 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800">
                    <span className="font-semibold text-slate-300">Directions: </span>
                    {recipe.instructions[0]}
                  </div>
                </div>

                {/* Add missing to shopping button */}
                <button
                  type="button"
                  onClick={() => {
                    const missing = recipe.ingredients.filter(
                      (ing) => !pantryNamesLower.some((p) => p.includes(ing.toLowerCase()) || ing.toLowerCase().includes(p))
                    );
                    if (missing.length > 0) {
                      onAddIngredientsToShopping(missing);
                      soundEngine.playChime('gentle');
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-sky-300 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add Missing Ingredients to Grocery List</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Pantry Inventory Tab */}
      {activeTab === 'pantry' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Pantry & Refrigerator Stock</h3>
            <button
              type="button"
              onClick={() => setIsAddingPantry(!isAddingPantry)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingPantry ? 'Cancel' : 'Add Food Item'}</span>
            </button>
          </div>

          {/* Add Pantry Form */}
          {isAddingPantry && (
            <form
              onSubmit={handleCreatePantry}
              className="p-4 rounded-3xl bg-slate-900 border border-slate-700 space-y-3 animate-fadeIn"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-300 font-semibold">Food / Ingredient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greek Yogurt, Cherry Tomatoes"
                    value={pantryName}
                    onChange={(e) => setPantryName(e.target.value)}
                    className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold">Quantity</label>
                  <input
                    type="text"
                    placeholder="e.g. 500g, 2 cans"
                    value={pantryQty}
                    onChange={(e) => setPantryQty(e.target.value)}
                    className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={pantryExpiry}
                    onChange={(e) => setPantryExpiry(e.target.value)}
                    className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPantry(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-500 text-slate-950 rounded-xl"
                >
                  Save to Pantry
                </button>
              </div>
            </form>
          )}

          {/* Pantry Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pantry.map((item) => {
              const daysLeft = getExpiryDays(item.expiryDate);
              const isUrgent = daysLeft <= 2 && daysLeft >= 0;
              const isExpired = daysLeft < 0;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isUrgent
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : isExpired
                      ? 'bg-rose-500/10 border-rose-500/40'
                      : 'bg-slate-900/70 border-slate-700/60'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {isUrgent ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          {daysLeft === 0 ? 'Expires today!' : daysLeft === 1 ? 'Expires tomorrow!' : `Expires in ${daysLeft} days`}
                        </span>
                      ) : isExpired ? (
                        <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded">
                          Expired
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          Fresh until {item.expiryDate} ({daysLeft} days)
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeletePantryItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Shopping List Tab */}
      {activeTab === 'shopping' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Grocery & Supplies List</h3>
            {shoppingList.some((s) => s.checked) && (
              <button
                type="button"
                onClick={onClearCheckedShopping}
                className="text-xs text-rose-400 hover:text-rose-300"
              >
                Clear Checked Items
              </button>
            )}
          </div>

          {/* Quick Add Shopping Item */}
          <form onSubmit={handleCreateShopping} className="flex gap-2">
            <input
              type="text"
              placeholder="Add item (e.g. Sourdough loaf, almond milk)..."
              value={newShoppingName}
              onChange={(e) => setNewShoppingName(e.target.value)}
              className="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Qty"
              value={newShoppingQty}
              onChange={(e) => setNewShoppingQty(e.target.value)}
              className="w-20 bg-slate-900/80 border border-slate-700/80 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-md"
            >
              Add
            </button>
          </form>

          {/* Shopping Checklist */}
          <div className="space-y-2">
            {shoppingList.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  item.checked
                    ? 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
                    : 'bg-slate-900/80 border-slate-700/70 text-slate-200'
                }`}
              >
                <div
                  onClick={() => {
                    onToggleShoppingItem(item.id);
                    soundEngine.playChime('gentle');
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  {item.checked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-slate-400">({item.quantity})</span>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteShoppingItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Meal Planner Schedule */}
      {activeTab === 'planner' && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white">Weekly Meal Schedule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {meals.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-700/60 space-y-1 backdrop-blur-md"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300">{m.day} • {m.mealType}</span>
                  <span className="text-slate-400">{m.prepTime}</span>
                </div>
                <h4 className="text-sm font-semibold text-white">{m.recipeTitle}</h4>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
