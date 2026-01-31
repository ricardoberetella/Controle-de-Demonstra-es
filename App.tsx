import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import { ClassRoom, Student, Operation, DemonstrationStatus } from './types';
import { INITIAL_CLASSES, INITIAL_OPERATIONS } from './constants';
import OperationCard from './components/OperationCard';
import StudentChecklistModal from './components/StudentChecklistModal';
import GeneralSummaryModal from './components/GeneralSummaryModal';

const firebaseConfig = {
  apiKey: "AIzaSyB0i38lQMhE9UgUIh5rqmZAuu1Z-KXUcI0",
  authDomain: "controle-de-demonstracao.firebaseapp.com",
  databaseURL: "https://controle-de-demonstracao-default-rtdb.firebaseio.com",
  projectId: "controle-de-demonstracao",
  storageBucket: "controle-de-demonstracao.firebasestorage.app",
  messagingSenderId: "804320803586",
  appId: "1:804320803586:web:82832e71ff3fef9e81a01b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const App: React.FC = () => {
  // CORREÇÃO: Persistência de login para não deslogar ao atualizar
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auth_demonstracao') === 'true';
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [classes] = useState<ClassRoom[]>(INITIAL_CLASSES);
  const [activeClassId, setActiveClassId] = useState<string>(INITIAL_CLASSES[0].id);
  const [operations] = useState<Operation[]>(INITIAL_OPERATIONS);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "ianes662") {
      setIsAuthenticated(true);
      localStorage.setItem('auth_demonstracao', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('auth_demonstracao');
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const studentsRef = ref(db, 'students');
    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStudents(Object.keys(data).map(key => ({
          ...data[key],
          id: key,
          demonstrations: data[key].demonstrations || {}
        })));
      } else {
        setStudents([]);
      }
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  const classStudents = useMemo(() => {
    return students.filter(s => s.classId === activeClassId)
                   .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, activeClassId]);

  const activeClass = useMemo(() => classes.find(c => c.id === activeClassId), [activeClassId, classes]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    push(ref(db, 'students'), {
      name: newStudentName.trim().toUpperCase(),
      classId: activeClassId,
      demonstrations: {}
    }).then(() => setNewStudentName(''));
  };

  // Componente de Logo (Estilo solicitado, fundo vermelho e grande)
  const SenaiLogo = () => (
    <div className="bg-[#E30613] text-white px-8 py-3 font-black text-4xl italic skew-x-[-12deg] shadow-xl inline-block select-none">
      SENAI
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-[#004B95] p-10 text-center">
            <SenaiLogo />
            <h1 className="text-white font-black text-xl uppercase tracking-tight mt-8">Mecânico de Usinagem</h1>
          </div>
          <form onSubmit={handleLogin} className="p-8">
            <input 
              type="password" 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-slate-100 border-2 rounded-xl p-4 text-center font-bold text-2xl outline-none"
              placeholder="SENHA"
            />
            <button type="submit" className="w-full bg-[#004B95] text-white font-black py-5 rounded-xl mt-6 uppercase shadow-lg">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-10">
      {/* Header mantido com o layout original, mas ajustado para tablet */}
      <header className="bg-[#004B95] shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-28 flex items-center justify-between">
          <SenaiLogo />
          
          <div className="hidden md:block text-center flex-1">
            <h1 className="text-white font-black text-xl uppercase italic">Controle de Demonstrações</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-black/20 p-1 rounded-xl">
              {['MA', 'MB', 'TA', 'TB'].map((label, i) => (
                <button 
                  key={classes[i]?.id} 
                  onClick={() => setActiveClassId(classes[i]?.id)} 
                  className={`px-3 py-2 rounded-lg text-xs font-black ${activeClassId === classes[i]?.id ? 'bg-white text-[#004B95]' : 'text-white/60'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button onClick={handleLogout} className="text-white/70 font-black text-xs border border-white/20 px-3 py-2 rounded-lg hover:bg-white/10 uppercase">Sair</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
              {activeClass?.name}
            </h2>
            <button onClick={() => setIsSummaryOpen(true)} className="bg-[#004B95] text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase mt-2 shadow-lg">Painel Analítico</button>
          </div>
          
          <form onSubmit={handleAddStudent} className="flex gap-2">
            <input 
              type="text" 
              value={newStudentName} 
              onChange={(e) => setNewStudentName(e.target.value)} 
              placeholder="NOME DO ALUNO..." 
              className="bg-white border-2 border-slate-200 px-4 py-3 rounded-xl text-xs font-black uppercase w-full md:w-64 outline-none focus:border-[#E30613]" 
            />
            <button type="submit" className="bg-[#E30613] text-white px-6 rounded-xl font-black text-xs uppercase shadow-lg">ADD</button>
          </form>
        </div>

        {/* Grid ajustado para 2 colunas no tablet de 7 polegadas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {operations.map(op => (
            <OperationCard 
              key={op.id} 
              operation={op} 
              totalStudents={classStudents.length} 
              completedCount={classStudents.filter(s => s.demonstrations?.[op.id]?.status === DemonstrationStatus.DONE).length} 
              onClick={() => { setSelectedOp(op); setIsModalOpen(true); }} 
            />
          ))}
        </div>
      </main>

      {/* Modais (Importados dos seus componentes existentes) */}
      {isModalOpen && selectedOp && (
        <StudentChecklistModal 
          operation={selectedOp} 
          students={classStudents} 
          onClose={() => setIsModalOpen(false)} 
          onToggleStatus={(studentId) => {
             const student = students.find(s => s.id === studentId);
             const isDone = student?.demonstrations?.[selectedOp.id]?.status === DemonstrationStatus.DONE;
             set(ref(db, `students/${studentId}/demonstrations/${selectedOp.id}`), {
               status: isDone ? DemonstrationStatus.PENDING : DemonstrationStatus.DONE,
               date: isDone ? null : `${new Date().getDate()}/${new Date().getMonth()+1}`
             });
          }} 
          onDeleteStudent={(id) => window.confirm("Excluir?") && remove(ref(db, `students/${id}`))} 
          onUpdateStudentName={(id, name) => update(ref(db, `students/${id}`), { name: name.toUpperCase() })} 
        />
      )}
      
      {isSummaryOpen && (
        <GeneralSummaryModal 
          activeClass={activeClass!} 
          students={classStudents} 
          operations={operations} 
          onClose={() => setIsSummaryOpen(false)} 
          onDeleteStudent={(id) => window.confirm("Excluir?") && remove(ref(db, `students/${id}`))} 
          onUpdateStudentName={(id, name) => update(ref(db, `students/${id}`), { name: name.toUpperCase() })} 
        />
      )}
    </div>
  );
};

export default App;
