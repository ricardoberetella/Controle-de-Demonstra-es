
import { GoogleGenAI } from "@google/genai";
import { Student, Operation, ClassRoom } from "../types";

export const analyzeClassProgress = async (
  classroom: ClassRoom,
  students: Student[],
  operations: Operation[]
): Promise<string> => {
  try {
    // Initializing GoogleGenAI inside the function to ensure the most current environment configuration
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const dataSummary = students.map(s => ({
      name: s.name,
      completedOps: Object.entries(s.demonstrations)
        .filter(([_, rec]) => rec.status === 'DONE')
        .map(([opId, rec]) => {
          const op = operations.find(o => o.id === opId);
          return `${op?.id} (em ${rec.date})`;
        })
    }));

    const prompt = `
      Você é um Instrutor de Prática Profissional do SENAI especializado em Usinagem Convencional.
      Analise o progresso da turma "${classroom.name}".

      DADOS DA TURMA (Operações 01-47):
      ${JSON.stringify(dataSummary)}

      INSTRUÇÕES:
      1. Avalie quem são os alunos mais adiantados e os que precisam de mais demonstrações.
      2. Seja técnico e direto, use linguagem de oficina.
      3. Forneça 3 pontos de atenção imediatos para o instrutor.
      4. Responda em Português do Brasil de forma sucinta.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // The response text is accessed via the .text property
    return response.text || "Sem análise disponível.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao processar dados pedagógicos.";
  }
};
