const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const COMIDAS_BASE = {
  pastas: {
    nombre: 'Pastas',
    items: ['Tallarines con tuco', 'Fideos con manteca', 'Ñoquis de papa', 'Lasagna', 'Fideos con crema'],
    categoria: 'carbohidratos', kidScore: 9, tiempo: 30,
    ingredientes: ['pasta', 'tomate', 'queso'],
  },
  carnes: {
    nombre: 'Carnes',
    items: ['Milanesas', 'Pollo al horno', 'Bife a la plancha', 'Pollo rebozado', 'Costillas al horno'],
    categoria: 'proteínas', kidScore: 8, tiempo: 40,
    ingredientes: ['carne', 'aceite', 'sal'],
  },
  guisos: {
    nombre: 'Guisos',
    items: ['Guiso de lentejas', 'Locro', 'Cazuela de pollo', 'Guiso de arroz'],
    categoria: 'completo', kidScore: 5, tiempo: 60,
    ingredientes: ['legumbres', 'verdura', 'caldo'],
  },
  sopas: {
    nombre: 'Sopas',
    items: ['Sopa de verduras', 'Caldo de pollo', 'Sopa de zapallo', 'Minestrone'],
    categoria: 'liviano', kidScore: 4, tiempo: 35,
    ingredientes: ['verdura', 'caldo', 'fideos'],
  },
  tartas: {
    nombre: 'Tartas y empanadas',
    items: ['Tarta de verdura', 'Tarta de jamón y queso', 'Empanadas', 'Pascualina'],
    categoria: 'horneados', kidScore: 7, tiempo: 50,
    ingredientes: ['masa', 'relleno', 'huevo'],
  },
  arrozPlatos: {
    nombre: 'Arroz',
    items: ['Arroz con pollo', 'Risotto', 'Arroz primavera', 'Arroz frito'],
    categoria: 'carbohidratos', kidScore: 7, tiempo: 35,
    ingredientes: ['arroz', 'caldo', 'verdura'],
  },
  ensaladas: {
    nombre: 'Ensaladas completas',
    items: ['Ensalada de pollo', 'Caesar con pollo', 'Ensalada de lentejas', 'Bowl de quinoa'],
    categoria: 'liviano', kidScore: 3, tiempo: 20,
    ingredientes: ['lechuga', 'tomate', 'proteína'],
  },
  hamburguesas: {
    nombre: 'Hamburguesas caseras',
    items: ['Hamburguesa clásica', 'Hamburguesa de pollo', 'Hamburguesa con huevo'],
    categoria: 'proteínas', kidScore: 10, tiempo: 25,
    ingredientes: ['carne molida', 'pan', 'queso'],
  },
};

function calcularScoreVariedad(planActual, categoriaCandidata, diaIndex) {
  let penalizacion = 0;
  const ventana = 2;
  for (let i = Math.max(0, diaIndex - ventana); i < diaIndex; i++) {
    if (planActual[i] && planActual[i].categoria === categoriaCandidata) {
      penalizacion += (ventana - (diaIndex - i)) * 30;
    }
  }
  return penalizacion;
}

function calcularScoreKids(categoria, perfil) {
  if (!perfil.tieneChicos) return 50;
  const base = COMIDAS_BASE[categoria].kidScore * 10;
  const historial = perfil.historialAceptacion?.[categoria] ?? 0;
  return Math.min(100, base + historial * 5);
}

function seleccionarCategoria(planActual, diaIndex, perfil, categoriasDisponibles) {
  const esFinde = diaIndex >= 5;
  const scores = categoriasDisponibles.map(cat => {
    const base = COMIDAS_BASE[cat];
    let score = 50;
    score -= calcularScoreVariedad(planActual, base.categoria, diaIndex);
    score += calcularScoreKids(cat, perfil) * 0.4;
    if (esFinde && base.tiempo >= 50) score += 15;
    if (!esFinde && base.tiempo <= 35) score += 10;
    if (perfil.preferencias?.includes(cat)) score += 20;
    if (perfil.evitar?.includes(cat)) score -= 50;
    return { cat, score };
  });
  scores.sort((a, b) => b.score - a.score);
  const top = scores.slice(0, Math.min(3, scores.length));
  return top[Math.floor(Math.random() * top.length)].cat;
}

export function generarPlanSemanal(perfil) {
  const plan = [];
  const categoriasDisponibles = Object.keys(COMIDAS_BASE);
  const usadasEstaSemana = new Set();

  for (let i = 0; i < 7; i++) {
    const disponibles = categoriasDisponibles.filter(cat => {
      const vecesUsada = plan.filter(p => p.categoriaKey === cat).length;
      return vecesUsada < 2;
    });
    const categoriaKey = seleccionarCategoria(plan, i, perfil, disponibles);
    const categoria = COMIDAS_BASE[categoriaKey];
    const platosDisponibles = categoria.items.filter(p => !usadasEstaSemana.has(p));
    const plato = platosDisponibles.length > 0
      ? platosDisponibles[Math.floor(Math.random() * platosDisponibles.length)]
      : categoria.items[Math.floor(Math.random() * categoria.items.length)];
    usadasEstaSemana.add(plato);
    const esNuevo = perfil.platosConocidos ? !perfil.platosConocidos.includes(plato) : false;
    plan.push({
      dia: DIAS[i], diaIndex: i, categoriaKey,
      categoria: categoria.nombre, categoriaTipo: categoria.categoria,
      plato, tiempo: categoria.tiempo, esNuevo,
      kidScore: categoria.kidScore, ingredientes: categoria.ingredientes,
    });
  }
  return plan;
}

export function generarListaCompras(plan) {
  const ingredientesMap = {};
  plan.forEach(dia => {
    dia.ingredientes.forEach(ing => {
      if (!ingredientesMap[ing]) {
        ingredientesMap[ing] = { nombre: ing, dias: [], cantidad: 1 };
      } else {
        ingredientesMap[ing].cantidad++;
      }
      ingredientesMap[ing].dias.push(dia.dia);
    });
  });
  return Object.values(ingredientesMap).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function calcularEstadisticas(plan) {
  const platosNuevos = plan.filter(d => d.esNuevo).length;
  const tiempoPromedio = Math.round(plan.reduce((sum, d) => sum + d.tiempo, 0) / plan.length);
  const categorias = [...new Set(plan.map(d => d.categoriaTipo))];
  const kidScorePromedio = Math.round(plan.reduce((sum, d) => sum + d.kidScore, 0) / plan.length);
  return { platosNuevos, tiempoPromedio, diversidad: categorias.length, kidScore: kidScorePromedio };
}

export { DIAS, COMIDAS_BASE };