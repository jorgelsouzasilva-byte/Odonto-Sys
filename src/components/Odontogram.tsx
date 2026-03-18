
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ToothProps {
  number: number;
  onClick: (number: number) => void;
  isSelected?: boolean;
}

const Tooth: React.FC<ToothProps> = ({ number, onClick, isSelected }) => {
  return (
    <div 
      onClick={() => onClick(number)}
      className={cn(
        "relative w-10 h-12 flex flex-col items-center justify-center border rounded-md cursor-pointer transition-all",
        "hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-slate-200 dark:border-slate-800",
        isSelected ? "bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500" : "bg-white dark:bg-slate-900"
      )}
    >
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">{number}</span>
      <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-700 rounded-sm flex items-center justify-center">
        <div className="w-2 h-2 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
    </div>
  );
};

interface QuadrantProps {
  label: string;
  dentes: number[];
  onToothClick: (number: number) => void;
  reverse?: boolean;
}

const Quadrant: React.FC<QuadrantProps> = ({ label, dentes, onToothClick, reverse }) => {
  const displayDentes = reverse ? [...dentes].reverse() : dentes;
  
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 text-center">{label}</p>
      <div className="flex flex-wrap justify-center gap-1">
        {displayDentes.map(num => (
          <Tooth key={num} number={num} onClick={onToothClick} />
        ))}
      </div>
    </div>
  );
};

interface OdontogramProps {
  onToothClick: (number: number) => void;
}

export default function Odontogram({ onToothClick }: OdontogramProps) {
  const [activeTab, setActiveTab] = useState<'permanentes' | 'deciduos'>('permanentes');

  const permanentes = [
    { id: 1, label: "Superior Direito", dentes: [18, 17, 16, 15, 14, 13, 12, 11] },
    { id: 2, label: "Superior Esquerdo", dentes: [21, 22, 23, 24, 25, 26, 27, 28] },
    { id: 3, label: "Inferior Esquerdo", dentes: [38, 37, 36, 35, 34, 33, 32, 31] },
    { id: 4, label: "Inferior Direito", dentes: [41, 42, 43, 44, 45, 46, 47, 48] },
  ];

  const deciduos = [
    { id: 5, label: "Superior Direito", dentes: [55, 54, 53, 52, 51] },
    { id: 6, label: "Superior Esquerdo", dentes: [61, 62, 63, 64, 65] },
    { id: 7, label: "Inferior Esquerdo", dentes: [75, 74, 73, 72, 71] },
    { id: 8, label: "Inferior Direito", dentes: [81, 82, 83, 84, 85] },
  ];

  const currentQuadrants = activeTab === 'permanentes' ? permanentes : deciduos;

  return (
    <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Odontograma</h3>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('permanentes')}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
              activeTab === 'permanentes' 
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            Permanentes
          </button>
          <button
            onClick={() => setActiveTab('deciduos')}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
              activeTab === 'deciduos' 
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            Decíduos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-12">
        {/* Quadrantes Superiores */}
        <Quadrant 
          label={currentQuadrants[0].label} 
          dentes={currentQuadrants[0].dentes} 
          onToothClick={onToothClick} 
        />
        <Quadrant 
          label={currentQuadrants[1].label} 
          dentes={currentQuadrants[1].dentes} 
          onToothClick={onToothClick} 
        />
        
        {/* Quadrantes Inferiores */}
        <Quadrant 
          label={currentQuadrants[2].label} 
          dentes={currentQuadrants[2].dentes} 
          onToothClick={onToothClick} 
        />
        <Quadrant 
          label={currentQuadrants[3].label} 
          dentes={currentQuadrants[3].dentes} 
          onToothClick={onToothClick} 
        />
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 text-[10px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border border-slate-200 dark:border-slate-800 rounded-sm" />
            <span>Saudável</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-500 rounded-sm" />
            <span>Selecionado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
