import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Play, RotateCcw, SkipForward, ChevronRight, Heart, MoreVertical, Pause, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, addDoc, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface Routine {
  id: string;
  title: string;
  stats: string;
  progress: number;
  image: string;
  category: string;
  color?: string;
  isFavorite?: boolean;
}

export default function Rutinas() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todo');
  const [timeLeft, setTimeLeft] = useState(45);
  const [isActive, setIsActive] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineCategory, setNewRoutineCategory] = useState('Pecho');
  const [newRoutineDays, setNewRoutineDays] = useState('3');

  useEffect(() => {
    if (!user) return;

    const routinesRef = collection(db, 'users', user.uid, 'routines');
    const unsubscribe = onSnapshot(routinesRef, (snapshot) => {
      const routinesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Routine[];
      setRoutines(routinesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/routines`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(45);
  };

  const handleCreateRoutine = async () => {
    if (!newRoutineName.trim() || !user) return;

    try {
      const routinesRef = collection(db, 'users', user.uid, 'routines');
      await addDoc(routinesRef, {
        title: newRoutineName,
        category: newRoutineCategory,
        stats: `${newRoutineDays} Días / Semana • 60 min`,
        progress: 0,
        image: `https://picsum.photos/seed/${newRoutineName}/400/500`,
        isFavorite: false,
        createdAt: new Date().toISOString()
      });
      
      setNewRoutineName('');
      setIsCreateModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/routines`);
    }
  };

  const filteredRoutines = filter === 'Todo' 
    ? routines 
    : routines.filter(r => r.category === filter);

  const favorites = routines.filter(r => r.isFavorite);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-headline font-black uppercase tracking-tighter text-on-surface">
            Gestión de <span className="text-primary-container">Rutinas</span>
          </h1>
          <p className="text-on-surface-variant mt-2 font-medium">Optimiza tu rendimiento con planes de entrenamiento de élite.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-surface-container-highest text-on-surface border border-outline-variant/20 px-6 py-3 rounded-xl font-headline font-bold tracking-tight hover:bg-surface-container-high transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Crear Rutina Personalizada
        </button>
      </div>

      {/* Create Routine Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-surface-container-high w-full max-w-lg rounded-[2.5rem] p-8 border border-outline-variant/10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-headline font-black uppercase tracking-tighter">Nueva Rutina</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-on-surface/5 rounded-full transition-colors cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Nombre de la Rutina</label>
                  <input 
                    value={newRoutineName}
                    onChange={(e) => setNewRoutineName(e.target.value)}
                    placeholder="Ej: Empuje Hipertrofia"
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-on-surface placeholder-on-surface-variant/50 focus:ring-2 focus:ring-primary-container outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Días / Semana</label>
                    <select 
                      value={newRoutineDays}
                      onChange={(e) => setNewRoutineDays(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-on-surface focus:ring-2 focus:ring-primary-container outline-none"
                    >
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Categoría</label>
                    <select 
                      value={newRoutineCategory}
                      onChange={(e) => setNewRoutineCategory(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-on-surface focus:ring-2 focus:ring-primary-container outline-none"
                    >
                      <option>Pecho</option>
                      <option>Espalda</option>
                      <option>Piernas</option>
                      <option>Hombros</option>
                      <option>Core</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleCreateRoutine}
                  className="w-full py-4 bg-primary-container text-on-primary-fixed font-headline font-black uppercase tracking-tight rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Crear Rutina
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {['Todo', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'].map((cat) => (
          <button 
            key={cat} 
            onClick={() => setFilter(cat)}
            className={cn(
              "px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all cursor-pointer",
              filter === cat ? "bg-primary-container text-on-primary-fixed" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-headline font-bold uppercase tracking-tighter">Rutinas Activas</h2>
              <span className="text-xs font-bold text-secondary uppercase tracking-widest px-3 py-1 bg-secondary-container/20 rounded-full">En Progreso</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRoutines.map(routine => (
                <RoutineCard key={routine.id} {...routine} />
              ))}
              {filteredRoutines.length === 0 && (
                <div className="col-span-2 py-20 text-center glass-card rounded-3xl">
                  <p className="text-on-surface-variant font-bold uppercase tracking-widest">No tienes rutinas propias aún</p>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 text-primary-container font-bold uppercase tracking-tighter hover:underline cursor-pointer"
                  >
                    Crear mi primera rutina
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-bold uppercase tracking-tighter mb-6">Tus Favoritos</h2>
            <div className="space-y-4">
              {favorites.map(fav => (
                <FavoriteItem key={fav.id} title={fav.title} stats={fav.stats} />
              ))}
              {favorites.length === 0 && (
                <p className="text-on-surface-variant text-sm italic">No tienes rutinas marcadas como favoritas.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="bg-surface-container p-8 rounded-[2rem] border border-outline-variant/10 shadow-2xl relative overflow-hidden sticky top-24">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-container">Editando Sesión</span>
                  <h2 className="text-4xl font-headline font-black uppercase tracking-tighter mt-1">Día 1: Empuje</h2>
                </div>
                <button className="p-3 bg-on-surface/5 rounded-full hover:bg-on-surface/10 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-surface-container-lowest/50 backdrop-blur-xl border border-on-surface/5 rounded-2xl p-6 mb-8 text-center group">
                <div className="text-[64px] font-headline font-black tracking-tighter leading-none mb-2 text-on-surface">
                  00:{timeLeft.toString().padStart(2, '0')}
                </div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-4">Tiempo de Descanso</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={resetTimer}
                    className="w-12 h-12 rounded-full bg-on-surface/10 flex items-center justify-center hover:bg-on-surface/20 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={toggleTimer}
                    className="w-12 h-12 rounded-full bg-primary-container text-on-primary-fixed flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(207,252,0,0.3)] cursor-pointer"
                  >
                    {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>
                  <button 
                    onClick={() => alert('Saltando al siguiente ejercicio...')}
                    className="w-12 h-12 rounded-full bg-on-surface/10 flex items-center justify-center hover:bg-on-surface/20 transition-all cursor-pointer"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <ExerciseItem number="01" title="Press de Banca" stats="4 Series • 8-10 Reps" weight="85 KG" />
                <ExerciseItem number="02" title="Press Militar" stats="3 Series • 12 Reps" weight="50 KG" active />
                <ExerciseItem number="03" title="Fondos en Paralelas" stats="3 Series • Fallo" weight="BW KG" disabled />
              </div>

              <button 
                onClick={() => alert('¡Entrenamiento finalizado! Buen trabajo.')}
                className="w-full mt-8 py-4 bg-primary-container text-on-primary-fixed font-headline font-black uppercase tracking-tight rounded-xl hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                Finalizar Entrenamiento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoutineCard({ title, stats, progress, image, color = 'primary' }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} className="group relative overflow-hidden rounded-xl bg-surface-container-low aspect-[4/5] flex flex-col justify-end p-6 border border-outline-variant/10">
      <div className="absolute inset-0 z-0">
        <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60" src={image} referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
      </div>
      <div className="relative z-10 space-y-2">
        <h3 className="text-3xl font-headline font-black uppercase tracking-tighter text-on-surface">{title}</h3>
        <p className={cn("text-sm font-bold", color === 'primary' ? "text-primary-container" : "text-secondary")}>{stats}</p>
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-1.5 bg-on-surface/10 rounded-full overflow-hidden">
            <div className={cn("h-full transition-all duration-500", color === 'primary' ? "bg-primary-container" : "bg-secondary")} style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-xs font-mono text-on-surface-variant">{progress}%</span>
        </div>
      </div>
    </motion.div>
  );
}

function FavoriteItem({ title, stats }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/5 hover:bg-surface-container transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center">
          <Heart className="text-primary fill-current w-5 h-5" />
        </div>
        <div>
          <h4 className="font-headline font-bold uppercase tracking-tighter">{title}</h4>
          <p className="text-xs text-on-surface-variant font-medium">{stats}</p>
        </div>
      </div>
      <ChevronRight className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
    </div>
  );
}

function ExerciseItem({ number, title, stats, weight, active, disabled }: any) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-xl transition-all",
      active ? "bg-surface-container-high border border-primary-container/20" : "bg-surface-container-high/50",
      disabled && "opacity-60"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn("font-headline font-black text-xl", active ? "text-primary-container" : "text-on-surface-variant")}>{number}</div>
        <div>
          <h5 className="font-headline font-bold text-sm uppercase">{title}</h5>
          <p className="text-xs text-on-surface-variant">{stats}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-lg font-headline font-bold">{weight.split(' ')[0]} <span className="text-xs text-on-surface-variant">{weight.split(' ')[1]}</span></span>
      </div>
    </div>
  );
}
