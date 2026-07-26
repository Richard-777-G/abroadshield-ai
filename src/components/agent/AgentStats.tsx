/**
 * Agent Stats Component
 * Detailed statistics and analytics
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, CheckCircle } from 'lucide-react';

export default function AgentStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/agent/status');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="text-slate-400">Loading stats...</div>;
  }

  const successRate = stats.totalCompleted / (stats.totalApproved || 1);
  const approvalRate = stats.totalApproved / (stats.totalDrafted || 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            label: 'Approval Rate',
            value: `${(approvalRate * 100).toFixed(1)}%`,
            icon: CheckCircle,
            color: 'from-green-500 to-emerald-600',
          },
          {
            label: 'Success Rate',
            value: `${(successRate * 100).toFixed(1)}%`,
            icon: TrendingUp,
            color: 'from-cyan-500 to-blue-600',
          },
          {
            label: 'Total Jobs Applied',
            value: stats.jobsApplied,
            icon: Target,
            color: 'from-purple-500 to-pink-600',
          },
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-lg border border-slate-700/50 bg-gradient-to-br ${metric.color} p-6`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-4xl font-bold text-white">
                    {metric.value}
                  </p>
                </div>
                <Icon className="h-10 w-10 text-white/20" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg border border-slate-700 bg-slate-800/50 p-6"
      >
        <h3 className="mb-6 text-xl font-bold text-white">Activity Breakdown</h3>
        <div className="space-y-4">
          {[
            { label: 'Pending Drafts', value: stats.totalDrafted, color: 'bg-yellow-500' },
            { label: 'Approved', value: stats.totalApproved, color: 'bg-green-500' },
            { label: 'Completed', value: stats.totalCompleted, color: 'bg-cyan-500' },
            { label: 'Failed', value: stats.totalFailed, color: 'bg-red-500' },
          ].map((item) => {
            const max = Math.max(stats.totalDrafted, stats.totalApproved, stats.totalCompleted, 10);
            const percentage = (item.value / max) * 100;
            return (
              <div key={item.label}>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm font-semibold text-slate-200">
                    {item.label}
                  </span>
                  <span className="text-sm text-slate-400">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-700/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
