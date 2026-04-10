import { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import './Onboarding.css';

const PREFERENCIAS_OPCIONES = [
  { key: 'pastas', label: '🍝 Pastas', emoji: '🍝' },
  { key: 'carnes', label: '🥩 Carnes', emoji: '🥩' },
  { key: 'guisos', label: '🍲 Guisos', emoji: '🍲' },
  { key: 'tartas', label: '🥧 Tartas', emoji: '🥧' },
  { key: 'arrozPlatos', label: '🍚 Arroz', emoji: '🍚' },
  { key: 'hamburguesas', label: '🍔 Hamburguesas', emoji: '🍔' },
  { key: 'sopas', label: '🍵 Sopas', emoji: '🍵' },
  { key: 'ensaladas', label: '🥗 Ensaladas', emoji: '🥗' },
];

export default function Onboarding({ onComplete }) {
  const { guardarPerfil } = useFamily();
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    personas: 4,
    tieneChicos: true,
    edadesChicos: '',
    preferencias: ['pastas', 'carnes'],
    evitar: [],
    comercios: [{ nombre: '', horarioPico: '' }],
  });

  function toggleOpcion(campo, valor) {
    setForm(prev => ({
      ...prev,
      [campo]: prev[campo].includes(valor)
        ? prev[campo].filter(v => v !== valor)
        : [...prev[campo], valor],
    }));
  }

  async function finalizar() {
    setGuardando(true);
    try {
      await guardarPerfil(form);
      onComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="onboarding">
      <div className="onboarding__bg" />
      <div className="onboarding__content">
        <div className="onboarding__header">
          <span className="onboarding__logo">🍽️ CaseroAI</span>
          <div className="onboarding__steps">
            {[1, 2, 3].map(n => (
              <div key={n} className={`step-dot ${paso >= n ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        {paso === 1 && (
          <div className="onboarding__card animate-fadeUp">
            <h1>¡Hola! Contanos sobre tu familia</h1>
            <p className="onboarding__subtitle">Así podemos armar el menú perfecto para ustedes</p>

            <div className="form-group">
              <label>¿Cómo se llama tu familia o vos?</label>
              <input
                type="text"
                placeholder="Ej: Los García, Marcelo..."
                value={form.nombre}
                onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>¿Cuántas personas comen en casa?</label>
              <div className="counter">
                <button onClick={() => setForm(p => ({ ...p, personas: Math.max(1, p.personas - 1) }))}>−</button>
                <span>{form.personas}</span>
                <button onClick={() => setForm(p => ({ ...p, personas: Math.min(10, p.personas + 1) }))}>+</button>
              </div>
            </div>

            <div className="form-group">
              <label>¿Hay chicos en casa?</label>
              <div className="toggle-group">
                <button className={`toggle-btn ${form.tieneChicos ? 'active' : ''}`} onClick={() => setForm(p => ({ ...p, tieneChicos: true }))}>Sí 👶</button>
                <button className={`toggle-btn ${!form.tieneChicos ? 'active' : ''}`} onClick={() => setForm(p => ({ ...p, tieneChicos: false }))}>No</button>
              </div>
            </div>

            {form.tieneChicos && (
              <div className="form-group animate-fadeIn">
                <label>¿Qué edades tienen? (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: 5, 8 años"
                  value={form.edadesChicos}
                  onChange={e => setForm(p => ({ ...p, edadesChicos: e.target.value }))}
                />
              </div>
            )}

            <button className="btn-primary full-width" onClick={() => setPaso(2)} disabled={!form.nombre}>
              Siguiente →
            </button>
          </div>
        )}

        {paso === 2 && (
          <div className="onboarding__card animate-fadeUp">
            <h1>¿Qué les gusta comer?</h1>
            <p className="onboarding__subtitle">Seleccioná las categorías que más disfrutan</p>

            <div className="opciones-grid">
              {PREFERENCIAS_OPCIONES.map(op => (
                <button
                  key={op.key}
                  className={`opcion-btn ${form.preferencias.includes(op.key) ? 'selected' : ''}`}
                  onClick={() => toggleOpcion('preferencias', op.key)}
                >
                  <span className="opcion-emoji">{op.emoji}</span>
                  <span>{op.label.split(' ').slice(1).join(' ')}</span>
                </button>
              ))}
            </div>

            <div className="form-group" style={{ marginTop: 24 }}>
              <label>¿Algo que prefieren evitar? (opcional)</label>
              <div className="opciones-grid">
                {PREFERENCIAS_OPCIONES.map(op => (
                  <button
                    key={op.key}
                    className={`opcion-btn small ${form.evitar.includes(op.key) ? 'selected-red' : ''}`}
                    onClick={() => toggleOpcion('evitar', op.key)}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="btn-row">
              <button className="btn-ghost" onClick={() => setPaso(1)}>← Atrás</button>
              <button className="btn-primary" onClick={() => setPaso(3)}>Siguiente →</button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="onboarding__card animate-fadeUp">
            <h1>¿Dónde comprás?</h1>
            <p className="onboarding__subtitle">Agregá tus comercios de barrio para optimizar las compras</p>

            {form.comercios.map((comercio, i) => (
              <div key={i} className="comercio-row">
                <input
                  type="text"
                  placeholder="Nombre del comercio"
                  value={comercio.nombre}
                  onChange={e => {
                    const nuevos = [...form.comercios];
                    nuevos[i].nombre = e.target.value;
                    setForm(p => ({ ...p, comercios: nuevos }));
                  }}
                />
                <input
                  type="text"
                  placeholder="Horario pico (ej: 9-10hs)"
                  value={comercio.horarioPico}
                  onChange={e => {
                    const nuevos = [...form.comercios];
                    nuevos[i].horarioPico = e.target.value;
                    setForm(p => ({ ...p, comercios: nuevos }));
                  }}
                />
              </div>
            ))}

            <button
              className="btn-ghost"
              onClick={() => setForm(p => ({ ...p, comercios: [...p.comercios, { nombre: '', horarioPico: '' }] }))}
            >
              + Agregar otro comercio
            </button>

            <div className="btn-row" style={{ marginTop: 24 }}>
              <button className="btn-ghost" onClick={() => setPaso(2)}>← Atrás</button>
              <button className="btn-primary" onClick={finalizar} disabled={guardando}>
                {guardando ? 'Guardando...' : '¡Listo! Generar mi menú →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}