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
    const unsubscribe = onValue(ref(db, 'students'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStudents(Object.keys(data).map(key => ({ ...data[key], id: key, demonstrations: data[key].demonstrations || {} })));
      } else {
        setStudents([]);
      }
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  const classStudents = useMemo(() => {
    return students.filter(s => s.classId === activeClassId).sort((a, b) => a.name.localeCompare(b.name));
  }, [students, activeClassId]);

  const activeClass = useMemo(() => classes.find(c => c.id === activeClassId), [activeClassId, classes]);

  // Componente de Logo Otimizado para Tablet
  const SenaiLogo = ({ size = "normal" }: { size?: "small" | "normal" }) => (
    <div className={`bg-[#E30613] text-white ${size === 'small' ? 'px-4 py-1.5 text-xl' : 'px-6 py-2 text-3xl'} font-black italic skew-x-[-12deg] shadow-lg inline-block`}>
      SENAI
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
          <div className="bg-[#004B95] p-8 text-center">
            <SenaiLogo />
            <h1 className="text-white font-black text-lg uppercase mt-6 leading-tight">Mecânico de Usinagem</h1>
          </div>
          <form onSubmit={handleLogin} className="p-6">
            <input 
              type="password" 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="SENHA"
              className="w-full bg-slate-100 border-2 rounded-xl p-4 text-center font-bold text-xl outline-none focus:border-[#004B95]"
            />
            <button type="submit" className="w-full bg-[#004B95] text-white font-black py-4 rounded-xl mt-4 uppercase tracking-widest text-sm shadow-lg">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      {/* Header Compacto para Tablet */}
      <header className="bg-[#004B95] shadow-xl sticky top-0 z-50 border-b-4 border-[#E30613]">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <SenaiLogo size="small" />
          
          <div className="flex items-center gap-2">
            <div className="flex bg-black/20 p-1 rounded-lg">
              {['MA', 'MB', 'TA', 'TB'].map((label, i) => (
                <button 
                  key={classes[i].id} 
                  onClick={() => setActiveClassId(classes[i].id)} 
                  className={`px-3 py-1.5 rounded-md text-[10px] font-black ${activeClassId === classes[i].id ? 'bg-white text-[#004B95]' : 'text-white/60'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button onClick={handleLogout} className="bg-red-600 text-white p-2 rounded-lg"><span className="sr-only">Sair</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
              {activeClass?.name.split(' - ')[1] || "Turma"}
            </h2>
            <button onClick={() => setIsSummaryOpen(true)} className="bg-[#004B95] text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow-md">Painel</button>
          </div>
          
          <form onSubmit={handleAddStudent} className="flex gap-2">
            <input 
              type="text" 
              value={newStudentName} 
              onChange={(e) => setNewStudentName(e.target.value)} 
              placeholder="NOVO ALUNO..." 
              className="flex-1 bg-white border-2 border-slate-200 px-4 py-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-[#E30613]" 
            />
            <button type="submit" className="bg-[#E30613] text-white px-6 rounded-xl font-black text-sm shadow-md">ADD</button>
          </form>
        </div>

        {/* Grid de Operações otimizado para Tablet (2 colunas em telas menores) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

      {/* Modais ajustados internamente nos seus respectivos arquivos para max-w-full ou max-w-lg */}
      {isModalOpen && selectedOp && (
        <StudentChecklistModal 
          operation={selectedOp} 
          students={classStudents} 
          onClose={() => setIsModalOpen(false)} 
          onToggleStatus={(id) => {
             const student = students.find(s => s.id === id);
             const isDone = student?.demonstrations?.[selectedOp.id]?.status === DemonstrationStatus.DONE;
             set(ref(db, `students/${id}/demonstrations/${selectedOp.id}`), {
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
