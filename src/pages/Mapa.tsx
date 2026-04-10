import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Navigation, Layers, Star, Heart, MapPin, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React using CDN URLs
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const UserIcon = L.divIcon({
  className: 'user-location-marker',
  html: '<div class="w-5 h-5 bg-primary-container rounded-full border-2 border-white shadow-[0_0_15px_rgba(209,255,0,0.5)] animate-pulse"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

L.Marker.prototype.options.icon = DefaultIcon;

const getCoords = (location: any): [number, number] | null => {
  if (!location) return null;
  if (typeof location.lat === 'number' && typeof location.lng === 'number') {
    return [location.lat, location.lng];
  }
  if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
    return [location.latitude, location.longitude];
  }
  // Handle Firestore GeoPoint if it has toMillis or similar markers of being a class
  if (location.latitude !== undefined && location.longitude !== undefined) {
    return [location.latitude, location.longitude];
  }
  return null;
};

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 1
    });
  }, [center, zoom, map]);
  return null;
}

export default function Mapa() {
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGym, setSelectedGym] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.4168, -3.7038]); // Madrid default
  const [mapZoom, setMapZoom] = useState(13);
  const [activeFilter, setActiveFilter] = useState('Cerca de mí');

  useEffect(() => {
    const gymsRef = collection(db, 'gyms');
    const unsubscribe = onSnapshot(gymsRef, (snapshot) => {
      const gymsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGyms(gymsData);
      if (gymsData.length > 0 && !selectedGym) {
        const firstGym = gymsData[0] as any;
        setSelectedGym(firstGym);
        const coords = getCoords(firstGym.location);
        if (coords) {
          setMapCenter(coords);
        }
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gyms');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationError("No soportado");
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(newPos);
        setMapCenter(newPos);
        setMapZoom(15);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Permiso denegado");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Posición no disponible");
            break;
          case error.TIMEOUT:
            setLocationError("Tiempo agotado");
            break;
          default:
            setLocationError("Error desconocido");
            break;
        }
        
        // If it fails, suggest opening in a new tab
        if (error.code === error.PERMISSION_DENIED) {
          console.warn("Geolocation blocked. If you are in the preview, try opening the app in a new tab.");
        }
        
        setTimeout(() => setLocationError(null), 5000);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, // Increased to 10s
        maximumAge: 0 
      }
    );
  };

  const filteredGyms = gyms.filter(gym => 
    gym.name.toLowerCase().includes(search.toLowerCase()) ||
    gym.tags?.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())) ||
    gym.address?.toLowerCase().includes(search.toLowerCase()) ||
    gym.city?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (filteredGyms.length > 0 && search.length > 2) {
      const firstResult = filteredGyms[0];
      const coords = getCoords(firstResult.location);
      if (coords) {
        setMapCenter(coords);
        setMapZoom(14);
      }
    }
  }, [search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 ml-0 md:ml-64 mt-16 flex overflow-hidden">
      {/* Map Section */}
      <section className="flex-1 relative z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {filteredGyms.map(gym => {
            const coords = getCoords(gym.location);
            return coords && (
              <Marker 
                key={gym.id} 
                position={coords}
                eventHandlers={{
                  click: () => {
                    setSelectedGym(gym);
                    setMapCenter(coords);
                  },
                }}
              >
                <Popup>
                  <div className="text-on-surface">
                    <h3 className="font-bold">{gym.name}</h3>
                    <p className="text-xs">{gym.tags?.join(', ')}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {userLocation && (
            <Marker position={userLocation} icon={UserIcon}>
              <Popup>Tu ubicación actual</Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Floating Controls */}
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-4 w-full max-w-3xl pointer-events-auto">
            <div className="flex-1 bg-stone-950/60 backdrop-blur-md rounded-2xl p-1 flex items-center gap-2 border border-stone-800/20">
              <Search className="ml-3 text-stone-400 w-5 h-5" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-white placeholder-stone-500 w-full text-sm py-3" 
                placeholder="Buscar gimnasio o zona..." 
                type="text"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors mr-1 cursor-pointer"
                >
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              )}
            </div>
            <button className="bg-stone-950/60 backdrop-blur-md p-3.5 rounded-xl border border-stone-800/20 text-stone-200 hover:bg-stone-900 transition-colors flex items-center gap-2 cursor-pointer">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-bold font-headline uppercase tracking-tight">Filtros</span>
            </button>
          </div>
          <div className="flex flex-col gap-2 pointer-events-auto items-end">
            {locationError && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-end gap-1"
              >
                <div className="bg-red-500/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase text-white border border-red-400/20">
                  {locationError}
                </div>
                {locationError === "Permiso denegado" && (
                  <div className="bg-stone-900/90 backdrop-blur-md px-3 py-2 rounded-xl text-[9px] text-stone-300 border border-stone-800/30 max-w-[180px] text-right">
                    Si estás en la vista previa, intenta abrir la app en una <b>pestaña nueva</b> para permitir el acceso.
                  </div>
                )}
              </motion.div>
            )}
            <button 
              onClick={handleGeolocation}
              disabled={isLocating}
              className={cn(
                "bg-stone-950/60 backdrop-blur-md p-3 rounded-xl border border-stone-800/20 text-stone-200 hover:text-primary-container transition-colors cursor-pointer",
                isLocating && "animate-pulse text-primary-container"
              )}
            >
              <Navigation className={cn("w-5 h-5", isLocating && "animate-spin")} />
            </button>
            <button className="bg-stone-950/60 backdrop-blur-md p-3 rounded-xl border border-stone-800/20 text-stone-200 hover:text-primary-container transition-colors cursor-pointer">
              <Layers className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selected Gym Detail (Bottom) */}
        <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between pointer-events-none">
          {selectedGym && (
            <motion.div 
              key={selectedGym.id}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="pointer-events-auto bg-stone-950/80 backdrop-blur-2xl p-6 rounded-3xl border border-stone-800/20 shadow-2xl max-w-lg w-full flex gap-5"
            >
              <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0">
                <img alt="Gym" className="w-full h-full object-cover" src={selectedGym.image} referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-headline font-black uppercase tracking-tighter text-white">{selectedGym.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="text-primary-container w-3 h-3 fill-current" />
                      <span className="text-xs font-bold text-white">{selectedGym.rating}</span>
                      <span className="text-[10px] text-stone-500 font-medium ml-1">({selectedGym.reviews} reseñas)</span>
                    </div>
                  </div>
                  <button className="text-primary-container hover:scale-110 transition-transform cursor-pointer">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  {selectedGym.tags?.map((tag: string) => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-stone-900 text-secondary font-bold uppercase tracking-tight">{tag}</span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <img key={i} alt="Friend" className="w-6 h-6 rounded-full border-2 border-stone-950 object-cover" src={`https://picsum.photos/seed/friend${i}/50/50`} referrerPolicy="no-referrer" />
                    ))}
                    <div className="w-6 h-6 rounded-full border-2 border-stone-950 bg-stone-800 flex items-center justify-center text-[8px] font-bold">+5</div>
                  </div>
                  <button className="text-primary-container text-xs font-bold font-headline uppercase border-b border-primary-container hover:opacity-70 cursor-pointer">Detalles</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Sidebar List Section */}
      <aside className="w-96 bg-surface-container-low/80 backdrop-blur-xl border-l border-stone-800/20 h-full flex flex-col">
        <div className="p-6 border-b border-stone-800/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-headline font-black uppercase tracking-tighter">Resultados</h2>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">{filteredGyms.length} centros</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['Cerca de mí', 'Barato', '24 Horas'].map((filter) => (
              <button 
                key={filter} 
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-tight transition-all cursor-pointer",
                  activeFilter === filter ? "bg-primary-container text-on-primary-fixed" : "bg-stone-900 text-stone-400 hover:text-white"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {filteredGyms.length > 0 ? (
            filteredGyms.map(gym => {
              const coords = getCoords(gym.location);
              return (
                <motion.div 
                  key={gym.id} 
                  whileHover={{ x: 4 }} 
                  onClick={() => {
                    setSelectedGym(gym);
                    if (coords) {
                      setMapCenter(coords);
                      setMapZoom(15);
                    }
                  }}
                  className={cn(
                    "group cursor-pointer p-2 rounded-2xl transition-all",
                    selectedGym?.id === gym.id ? "bg-stone-900/50" : ""
                  )}
                >
                <div className="relative h-44 rounded-2xl overflow-hidden mb-3">
                  <img alt={gym.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={gym.image} referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  {gym.isPremium && (
                    <div className="absolute top-4 right-4 bg-stone-950/60 backdrop-blur-md px-2 py-1 rounded-lg">
                      <p className="text-[10px] font-bold text-primary-container">PREMIUM</p>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{gym.distance} de distancia</p>
                    <h4 className="text-lg font-headline font-bold uppercase tracking-tighter leading-none">{gym.name}</h4>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="text-primary-container w-3 h-3 fill-current" />
                      <span className="text-xs font-bold">{gym.rating}</span>
                    </div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{gym.tags?.join(' • ')}</span>
                  </div>
                  <p className="text-sm font-headline font-black text-white">{gym.price}€<span className="text-[10px] text-stone-500 ml-1">/mes</span></p>
                </div>
              </motion.div>
            );
          })
        ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Search className="w-12 h-12 text-stone-800 mb-4" />
              <p className="text-stone-400 font-bold uppercase tracking-tighter">No se encontraron centros</p>
              <p className="text-stone-600 text-xs mt-2">Prueba con otros términos o filtros</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
