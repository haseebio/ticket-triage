'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function RoutingTrace({ category, priority, assignee }) {
  const reduceMotion = useReducedMotion();
  const nodes = [
    { label: 'Ticket', value: 'Received' },
    { label: 'Category', value: category || '—' },
    { label: 'Priority', value: priority || '—' },
    { label: 'Assigned to', value: assignee || 'Unassigned' },
  ];

  return (
    <div className="flex items-center overflow-x-auto rounded-lg border border-line bg-surface p-6">
      {nodes.map((node, i) => (
        <div key={node.label} className="flex items-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15, duration: 0.25 }}
            className="flex flex-col items-center gap-1 px-2 text-center"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="whitespace-nowrap text-xs text-fog">{node.label}</span>
            <span className="whitespace-nowrap text-sm font-medium text-ink">{node.value}</span>
          </motion.div>

          {i < nodes.length - 1 && (
            <motion.div
              initial={reduceMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.15 + 0.1, duration: 0.3 }}
              style={{ transformOrigin: 'left' }}
              className="h-px w-10 bg-line sm:w-16"
            />
          )}
        </div>
      ))}
    </div>
  );
}
