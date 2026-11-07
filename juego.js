const MAX_TURNOS = 12;
const META = 100;

let confianza = 40;
let turnos = MAX_TURNOS;
let terminado = false;
let historial = [];

const chat = document.getElementById("chat");
const formulario = document.getElementById("formulario");
const entrada = document.getElementById("entrada");
const barraConfianza = document.getElementById("confianza");
const textoEstado = document.getElementById("estado");
const textoTurnos = document.getElementById("turnos");

function actualizarPantalla() {
  barraConfianza.style.width = `${Math.max(0, Math.min(100, confianza))}%`;
  textoEstado.textContent = `Confianza: ${confianza} / ${META}`;
  textoTurnos.textContent = `Turnos restantes: ${turnos}`;
  chat.scrollTop = chat.scrollHeight;
}

function agregarMensaje(texto, tipo) {
  const div = document.createElement("div");
  div.className = `msg ${tipo}`;
  div.textContent = texto;
  chat.appendChild(div);
  historial.push({ role: tipo === "jugador" ? "user" : "assistant", content: texto });
  actualizarPantalla();
}

function terminar(gano) {
  terminado = true;
  entrada.disabled = true;
  const div = document.createElement("div");
  div.className = `msg fin ${gano ? "gano" : "perdio"}`;
  div.textContent = gano 
    ? "¡Felicidades! El chef te entregó tu comida." 
    : "Has agotado la paciencia del chef. tu comida se ha enfriado.";
  chat.appendChild(div);
  actualizarPantalla();
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (terminado) return;

  const texto = entrada.value.trim();
  if (!texto) return;

  agregarMensaje(texto, "jugador");
  entrada.value = "";
  turnos--;

  const ia = await consultarDragonIA(texto, historial);
  let sentimiento, cambio, respuesta;

  if (ia) {
    sentimiento = ia.sentimiento;
    cambio = sentimiento * 2.5;
    respuesta = ia.respuesta;
  } else {
    sentimiento = analizarSentimiento(texto);
    cambio = sentimiento * 6;
    const intencion = detectarIntencion(texto);
    const humor = sentimiento >= 0 && confianza >= 25 ? "bien" : "mal";
    respuesta = RESPUESTAS[intencion][humor];
  }

  confianza = Math.max(0, Math.min(META, confianza + cambio));
  agregarMensaje(respuesta, "dragon-msg");

  if (confianza >= META) {
    terminar(true);
  } else if (confianza <= 0 || turnos === 0) {
    terminar(false);
  }
});

actualizarPantalla();