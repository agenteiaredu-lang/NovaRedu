import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, BrainCircuit, Sparkles, User, Bot, Loader2, Info } from 'lucide-react';
import { getCoachResponse } from '../services/gemini';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function CoachIA() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: '¡Hola! Soy tu Coach FitNova IA. Estoy aquí para optimizar tu rendimiento. ¿En qué puedo ayudarte hoy? Podemos hablar sobre tu rutina de hoy, nutrición o cualquier duda técnica que tengas.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await getCoachResponse(messages.concat({ role: 'user', content: userMessage }));
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      console.error('Error getting coach response:', error);
      setMessages(prev => [...prev, { role: 'model', content: 'Lo siento, he tenido un problema de conexión. ¿Podrías repetir eso?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center shadow-[0_0_20px_rgba(207,252,0,0.3)]">
            <BrainCircuit className="text-on-primary-fixed w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Coach IA <span className="text-primary-container">FitNova</span></h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Sistema de Optimización Activo</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-xl border border-outline-variant/10">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-on-surface-variant">Basado en tu progreso real</span>
        </div>
      </div>

      <div className="flex-1 bg-surface-container-low/50 backdrop-blur-xl rounded-[2.5rem] border border-outline-variant/10 flex flex-col overflow-hidden shadow-2xl relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#cffc00_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar relative z-10">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                  msg.role === 'user' ? "bg-stone-900 border-stone-800" : "bg-primary-container border-primary shadow-[0_0_15px_rgba(207,252,0,0.2)]"
                )}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-stone-400" /> : <Bot className="w-5 h-5 text-on-primary-fixed" />}
                </div>
                <div className={cn(
                  "p-5 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-surface-container-highest text-white rounded-tr-none" 
                    : "bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/5"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center border border-primary">
                <Bot className="w-5 h-5 text-on-primary-fixed" />
              </div>
              <div className="bg-surface-container-high p-5 rounded-2xl rounded-tl-none border border-outline-variant/5">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-surface-container-high/50 backdrop-blur-xl border-t border-outline-variant/10 relative z-10">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pregunta sobre tu entrenamiento, dieta o recuperación..."
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all outline-none text-white placeholder-stone-500"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button className="p-2 text-stone-500 hover:text-primary transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-primary-container text-on-primary-fixed p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(207,252,0,0.3)]"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <p className="text-[10px] text-center mt-4 text-stone-600 font-bold uppercase tracking-widest">
            FitNova IA puede cometer errores. Verifica la información importante.
          </p>
        </div>
      </div>
    </div>
  );
}
