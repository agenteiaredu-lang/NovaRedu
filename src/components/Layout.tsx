import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, LineChart, Map as MapIcon, Users, Target, BrainCircuit, Settings, LogOut, Search, Bell, Sun, Moon, ShieldCheck } from 'lucide-react';
import { auth, logout, db } from '../firebase';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, requestPermission, permissionStatus } = useNotifications();
  const [level, setLevel] = useState<number | string>('...');
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const isAdmin = user?.email === 'agenteiaredu@gmail.com';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Rutinas', path: '/rutinas', icon: Dumbbell },
    { name: 'Progreso', path: '/progreso', icon: LineChart },
    { name: 'Mapa', path: '/mapa', icon: MapIcon },
    { name: 'Comunidad', path: '/comunidad', icon: Users },
    { name: 'Objetivos', path: '/objetivos', icon: Target },
    { name: 'Coach IA', path: '/coach', icon: BrainCircuit },
    ...(isAdmin ? [{ name: 'Admin Centros', path: '/admin/centros', icon: ShieldCheck }] : []),
  ];

  const searchResults = searchQuery.length > 2 
    ? navItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setLevel(snapshot.data().level || 1);
      }
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 border-r border-outline-variant/20 bg-surface-container/80 backdrop-blur-xl py-8 px-4 fixed left-0 top-0 z-50 shadow-[40px_0_60px_-15px_rgba(0,0,0,0.3)]">
        <div className="mb-10 px-4">
          <h1 className="text-2xl font-black text-[#D1FF00] italic font-headline tracking-tighter uppercase">FitNova</h1>
          <p className="text-[10px] font-headline font-bold uppercase tracking-tighter text-on-surface-variant mt-1">Elite Performance</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-headline font-bold uppercase tracking-tighter hover:scale-105",
                  isActive 
                    ? "text-[#D1FF00] border-r-2 border-[#D1FF00] bg-on-surface/5" 
                    : "text-on-surface-variant hover:text-on-surface"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-outline-variant/20 space-y-2">
          <button 
            onClick={() => navigate('/rutinas')}
            className="w-full bg-[#D1FF00] text-[#3b4a00] py-3 rounded-xl font-headline font-bold uppercase tracking-tighter active:scale-95 transition-all mb-4 text-xs cursor-pointer"
          >
            Iniciar Entrenamiento
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface font-headline font-bold uppercase tracking-tighter text-sm w-full cursor-pointer"
          >
            <Settings className="w-5 h-5" />
            <span>Ajustes</span>
          </button>
          <button 
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface font-headline font-bold uppercase tracking-tighter text-sm w-full cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-8 bg-surface-container/60 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/10">
          <div className="relative flex items-center gap-4 bg-surface-container-low rounded-full px-4 py-1.5 border border-outline-variant/30 w-full max-md:hidden max-w-md">
            <Search className="w-4 h-4 text-on-surface-variant" />
            <input 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder-on-surface-variant/50 w-full" 
              placeholder="Buscar secciones, herramientas..." 
              type="text"
            />
            
            <AnimatePresence>
              {showSearchResults && searchQuery.length > 2 && (
                <>
                  <div 
                    className="fixed inset-0 z-[-1]" 
                    onClick={() => setShowSearchResults(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-surface-container-high rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      {searchResults.length > 0 ? (
                        searchResults.map((result) => (
                          <button
                            key={result.path}
                            onClick={() => {
                              navigate(result.path);
                              setSearchQuery('');
                              setShowSearchResults(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-on-surface/5 rounded-xl transition-colors text-left"
                          >
                            <result.icon className="w-4 h-4 text-primary-container" />
                            <span className="text-sm font-bold">{result.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-xs text-on-surface-variant">No se encontraron resultados para "{searchQuery}"</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="text-on-surface-variant hover:text-[#D1FF00] transition-colors cursor-pointer p-2 rounded-full hover:bg-on-surface/5"
                title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="text-on-surface-variant hover:text-[#D1FF00] transition-colors relative cursor-pointer p-2 rounded-full hover:bg-on-surface/5"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary-container rounded-full border-2 border-background"></span>
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotifs && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-surface-container-high rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden z-[100]"
                    >
                      <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center">
                        <h3 className="font-headline font-bold uppercase tracking-tighter">Notificaciones</h3>
                        {permissionStatus === 'default' && (
                          <button 
                            onClick={requestPermission}
                            className="text-[10px] font-bold text-primary-container uppercase hover:underline"
                          >
                            Activar Push
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => markAsRead(n.id)}
                              className={cn(
                                "p-4 border-b border-outline-variant/5 hover:bg-on-surface/5 transition-colors cursor-pointer",
                                !n.read && "bg-primary-container/5"
                              )}
                            >
                              <p className="text-xs font-bold text-on-surface">{n.title}</p>
                              <p className="text-[10px] text-on-surface-variant mt-1">{n.message}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-xs text-on-surface-variant italic">No tienes notificaciones.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button 
                onClick={() => navigate('/settings')}
                className="text-on-surface-variant hover:text-[#D1FF00] transition-colors cursor-pointer p-2 rounded-full hover:bg-on-surface/5"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/50 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-on-surface leading-none">{user?.displayName}</p>
                <p className="text-[10px] text-primary-container font-medium uppercase tracking-tighter">Nivel {level}</p>
              </div>
              <img 
                alt="User" 
                className="w-10 h-10 rounded-full object-cover border border-outline-variant" 
                src={user?.photoURL || 'https://picsum.photos/seed/user/100/100'} 
              />
            </div>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
