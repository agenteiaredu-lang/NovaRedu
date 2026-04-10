import { motion } from 'motion/react';
import { User, Bell, Shield, Smartphone, LogOut, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../firebase';
import { cn } from '../lib/utils';
import { useNotifications } from '../context/NotificationContext';

export default function Settings() {
  const { user } = useAuth();
  const { permissionStatus, requestPermission } = useNotifications();

  const sections = [
    {
      title: 'Cuenta',
      items: [
        { icon: User, label: 'Perfil Personal', value: user?.displayName || 'Atleta' },
        { 
          icon: Bell, 
          label: 'Notificaciones Push', 
          value: permissionStatus === 'granted' ? 'Activadas' : permissionStatus === 'denied' ? 'Bloqueadas' : 'Desactivadas',
          action: permissionStatus !== 'granted' ? requestPermission : undefined,
          statusIcon: permissionStatus === 'granted' ? <CheckCircle2 className="w-4 h-4 text-primary-container" /> : <XCircle className="w-4 h-4 text-error" />
        },
        { icon: Shield, label: 'Privacidad y Seguridad', value: 'Protegido' },
      ]
    },
    {
      title: 'Dispositivo',
      items: [
        { icon: Smartphone, label: 'Sincronización', value: 'Apple Watch' },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div>
        <h1 className="text-5xl font-headline font-black uppercase tracking-tighter text-on-surface">
          Ajustes de <span className="text-primary-container">Sistema</span>
        </h1>
        <p className="text-on-surface-variant mt-2 font-medium">Personaliza tu experiencia de alto rendimiento.</p>
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant ml-4">{section.title}</h2>
            <div className="bg-surface-container-low rounded-[2rem] border border-outline-variant/10 overflow-hidden">
              {section.items.map((item, i) => (
                <button 
                  key={i}
                  onClick={() => item.action && item.action()}
                  className={cn(
                    "w-full flex items-center justify-between p-6 hover:bg-surface-container-high transition-colors text-left",
                    i !== section.items.length - 1 && "border-b border-outline-variant/10",
                    !item.action && "cursor-default"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary-container" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-on-surface">{item.label}</p>
                        {'statusIcon' in item && item.statusIcon}
                      </div>
                      <p className="text-xs text-on-surface-variant">{item.value}</p>
                    </div>
                  </div>
                  {item.action && <ChevronRight className="w-5 h-5 text-on-surface-variant" />}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-4 p-6 bg-error/10 text-error rounded-[2rem] border border-error/20 hover:bg-error/20 transition-colors font-headline font-bold uppercase tracking-tighter cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión de FitNova
        </button>
      </div>
    </div>
  );
}
