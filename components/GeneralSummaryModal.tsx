import React, { useState } from 'react';
import { Student, Operation, ClassRoom, DemonstrationStatus } from '../types';

interface GeneralSummaryModalProps {
  activeClass: ClassRoom;
  students: Student[];
  operations: Operation[];
  onClose: () => void;
  onDeleteStudent: (id: string) => void;
  onUpdateStudentName: (id: string, newName: string) => void;
}

const GeneralSummaryModal: React.FC<GeneralSummaryModalProps> = ({ 
  activeClass, 
  students, 
  operations, 
  onClose,
  onDeleteStudent,
  onUpdateStudentName
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setEditValue(student.name);
    setConfirmDeleteId(null);
  };

  const saveEdit = (id: string) => {
    if (editValue.trim()) {
      onUpdateStudentName(id, editValue);
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Torno': return 'bg-[#004B95]';
      case 'Fresadora': return 'bg-[#E30613]';
      case 'Bancada': return 'bg-amber-600';
      case 'Retificadora': return 'bg-purple-700';
      case 'Furadeira': return 'bg-emerald-700';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="h-20 bg-[#1e293b] flex items-center justify-between px-8 shrink-0 shadow-2xl z-20">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition-all">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="text-xl font-black text-white italic uppercase leading-none">Painel Analítico de Gestão</h2>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">{activeClass.name}</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
            <div className="hidden sm:flex gap-6 items-center text-[10px] font-black text-white/60 uppercase">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div>Realizado</div>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative bg-slate-100">
        <table className="border-collapse table-fixed min-w-full">
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-50 bg-[#f8fafc] border-b-4 border-r-4 border-slate-300 w-[350px] min-w-[350px] h-[100px] p-6 text-left shadow-xl">
                <div className="flex flex-col justify-end h-full">
                  <h4 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">ALUNOS</h4>
                </div>
              </th>
              {operations.map(op => (
                <th key={op.id} className="sticky top-0 z-40 w-16 min-w-[4rem] h-[100px] bg-white border-b-4 border-r border-slate-200">
                  <div className={`absolute top-0 left-0 w-full h-2 ${getCategoryColor(op.category)}`}></div>
                  <div className="flex flex-col items-center justify-center h-full pt-2 px-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-tighter leading-none block h-3">
                      {op.category}
                    </span>
                    <span className="text-xl font-black text-slate-800 italic">{op.id}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white">
            {students.length === 0 ? (
                <tr><td colSpan={operations.length + 1} className="p-20 text-center text-slate-400 font-black uppercase italic tracking-widest">NÃO HÁ ALUNOS</td></tr>
            ) : (
                students.map((student, sIdx) => {
                    const completedCount = Object.values(student.demonstrations).filter((d: any) => d.status === DemonstrationStatus.DONE).length;
                    const progressPct = Math.round((completedCount / operations.length) * 100);
                    const isEditing = editingId === student.id;
                    const isConfirmingDelete = confirmDeleteId === student.id;

                    return (
                        <tr key={student.id} className="hover:bg-blue-50/20">
                            <td className="sticky left-0 z-30 bg-white border-r-4 border-b border-slate-300 p-0 shadow-xl">
                                <div className="flex flex-col gap-2 p-4 w-[350px]">
                                    <div className="flex items-center justify-between gap-3 min-w-0">
                                      {isEditing ? (
                                        <div className="flex-1 flex gap-1">
                                          <input 
                                            autoFocus
                                            className="flex-1 border-2 border-blue-500 rounded px-2 text-[11px] font-black uppercase"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                          />
                                          <button onClick={() => saveEdit(student.id)} className="bg-blue-600 text-white px-2 py-1 rounded text-[9px] font-black">V</button>
                                          <button onClick={cancelEdit} className="bg-slate-200 px-2 py-1 rounded text-[9px] font-black">X</button>
                                        </div>
                                      ) : isConfirmingDelete ? (
                                        <div className="flex-1 flex gap-2">
                                          <span className="text-[10px] font-black text-red-600 uppercase">EXCLUIR?</span>
                                          <button onClick={() => { onDeleteStudent(student.id); setConfirmDeleteId(null); }} className="bg-red-600 text-white px-2 py-1 rounded text-[9px] font-black uppercase">SIM</button>
                                          <button onClick={() => setConfirmDeleteId(null)} className="bg-slate-200 px-2 py-1 rounded text-[9px] font-black uppercase">NÃO</button>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex items-center gap-2 truncate flex-1">
                                            <span className="text-[10px] font-mono font-black text-slate-300">{String(sIdx + 1).padStart(2, '0')}</span>
                                            <span className="uppercase font-black text-[11px] text-slate-800 tracking-tight truncate">{student.name}</span>
                                          </div>
                                          <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => startEdit(student)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                            <button onClick={() => setConfirmDeleteId(student.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${progressPct === 100 ? 'bg-green-500' : 'bg-[#004B95]'}`} style={{ width: `${progressPct}%` }} />
                                        </div>
                                        <span className="text-[8px] font-black text-slate-400">{progressPct}%</span>
                                    </div>
                                </div>
                            </td>
                            {operations.map(op => {
                                const record = student.demonstrations[op.id] || { status: DemonstrationStatus.PENDING, date: null };
                                const isDone = record.status === DemonstrationStatus.DONE;
                                return (
                                    <td key={`${student.id}-${op.id}`} className={`border-r border-b border-slate-100 p-1 text-center ${isDone ? 'bg-green-50/30' : ''}`}>
                                        <div className={`w-full h-12 rounded-lg border-2 flex flex-col items-center justify-center relative overflow-hidden ${isDone ? 'bg-green-500 border-green-700 text-white shadow-md' : 'bg-white border-slate-100 text-slate-200'}`}>
                                            {isDone ? (<><span className="text-[10px] font-black uppercase">OK</span><span className="text-[8px] font-black mt-1">{record.date}</span></>) : (<span className="text-[9px] font-black uppercase opacity-20">{op.id}</span>)}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GeneralSummaryModal;
