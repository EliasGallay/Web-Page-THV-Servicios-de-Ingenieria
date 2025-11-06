// historial.js
import { fmtARS, fmtUSD } from "./config.js";

const HIST_KEY = "historialPresupuestos";

// === helpers de storage ===
export function leerHistorial() {
  try {
    return JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
  } catch {
    return [];
  }
}

export function escribirHistorial(arr) {
  localStorage.setItem(HIST_KEY, JSON.stringify(Array.isArray(arr) ? arr : []));
}

// === render de la tabla ===
export function renderHistorial(verEnUSD = false, dolarBlue = 0) {
  const tbody = document.getElementById("historialBody");
  if (!tbody) return;

  const data = leerHistorial();
  tbody.innerHTML = "";

  const asText = (raw) =>
    verEnUSD && dolarBlue ? fmtUSD(Number(raw || 0) / dolarBlue) : fmtARS(raw || 0);

  if (!data.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 10;
    td.textContent = "Sin registros todavía.";
    td.style.opacity = "0.7";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  data.forEach((it, idx) => {
    const tr = document.createElement("tr");

    const tdFecha = document.createElement("td");
    tdFecha.textContent = new Date(it.fecha).toLocaleString("es-AR");

    const tdTipo = document.createElement("td");
    tdTipo.textContent = it.tipo;

    const tdInput = document.createElement("td");
    tdInput.textContent = it.input ?? "-";

    const tdCad = document.createElement("td");
    tdCad.textContent = asText(it.cadista);

    const tdElec = document.createElement("td");
    tdElec.textContent = asText(it.electricas);

    const tdPip = document.createElement("td");
    tdPip.textContent = asText(it.piping);

    const tdBas = document.createElement("td");
    tdBas.textContent = asText(it.basica);

    const tdTotal = document.createElement("td");
    tdTotal.textContent = asText(it.total);

    const tdAcc = document.createElement("td");
    tdAcc.textContent = ""; // acá podés inyectar botones si querés

    tr.append(tdFecha, tdTipo, tdInput, tdCad, tdElec, tdPip, tdBas, tdTotal, tdAcc);
    tbody.appendChild(tr);
  });
}
