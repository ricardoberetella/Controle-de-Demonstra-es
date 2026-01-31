import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import { Student, Operation, DemonstrationStatus } from './types';
import { INITIAL_OPERATIONS } from './constants';
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auth_demonstracao') === 'true';
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [activeClassId, setActiveClassId] = useState<string>('MA'); // Padrão MA
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
    } else {
      alert("Senha incorreta");
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('auth_demonstracao');
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubscribe = onValue(ref(db, 'students'), (snapshot) => {
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
    return students.filter(s => s.classId === activeClassId).sort((a, b) => a.name.localeCompare(b.name));
  }, [students, activeClassId]);

  const SenaiLogo = () => (
    <div className="bg-[#E30613] text-white px-6 py-2 font-black text-3xl italic skew-x-[-12deg] shadow-xl inline-block">
      SENAI
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-center">
          <div className="bg-[#004B95] p-10">
            <SenaiLogo />
            <div className="mt-8">
              <h1 className="text-white font-black text-xl uppercase">Mecânico de Usinagem Convencional</h1>
              <p className="text-white/70 font-bold text-xs uppercase mt-2">Controle de Demonstrações</p>
            </div>
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
      <header className="bg-[#004B95] shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-28 flex items-center justify-between">
          <SenaiLogo />
          
          <div className="hidden lg:block text-center">
            <h1 className="text-white font-black text-xl uppercase italic">Mecânico de Usinagem Convencional</h1>
            <p className="text-white/60 font-bold text-xs uppercase">Controle de Demonstrações</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-black/20 p-1 rounded-xl">
              {['MA', 'MB', 'TA', 'TB'].map((label) => (
                <button 
                  key={label} 
                  onClick={() => setActiveClassId(label)} 
                  className={`px-3 py-2 rounded-lg text-xs font-black transition-colors ${activeClassId === label ? 'bg-white text-[#004B95]' : 'text-white/60'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button onClick={handleLogout} className="text-white bg-red-600 p-2 rounded-lg ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-black text-[#004B95] uppercase italic">TURMA {activeClassId}</h2>
            <button onClick={() => setIsSummaryOpen(true)} className="text-[10px] font-black bg-slate-200 text-slate-600 px-3 py-1 rounded-lg uppercase tracking-wider">Painel</button>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!newStudentName.trim()) return;
            push(ref(db, 'students'), { name: newStudentName.trim().toUpperCase(), classId: activeClassId, demonstrations: {} });
            setNewStudentName('');
          }} className="flex gap-2">
            <input 
              type="text" 
              value={newStudentName} 
              onChange={(e) => setNewStudentName(e.target.value)} 
              placeholder="NOME DO ALUNO..." 
              className="flex-1 bg-white border-2 border-slate-200 px-4 py-3 rounded-xl text-xs font-bold uppercase outline-none focus:border-[#E30613]" 
            />
            <button type="submit" className="bg-[#E30613] text-white px-5 rounded-xl font-black text-xs uppercase shadow-md">ADD</button>
          </form>
        </div>

        {/* Grid para Tablet 7" (2 colunas) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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

      {isModalOpen && selectedOp && (
        <StudentChecklistModal 
          operation={selectedOp} 
          students={classStudents} 
          onClose={() => setIsModalOpen(false)} 
          onToggleStatus={(id) => {
            const student = students.find(s => s.id === id);
            const isDone = student?.demonstrations?.[selectedOp.id]?.status === DemonstrationStatus.DONE;
            update(ref(db, `students/${id}/demonstrations/${selectedOp.id}`), {
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
          activeClass={{id: activeClassId, name: activeClassId}} 
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
