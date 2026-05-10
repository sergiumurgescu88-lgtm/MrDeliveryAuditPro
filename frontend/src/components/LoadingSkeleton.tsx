import { motion } from 'framer-motion';

export default function LoadingSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass-card p-8 h-44 animate-pulse bg-slate-100/60" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="glass-card p-5 h-20 animate-pulse bg-slate-100/60" />)}
      </div>
      <div className="glass-card p-6 h-56 animate-pulse bg-slate-100/60" />
      <div className="glass-card p-6 h-32 animate-pulse bg-slate-100/60" />
    </motion.div>
  );
}
