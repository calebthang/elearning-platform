// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database, googleProvider, facebookProvider, githubProvider } from '../firebase/firebaseConfig';

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signInWithGoogle(role = 'student') {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user, role);
      return result.user;
    } catch (error) {
      throw error;
    }
  }

  async function signInWithFacebook(role = 'student') {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      await createUserProfile(result.user, role);
      return result.user;
    } catch (error) {
      throw error;
    }
  }

  async function signInWithGithub(role = 'student') {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      await createUserProfile(result.user, role);
      return result.user;
    } catch (error) {
      throw error;
    }
  }

  async function createUserProfile(user, role) {
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      await set(userRef, {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: role,
        createdAt: new Date().toISOString()
      });
    }
  }

  async function signup(email, password, role, fullName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile({
        ...result.user,
        displayName: fullName
      }, role);
      return result.user;
    } catch (error) {
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setCurrentUser({ ...user, ...snapshot.val() });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    signInWithGoogle,
    signInWithFacebook,
    signInWithGithub
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}