const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Estación actual basada en hemisferio sur (Argentina)
function getEstacionActual() {
  const mes = new Date().getMonth() + 1; // 1-12
  if (mes >= 12 || mes <= 2) return 'verano';
  if (mes >= 3 && mes <= 5) return 'otono';
  if (mes >= 6 && mes <= 8) return 'invierno';
  return 'primavera';
}

const COMIDAS_BASE = {
  pastas: {
    nombre: 'Pastas',
    items: ['Tallarines con tuco', 'Fideos con manteca', 'Ñoquis de papa', 'Lasagna', 'Fideos con crema'],
    categoria: 'carbohidratos', kidScore: 9, tiempo: 30,
    ingredientes: ['pasta', 'tomate', 'queso'],
    estaciones: ['verano', 'otono', 'invierno', 'primavera'],
    bonusEstacion: { verano: 5, otono: 10, invierno: 10, primavera: 5 },
  },
  carnes: {
    nombre: 'Carnes',
    items: ['Milanesas', 'Pollo al horno', 'Bife a la plancha', 'Pollo rebozado', 'Costillas al horno'],
    categoria: 'proteínas', kidScore: 8, tiempo: 40,
    ingredientes: ['carne', 'aceite', 'sal'],
    estaciones: ['verano', 'otono', 'invierno', 'primavera'],
    bonusEstacion: { verano: 10, otono: 10, invierno: 5, primavera: 10 },
  },
  guisos: {
    nombre: 'Guisos',
    items: ['Guiso de lentejas', 'Cazuela de pollo', 'Guiso de arroz', 'Carbonada'],
    categoria: 'completo', kidScore: 5, tiempo: 60,
    ingredientes: ['legumbres', 'verdura', 'caldo'],
    estaciones: ['otono', 'invierno'],
    bonusEstacion: { verano: -50, otono: 20, invierno: 30, primavera: -10 },
  },
  sopas: {
    nombre: 'Sopas',
    items: ['Sopa de verduras', 'Caldo de pollo con fideos', 'Sopa de zapallo', 'Minestrone'],
    categoria: 'liviano', kidScore: 4, tiempo: 35,
    ingredientes: ['verdura', 'caldo', 'fideos'],
    estaciones: ['otono', 'invierno'],
    bonusEstacion: { verano: -40, otono: 15, invierno: 25, primavera: -5 },
  },
  tartas: {
    nombre: 'Tartas y empanadas',
    items: ['Tarta de verdura', 'Tarta de jamón y queso', 'Empanadas', 'Pascualina'],
    categoria: 'horneados', kidScore: 7, tiempo: 50,
    ingredientes: ['masa', 'relleno', 'huevo'],
    estaciones: ['verano', 'otono', 'invierno', 'primavera'],
    bonusEstacion: { verano: 5, otono: 10, invierno: 15, primavera: 10 },
  },
  arrozPlatos: {
    nombre: 'Arroz',
    items: ['Arroz con pollo', 'Arroz primavera', 'Arroz frito con verduras', 'Arroz con azafrán y cebolla'],
    categoria: 'carbohidratos', kidScore: 7, tiempo: 35,
    ingredientes: ['arroz', 'caldo', 'verdura'],
    estaciones: ['verano', 'otono', 'invierno', 'primavera'],
    bonusEstacion: { verano: 10, otono: 10, invierno: 5, primavera: 10 },
  },
  ensaladas: {
    nombre: 'Ensaladas completas',
    items: ['Ensalada de pollo', 'Caesar con pollo', 'Ensalada de lentejas', 'Ensalada de papa y huevo'],
    categoria: 'liviano', kidScore: 3, tiempo: 20,
    ingredientes: ['lechuga', 'tomate', 'proteína'],
    estaciones: ['verano', 'primavera'],
    bonusEstacion: { verano: 25, otono: -10, invierno: -20, primavera: 20 },
  },
  hamburguesas: {
    nombre: 'Hamburguesas caseras',
    items: ['Hamburguesa clásica', 'Hamburguesa de pollo', 'Hamburguesa con huevo'],
    categoria: 'proteínas', kidScore: 10, tiempo: 25,
    ingredientes: ['carne molida', 'pan', 'queso'],
    estaciones: ['verano', 'otono', 'invierno', 'primavera'],
    bonusEstacion: { verano: 15, otono: 10, invierno: 5, primavera: 15 },
  },
  tortillas: {
    nombre: 'Tortillas y huevos',
    items: ['Tortilla de papa', 'Tortilla con cebolla', 'Revuelto gramajo', 'Huevos a la cazuela'],
    categoria: 'proteínas', kidScore: 7, tiempo: 25,
    ingredientes: ['huevo', 'papa', 'aceite'],
    estaciones: ['verano', 'otono', 'invierno', 'primavera'],
    bonusEstacion: { verano: 10, otono: 10, invierno: 10, primavera: 10 },
  },
  pure: {
    nombre: 'Puré y guarniciones',
    items: ['Puré de papas con milanesa', 'Puré de zapallo', 'Papas al horno', 'Puré mixto'],
    categoria: 'carbohidratos', kidScore: 9, tiempo: 35,
    ingredientes: ['papa', 'manteca', 'leche'],
    estaciones: ['otono', 'invierno', 'primavera'],
    bonusEstacion: { verano: -10, otono: 15, invierno: 20, primavera: 10 },
  },
};

function calcularScoreVariedad(planActual, categoriaCandidata, diaIndex) {
  let penalizacion = 0;
  const ventana = 2;
  for (let i = Math.max(0, diaIndex - ventana); i < diaIndex; i++) {
    if (planActual[i] && planActual[i].categoriaTipo === categoriaCandidata) {
      penalizacion += (ventana - (diaIndex - i)) * 30;
    }
  }
  return penalizacion;
}

function calcularScoreKids(categoriaKey, perfil) {
  if (!perfil.tieneChicos) return 50;
  const base = COMIDAS_BASE[categoriaKey].kidScore * 10;
  const historial = perfil.historialAceptacion?.[categoriaKey] ?? 0;
  return Math.min(100, base + historial * 5);
}

function seleccionarCategoria(planActual, diaIndex, perfil, categoriasDisponibles) {
  const esFinde = diaIndex >= 5;
  const estacion = getEstacionActual();

  const scores = categoriasDisponibles.map(cat => {
    const base = COMIDAS_BASE[cat];
    let score = 50;

    // Variedad
    score -= calcularScoreVariedad(planActual, base.categoria, diaIndex);

    // Kids
    score += calcularScoreKids(cat, perfil) * 0.4;

    // Tiempo disponible
    if (esFinde && base.tiempo >= 50) score += 15;
    if (!esFinde && base.tiempo <= 35) score += 10;

    // Estacionalidad ← NUEVO
    score += (base.bonusEstacion?.[estacion] ?? 0);

    // Preferencias del usuario
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
  const platosConocidos = perfil.platosConocidos || [];

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

    // Fix: solo marca como nuevo si no está en platosConocidos
    const esNuevo = platosConocidos.length > 0
      ? !platosConocidos.includes(plato)
      : false;

    plan.push({
      dia: DIAS[i], diaIndex: i, categoriaKey,
      categoria: categoria.nombre, categoriaTipo: categoria.categoria,
      plato, tiempo: categoria.tiempo, esNuevo,
      kidScore: categoria.kidScore, ingredientes: categoria.ingredientes,
      estacion: getEstacionActual(),
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