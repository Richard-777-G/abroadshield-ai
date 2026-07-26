/**
 * Activity Timeline Component
 */

'use client';

import { motion } from 'framer-motion';

export default function ActivityTimeline({ activities }: { activities: any[] }) {
  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex gap-4 border-l-2 border-cyan-500/30 py-2 pl-4"
        >
          <div className="mt-1 h-2 w-2 rounded-full bg-cyan-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-200">
              {activity.type.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-slate-400">
              {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
