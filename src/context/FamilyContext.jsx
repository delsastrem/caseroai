import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const FamilyContext = createContext(null);

const PERFIL_DEFAULT = {
  nombre: '',
  personas: 4,
  tieneChicos: true,
  preferencias: [],
  evitar: [],
  platosConocidos: [],
  historialAceptacion: {},
  comercios: [],
};

export function FamilyProvider({ children }) {
  const [perfil, setPerfil] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const SESSION_ID = 'familia_principal';

  useEffect(() => {
    cargarPerfil();
  }, []);

  async function cargarPerfil() {
    try {
      const ref = doc(db, 'familias', SESSION_ID);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setPerfil(snap.data().perfil);
        setPlan(snap.data().plan || null);
      }
    } catch (e) {
      console.error('Error cargando perfil:', e);
    } finally {
      setLoading(false);
    }
  }

  async function guardarPerfil(nuevoPerfil) {
    const ref = doc(db, 'familias', SESSION_ID);
    const perfilCompleto = { ...PERFIL_DEFAULT, ...nuevoPerfil };
    await setDoc(ref, { perfil: perfilCompleto }, { merge: true });
    setPerfil(perfilCompleto);
  }

  async function guardarPlan(nuevoPlan) {
    const ref = doc(db, 'familias', SESSION_ID);
    await setDoc(ref, { plan: nuevoPlan }, { merge: true });
    setPlan(nuevoPlan);
  }

  return (
    <FamilyContext.Provider value={{
      perfil, plan, loading,
      guardarPerfil, guardarPlan,
      PERFIL_DEFAULT,
    }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamily debe usarse dentro de FamilyProvider');
  return ctx;
}