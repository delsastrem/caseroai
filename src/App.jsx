import { FamilyProvider, useFamily } from './context/FamilyContext';
import Onboarding from './components/Onboarding/Onboarding';
import MealPlan from './components/MealPlan/MealPlan';
import './index.css';

function AppContent() {
  const { perfil, loading } = useFamily();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', flexDirection: 'column', gap: 16,
        color: 'var(--muted)', fontFamily: 'var(--font-body)',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--terracotta)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p>Cargando CaseroAI...</p>
      </div>
    );
  }

  if (!perfil || !perfil.nombre) {
    return <Onboarding onComplete={() => {}} />;
  }

  return <MealPlan />;
}

export default function App() {
  return (
    <FamilyProvider>
      <AppContent />
    </FamilyProvider>
  );
}