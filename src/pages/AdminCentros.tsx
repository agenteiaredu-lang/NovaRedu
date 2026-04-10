import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Save, MapPin, Star, Tag, Image as ImageIcon, Euro, Database } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface Gym {
  id: string;
  name: string;
  city: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  price: number;
  rating: number;
  reviews: number;
  image: string;
  tags: string[];
  isPremium: boolean;
  distance?: string;
}

export default function AdminCentros() {
  const { user } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Gym>>({
    name: '',
    city: '',
    address: '',
    location: { lat: 40.4168, lng: -3.7038 },
    price: 0,
    rating: 4.5,
    reviews: 0,
    image: '',
    tags: [],
    isPremium: false,
    distance: '0.5km'
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    // Simple admin check based on email for now
    if (user?.email === 'agenteiaredu@gmail.com') {
      setIsAdmin(true);
    }

    const gymsRef = collection(db, 'gyms');
    const unsubscribe = onSnapshot(gymsRef, (snapshot) => {
      const gymsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Gym[];
      setGyms(gymsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gyms');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleOpenModal = (gym: Gym | null = null) => {
    if (gym) {
      setEditingGym(gym);
      setFormData(gym);
    } else {
      setEditingGym(null);
      setFormData({
        name: '',
        city: '',
        address: '',
        location: { lat: 40.4168, lng: -3.7038 },
        price: 0,
        rating: 4.5,
        reviews: 0,
        image: '',
        tags: [],
        isPremium: false,
        distance: '0.5km'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.city) {
      alert('Nombre y Ciudad son obligatorios');
      return;
    }

    try {
      if (editingGym) {
        const gymRef = doc(db, 'gyms', editingGym.id);
        await updateDoc(gymRef, { ...formData });
      } else {
        const gymsRef = collection(db, 'gyms');
        await addDoc(gymsRef, { ...formData });
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingGym ? OperationType.UPDATE : OperationType.CREATE, 'gyms');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este centro?')) return;
    try {
      await deleteDoc(doc(db, 'gyms', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gyms/${id}`);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tagToRemove) });
  };

  const handleSeed = async () => {
    if (!confirm('¿Quieres añadir 5 gimnasios de ejemplo en diferentes ciudades?')) return;
    
    const seedGyms = [
      {
        name: 'FitNova Barcelona Center',
        city: 'Barcelona',
        address: 'Carrer de Balmes, 150',
        location: { lat: 41.3851, lng: 2.1734 },
        price: 45,
        rating: 4.8,
        reviews: 120,
        image: 'https://picsum.photos/seed/bcn1/800/600',
        tags: ['Piscina', 'Spa', 'Yoga'],
        isPremium: true,
        distance: '1.2km'
      },
      {
        name: 'Iron Peak Sevilla',
        city: 'Sevilla',
        address: 'Calle Sierpes, 45',
        location: { lat: 37.3891, lng: -5.9845 },
        price: 35,
        rating: 4.6,
        reviews: 85,
        image: 'https://picsum.photos/seed/sev1/800/600',
        tags: ['Crossfit', 'Boxeo'],
        isPremium: false,
        distance: '0.8km'
      },
      {
        name: 'Valencia Sport Hub',
        city: 'Valencia',
        address: 'Avinguda del Cid, 12',
        location: { lat: 39.4699, lng: -0.3763 },
        price: 40,
        rating: 4.7,
        reviews: 210,
        image: 'https://picsum.photos/seed/val1/800/600',
        tags: ['Tenis', 'Pádel', 'Gimnasio'],
        isPremium: true,
        distance: '2.5km'
      },
      {
        name: 'Bilbao Strength Academy',
        city: 'Bilbao',
        address: 'Gran Vía de Don Diego López de Haro, 8',
        location: { lat: 43.2630, lng: -2.9350 },
        price: 30,
        rating: 4.5,
        reviews: 65,
        image: 'https://picsum.photos/seed/bil1/800/600',
        tags: ['Halterofilia', 'Powerlifting'],
        isPremium: false,
        distance: '1.5km'
      },
      {
        name: 'Malaga Beach Fitness',
        city: 'Málaga',
        address: 'Paseo Marítimo Pablo Ruiz Picasso, 1',
        location: { lat: 36.7213, lng: -4.4214 },
        price: 50,
        rating: 4.9,
        reviews: 150,
        image: 'https://picsum.photos/seed/mal1/800/600',
        tags: ['Outdoor', 'Calistenia', 'Yoga'],
        isPremium: true,
        distance: '0.3km'
      }
    ];

    try {
      const gymsRef = collection(db, 'gyms');
      for (const gym of seedGyms) {
        await addDoc(gymsRef, gym);
      }
      alert('Gimnasios de ejemplo añadidos con éxito');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gyms');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-3xl font-headline font-black uppercase italic text-primary-container mb-4">Acceso Restringido</h2>
        <p className="text-on-surface-variant">Solo los administradores pueden configurar los centros.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-headline font-black italic tracking-tighter uppercase leading-none">Gestión de <span className="text-primary-container">Centros</span></h2>
          <p className="text-on-surface-variant font-medium mt-2">Configura los gimnasios y centros deportivos de la plataforma.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSeed}
            className="bg-surface-container-highest text-on-surface font-headline font-black px-6 py-4 rounded-xl uppercase tracking-tighter flex items-center gap-2 hover:bg-on-surface/10 transition-all cursor-pointer"
          >
            <Database className="w-5 h-5" />
            Seed Data
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#D1FF00] text-[#3b4a00] font-headline font-black px-8 py-4 rounded-xl uppercase tracking-tighter flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_30px_-5px_rgba(207,252,0,0.3)] cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Nuevo Centro
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-[2.5rem] border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 border-b border-outline-variant/10">
                <th className="px-6 py-4 text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant">Centro</th>
                <th className="px-6 py-4 text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant">Ubicación</th>
                <th className="px-6 py-4 text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant">Precio</th>
                <th className="px-6 py-4 text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant">Valoración</th>
                <th className="px-6 py-4 text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {gyms.map((gym) => (
                <tr key={gym.id} className="hover:bg-on-surface/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={gym.image} alt={gym.name} className="w-12 h-12 rounded-xl object-cover border border-outline-variant/20" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-headline font-bold uppercase tracking-tight text-on-surface">{gym.name}</p>
                        <div className="flex gap-1 mt-1">
                          {gym.isPremium && <span className="text-[8px] font-black bg-primary-container text-on-primary-fixed px-1.5 py-0.5 rounded uppercase">Premium</span>}
                          {gym.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[8px] font-bold bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded uppercase">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    <p className="font-bold text-on-surface">{gym.city}</p>
                    <p className="text-xs">{gym.address}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-headline font-black text-on-surface">{gym.price}€<span className="text-[10px] text-on-surface-variant ml-1">/mes</span></p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-primary-container fill-current" />
                      <span className="text-sm font-bold">{gym.rating}</span>
                      <span className="text-[10px] text-on-surface-variant">({gym.reviews})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(gym)}
                        className="p-2 hover:bg-primary-container/20 text-primary-container rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(gym.id)}
                        className="p-2 hover:bg-error/20 text-error rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {gyms.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant italic">No hay centros configurados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
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
              className="relative bg-surface-container-high w-full max-w-2xl rounded-[2.5rem] p-8 border border-outline-variant/10 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-headline font-black uppercase tracking-tighter italic">
                  {editingGym ? 'Editar' : 'Nuevo'} <span className="text-primary-container">Centro</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-on-surface/5 rounded-full transition-colors cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant ml-2">Nombre del Centro</label>
                  <div className="relative">
                    <input 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                      placeholder="Ej: FitNova Elite Madrid"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant ml-2">Ciudad</label>
                  <input 
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                    placeholder="Ej: Madrid"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant ml-2">Dirección</label>
                  <input 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                    placeholder="Ej: Calle Gran Vía, 12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant ml-2">Latitud</label>
                  <input 
                    type="number"
                    step="any"
                    value={formData.location?.lat}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, lat: parseFloat(e.target.value) } })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant ml-2">Longitud</label>
                  <input 
                    type="number"
                    step="any"
                    value={formData.location?.lng}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, lng: parseFloat(e.target.value) } })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant ml-2">Precio Mensual (€)</label>
                  <input 
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant ml-2">Valoración (1-5)</label>
                  <input 
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant ml-2">Número de Reseñas</label>
                  <input 
                    type="number"
                    value={formData.reviews}
                    onChange={(e) => setFormData({ ...formData, reviews: parseInt(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant ml-2">URL de Imagen</label>
                  <input 
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-headline font-black uppercase tracking-widest text-on-surface-variant ml-2">Etiquetas</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {formData.tags?.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-primary-container/20 text-primary-container rounded-full text-xs font-bold uppercase">
                        {tag}
                        <button onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                      placeholder="Añadir etiqueta..."
                    />
                    <button 
                      onClick={addTag}
                      className="bg-surface-container-highest p-3 rounded-xl hover:bg-on-surface/10 transition-colors cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="col-span-2 flex items-center gap-3 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                  <input 
                    type="checkbox"
                    id="isPremium"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                    className="w-5 h-5 rounded border-outline-variant/30 text-primary-container focus:ring-primary-container bg-surface-container-lowest"
                  />
                  <label htmlFor="isPremium" className="text-sm font-bold uppercase tracking-tight text-on-surface">Centro Premium</label>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-surface-container-highest text-on-surface font-headline font-black uppercase tracking-tight rounded-xl hover:bg-on-surface/10 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-4 bg-primary-container text-on-primary-fixed font-headline font-black uppercase tracking-tight rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary-container/20 cursor-pointer"
                >
                  <Save className="w-5 h-5 inline-block mr-2" />
                  Guardar Centro
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
