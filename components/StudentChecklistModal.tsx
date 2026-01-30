
import React, { useState } from 'react';
import { Student, Operation, DemonstrationStatus } from '../types';

interface StudentChecklistModalProps {
  operation: Operation;
  students: Student[];
  onClose: () => void;
  onToggleStatus: (studentId: string) => void;
  onDeleteStudent: (id: string) => void;
  onUpdateStudentName: (id: string, newName: string) => void;
}

const StudentChecklistModal: React.FC<StudentChecklistModalProps> = ({ 
  operation, 
  students, 
  onClose, 
  onToggleStatus, 
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

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={onClose} />
      
      <div 
        className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="bg-[#1e293b] p-7 text-white shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <span className="bg-[#E30613] text-white px-4 py-1 font-black italic rounded-lg text-xl">
                OP. {operation.id}
              </span>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">
                {operation.name}
              </h2>
            </div>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-all">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
          {students.length === 0 ? (
            <div className="text-center py-20 text-slate-300 font-black uppercase text-sm italic tracking-widest">
              TURMA VAZIA
            </div>
          ) : (
            students.map((student) => {
              const record = student.demonstrations[operation.id];
              const isDone = record?.status === DemonstrationStatus.DONE;
              const isEditing = editingId === student.id;
              const isConfirmingDelete = confirmDeleteId === student.id;

              return (
                <div 
                  key={student.id} 
                  className={`flex flex-col items-stretch p-5 rounded-[1.5rem] border-2 transition-all shadow-sm ${
                    isDone ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input 
                            autoFocus
                            className="flex-1 bg-white border-2 border-blue-500 rounded-lg px-3 py-1 font-black uppercase text-slate-800 outline-none"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(student.id)}
                          />
                          <button onClick={() => saveEdit(student.id)} className="bg-blue-600 text-white px-3 rounded-lg text-[10px] font-black uppercase">SALVAR</button>
                          <button onClick={cancelEdit} className="bg-slate-200 text-slate-600 px-3 rounded-lg text-[10px] font-black uppercase">X</button>
                        </div>
                      ) : (
                        <div>
                          <h5 className={`font-black uppercase text-base truncate ${isDone ? 'text-green-800' : 'text-slate-800'}`}>
                            {student.name}
                          </h5>
                          {isDone && (
                            <span className="text-[10px] font-black text-green-600 block mt-1 uppercase tracking-wider italic">
                              ✓ {record.date}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-2 shrink-0">
                        {isConfirmingDelete ? (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => { onDeleteStudent(student.id); setConfirmDeleteId(null); }}
                              className="bg-red-600 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase"
                            >
                              CONFIRMAR EXCLUIR?
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)} className="bg-slate-200 px-3 py-2 rounded-lg text-[9px] font-black">NÃO</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => startEdit(student)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                            <button onClick={() => setConfirmDeleteId(student.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            <div className="w-px h-6 bg-slate-200 mx-1"></div>
                            <button
                              onClick={() => onToggleStatus(student.id)}
                              className={`h-10 px-5 rounded-xl font-black text-[11px] uppercase transition-all border-2 ${
                                isDone ? 'bg-green-600 border-green-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
                              }`}
                            >
                              {isDone ? 'OK' : 'MARCAR'}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-white">
          <button onClick={onClose} className="w-full py-4 text-[12px] font-black uppercase text-slate-400 bg-slate-50 rounded-2xl">FECHAR</button>
        </div>
      </div>
    </div>
  );
};

export default StudentChecklistModal;
