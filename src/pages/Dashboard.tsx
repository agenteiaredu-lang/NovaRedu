import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bolt, Timer, Flame, Footprints, Moon, Droplets, TrendingUp, CheckCircle2, Play, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const navigate = useNavigate();
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
    <div className="max-w-[1600px] mx-auto w-full space-y-10">
      <header className="mb-10">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black font-headline tracking-tighter text-on-surface mb-1"
        >
          Hoy es un gran día para entrenar, {user?.displayName?.split(' ')[0] || 'Atleta'}.
        </motion.h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
          <span className="text-on-surface-variant font-medium text-sm uppercase tracking-widest">
            Objetivo activo: <span className="text-primary-container">{profile?.objective || 'Ganar masa muscular'}</span>
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Rings Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 glass-card p-8 rounded-3xl flex flex-col justify-center items-center gap-8"
        >
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-surface-container-highest" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12" />
              <circle className="text-primary-container" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeDasharray="502" strokeDashoffset={502 - (502 * Math.min((profile?.kcals || 0) / 1000, 1))} strokeLinecap="round" strokeWidth="12" />
              <circle className="text-secondary" cx="96" cy="96" fill="transparent" r="64" stroke="currentColor" strokeWidth="12" />
              <circle className="text-secondary" cx="96" cy="96" fill="transparent" r="64" stroke="currentColor" strokeDasharray="402" strokeDashoffset={402 - (402 * Math.min((profile?.exerciseMinutes || 0) / 60, 1))} strokeLinecap="round" strokeWidth="12" />
              <circle className="text-tertiary" cx="96" cy="96" fill="transparent" r="48" stroke="currentColor" strokeWidth="12" />
              <circle className="text-tertiary" cx="96" cy="96" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301" strokeDashoffset={301 - (301 * Math.min((profile?.standHours || 0) / 12, 1))} strokeLinecap="round" strokeWidth="12" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Bolt className="text-primary-container w-8 h-8" />
            </div>
          </div>
          <div className="flex gap-6 w-full justify-between">
            <div className="text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-tighter mb-1 font-bold">Mover</p>
              <p className="text-lg font-bold font-headline text-primary-container">{profile?.kcals || 0} <span className="text-[10px]">KCAL</span></p>
            </div>
            <div className="text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-tighter mb-1 font-bold">Ejercicio</p>
              <p className="text-lg font-bold font-headline text-secondary">{profile?.exerciseMinutes || 0} <span className="text-[10px]">MIN</span></p>
            </div>
            <div className="text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-tighter mb-1 font-bold">Pie</p>
              <p className="text-lg font-bold font-headline text-tertiary">{profile?.standHours || 0} <span className="text-[10px]">HR</span></p>
            </div>
          </div>
        </motion.div>

        {/* Recommendation Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-surface-container-high border border-outline-variant/10 group"
        >
          <img 
            alt="Leg workout" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 group-hover:scale-100 transition-transform duration-700" 
            src="https://picsum.photos/seed/gym/1200/800"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
          <div className="relative h-full flex flex-col justify-end p-10">
            <span className="bg-primary-container text-on-primary-fixed text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full w-fit mb-4">Recomendado</span>
            <h3 className="text-5xl font-black font-headline leading-none mb-4 max-w-lg">Hoy toca: Sesión de Piernas Potente</h3>
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Timer className="text-primary-container w-5 h-5" />
                <span className="text-sm font-medium">45 min</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="text-secondary w-5 h-5" />
                <span className="text-sm font-medium">Fuerza Hipertrofia</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/rutinas')}
              className="kinetic-gradient text-on-primary-fixed flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black font-headline uppercase tracking-tight hover:scale-105 transition-transform active:scale-95 w-fit cursor-pointer"
            >
              Entrenar Ahora
              <Play className="w-5 h-5 fill-current" />
            </button>
          </div>
        </motion.div>

        {/* Weekly Summary Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-5 bg-surface-container p-8 rounded-3xl border border-outline-variant/10"
        >
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-headline font-bold text-xl uppercase tracking-tighter">Resumen Semanal</h4>
            <span className="text-secondary text-sm font-bold">+12% vs sem. pasada</span>
          </div>
          <div className="flex items-end justify-between h-40 gap-3 px-2">
            {[40, 65, 90, 50, 75, 30, 20].map((height, i) => (
              <div key={i} className="w-full bg-surface-container-highest rounded-t-lg relative group" style={{ height: `${height}%` }}>
                <div className={cn(
                  "absolute bottom-0 w-full rounded-t-lg transition-all h-full",
                  i === 2 ? "bg-primary-container shadow-[0_0_15px_rgba(207,252,0,0.3)]" : "bg-surface-container-highest"
                )}></div>
                <span className={cn(
                  "absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold",
                  i === 2 ? "text-primary-container" : "text-on-surface-variant"
                )}>
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Metrics Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            icon={Footprints} 
            label="Pasos" 
            value={profile?.steps?.toLocaleString() || "0"} 
            progress={Math.min(((profile?.steps || 0) / 10000) * 100, 100)} 
            color="primary" 
            trend={<TrendingUp className="w-4 h-4 text-on-surface-variant" />} 
          />
          <MetricCard 
            icon={Moon} 
            label="Sueño" 
            value={profile?.sleep || "0h 0m"} 
            subValue="Calidad Óptima" 
            color="secondary" 
            trend={<CheckCircle2 className="w-4 h-4 text-on-surface-variant" />} 
          />
          <MetricCard 
            icon={Droplets} 
            label="Hidratación" 
            value={`${profile?.hydration || 0} L`} 
            subValue={`Meta: 3.0L`} 
            color="tertiary" 
            action={<Plus className="w-4 h-4" />} 
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subValue, progress, color, trend, action }: any) {
  const colorClasses: any = {
    primary: "bg-primary/10 text-primary-container",
    secondary: "bg-secondary/10 text-secondary",
    tertiary: "bg-tertiary/10 text-tertiary",
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 flex flex-col justify-between hover:bg-surface-container-high transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend || (action && (
          <button className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-on-surface/5 cursor-pointer">
            {action}
          </button>
        ))}
      </div>
      <div>
        <p className="text-on-surface-variant text-xs uppercase font-bold tracking-widest mb-1">{label}</p>
        <h5 className="text-3xl font-black font-headline">{value}</h5>
        {progress !== undefined && (
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary-container h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        )}
        {subValue && <p className={cn("text-[10px] mt-2 font-bold italic", color === 'secondary' ? "text-secondary" : "text-on-surface-variant")}>{subValue}</p>}
      </div>
    </motion.div>
  );
}
