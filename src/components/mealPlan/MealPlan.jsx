import { useState, useEffect } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { generarPlanSemanal, calcularEstadisticas, generarListaCompras } from '../../services/mealPlanner';
import { generarConsejoPlan, consultarSobrePlato } from '../../services/claudeApi';
import './MealPlan.css';

const CATEGORIA_COLORES = {
  carbohidratos: { bg: '#FFF8E8', color: '#9B7A20', label: '🌾 Carbos' },
  proteínas:     { bg: '#FFF0E8', color: '#C4622D', label: '🥩 Proteínas' },
  completo:      { bg: '#F0F0FF', color: '#5B5BCC', label: '🍲 Completo' },
  liviano:       { bg: '#E8F4E8', color: '#2D6A35', label: '🥗 Liviano' },
  horneados:     { bg: '#FFF0F5', color: '#C44D7A', label: '🥧 Horneado' },
};

export default function MealPlan() {
  const { perfil, plan, guardarPlan } = useFamily();
  const [planLocal, setPlanLocal] = useState(plan);
  const [stats, setStats] = useState(null);
  const [consejo, setConsejo] = useState('');
  const [cargandoConsejo, setCargandoConsejo] = useState(false);
  const [preguntaActiva, setPreguntaActiva] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const [cargandoRespuesta, setCargandoRespuesta] = useState(false);
  const [preguntaTexto, setPreguntaTexto] = useState('');
  const [vista, setVista] = useState('plan');

  useEffect(() => {
    if (!planLocal && perfil) {
      regenerarPlan();
    } else if (planLocal) {
      setStats(calcularEstadisticas(planLocal));
    }
  }, [perfil]);

  function regenerarPlan() {
    const nuevoPlan = generarPlanSemanal(perfil);
    setPlanLocal(nuevoPlan);
    setStats(calcularEstadisticas(nuevoPlan));
    guardarPlan(nuevoPlan);
    setConsejo('');
  }

  async function pedirConsejo() {
    if (!planLocal) return;
    setCargandoConsejo(true);
    try {
      const texto = await generarConsejoPlan(planLocal, perfil);
      setConsejo(texto);
    } catch (e) {
      setConsejo('No se pudo obtener el consejo. Revisá tu API key.');
    } finally {
      setCargandoConsejo(false);
    }
  }

  async function preguntarSobrePlato(plato) {
    if (!preguntaTexto.trim()) return;
    setCargandoRespuesta(true);
    try {
      const texto = await consultarSobrePlato(plato, preguntaTexto);
      setRespuesta(texto);
    } catch (e) {
      setRespuesta('No se pudo obtener respuesta.');
    } finally {
      setCargandoRespuesta(false);
    }
  }

  if (!planLocal) {
    return (
      <div className="meal-plan__loading">
        <div className="spinner" />
        <p>Generando tu menú...</p>
      </div>
    );
  }

  return (
    <div className="meal-plan">
      <div className="meal-plan__header">
        <div>
          <h1>Menú de la semana</h1>
          <p className="meal-plan__sub">Hola <strong>{perfil?.nombre}</strong> 👋 — {planLocal.length} días planificados</p>
        </div>
        <div className="meal-plan__actions">
          <button className="btn-secondary" onClick={regenerarPlan}>🔄 Nuevo menú</button>
          <button className="btn-primary" onClick={pedirConsejo} disabled={cargandoConsejo}>
            {cargandoConsejo ? '⏳ Consultando...' : '🤖 Pedir consejo'}
          </button>
        </div>
      </div>

      {stats && (
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">{stats.platosNuevos}</span>
            <span className="stat-label">platos nuevos</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.tiempoPromedio}'</span>
            <span className="stat-label">tiempo promedio</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.diversidad}</span>
            <span className="stat-label">categorías distintas</span>
          </div>
          {perfil?.tieneChicos && (
            <div className="stat">
              <span className="stat-value">{stats.kidScore}/10</span>
              <span className="stat-label">score para chicos</span>
            </div>
          )}
        </div>
      )}

      {consejo && (
        <div className="consejo-card animate-fadeUp">
          <span className="consejo-icon">👨‍🍳</span>
          <div>
            <strong>Consejo del chef</strong>
            <p>{consejo}</p>
          </div>
          <button className="consejo-close" onClick={() => setConsejo('')}>×</button>
        </div>
      )}

      <div className="nav-tabs">
        <button className={vista === 'plan' ? 'active' : ''} onClick={() => setVista('plan')}>📅 Plan semanal</button>
        <button className={vista === 'compras' ? 'active' : ''} onClick={() => setVista('compras')}>🛒 Lista de compras</button>
      </div>

      {vista === 'plan' && (
        <div className="dias-grid">
          {planLocal.map((dia, i) => {
            const color = CATEGORIA_COLORES[dia.categoriaTipo] || CATEGORIA_COLORES.completo;
            return (
              <div
                key={dia.dia}
                className={`dia-card ${preguntaActiva === i ? 'expanded' : ''}`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="dia-card__top">
                  <div>
                    <span className="dia-nombre">{dia.dia}</span>
                    {dia.esNuevo && <span className="tag-nuevo">✨ Nuevo</span>}
                  </div>
                  <span className="dia-tiempo">⏱ {dia.tiempo}'</span>
                </div>

                <h3 className="dia-plato">{dia.plato}</h3>

                <div className="dia-card__bottom">
                  <span className="tag-categoria" style={{ background: color.bg, color: color.color }}>
                    {color.label}
                  </span>
                  <button className="btn-ask" onClick={() => {
                    setPreguntaActiva(preguntaActiva === i ? null : i);
                    setRespuesta('');
                    setPreguntaTexto('');
                  }}>💬</button>
                </div>

                {preguntaActiva === i && (
                  <div className="dia-pregunta animate-fadeIn">
                    <input
                      type="text"
                      placeholder="¿Cómo lo hago? ¿Variantes? ..."
                      value={preguntaTexto}
                      onChange={e => setPreguntaTexto(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && preguntarSobrePlato(dia.plato)}
                    />
                    <button className="btn-primary" onClick={() => preguntarSobrePlato(dia.plato)} disabled={cargandoRespuesta}>
                      {cargandoRespuesta ? '⏳' : 'Preguntar'}
                    </button>
                    {respuesta && (
                      <div className="respuesta-box animate-fadeIn">
                        <p>{respuesta}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {vista === 'compras' && (
        <ShoppingView plan={planLocal} perfil={perfil} />
      )}
    </div>
  );
}

function ShoppingView({ plan, perfil }) {
  const lista = generarListaCompras(plan);
  const comercios = perfil?.comercios?.filter(c => c.nombre) || [];

  return (
    <div className="shopping-view animate-fadeUp">
      <div className="shopping-header">
        <h2>Lista de compras</h2>
        <p>{lista.length} ingredientes para la semana</p>
      </div>
      <div className="shopping-grid">
        <div className="shopping-ingredientes">
          <h3>Ingredientes</h3>
          <div className="ingredientes-list">
            {lista.map(item => (
              <div key={item.nombre} className="ingrediente-item">
                <span className="ingrediente-nombre">{item.nombre}</span>
                {item.cantidad > 1 && <span className="ingrediente-cantidad">×{item.cantidad}</span>}
              </div>
            ))}
          </div>
        </div>

        {comercios.length > 0 && (
          <div className="shopping-comercios">
            <h3>Tus comercios</h3>
            {comercios.map((c, i) => (
              <div key={i} className="comercio-card">
                <span className="comercio-nombre">🏪 {c.nombre}</span>
                {c.horarioPico && <span className="comercio-pico">⚠️ Evitar {c.horarioPico}</span>}
              </div>
            ))}
            <p className="comercios-tip">💡 Comprá temprano o después de las 19hs para evitar picos</p>
          </div>
        )}
      </div>
    </div>
  );
}