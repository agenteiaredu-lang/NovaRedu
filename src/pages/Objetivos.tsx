import { motion } from 'motion/react';
import { Timer, TrendingDown, Utensils, Zap, Plus, History, Share2, Check, Flag } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

export default function Objetivos() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newObjective, setNewObjective] = useState('');

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data());
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpdateObjective = async (obj: string) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { objective: obj });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleAddObjective = () => {
    if (!newObjective.trim()) return;
    alert(`Nuevo hito añadido: ${newObjective}`);
    setNewObjective('');
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeObjective = profile?.objective || 'Perder grasa';

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
          <div>
            <span className="text-secondary text-xs font-bold tracking-[0.2em] uppercase">Estrategia Activa</span>
            <h2 className="text-5xl font-black italic tracking-tighter mt-2">Misión de Rendimiento</h2>
          </div>
          <div className="bg-surface-container-high p-1 rounded-2xl flex gap-1">
            {['Perder grasa', 'Ganar músculo', 'Resistencia'].map((obj) => (
              <button 
                key={obj}
                onClick={() => handleUpdateObjective(obj)}
                className={cn(
                  "px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer",
                  activeObjective === obj ? "bg-primary-container text-on-primary-fixed shadow-lg" : "text-on-surface-variant hover:bg-surface-container-highest"
                )}
              >
                {obj}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-[2.5rem] p-10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
              <div>
                <h3 className="text-3xl font-bold mb-2">Composición Atlética</h3>
                <p className="text-on-surface-variant max-w-md">Tu objetivo actual es alcanzar un 12% de grasa corporal manteniendo masa magra.</p>
              </div>
              <div className="mt-6 md:mt-0 text-right">
                <div className="text-6xl font-black text-primary tracking-tighter">68<span className="text-2xl font-bold">%</span></div>
                <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Completado</div>
              </div>
            </div>

            <div className="relative py-12">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-highest -translate-y-1/2 rounded-full overflow-hidden">
                <div className="h-full bg-primary-container w-[68%] shadow-[0_0_20px_rgba(207,252,0,0.4)] transition-all duration-1000"></div>
              </div>
              <div className="relative flex justify-between">
                <TimelineNode label="INICIO" value="85 kg" completed />
                <TimelineNode label="FASE 1" value="78 kg" completed />
                <TimelineNode label="ACTUAL" value="74.2 kg" active />
                <TimelineNode label="META" value="70 kg" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-12 lg:col-span-4 bg-primary-container text-on-primary-fixed rounded-[2.5rem] p-10 flex flex-col justify-between"
          >
            <div>
              <Timer className="w-10 h-10 mb-4" />
              <h3 className="text-4xl font-black italic leading-none mb-4 uppercase">TIEMPO<br/>RESTANTE</h3>
            </div>
            <div className="mt-auto">
              <div className="text-7xl font-black tracking-tighter">24</div>
              <div className="text-xl font-bold uppercase tracking-widest opacity-80">Días para el Hito</div>
              <div className="mt-6 pt-6 border-t border-on-primary-fixed/20 flex justify-between items-end">
                <div>
                  <span className="block text-xs font-bold opacity-60">FECHA OBJETIVO</span>
                  <span className="text-lg font-bold">12 OCT 2024</span>
                </div>
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard title="Nuevo Hito" desc="Define una meta intermedia" icon={Plus} onClick={() => setIsModalOpen(true)} />
        <ActionCard title="Histórico" desc="Revisa tus metas pasadas" icon={History} onClick={() => alert('Mostrando historial de objetivos...')} />
        <ActionCard title="Compartir Logro" desc="Motiva a la comunidad" icon={Share2} onClick={() => alert('¡Logro compartido en el Círculo!')} />
      </div>

      {/* New Objective Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-surface-container-high w-full max-w-lg rounded-[2.5rem] p-8 border border-outline-variant/10 shadow-2xl"
          >
            <h3 className="text-2xl font-headline font-black uppercase tracking-tighter mb-6">Nuevo Hito</h3>
            <input 
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="Ej: Levantar 100kg en Press Banca"
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-white placeholder-stone-500 mb-6 outline-none focus:ring-2 focus:ring-primary-container"
            />
            <button 
              onClick={handleAddObjective}
              className="w-full py-4 bg-primary-container text-on-primary-fixed font-headline font-black uppercase tracking-tight rounded-xl hover:brightness-110 transition-all"
            >
              Añadir Objetivo
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function TimelineNode({ label, value, completed, active }: any) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-surface-container-low shadow-xl transition-all",
        completed ? "bg-primary-container text-on-primary-fixed" : active ? "bg-surface-container-highest border-primary-container" : "bg-surface-container-highest opacity-40"
      )}>
        {completed ? <Check className="w-5 h-5" /> : active ? <span className="text-primary text-xs">ACT</span> : <Flag className="w-5 h-5" />}
      </div>
      <div className={cn("text-center", !completed && !active && "opacity-40")}>
        <span className={cn("block text-xs font-bold", (completed || active) ? "text-primary" : "text-on-surface")}>{label}</span>
        <span className="block text-[10px] text-on-surface-variant font-bold">{value}</span>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon: Icon, onClick }: any) {
  return (
    <motion.button 
      whileHover={{ y: -5 }} 
      onClick={onClick}
      className="bg-surface-container-low p-8 rounded-[2rem] flex items-center justify-between group hover:bg-surface-container-high transition-colors text-left w-full cursor-pointer"
    >
      <div>
        <h4 className="font-bold text-lg">{title}</h4>
        <p className="text-xs text-on-surface-variant">{desc}</p>
      </div>
      <div className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center group-hover:bg-primary-container group-hover:text-on-primary-fixed transition-all">
        <Icon className="w-5 h-5" />
      </div>
    </motion.button>
  );
}
