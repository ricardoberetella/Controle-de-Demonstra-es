import React, { useState, useEffect, useMemo } from 'react';
// Importação padrão para React/Vite
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, remove, update } from "firebase/database";

import { ClassRoom, Student, Operation, DemonstrationStatus } from './types';
import { INITIAL_CLASSES, INITIAL_OPERATIONS } from './constants';
import OperationCard from './components/OperationCard';
import StudentChecklistModal from './components/StudentChecklistModal';
import GeneralSummaryModal from './components/GeneralSummaryModal';

// Suas chaves (já conferidas)
const firebaseConfig = {
  apiKey: "AIzaSyB0i38lQMhE9UgUIh5rqmZAuu1Z-KXUcI0",
  authDomain: "controle-de-demonstracao.firebaseapp.com",
  databaseURL: "https://controle-de-demonstracao-default-rtdb.firebaseio.com",
  projectId: "controle-de-demonstracao",
  storageBucket: "controle-de-demonstracao.firebasestorage.app",
  messagingSenderId: "804320803586",
  appId: "1:804320803586:web:82832e71ff3fef9e81a01b",
  measurementId: "G-KXRZLERB76"
};

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

  // Carregar dados em tempo real
  useEffect(() => {
    const studentsRef = ref(db, 'students');
    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const firebaseStudents = Object.keys(data).map(key => ({
          ...data[key],
          id: key 
        }));
        setStudents(firebaseStudents);
      } else {
        setStudents([]);
      }
    });
    return () => unsubscribe();
  }, []);

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
    
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const isDone = student.demonstrations?.[opId]?.status === DemonstrationStatus.DONE;
    
    const updates: any = {};
    updates[`/students/${studentId}/demonstrations/${opId}`] = {
      status: isDone ? DemonstrationStatus.PENDING : DemonstrationStatus.DONE,
      date: isDone ? null : formattedDate
    };

    update(ref(db), updates);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newStudentName.trim().toUpperCase();
    if (!name) return;

    const studentsRef = ref(db, 'students');
    const newStudentRef = push(studentsRef);

    set(newStudentRef, {
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
    if (window.confirm("Deseja excluir?")) {
      remove(ref(db, `students/${id}`));
    }
  };

  return (
    // ... O RESTO DO RETURN É IGUAL AO SEU CÓDIGO ANTERIOR ...
    // PODE MANTER O MESMO JSX (HTML) QUE VOCÊ JÁ TINHA
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      {/* Copie aqui todo o conteúdo do <header> e <main> do arquivo anterior */}
    </div>
  );
};

export default App;
