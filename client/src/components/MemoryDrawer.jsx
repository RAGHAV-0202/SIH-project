import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMemory } from '../context/MemoryContext';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  X,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  Save,
  MessageSquare,
  ShieldCheck,
  LogOut,
  LogIn,
} from 'lucide-react';

export default function MemoryDrawer() {
  const { memory, updateMemory, addNote, removeNote, isDrawerOpen, closeDrawer } = useMemory();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [routineText, setRoutineText] = useState(
    memory.routineText || 'Mai subah 8 bje uthta hu aur pure vegetarian khata hu. Pacing: aaram se with morning chai.'
  );
  const [newNoteText, setNewNoteText] = useState('');
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (memory.routineText) {
      setRoutineText(memory.routineText);
    }
  }, [memory.routineText]);

  if (!isDrawerOpen) return null;

  const handleSaveRoutineText = (e) => {
    e?.preventDefault();
    updateMemory({ routineText: routineText.trim() });
    triggerToast();
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addNote(newNoteText.trim(), 'routine');
    setNewNoteText('');
    triggerToast();
  };

  const triggerToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 font-['Geist']">
      <div className="w-full max-w-lg h-full bg-[#FAF8FF] text-[#131B2E] border-l border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#FFDBC9]/60 border border-[#DAC2B6] text-[#914714]">
                <Brain className="w-5 h-5 text-[#C26D38]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F2F3FF] border border-slate-200 text-[10px] font-bold text-[#006C4A] uppercase tracking-wider mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006C4A] animate-pulse" />
                  Dynamic Agent Context
                </div>
                <h2 className="text-xl font-black text-[#131B2E] tracking-tight">Traveler Settings & Memory</h2>
                <p className="text-xs text-[#4F5D72] mt-0.5">Personal routines, habits, and preferences passed to the agent</p>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toast Notification */}
          {saveToast && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Context saved! Agent swarm will use this memory for all trip itineraries.</span>
            </div>
          )}

          {/* Section 1: Routine & Rhythm Text Context */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#131B2E] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#C26D38]" />
                <span>Daily Routine & Travel Rhythm (Natural Text)</span>
              </label>
              <span className="text-[10px] font-mono text-[#006C4A] bg-[#006C4A]/10 px-2 py-0.5 rounded-full font-bold">
                Auto-Injected
              </span>
            </div>
            <p className="text-xs text-[#4F5D72] leading-relaxed">
              Describe your personal rhythm in your own words (Hindi, Hinglish, or English). The agent will automatically adjust wake-up buffers, tea intervals, meal choices, and road pace.
            </p>

            <form onSubmit={handleSaveRoutineText} className="space-y-3 pt-1">
              <textarea
                value={routineText}
                onChange={(e) => setRoutineText(e.target.value)}
                rows={4}
                placeholder="e.g. Mai subah 8 bje uthta hu aur pure vegetarian khata hu. Pacing: aaram se with morning chai, avoid night journeys..."
                className="w-full bg-white border border-slate-200/90 rounded-2xl p-3.5 text-xs text-[#131B2E] placeholder:text-slate-400 focus:outline-none focus:border-[#C26D38] focus:ring-2 focus:ring-[#C26D38]/10 shadow-2xs leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-98 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Routine Context</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Specific Habit Notes & Custom Rules */}
          <div className="mt-8 space-y-3 pt-6 border-t border-slate-200/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#131B2E] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C26D38]" />
                <span>Traveler Memory Notes & Rules</span>
              </span>
              <span className="text-[11px] font-semibold text-[#4F5D72]">
                {(memory.notes || []).length} active rule{(memory.notes || []).length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(memory.notes || []).map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 text-xs text-[#131B2E] shadow-2xs"
                >
                  <span className="leading-snug">"{n.text}"</span>
                  <button
                    onClick={() => removeNote(n.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer shrink-0"
                    title="Remove rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add rule: e.g. Prefer homestays with heating..."
                className="flex-1 bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-[#131B2E] placeholder:text-slate-400 focus:outline-none focus:border-[#C26D38] shadow-2xs"
              />
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="px-3.5 py-2 rounded-xl bg-[#F2F3FF] hover:bg-slate-200 text-[#131B2E] text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Section 3: Reassurance Info Card */}
          <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3 text-xs text-[#4F5D72]">
            <ShieldCheck className="w-4 h-4 text-[#006C4A] shrink-0 mt-0.5" />
            <span>
              Your memory context is saved securely and injected into the multi-agent trip planner so you never have to re-enter your daily habits.
            </span>
          </div>

        </div>

        {/* Footer with User Auth controls */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6">
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#C26D38] text-white flex items-center justify-center text-[10px] font-bold font-mono">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'KS'}
                </div>
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-[#131B2E] block truncate max-w-[130px]">{user.name || 'Traveler'}</span>
                  <span className="text-[#006C4A] font-semibold text-[10px]">Active Session</span>
                </div>
              </div>
            ) : (
              <span className="text-[11px] text-[#4F5D72]">
                Guest Mode • Wandr v4.8
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  closeDrawer();
                  navigate('/');
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-rose-200/60"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeDrawer}
                className="px-3.5 py-2 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </Link>
            )}

            <button
              onClick={closeDrawer}
              className="px-4 py-2 rounded-xl bg-[#131B2E] hover:bg-slate-800 text-xs text-white font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
