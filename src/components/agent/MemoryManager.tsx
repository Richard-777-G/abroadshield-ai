/**
 * Memory Manager Component
 * Manage agent goals and preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Zap } from 'lucide-react';

interface AgentMemory {
  id: string;
  currentPhase: string;
  goals: Record<string, any>;
  preferences: Record<string, any>;
}

export default function MemoryManager() {
  const [memory, setMemory] = useState<AgentMemory | null>(null);
  const [formData, setFormData] = useState<AgentMemory | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    try {
      const res = await fetch('/api/agent/memory');
      if (res.ok) {
        const data = await res.json();
        setMemory(data.memory);
        setFormData(data.memory);
      }
    } catch (err) {
      console.error('Failed to fetch memory:', err);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    setSaving(true);
    try {
      const res = await fetch('/api/agent/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPhase: formData.currentPhase,
          goals: formData.goals,
          preferences: formData.preferences,
        }),
      });
      if (res.ok) {
        fetchMemory();
      }
    } catch (err) {
      console.error('Failed to save memory:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!formData) return <div>Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 rounded-lg border border-slate-700 bg-slate-800/50 p-6"
    >
      <h2 className="text-2xl font-bold text-white">Agent Goals & Preferences</h2>

      {/* Current Phase */}
      <div>
        <label className="block text-sm font-semibold text-slate-200">
          Current Journey Phase
        </label>
        <select
          value={formData.currentPhase}
          onChange={(e) =>
            setFormData({
              ...formData,
              currentPhase: e.target.value,
            })
          }
          className="mt-2 block w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white"
        >
          <option value="pre-departure">Pre-Departure</option>
          <option value="arrival">Arrival</option>
          <option value="studying">Studying</option>
          <option value="job_success">Job Success</option>
        </select>
      </div>

      {/* Job Goals */}
      <div className="space-y-4 border-t border-slate-700 pt-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Zap className="h-5 w-5 text-cyan-400" />
          Job Search Goals
        </h3>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.goals.wantJob || false}
            onChange={(e) =>
              setFormData({
                ...formData,
                goals: {
                  ...formData.goals,
                  wantJob: e.target.checked,
                },
              })
            }
            className="h-4 w-4 rounded border-slate-600 bg-slate-700"
          />
          <span className="text-slate-300">Agent should hunt for jobs</span>
        </label>

        {formData.goals.wantJob && (
          <>
            <div>
              <label className="block text-sm text-slate-400">
                Target Sectors (comma-separated)
              </label>
              <input
                type="text"
                value={formData.goals.targetSectors?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    goals: {
                      ...formData.goals,
                      targetSectors: e.target.value
                        .split(',')
                        .map((s) => s.trim()),
                    },
                  })
                }
                placeholder="fintech, AI, blockchain"
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400">
                Target Roles (comma-separated)
              </label>
              <input
                type="text"
                value={formData.goals.targetRoles?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    goals: {
                      ...formData.goals,
                      targetRoles: e.target.value
                        .split(',')
                        .map((s) => s.trim()),
                    },
                  })
                }
                placeholder="Software Engineer, Data Scientist, Product Manager"
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400">
                Target Locations (comma-separated)
              </label>
              <input
                type="text"
                value={formData.goals.targetLocations?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    goals: {
                      ...formData.goals,
                      targetLocations: e.target.value
                        .split(',')
                        .map((s) => s.trim()),
                    },
                  })
                }
                placeholder="London, Manchester, UK"
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white"
              />
            </div>
          </>
        )}
      </div>

      {/* Networking Goals */}
      <div className="space-y-4 border-t border-slate-700 pt-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Zap className="h-5 w-5 text-cyan-400" />
          Networking Goals
        </h3>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.goals.wantNetworking || false}
            onChange={(e) =>
              setFormData({
                ...formData,
                goals: {
                  ...formData.goals,
                  wantNetworking: e.target.checked,
                },
              })
            }
            className="h-4 w-4 rounded border-slate-600 bg-slate-700"
          />
          <span className="text-slate-300">
            Agent should find people to network with
          </span>
        </label>

        {formData.goals.wantNetworking && (
          <div>
            <label className="block text-sm text-slate-400">
              Why do you want to network?
            </label>
            <input
              type="text"
              value={formData.goals.networkingReason || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  goals: {
                    ...formData.goals,
                    networkingReason: e.target.value,
                  },
                })
              }
              placeholder="Job search, mentorship, industry insights"
              className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white"
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
      >
        <Save className="h-5 w-5" />
        {saving ? 'Saving...' : 'Save Goals'}
      </motion.button>
    </motion.div>
  );
}
