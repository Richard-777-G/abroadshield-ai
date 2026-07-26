/**
 * Draft Queue Component
 * View and manage all pending drafts
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Edit2,
  ChevronDown,
  Briefcase,
  Users,
  Home,
  AlertCircle,
} from 'lucide-react';

interface Task {
  id: string;
  type: string;
  status: string;
  payload: any;
  studentAction: string | null;
  createdAt: string;
}

export default function DraftQueue() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('drafted');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchDrafts();
  }, [filter]);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agent/drafts?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    taskId: string,
    action: 'approved' | 'declined' | 'edited'
  ) => {
    try {
      const res = await fetch(`/api/agent/drafts/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        // Refresh
        fetchDrafts();
      }
    } catch (err) {
      console.error('Failed to update draft:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'job_apply':
        return <Briefcase className="h-5 w-5" />;
      case 'network_message':
        return <Users className="h-5 w-5" />;
      case 'housing_inquiry':
        return <Home className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      job_apply: '🔍 Job Application',
      network_message: '🤝 Network Message',
      housing_inquiry: '🏠 Housing Inquiry',
      visa_check: '📋 Visa Check',
      banking_setup: '🏦 Banking Setup',
    };
    return labels[type] || type;
  };

  const statusColors: Record<string, string> = {
    drafted: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    approved: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    executing: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
    completed: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    declined: 'from-red-500/20 to-rose-500/20 border-red-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['drafted', 'approved', 'executing', 'completed', 'declined'].map(
          (s) => (
            <motion.button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === s
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </motion.button>
          )
        )}
      </div>

      {/* Draft List */}
      <AnimatePresence>
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            Loading drafts...
          </div>
        ) : tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border border-slate-700 bg-slate-800/30 py-12 text-center text-slate-400"
          >
            <AlertCircle className="mx-auto mb-3 h-8 w-8" />
            No {filter} drafts
          </motion.div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-lg border bg-gradient-to-r ${statusColors[task.status] || statusColors.drafted} p-4`}
              >
                <div
                  onClick={() =>
                    setExpandedId(
                      expandedId === task.id ? null : task.id
                    )
                  }
                  className="flex cursor-pointer items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-cyan-400">
                      {getIcon(task.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {getTypeLabel(task.type)}
                      </h3>
                      {task.type === 'job_apply' && (
                        <p className="text-sm text-slate-300">
                          {task.payload.company} — {task.payload.jobTitle}
                        </p>
                      )}
                      {task.type === 'network_message' && (
                        <p className="text-sm text-slate-300">
                          Reaching out to {task.payload.targetName}
                        </p>
                      )}
                    </div>
                  </div>
                  <motion.div
                    animate={{
                      rotate: expandedId === task.id ? 180 : 0,
                    }}
                  >
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </motion.div>
                </div>

                {/* Expanded View */}
                <AnimatePresence>
                  {expandedId === task.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 border-t border-slate-600/50 pt-4"
                    >
                      {/* Preview */}
                      <div className="mb-4 max-h-60 overflow-y-auto rounded-lg bg-slate-900/50 p-3 font-mono text-sm text-slate-300">
                        {task.type === 'job_apply' && (
                          <>
                            <p className="font-semibold text-cyan-400 mb-2">
                              Cover Letter:
                            </p>
                            <p>{task.payload.coverLetter.slice(0, 300)}...</p>
                          </>
                        )}
                        {task.type === 'network_message' && (
                          <>
                            <p className="font-semibold text-cyan-400 mb-2">
                              Message:
                            </p>
                            <p>
                              {task.payload.personalizedMessage.slice(
                                0,
                                300
                              )}
                              ...
                            </p>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      {task.status === 'drafted' && (
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleAction(task.id, 'approved')
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                            Approve & Send
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleAction(task.id, 'declined')
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                          >
                            <X className="h-4 w-4" />
                            Decline
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleAction(task.id, 'edited')
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 font-semibold text-white hover:bg-yellow-700"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
