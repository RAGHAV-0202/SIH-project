import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserMemory, saveUserMemory, addUserMemoryNote, deleteUserMemoryNote } from '../services/api';
import { useAuth } from './AuthContext';

const MemoryContext = createContext(null);

const DEFAULT_MEMORY = {
  routineText: 'Mai subah 8 bje uthta hu aur pure vegetarian khata hu. Pacing: aaram se with morning chai.',
  wakeUpTime: '08:00',
  sleepTime: '23:00',
  pace: 'moderate',
  dietary: ['vegetarian'],
  notes: [
    { id: 'init-1', text: 'Mai subah 8 bje uthta hu', category: 'routine' },
    { id: 'init-2', text: 'Prefers fresh vegetarian food', category: 'food' },
  ],
};

export function MemoryProvider({ children }) {
  const { token, user } = useAuth();
  const [memory, setMemory] = useState(() => {
    try {
      const saved = localStorage.getItem('wandr_memory');
      return saved ? JSON.parse(saved) : DEFAULT_MEMORY;
    } catch {
      return DEFAULT_MEMORY;
    }
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wandr_memory', JSON.stringify(memory));
    } catch (err) {
      console.warn('Failed to persist memory in localStorage:', err);
    }
  }, [memory]);

  // Sync with backend if logged in
  useEffect(() => {
    if (token) {
      getUserMemory(token)
        .then((res) => {
          if (res?.memory) {
            setMemory(prev => ({
              ...prev,
              ...res.memory,
              notes: res.memory.notes?.length ? res.memory.notes : prev.notes,
            }));
          }
        })
        .catch((err) => console.warn('Could not sync user memory from backend:', err.message));
    }
  }, [token]);

  const updateMemory = async (updates) => {
    const updated = { ...memory, ...updates };
    setMemory(updated);

    if (token) {
      try {
        await saveUserMemory(updated, token);
      } catch (err) {
        console.warn('Failed to save memory to backend:', err.message);
      }
    }
  };

  const addNote = async (text, category = 'routine') => {
    if (!text?.trim()) return;
    const newNote = {
      id: `MEM-${Date.now()}`,
      text: text.trim(),
      category,
      createdAt: new Date().toISOString(),
    };

    const updatedNotes = [...(memory.notes || []), newNote];
    updateMemory({ notes: updatedNotes });

    if (token) {
      try {
        await addUserMemoryNote(text.trim(), category, token);
      } catch (err) {
        console.warn('Failed to add note to backend:', err.message);
      }
    }
  };

  const removeNote = async (id) => {
    const updatedNotes = (memory.notes || []).filter((n) => n.id !== id);
    updateMemory({ notes: updatedNotes });

    if (token) {
      try {
        await deleteUserMemoryNote(id, token);
      } catch (err) {
        console.warn('Failed to delete note from backend:', err.message);
      }
    }
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <MemoryContext.Provider
      value={{
        memory,
        updateMemory,
        addNote,
        removeNote,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemory() {
  const ctx = useContext(MemoryContext);
  if (!ctx) throw new Error('useMemory must be used within a MemoryProvider');
  return ctx;
}
