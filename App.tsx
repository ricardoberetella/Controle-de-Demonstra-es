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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    const SENHA_MESTRA = "ianes662"; 
    if (passwordInput === SENHA_MESTRA) {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const studentsRef = ref(db, 'students');
    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const firebaseStudents = Object.keys(data).map(key => ({
          ...data[key],
          id: key,
          demonstrations: data[key].demonstrations || {}
        }));
        setStudents(firebaseStudents);
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

  const activeClass = useMemo(() => 
    classes.find(c => c.id === activeClassId), 
    [activeClassId, classes]
  );

  const handleUpdateStatus = (studentId: string, opId: string) => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const isDone = student.demonstrations?.[opId]?.status === DemonstrationStatus.DONE;
    const statusRef = ref(db, `students/${studentId}/demonstrations/${opId}`);
    set(statusRef, {
      status: isDone ? DemonstrationStatus.PENDING : DemonstrationStatus.DONE,
      date: isDone ? null : formattedDate
    });
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newStudentName.trim().toUpperCase();
    if (!name) return;
    const studentsRef = ref(db, 'students');
    push(studentsRef, {
      name: name,
      classId: activeClassId,
      demonstrations: {}
    }).then(() => setNewStudentName(''));
  };

  const onUpdateStudentName = (id: string, newName: string) => {
    const sanitized = newName.trim().toUpperCase();
    if (!sanitized) return;
    update(ref(db, `students/${id}`), { name: sanitized });
  };

  const onDeleteStudent = (id: string) => {
    if (window.confirm("Excluir aluno?")) {
      remove(ref(db, `students/${id}`));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
          <div className="bg-[#004B95] p-8 text-center">
            <div className="inline-block bg-[#E30613] text-white px-4 py-1 font-black text-xl italic skew-x-[-12deg] mb-6 shadow-lg">
              SENAI
            </div>
            <h1 className="text-white font-black text-xl uppercase tracking-tight leading-tight">
              Mecânico de Usinagem Convencional
            </h1>
            <p className="text-white/70 font-bold text-xs uppercase tracking-[0.2em] mt-2 italic">
              controle de demonstrações
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="p-8">
            <label className="block text-slate-500 font-bold text-[10px] uppercase mb-3 tracking-widest text-center">
              Digite a senha de acesso
            </label>
            <input 
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className={`w-full bg-slate-100 border-2 ${loginError ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-4 outline-none focus:border-[#004B95] text-center font-bold text-2xl transition-all shadow-inner`}
              autoFocus
            />
            {loginError && <p className="text-red-500 text-[10px] font-black mt-3 text-center uppercase animate-bounce">Senha incorreta!</p>}
            
            <button 
              type="submit" 
              className="w-full bg-[#004B95] text-white font-black py-5 rounded-xl mt-6 hover:bg-blue-800 transition-all active:scale-95 shadow-lg uppercase tracking-widest text-sm"
            >
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <header className="bg-[#004B95] shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between gap-4">
          <div className="flex items-center shrink-0">
             <div className="bg-[#E30613] text-white px-4 py-1 font-black text-xl italic skew-x-[-12deg] shadow-lg">SENAI</div>
          </div>
          
          <div className="hidden lg:flex flex-col items-center justify-center text-center flex-1">
            <h1 className="text-white font-black text-lg uppercase tracking-tight leading-none">
              Mecânico de Usinagem Convencional
            </h1>
            <p className="text-white/60 font-bold text-xs uppercase tracking-[0.1em] mt-1 border-t border-white/10 pt-1 w-full max-w-[200px]">
              controle de demonstrações
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-black/20 p-1 rounded-xl gap-1">
              {classes.map((c, index) => (
                <button 
                  key={c.id} 
                  onClick={() => setActiveClassId(c.id)} 
                  className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all whitespace-nowrap ${activeClassId === c.id ? 'bg-white text-[#004B95] shadow-md' : 'text-white/60 hover:text-white'}`}
                >
                  {/* Siglas curtas apenas nos botões do topo para não poluir */}
                  {index === 0 ? 'MA' : index === 1 ? 'MB' : index === 2 ? 'TA' : 'TB'}
                </button>
              ))}
            </div>
            <button onClick={handleLogout} className="text-white/70 hover:text-white text-[9px] font-black uppercase border border-white/20 px-3 py-2 rounded-lg transition-all hover:bg-white/10 shrink-0">Sair</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b-2 border-slate-200 pb-8">
          <div className="flex-1">
            {/* TÍTULO COMPLETO LOGO ACIMA DO BOTÃO PAINEL ANALÍTICO */}
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">
              {activeClass?.name === "Manhã - Turma A" ? "Manhã Turma A" :
               activeClass?.name === "Manhã - Turma B" ? "Manhã Turma B" :
               activeClass?.name === "Tarde - Turma A" ? "Tarde Turma A" :
               activeClass?.name === "Tarde - Turma B" ? "Tarde Turma B" : activeClass?.name}
            </h2>
            <button onClick={() => setIsSummaryOpen(true)} className="bg-[#004B95] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all">
              Painel Analítico
            </button>
          </div>
          
          <form onSubmit={handleAddStudent} className="flex gap-2">
            <input 
              type="text" 
              value={newStudentName} 
              onChange={(e) => setNewStudentName(e.target.value)} 
              placeholder="NOVO ALUNO..." 
              className="bg-white border-2 border-slate-200 px-6 py-3 rounded-xl text-xs font-black uppercase w-64 focus:border-[#E30613] outline-none shadow-sm" 
            />
            <button type="submit" className="bg-[#E30613] text-white px-6 rounded-xl font-black text-xs uppercase shadow-lg hover:brightness-110 active:scale-95 transition-all">ADD</button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
