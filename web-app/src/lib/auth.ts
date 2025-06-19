import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase';

export const auth = getAuth(app);

export const signUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const logOut = () => signOut(auth);

export const onAuthChange = (callback: (user: import('firebase/auth').User | null) => void) =>
  onAuthStateChanged(auth, callback);
