/**
 * Student Agent Dashboard - Main Page
 * Complete control center for the AI agent
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Briefcase,
  Users,
  Home,
  Settings,
  LogOut,
  Play,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

import DraftQueue from '@/components/agent/DraftQueue';
import MemoryManager from '@/components/agent/MemoryManager';
import AgentStats from '@/components/agent/AgentStats';
import ActivityTimeline from '@/components/agent/ActivityTimeline';

type TabType = 'drafts' | 'goals' | 'stats' | 'settings';

interface AgentStatus {
  stats: {
    totalDrafted: number;
    totalApproved: number;
    totalCompleted: number;
    totalFailed: number;
    jobsApplied: number;
    networksContacted: number;
  };
  recentActivity: any[];
}

export default function AgentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('drafts');
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Fetch agent status on mount
  useEffect(() => {
    if (session?.user?.email) {
      fetchStatus();
    }
  }, [session]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/agent/status');
      if (res.ok) {
        const data = await res.json();
        setAgentStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const runAgentNow = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/agent/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        console.log('Agent run result:', data);
        setLastRun(new Date());
        // Refresh status
        setTimeout(fetchStatus, 2000);
      }
    } catch (err) {
      console.error('Failed to run agent:', err);
    } finally {
      setIsRunning(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-12 w-12 rounded-full border-4 border-cyan-500/30 border-t-cyan-500"
        />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const TABS: { id: TabType; label: string; icon: any }[] = [
    { id: 'drafts', label: 'Drafts', icon: CheckCircle },
    { id: 'goals', label: 'Goals', icon: TrendingUp },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Briefcase className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  AbroadShield Agent
                </h1>
                <p className="text-sm text-slate-400">
                  Autonomous Job & Networking Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Run Agent Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={runAgentNow}
                disabled={isRunning}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 font-semibold text-white shadow-lg disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Agent Now
                  </>
                )}
              </motion.button>

              {/* User Menu */}
              <div className="flex items-center gap-3 border-l border-slate-700 pl-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {session.user?.name || 'Student'}
                  </p>
                  <p className="text-xs text-slate-400">{session.user?.email}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut()}
                  className="rounded-lg p-2 hover:bg-slate-700/50"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5 text-slate-400" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Quick Stats */}
        {agentStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-6"
          >
            {[
              {
                label: 'Pending Drafts',
                value: agentStatus.stats.totalDrafted,
                icon: Clock,
                color: 'from-yellow-500 to-orange-600',
              },
              {
                label: 'Approved',
                value: agentStatus.stats.totalApproved,
                icon: CheckCircle,
                color: 'from-green-500 to-emerald-600',
              },
              {
                label: 'Completed',
                value: agentStatus.stats.totalCompleted,
                icon: TrendingUp,
                color: 'from-cyan-500 to-blue-600',
              },
              {
                label: 'Jobs Applied',
                value: agentStatus.stats.jobsApplied,
                icon: Briefcase,
                color: 'from-purple-500 to-pink-600',
              },
              {
                label: 'Networked',
                value: agentStatus.stats.networksContacted,
                icon: Users,
                color: 'from-indigo-500 to-purple-600',
              },
              {
                label: 'Failed',
                value: agentStatus.stats.totalFailed,
                icon: AlertCircle,
                color: 'from-red-500 to-rose-600',
              },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-lg border border-slate-700/50 bg-gradient-to-br ${stat.color} p-4 shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-white/70 uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-white">
                        {stat.value}
                      </p>
                    </div>
                    <Icon className="h-8 w-8 text-white/30" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex gap-2 border-b border-slate-700/50"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 font-semibold transition ${
                  isActive
                    ? 'border-cyan-500 text-cyan-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'drafts' && <DraftQueue />}
            {activeTab === 'goals' && <MemoryManager />}
            {activeTab === 'stats' && <AgentStats />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg border border-slate-700 bg-slate-800/50 p-6"
    >
      <h2 className="mb-6 text-2xl font-bold text-white">Settings</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-200">
            Notification Preferences
          </label>
          <div className="mt-3 space-y-2">
            {[
              'Email on new jobs found',
              'Email on networking responses',
              'Daily summary report',
              'Alerts for application status',
            ].map((pref) => (
              <label key={pref} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-600 bg-slate-700"
                />
                <span className="text-slate-300">{pref}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-700 pt-6">
          <label className="block text-sm font-semibold text-slate-200">
            Agent Behavior
          </label>
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-sm text-slate-400">Run frequency</label>
              <select className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700 text-white">
                <option>Every 6 hours (recommended)</option>
                <option>Every 4 hours</option>
                <option>Every 2 hours</option>
                <option>Hourly</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400">
                Max drafts per run
              </label>
              <input
                type="number"
                defaultValue={10}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
