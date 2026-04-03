import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getDb, getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/types/models';

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  profileError: string | null;
  login: (usuario: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  firebaseReady: boolean;
};

const Ctx = createContext<AuthState | null>(null);

async function loadProfile(u: User): Promise<UserProfile | null> {
  if (!isFirebaseConfigured()) return null;
  const snap = await getDoc(doc(getDb(), 'users', u.uid));
  if (!snap.exists()) return null;
  const d = snap.data() as { role?: UserRole; nombre?: string };
  return {
    uid: u.uid,
    email: u.email ?? '',
    role: d.role ?? 'profesional',
    nombre: d.nombre,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setProfileError(null);
      if (u) {
        const p = await loadProfile(u);
        setProfile(p);
        if (!p) {
          setProfileError(
            'No existe perfil en Firestore (colección users). Solicite acceso al administrador.'
          );
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (usuario: string, password: string) => {
    setError(null);
    if (!isFirebaseConfigured()) {
      setError('Configure Firebase en .env');
      return;
    }
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, usuario.trim(), password);
  }, []);

  const logout = useCallback(async () => {
    if (!isFirebaseConfigured()) return;
    await signOut(getFirebaseAuth());
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      error,
      profileError,
      login,
      logout,
      firebaseReady: isFirebaseConfigured(),
    }),
    [user, profile, loading, error, profileError, login, logout]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth fuera de AuthProvider');
  return v;
}

export function useIsAdmin(): boolean {
  const { profile } = useAuth();
  return profile?.role === 'administrador';
}
