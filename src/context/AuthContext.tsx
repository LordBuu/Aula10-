/**
 * Authentication Context supporting Firebase Auth and Ultra-Fast Instant Role Switching
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as fbSignOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, testFirestoreConnection } from '../config/firebase';
import { UserProfile } from '../types/vacation';
import {
  DEMO_USERS,
  subscribeToUserProfile,
  saveUserProfile,
  seedInitialDataIfEmpty,
} from '../services/firebaseService';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  switchDemoUser: (personaId: string) => void;
  logout: () => Promise<void>;
  demoUsers: UserProfile[];
  updateCurrentUserProfile: (updated: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedUid = localStorage.getItem('vacation_active_uid') || 'demo_emp_ana';
    return DEMO_USERS.find(u => u.uid === savedUid) || DEMO_USERS[0];
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Background initialization & Firestore connection check
  useEffect(() => {
    async function init() {
      try {
        await testFirestoreConnection();
        await seedInitialDataIfEmpty();
      } catch (e) {
        console.warn('Init error in background:', e);
      }
    }
    init();
  }, []);

  // Listen to Firestore updates for the active user's profile
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = subscribeToUserProfile(currentUser.uid, (updatedProfile) => {
      if (updatedProfile) {
        setCurrentUser(prev => {
          // Only update if it belongs to currently active UID
          if (prev?.uid === updatedProfile.uid) {
            return updatedProfile;
          }
          return prev;
        });
      }
    });
    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const profile: UserProfile = {
          uid: fbUser.uid,
          name: fbUser.displayName || 'Colaborador Google',
          email: fbUser.email || '',
          role: 'employee',
          department: 'Engenharia de Software',
          jobTitle: 'Especialista de Requisitos',
          managerId: 'demo_mgr_carlos',
          managerName: 'Carlos Mendes',
          hireDate: new Date().toISOString().split('T')[0],
          totalVacationDays: 30,
          usedVacationDays: 0,
          soldVacationDays: 0,
          remainingVacationDays: 30,
          periodsUsed: 0,
          hasLongPeriodUsed: false,
          acquisitionPeriodStart: `${new Date().getFullYear()}-01-01`,
          acquisitionPeriodEnd: `${new Date().getFullYear()}-12-31`,
          avatarUrl: fbUser.photoURL || undefined,
          updatedAt: new Date().toISOString(),
        };
        saveUserProfile(profile).catch(console.warn);
        setCurrentUser(profile);
        localStorage.setItem('vacation_active_uid', fbUser.uid);
      }
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Instantaneous user switching (0ms delay)
   * Updates state immediately without tearing down the UI with loading spinners
   */
  const switchDemoUser = (personaId: string) => {
    const persona = DEMO_USERS.find(u => u.uid === personaId);
    if (persona) {
      // 1. Instant state update - zero latency
      setCurrentUser(persona);
      localStorage.setItem('vacation_active_uid', persona.uid);

      // 2. Sync to Firestore in background without awaiting or blocking UI
      saveUserProfile(persona).catch(() => {});
    }
  };

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await fbSignOut(auth);
      }
    } catch (e) {
      console.error(e);
    }
    setFirebaseUser(null);
    setCurrentUser(null);
    localStorage.removeItem('vacation_active_uid');
  };

  const updateCurrentUserProfile = async (updated: Partial<UserProfile>) => {
    if (!currentUser) return;
    const newProfile = { ...currentUser, ...updated, updatedAt: new Date().toISOString() };
    setCurrentUser(newProfile);
    await saveUserProfile(newProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        loginWithGoogle,
        switchDemoUser,
        logout,
        demoUsers: DEMO_USERS,
        updateCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
