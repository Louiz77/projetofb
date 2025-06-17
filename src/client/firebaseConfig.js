import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBKwDX4tnxeTxDYRMP98M2hHSdzfgg6rbs",
  authDomain: "vanadus-32c2a.firebaseapp.com",
  projectId: "vanadus-32c2a",
  storageBucket: "vanadus-32c2a.firebasestorage.app",
  messagingSenderId: "586762090260",
  appId: "1:586762090260:web:c3ecb8bba23a2e41a57401",
  measurementId: "G-C28J9S68G6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// eslint-disable-next-line
const analytics = getAnalytics(app);

// Ativar persistência offline (necessário para usuários sem internet)
enableIndexedDbPersistence(db)
  .catch((error) => {
    console.error("Erro ao ativar persistência offline:", error);
    alert("Falha ao carregar carrinho. Verifique sua conexão com a internet.");
  });

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  doc, 
  setDoc, 
  getDoc 
};