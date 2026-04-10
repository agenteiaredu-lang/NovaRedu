import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const getCoachResponse = async (history: { role: 'user' | 'model'; content: string }[]) => {
  const lastMessage = history[history.length - 1].content;
  
  // Format history for the new SDK if needed, but generateContent can take a prompt
  // For multi-turn, we can use the contents array
  const contents = history.map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: contents,
    config: {
      systemInstruction: `Eres FitNova AI, un coach de fitness de élite. 
      Tu tono es motivador, profesional, directo y experto. 
      Hablas español. 
      Ayudas a los usuarios con rutinas, nutrición, recuperación y motivación. 
      Si el usuario pregunta por datos específicos de su progreso, asume que eres un sistema integrado y dale consejos basados en un perfil de atleta de alto rendimiento.
      Usa un lenguaje que inspire acción y disciplina.
      No uses markdown excesivo, mantén el texto limpio pero estructurado.`
    }
  });

  return response.text || 'Lo siento, no pude procesar tu solicitud.';
};
