import React, { useState, useEffect, useMemo } from 'react';
// Importação via CDN para garantir compatibilidade total no navegador
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import { ClassRoom, Student, Operation, DemonstrationStatus } from './types';
import { INITIAL_CLASSES, INITIAL_OPERATIONS } from './constants';
import OperationCard from './components/OperationCard';
import StudentChecklistModal from './components/StudentChecklistModal';
import GeneralSummaryModal from './components/GeneralSummaryModal';

// Configuração do seu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB0i38lQMhE9UgUIh5rqmZAuu1Z-KXUcI0",
  authDomain: "controle-de-demonstracao.firebaseapp.com",
  databaseURL: "https://controle-de-demonstracao-default-rtdb.firebaseio.com",
  projectId: "controle-de-demonstracao",
  storageBucket: "controle-de-demonstracao.firebasestorage.app",
  messagingSenderId: "804320803586",
  appId: "1:804320803586:web:82832e71ff3fef9e81a01b"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const App: React.FC = () => {
  const [classes] = useState<ClassRoom[]>(INITIAL_CLASSES);
  const [activeClassId, setActiveClassId] = useState<string>(INITIAL_CLASSES[0].id);
  const [operations] = useState<Operation[]>(INITIAL_OPERATIONS);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  // 1. BUSCAR DADOS (Sincronização em tempo real com travas contra erros)
  useEffect(() => {
    const studentsRef = ref(db, 'students');
    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const firebaseStudents = Object.keys(data).map(key => ({
          ...data[key],
          id: key,
          // Garante que demonstrations nunca seja nulo (evita erro de tela branca)
          demonstrations: data[key].demonstrations || {}
        }));
        setStudents(firebaseStudents);
      } else {
        setStudents([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filtra os alunos pela turma ativa
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

  // 2. ATUALIZAR STATUS (Marcação de concluído/pendente)
  const handleUpdateStatus = (studentId: string, opId: string) => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Checa se já está marcado como feito
    const currentStatus = student.demonstrations?.[opId]?.status;
    const isDone = currentStatus === DemonstrationStatus.DONE;
    
    const statusRef = ref(db, `students/${studentId}/demonstrations/${opId}`);

    set(statusRef, {
      status: isDone ? DemonstrationStatus.PENDING : DemonstrationStatus.DONE,
      date: isDone ? null : formattedDate
    });
  };

  // 3. ADICIONAR ALUNO
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newStudentName.trim().toUpperCase();
    if (!name) return;

    const studentsRef = ref(db, 'students');
    const newStudentRef = push(studentsRef);

    set(newStudentRef, {
      name: name,
      classId: activeClassId,
      demonstrations: {} // Inicia sem marcações
    }).then(() => setNewStudentName(''));
  };

  // 4. EDITAR NOME DO ALUNO
  const onUpdateStudentName = (id: string, newName: string) => {
    const sanitized = newName.trim().toUpperCase();
    if (!sanitized) return;
    update(ref(db, `students/${id}`), { name: sanitized });
  };

  // 5. DELETAR ALUNO
  const onDeleteStudent = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este aluno?")) {
      remove(ref(db, `students/${id}`));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      {/* CABEÇALHO */}
      <header className="bg-[#004B95] shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-[#E30613] text-white px-4 py-1 font-black text-xl sm:text-2xl italic skew-x-[-12deg] shadow-lg">
              SENAI
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center flex-1 px-2">
            <h1 className="text-white font-black text-xs sm:text-lg uppercase tracking-tight leading-none">
              Mecânico de Usinagem
            </h1>
            <h2 className="text-white/70 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-1 border-t border-white/20 pt-1 w-full max-w-[150px] sm:max-w-[200px]">
              Convencional
            </h2>
          </div>

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

      {/* CONTEÚDO PRINCIPAL */}
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

        {/* GRID DE OPERAÇÕES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {operations.map(op => {
            const completedCount = classStudents.filter(s => s.demonstrations?.[op.id]?.status === DemonstrationStatus.DONE).length;
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

      {/* MODAL DE CHECKLIST (POR ALUNO) */}
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

      {/* MODAL DE RESUMO GERAL */}
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
