import { signInWithGoogle, db } from '../firebase';
import { motion } from 'motion/react';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Login() {
  const handleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            level: 1,
            xp: 0,
            objective: 'Ganar músculo',
            steps: 0,
            sleep: '0h 0m',
            hydration: 0,
            kcals: 0,
            exerciseMinutes: 0,
            standHours: 0,
            weight: 75,
            bodyFat: 15,
            performanceScore: 50,
            consistencyDays: 0,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-container/10 blur-[120px] rounded-full -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full -ml-64 -mb-64" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-surface-container/60 backdrop-blur-xl border border-outline-variant/10 p-10 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-[#D1FF00] italic font-headline uppercase tracking-tighter mb-2">FitNova</h1>
          <p className="text-stone-500 font-headline font-bold uppercase tracking-widest text-xs">Elite Performance</p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Bienvenido de nuevo</h2>
            <p className="text-on-surface-variant text-sm">Entrena con la élite. Tu mejor versión empieza aquí.</p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-bold hover:bg-stone-100 transition-all active:scale-[0.98]"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Continuar con Google
          </button>
        </div>

        <p className="mt-10 text-center text-[10px] text-stone-600 uppercase tracking-widest font-bold">
          Al continuar, aceptas nuestros términos y condiciones
        </p>
      </motion.div>
    </div>
  );
}
