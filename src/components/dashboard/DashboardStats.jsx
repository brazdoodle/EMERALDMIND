
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Code, Palette, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
  >
    <div className={`bg-slate-900/80 dark:bg-slate-900/80 light:bg-white/90 backdrop-blur-sm border border-slate-800 dark:border-slate-800 light:border-slate-300 hover:border-${color}-400/50 transition-all duration-300 rounded-2xl p-4 md:p-6`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 bg-${color}-400/20 rounded-lg`}>
          <Icon className={`w-4 h-4 md:w-5 md:h-5 text-${color}-400`} />
        </div>
        <TrendingUp className={`w-3 h-3 md:w-4 md:h-4 text-${color}-400`} />
      </div>
      <h3 className={`text-xl md:text-2xl font-bold text-${color}-400 font-mono mb-1`}>
        {value}
      </h3>
      <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-xs md:text-sm font-mono">{title}</p>
    </div>
  </motion.div>
);

export default function DashboardStats({ stats }) {
  const statItems = [
    { icon: Zap, title: "FLAGS ACTIVE", value: stats.flags, color: "emerald", delay: 0.1 },
    { icon: Users, title: "TRAINERS BUILT", value: stats.trainers, color: "teal", delay: 0.2 },
    { icon: Code, title: "SCRIPTS READY", value: stats.scripts, color: "yellow", delay: 0.3 },
    { icon: Palette, title: "SPRITES VALID", value: stats.sprites, color: "purple", delay: 0.4 },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {statItems.map(item => <StatCard key={item.title} {...item} />)}
    </div>
  );
}
