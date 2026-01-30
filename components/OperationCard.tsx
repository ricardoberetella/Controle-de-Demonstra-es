
import React from 'react';
import { Operation } from '../types';

interface OperationCardProps {
  operation: Operation;
  totalStudents: number;
  completedCount: number;
  onClick: () => void;
}

const OperationCard: React.FC<OperationCardProps> = ({ operation, totalStudents, completedCount, onClick }) => {
  const progressPct = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Torno': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Fresadora': return 'text-red-600 bg-red-50 border-red-200';
      case 'Bancada': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Retificadora': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Furadeira': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const colors = getCategoryColor(operation.category);

  return (
    <button 
      onClick={onClick}
      className="group relative bg-white border-2 border-slate-200 rounded-3xl p-6 text-left hover:border-[#004B95] hover:shadow-2xl transition-all flex flex-col justify-between min-h-[180px] hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`text-lg font-black italic tracking-tighter ${colors.split(' ')[0]}`}>
          OP. {operation.id}
        </span>
        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${colors}`}>
          {operation.category}
        </span>
      </div>

      <h4 className="text-[13px] font-black text-slate-900 uppercase italic leading-tight mb-4 flex-1 line-clamp-3">
        {operation.name}
      </h4>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-2">
          <span>Progresso</span>
          <span className={completedCount === totalStudents && totalStudents > 0 ? 'text-green-600' : ''}>
            {completedCount}/{totalStudents}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 ${progressPct === 100 ? 'bg-green-500' : 'bg-[#004B95]'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </button>
  );
};

export default OperationCard;
