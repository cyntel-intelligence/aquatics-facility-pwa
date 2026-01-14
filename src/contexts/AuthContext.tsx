import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: userData.role || 'staff',
          facilityIds: userData.facilityIds || [],
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await fetchUserData(firebaseUser);
        setState({ user, loading: false, error: null });
      } else {
        setState({ user: null, loading: false, error: null });
      }
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(firebaseUser, { displayName });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: firebaseUser.email,
        displayName,
        role: 'staff', // Default role, admin can change this
        facilityIds: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user = await fetchUserData(firebaseUser);
      setState({ user, loading: false, error: null });
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      const user = await fetchUserData(firebaseUser);

      setState({ user, loading: false, error: null });
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setState({ user: null, loading: false, error: null });
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string) => {
    if (!auth.currentUser) throw new Error('No user logged in');

    try {
      await updateProfile(auth.currentUser, { displayName });

      await setDoc(
        doc(db, 'users', auth.currentUser.uid),
        { displayName, updatedAt: new Date() },
        { merge: true }
      );

      if (state.user) {
        setState((prev) => ({
          ...prev,
          user: { ...prev.user!, displayName },
        }));
      }
    } catch (error: any) {
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    signup,
    login,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
