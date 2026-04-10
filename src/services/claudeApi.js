const SYSTEM_PROMPT = `Sos un chef y consejero familiar argentino, cálido y práctico. 
Tu rol es explicar planes de comida semanales, dar consejos de cocina adaptados a familias con chicos, 
y sugerir cómo hacer más atractivos los platos nuevos para niños.
Respondé siempre en español rioplatense, de forma concisa y amigable.
Usá vocabulario argentino (vos, che, etc). Máximo 150 palabras por respuesta.`;

export async function consultarClaude(mensaje, contexto = '') {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('API key de Anthropic no configurada');

  const mensajeCompleto = contexto
    ? `Contexto del plan familiar: ${contexto}\n\nConsulta: ${mensaje}`
    : mensaje;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: mensajeCompleto }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al consultar Claude');
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function generarConsejoPlan(plan, perfil) {
  const resumenPlan = plan
    .map(d => `${d.dia}: ${d.plato}${d.esNuevo ? ' (NUEVO)' : ''}`)
    .join(', ');

  const contexto = `Familia de ${perfil.personas} personas${perfil.tieneChicos ? ' con chicos' : ''}. 
    Preferencias: ${perfil.preferencias?.join(', ') || 'variado'}.`;

  const mensaje = `Este es el plan semanal generado: ${resumenPlan}. 
    Dame un consejo general sobre este menú y cómo presentar los platos nuevos a los chicos.`;

  return consultarClaude(mensaje, contexto);
}

export async function consultarSobrePlato(plato, pregunta) {
  return consultarClaude(`Sobre el plato "${plato}": ${pregunta}`);
}