
import React from 'react';
import { AgendaDashboardStats } from '../types/agenda';
import { Clock, CheckCircle2, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface AgendaDashboardProps {
  stats: AgendaDashboardStats;
}

export const AgendaDashboard: React.FC<AgendaDashboardProps> = ({ stats }) => {
  const cards = [
    {
      id: 'agendas_pendentes',
      label: 'Pendentes',
      value: stats.pendentes,
      icon: Clock,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      id: 'agendas_confirmadas',
      label: 'Confirmadas',
      value: stats.confirmadas,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      id: 'agendas_total_dia',
      label: 'Total do Dia',
      value: stats.total_dia,
      icon: Calendar,
      color: 'text-zinc-600',
      bg: 'bg-zinc-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4"
        >
          <div className={`p-3 rounded-xl ${card.bg}`}>
            <card.icon className={`w-6 h-6 ${card.color}`} />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-bold text-zinc-900">{card.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
