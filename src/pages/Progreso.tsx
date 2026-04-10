import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bolt, Flame, TrendingDown, TrendingUp, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Progreso() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto w-full space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 glass-card rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full"></div>
          <div className="z-10 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 text-primary-container mb-4">
              <Bolt className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Hito Mensual Alcanzado</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none mb-4">
              HAS MEJORADO UN <span className="text-primary-container">12%</span> EN FUERZA.
            </h2>
            <p className="text-on-surface-variant max-w-md text-sm leading-relaxed">
              Tu rendimiento en el tren superior ha superado la media de tu categoría. Estás a solo unas sesiones de alcanzar el siguiente nivel.
            </p>
          </div>
          <div className="z-10 flex flex-col items-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-highest" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="8" />
                <circle className="text-primary-container" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset={440 - (440 * Math.min((profile?.performanceScore || 0) / 100, 1))} strokeWidth="8" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black italic">{profile?.performanceScore || 0}</span>
                <span className="text-[10px] font-bold uppercase text-stone-500">Score</span>
              </div>
            </div>
            <p className="mt-4 font-headline text-xs font-bold uppercase tracking-tighter text-primary-container">Performance Score</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 glass-card rounded-[2rem] p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline font-bold uppercase tracking-tighter">Consistencia</h3>
            <div className="text-primary-container flex items-center gap-1">
              <Flame className="w-5 h-5 fill-current" />
              <span className="text-sm font-black">{profile?.consistencyDays || 0} Días</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className={cn(
                "w-full aspect-square rounded-lg",
                i >= (profile?.consistencyDays || 0) ? "bg-stone-800" : "bg-primary-container shadow-[0_0_15px_rgba(207,252,0,0.3)]"
              )}></div>
            ))}
            <div className="w-full aspect-square bg-stone-900 border border-dashed border-stone-700 rounded-lg"></div>
          </div>
          <button 
            onClick={() => alert('Mostrando historial de consistencia...')}
            className="w-full mt-6 py-3 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            Ver historial completo
          </button>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ChartCard title="PESO" unit="KG" value={profile?.weight || 0} change="-0.8 kg este mes" color="primary" />
        <ChartCard title="% GRASA" unit="CORPORAL" value={`${profile?.bodyFat || 0}%`} change="-1.2% este mes" color="secondary" />
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="text-2xl font-black uppercase tracking-tighter italic">Récords Personales <span className="text-stone-600">(PB)</span></h3>
          <button 
            onClick={() => alert('Mostrando todos los récords personales...')}
            className="text-primary-container text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:underline"
          >
            Ver todos <TrendingUp className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PBCard title="Bench Press" value="120" unit="KG" category="Powerlifting" change="+5KG" time="hace 2 días" color="primary" />
          <PBCard title="5K Run" value="19:42" unit="MIN" category="Cardio" change="-15s" time="hace 1 sem" color="secondary" />
          <PBCard title="Pull Ups" value="28" unit="REPS" category="Endurance" change="+3 REPS" time="ayer" color="tertiary" />
          <div className="relative rounded-3xl overflow-hidden group h-full min-h-[160px]">
            <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://picsum.photos/seed/challenge/400/300" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent p-6 flex flex-col justify-end">
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Próximo Reto</p>
              <h4 className="text-xl font-black italic tracking-tighter text-white">SQUAT 140KG</h4>
              <div className="mt-2 w-full bg-stone-900 h-1 rounded-full overflow-hidden">
                <div className="bg-primary-container h-full w-[72%]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ChartCard({ title, unit, value, change, color }: any) {
  return (
    <div className="glass-card rounded-[2rem] p-8 overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Evolución Corporal</p>
          <h3 className="text-2xl font-black italic tracking-tighter">{title} <span className="text-stone-500">{unit}</span></h3>
        </div>
        <div className="text-right">
          <p className={cn("text-3xl font-black italic", color === 'primary' ? "text-primary-container" : "text-secondary")}>{value}</p>
          <p className={cn("text-[10px] font-bold", color === 'primary' ? "text-error" : "text-primary-container")}>{change}</p>
        </div>
      </div>
      <div className="relative h-48 w-full mt-4">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100">
          <path 
            d={color === 'primary' ? "M0,80 Q50,75 100,60 T200,50 T300,30 T400,20" : "M0,40 Q50,45 100,42 T200,55 T300,50 T400,65"} 
            fill="transparent" 
            stroke={color === 'primary' ? "#cffc00" : "#00e3fd"} 
            strokeWidth="4" 
            strokeLinecap="round" 
          />
          <circle cx="400" cy={color === 'primary' ? 20 : 65} fill={color === 'primary' ? "#cffc00" : "#00e3fd"} r="6" />
        </svg>
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-[8px] font-bold text-stone-600 uppercase pt-4">
          <span>01 Ene</span>
          <span>15 Ene</span>
          <span>Hoy</span>
        </div>
      </div>
    </div>
  );
}

function PBCard({ title, value, unit, category, change, time, color }: any) {
  return (
    <div className={cn(
      "surface-container-high rounded-3xl p-6 border border-stone-800/30 group transition-all cursor-default",
      color === 'primary' ? "hover:border-primary-container/30" : color === 'secondary' ? "hover:border-secondary/30" : "hover:border-tertiary/30"
    )}>
      <div className="flex justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-stone-400 group-hover:text-primary-container transition-colors">
          <Bolt className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold text-stone-500 uppercase bg-stone-900 px-2 py-1 rounded-md">{category}</span>
      </div>
      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black italic">{value}</span>
        <span className="text-sm font-bold text-stone-500 uppercase">{unit}</span>
      </div>
      <div className="mt-4 pt-4 border-t border-stone-800 flex justify-between items-center">
        <span className="text-[10px] text-stone-600 font-medium italic">Logrado {time}</span>
        <span className={cn("text-[10px] font-black uppercase tracking-tighter", color === 'primary' ? "text-primary-container" : color === 'secondary' ? "text-secondary" : "text-tertiary")}>{change}</span>
      </div>
    </div>
  );
}
