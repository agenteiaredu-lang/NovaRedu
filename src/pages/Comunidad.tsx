import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, Calendar, MoreHorizontal, Zap, MessageSquare, Timer, Flame, Star, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, addDoc, query, orderBy, limit, updateDoc, doc, increment } from 'firebase/firestore';

export default function Comunidad() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    const activitiesRef = collection(db, 'activities');
    const q = query(activitiesRef, orderBy('createdAt', 'desc'), limit(20));
    
    const unsubscribeActivities = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(activitiesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'activities');
      setLoading(false);
    });

    // Fetch rankings
    const usersRef = collection(db, 'users');
    const qRank = query(usersRef, orderBy('xp', 'desc'), limit(5));
    const unsubscribeRankings = onSnapshot(qRank, (snapshot) => {
      const rankingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRankings(rankingsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => {
      unsubscribeActivities();
      unsubscribeRankings();
    };
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    
    try {
      const activitiesRef = collection(db, 'activities');
      await addDoc(activitiesRef, {
        uid: user.uid,
        authorName: user.displayName || "Atleta",
        authorPhoto: user.photoURL || "https://picsum.photos/seed/user/100/100",
        time: "Ahora",
        type: "Entrenamiento",
        content: newPost,
        metrics: [{ label: 'Intensidad', value: 'Alta' }],
        kudos: 0,
        comments: 0,
        createdAt: new Date().toISOString()
      });
      
      setNewPost('');
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'activities');
    }
  };

  const handleKudos = async (id: string) => {
    try {
      const activityRef = doc(db, 'activities', id);
      await updateDoc(activityRef, {
        kudos: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `activities/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-5xl font-headline font-black italic tracking-tighter uppercase leading-none">The Kinetic <span className="text-primary-container">Circle</span></h2>
          <p className="text-on-surface-variant font-medium mt-2 max-w-lg">Conecta con la élite. Tu rendimiento no tiene límites cuando el equipo te impulsa.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-primary-container to-primary-dim text-on-primary-fixed font-headline font-black px-8 py-4 rounded-xl uppercase tracking-tighter flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_30px_-5px_rgba(207,252,0,0.3)] cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          Publicar Actividad
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Activity Feed */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs font-headline font-black bg-surface-container-highest px-3 py-1 rounded-full uppercase tracking-widest text-primary">Live Feed</span>
            <div className="h-px flex-1 bg-outline-variant/20"></div>
          </div>

          {activities.map(activity => (
            <ActivityItem 
              key={activity.id}
              {...activity}
              author={activity.authorName}
              avatar={activity.authorPhoto}
              onKudos={() => handleKudos(activity.id)}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <section className="bg-surface-container-high rounded-[2rem] p-8 overflow-hidden relative">
            <h3 className="text-2xl font-headline font-black italic uppercase tracking-tighter mb-6 relative z-10">Ranking <span className="text-secondary">Semanal</span></h3>
            <div className="space-y-4">
              {rankings.map((rankUser, index) => (
                <RankingItem 
                  key={rankUser.id} 
                  rank={index + 1} 
                  name={rankUser.displayName || 'Atleta'} 
                  xp={`${(rankUser.xp || 0).toLocaleString()} XP`} 
                  avatar={rankUser.photoURL || `https://picsum.photos/seed/${rankUser.id}/100/100`} 
                  active={rankUser.id === user?.uid} 
                />
              ))}
              {rankings.length === 0 && (
                <p className="text-on-surface-variant text-sm italic">No hay suficientes datos para el ranking.</p>
              )}
            </div>
            <button 
              onClick={() => alert('Mostrando tabla de clasificación completa...')}
              className="w-full mt-6 py-3 text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              Ver Tabla Completa
            </button>
          </section>

          <section className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10">
            <h3 className="text-2xl font-headline font-black italic uppercase tracking-tighter mb-6">Retos <span className="text-primary">Activos</span></h3>
            <div className="space-y-6">
              <ChallengeItem title="Reto 100km en Abril" tag="Reto Comunitario" progress={68} image="https://picsum.photos/seed/ch1/400/200" color="primary" />
              <ChallengeItem title="Iron Peak: 500 Tons" tag="Club de Fuerza" progress={25} image="https://picsum.photos/seed/ch2/400/200" color="secondary" />
            </div>
          </section>
        </div>
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-surface-container-high w-full max-w-lg rounded-[2.5rem] p-8 border border-outline-variant/10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-headline font-black uppercase tracking-tighter">Nueva Actividad</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-on-surface/5 rounded-full transition-colors cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <textarea 
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="¿Qué has entrenado hoy?"
                className="w-full h-40 bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-on-surface placeholder-on-surface-variant/50 focus:ring-2 focus:ring-primary-container outline-none resize-none mb-6"
              />
              <button 
                onClick={handlePost}
                className="w-full py-4 bg-primary-container text-on-primary-fixed font-headline font-black uppercase tracking-tight rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Publicar en el Círculo
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActivityItem({ author, time, type, pr, content, metrics, kudos, comments, avatar, image, onKudos }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="bg-surface-container-low rounded-[2rem] p-6 hover:bg-surface-container transition-colors duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <img className="w-14 h-14 rounded-2xl object-cover" src={avatar} referrerPolicy="no-referrer" />
          <div>
            <h4 className="text-lg font-headline font-bold uppercase tracking-tight">{author}</h4>
            <p className="text-xs text-on-surface-variant flex items-center gap-1">
              <Zap className="w-3 h-3" /> Hace {time} • {type}
            </p>
          </div>
        </div>
        <button className="text-on-surface-variant hover:text-on-surface cursor-pointer"><MoreHorizontal className="w-5 h-5" /></button>
      </div>

      {pr && (
        <div className="bg-surface-container-highest/50 border-l-4 border-primary p-6 rounded-2xl mb-6 backdrop-blur-sm">
          <p className="text-xs font-headline font-black uppercase text-primary tracking-widest mb-1">NUEVO RÉCORD PERSONAL (PR)</p>
          <h3 className="text-3xl font-headline font-black italic uppercase tracking-tighter">{pr}</h3>
        </div>
      )}

      {content && <p className="text-on-surface-variant mb-4 italic font-medium leading-relaxed">{content}</p>}

      {image && (
        <div className="relative rounded-2xl overflow-hidden aspect-video mb-6 group">
          <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={image} referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {metrics.map((m: any, i: number) => (
          <div key={i} className="bg-surface-container-high/40 p-4 rounded-xl text-center">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">{m.label}</p>
            <p className="text-xl font-headline font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
        <div className="flex gap-4">
          <button 
            onClick={onKudos}
            className="flex items-center gap-1.5 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-current" /> {kudos} Kudus
          </button>
          <button className="flex items-center gap-1.5 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <MessageSquare className="w-5 h-5" /> {comments}
          </button>
        </div>
        <button className="text-sm font-headline font-bold text-primary uppercase tracking-tighter hover:underline cursor-pointer">Ver detalles</button>
      </div>
    </motion.div>
  );
}

function RankingItem({ rank, name, xp, avatar, active }: any) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-2xl transition-all",
      active ? "bg-secondary/10 border border-secondary/20" : "bg-surface-container-lowest/50"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-8 h-8 flex items-center justify-center font-black italic rounded-lg transform",
          active ? "bg-secondary text-on-surface-container -rotate-12" : "text-on-surface-variant"
        )}>{rank}</div>
        <img className="w-10 h-10 rounded-full object-cover" src={avatar} referrerPolicy="no-referrer" />
        <span className="font-bold uppercase tracking-tight">{name}</span>
      </div>
      <span className={cn("font-headline font-bold", active ? "text-secondary" : "text-on-surface")}>{xp}</span>
    </div>
  );
}

function ChallengeItem({ title, tag, progress, image, color }: any) {
  return (
    <div 
      onClick={() => alert(`Abriendo detalles del reto: ${title}`)}
      className="group cursor-pointer"
    >
      <div className="relative h-32 rounded-2xl overflow-hidden mb-3">
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={image} referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-on-surface/40 group-hover:bg-on-surface/20 transition-colors"></div>
        <div className={cn(
          "absolute top-3 left-3 text-[10px] font-black uppercase px-2 py-1 rounded",
          color === 'primary' ? "bg-primary text-on-primary-fixed" : "bg-secondary text-on-secondary-fixed"
        )}>{tag}</div>
        <div className="absolute bottom-3 left-3">
          <h4 className="font-headline font-bold uppercase tracking-tight text-on-surface">{title}</h4>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs mb-2">
        <span className="text-on-surface-variant font-bold uppercase">Progreso</span>
        <span className={cn("font-bold", color === 'primary' ? "text-primary" : "text-secondary")}>{progress}% Completado</span>
      </div>
      <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color === 'primary' ? "bg-primary" : "bg-secondary")} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}
