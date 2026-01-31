import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- Configuração Firebase ---
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

// --- Constantes ---
const CLASSES = [
  { id: 'MA', name: 'MANHÃ - TURMA A' },
  { id: 'MB', name: 'MANHÃ - TURMA B' },
  { id: 'TA', name: 'TARDE - TURMA A' },
  { id: 'TB', name: 'TARDE - TURMA B' }
];

const OPERATIONS = Array.from({ length: 16 }, (_, i) => ({
  id: `op${i + 1}`,
  title: `OPERAÇÃO ${(i + 1).toString().padStart(2, '0')}`,
  category: i < 8 ? 'TORNO' : 'FRESA'
}));

const App = () => {
  // Persistência de Login (Não sai ao atualizar)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('senai_auth') === 'true';
  });
  
  const [passwordInput, setPasswordInput] = useState('');
  const [activeClassId, setActiveClassId] = useState('MA');
  const [students, setStudents] = useState([]);
  const [newStudentName, setNewStudentName] = useState('');

  // Sincronização com Firebase
  useEffect(() => {
    if (!isAuthenticated) return;
    const studentsRef = ref(db, 'students');
    return onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStudents(Object.entries(data).map(([id, val]) => ({ id, ...val })));
      } else {
        setStudents([]);
      }
    });
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === "ianes662") {
      setIsAuthenticated(true);
      localStorage.setItem('senai_auth', 'true');
    } else {
      alert("Senha incorreta!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('senai_auth');
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    push(ref(db, 'students'), {
      name: newStudentName.toUpperCase(),
      classId: activeClassId,
      demonstrations: {}
    });
    setNewStudentName('');
  };

  const filteredStudents = useMemo(() => 
    students.filter(s => s.classId === activeClassId), 
  [students, activeClassId]);

  // Componente de Logo (Maior e fiel ao anexo)
  const Logo = ({ className = "" }) => (
    <div className={`bg-[#E30613] text-white font-black italic px-6 py-2 flex items-center justify-center shadow-xl ${className}`} 
         style={{ transform: 'skewX(-10deg)', minWidth: '180px' }}>
      <span style={{ fontSize: '2.5rem', letterSpacing: '-2px' }}>SENAI</span>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center border-t-8 border-[#004B95]">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          <h2 className="text-[#004B95] font-black uppercase text-xl mb-6">Acesso ao Sistema</h2>
          <input 
            type="password" 
            placeholder="SENHA" 
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full p-4 bg-slate-100 border-2 border-slate-200 rounded-xl mb-4 text-center font-bold text-lg focus:border-[#004B95] outline-none"
          />
          <button className="w-full bg-[#004B95] text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-transform uppercase">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header ajustado para Tablet 7" */}
      <header className="bg-[#004B95] p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <Logo className="scale-75 sm:scale-100 origin-left" />
          
          <div className="flex bg-white/10 p-1 rounded-xl">
            {CLASSES.map(c => (
              <button 
                key={c.id}
                onClick={() => setActiveClassId(c.id)}
                className={`px-3 py-2 rounded-lg text-xs font-black transition-all ${activeClassId === c.id ? 'bg-white text-[#004B95] shadow-md' : 'text-white/60'}`}
              >
                {c.id}
              </button>
            ))}
          </div>

          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase active:scale-90">
            Sair
          </button>
        </div>
      </header>

      {/* Área Principal */}
      <main className="p-4 max-w-6xl mx-auto w-full">
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between border-b-4 border-[#E30613]">
          <h1 className="text-[#004B95] font-black text-lg italic uppercase">
            {CLASSES.find(c => c.id === activeClassId)?.name}
          </h1>
          
          <form onSubmit={handleAddStudent} className="flex w-full sm:w-auto gap-2">
            <input 
              type="text" 
              placeholder="NOME DO ALUNO" 
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="flex-1 sm:w-64 p-3 bg-slate-100 border-2 border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-[#004B95]"
            />
            <button className="bg-[#E30613] text-white px-6 py-3 rounded-xl font-black text-sm shadow-md active:scale-95">
              ADD
            </button>
          </form>
        </div>

        {/* Grid de Operações Otimizado para 7 polegadas (2 colunas) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {OPERATIONS.map(op => (
            <div key={op.id} className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 active:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black bg-blue-100 text-[#004B95] px-2 py-1 rounded-md">{op.category}</span>
                <span className="text-[10px] font-bold text-slate-400">{op.id.toUpperCase()}</span>
              </div>
              <h3 className="font-black text-xs text-slate-800 leading-tight h-8 mb-3 uppercase">{op.title}</h3>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
