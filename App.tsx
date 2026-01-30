
import React, { useState, useEffect, useMemo } from 'react';
import { ClassRoom, Student, Operation, DemonstrationStatus } from './types';
import { INITIAL_CLASSES, INITIAL_OPERATIONS } from './constants';
import OperationCard from './components/OperationCard';
import StudentChecklistModal from './components/StudentChecklistModal';
import GeneralSummaryModal from './components/GeneralSummaryModal';

const App: React.FC = () => {
  const [classes] = useState<ClassRoom[]>(INITIAL_CLASSES);
  const [activeClassId, setActiveClassId] = useState<string>(INITIAL_CLASSES[0].id);
  const [operations] = useState<Operation[]>(INITIAL_OPERATIONS);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  // Carregar dados do LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('senai_track_v_dashboard');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setStudents(parsed);
      } catch (e) {
        console.error("Erro ao carregar dados do armazenamento local");
      }
    }
  }, []);

  // Salvar dados no LocalStorage sempre que houver mudança
  useEffect(() => {
    localStorage.setItem('senai_track_v_dashboard', JSON.stringify(students));
  }, [students]);

  const classStudents = useMemo(() => {
    return students.filter(s => s.classId === activeClassId)
                   .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, activeClassId]);

  const activeClass = useMemo(() => 
    classes.find(c => c.id === activeClassId), 
    [activeClassId, classes]
  );

  const handleOpenOp = (op: Operation) => {
    setSelectedOp(op);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (studentId: string, opId: string) => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}`;

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const isDone = s.demonstrations[opId]?.status === DemonstrationStatus.DONE;
        return {
          ...s,
          demonstrations: {
            ...s.demonstrations,
            [opId]: { 
              status: isDone ? DemonstrationStatus.PENDING : DemonstrationStatus.DONE, 
              date: isDone ? null : formattedDate 
            }
          }
        };
      }
      return s;
    }));
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newStudentName.trim().toUpperCase();
    if (!name) return;

    const newStudent: Student = {
      id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name,
      classId: activeClassId,
      demonstrations: {}
    };

    setStudents(prev => [...prev, newStudent]);
    setNewStudentName('');
  };

  const onUpdateStudentName = (id: string, newName: string) => {
    const sanitized = newName.trim().toUpperCase();
    if (!sanitized) return;
    setStudents(prev => prev.map(s => s.id === id ? { ...s, name: sanitized } : s));
  };

  const onDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <header className="bg-[#004B95] shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between">
          {/* Logo SENAI */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-[#E30613] text-white px-4 py-1 font-black text-xl sm:text-2xl italic skew-x-[-12deg] shadow-lg">
              SENAI
            </div>
          </div>

          {/* Título Centralizado Solicitado */}
          <div className="flex flex-col items-center justify-center text-center flex-1 px-2">
            <h1 className="text-white font-black text-xs sm:text-lg uppercase tracking-tight leading-none">
              Mecânico de Usinagem
            </h1>
            <h2 className="text-white/70 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-1 border-t border-white/20 pt-1 w-full max-w-[150px] sm:max-w-[200px]">
              Convencional
            </h2>
          </div>

          {/* Seleção de Turmas */}
          <div className="flex bg-black/20 p-1 rounded-xl gap-1 shrink-0">
            {classes.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveClassId(c.id)}
                className={`px-2 sm:px-4 py-2 rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeClassId === c.id ? 'bg-white text-[#004B95] shadow-lg' : 'text-white/60 hover:text-white'
                }`}
              >
                {c.name.replace('Manhã Turma ', 'M').replace('Tarde Turma ', 'T')}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b-2 border-slate-200 pb-8">
          <div className="flex-1">
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">
              {activeClass?.name}
            </h2>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsSummaryOpen(true)}
                className="bg-[#004B95] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg transition-all active:scale-95"
              >
                Painel Analítico
              </button>
            </div>
          </div>

          <form onSubmit={handleAddStudent} className="flex gap-2 shrink-0">
            <input 
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="NOME DO NOVO ALUNO..."
              className="bg-white border-2 border-slate-200 px-6 py-3 rounded-xl text-xs font-black uppercase w-48 sm:w-64 focus:border-[#E30613] outline-none shadow-sm transition-all"
            />
            <button type="submit" className="bg-[#E30613] text-white px-6 rounded-xl font-black text-xs uppercase hover:brightness-110 active:scale-95 shadow-lg">
              ADICIONAR
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {operations.map(op => {
            const completedCount = classStudents.filter(s => s.demonstrations[op.id]?.status === DemonstrationStatus.DONE).length;
            return (
              <OperationCard 
                key={op.id} 
                operation={op} 
                totalStudents={classStudents.length} 
                completedCount={completedCount}
                onClick={() => handleOpenOp(op)}
              />
            );
          })}
        </div>
      </main>

      {isModalOpen && selectedOp && (
        <StudentChecklistModal 
          key={`modal-op-${selectedOp.id}`}
          operation={selectedOp}
          students={classStudents}
          onClose={() => setIsModalOpen(false)}
          onToggleStatus={(id) => handleUpdateStatus(id, selectedOp.id)}
          onDeleteStudent={onDeleteStudent}
          onUpdateStudentName={onUpdateStudentName}
        />
      )}

      {isSummaryOpen && (
        <GeneralSummaryModal 
          activeClass={activeClass!}
          students={classStudents}
          operations={operations}
          onClose={() => setIsSummaryOpen(false)}
          onDeleteStudent={onDeleteStudent}
          onUpdateStudentName={onUpdateStudentName}
        />
      )}
    </div>
  );
};

export default App;
