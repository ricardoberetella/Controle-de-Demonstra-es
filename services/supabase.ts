// services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Student } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchStudentsFromSupabase = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('alunos')
    .select('*')
    .order('nome', { ascending: true });

  if (error) throw error;
  
  // Aqui mapeamos o nome do banco para o objeto que seu componente espera
  return data.map(aluno => ({
    id: aluno.id.toString(),
    name: aluno.nome,
    demonstrations: {} // Inicialmente vazio, ou vindo de outra tabela depois
  }));
};
