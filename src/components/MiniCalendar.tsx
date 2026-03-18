
import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarMark } from '../types/agenda';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  marks: CalendarMark[];
  onMonthChange?: (month: number, year: number) => void;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ selectedDate, onDateSelect, marks, onMonthChange }) => {
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(selectedDate));

  const nextMonth = () => {
    const next = addMonths(currentMonth, 1);
    setCurrentMonth(next);
    onMonthChange?.(next.getMonth(), next.getFullYear());
  };

  const prevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    setCurrentMonth(prev);
    onMonthChange?.(prev.getMonth(), prev.getFullYear());
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const getMarkStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return marks.find(m => m.data === dateStr)?.status;
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-zinc-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-zinc-500" />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-zinc-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
          <span key={i} className="text-[10px] font-bold text-zinc-400 uppercase">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const status = getMarkStatus(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={i}
              onClick={() => onDateSelect(day)}
              className={cn(
                "relative h-8 w-8 flex items-center justify-center text-xs rounded-full transition-all",
                !isCurrentMonth && "text-zinc-300",
                isCurrentMonth && "text-zinc-700 hover:bg-zinc-100",
                isSelected && "bg-zinc-900 text-white hover:bg-zinc-800"
              )}
            >
              {format(day, 'd')}
              {status && (
                <span className={cn(
                  "absolute bottom-1 w-1 h-1 rounded-full",
                  status === 'pendente' ? "bg-red-500" : "bg-emerald-500"
                )} />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[10px] text-zinc-500">Agenda pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-zinc-500">Agenda confirmada</span>
        </div>
      </div>
    </div>
  );
};
