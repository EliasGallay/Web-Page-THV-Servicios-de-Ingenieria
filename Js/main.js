import { obtenerDolarBlue } from "./dolar.js";
import { fmtARS } from "./config.js";
import { renderHistorial } from "./historial.js";

let dolarBlue = null;
let verEnUSD = false;

function actualizarMonedaUI() {
  const celdas = document.querySelectorAll("[data-raw]");
  celdas.forEach((el) => {
    const raw = Number(el.dataset.raw || 0);
    el.textContent =
      verEnUSD && dolarBlue
        ? `$ ${(raw / dolarBlue).toFixed(2)} USD`
        : fmtARS(raw);
  });
  renderHistorial(verEnUSD, dolarBlue || 0);
}
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("toggleUSD");
  if (!btn) {
    console.warn("No se encontró #toggleUSD en el DOM.");
    return;
  }

  btn.addEventListener("click", async () => {
    if (verEnUSD) {
      verEnUSD = false;
      actualizarMonedaUI();
      return;
    }

    try {
      btn.disabled = true;
      Swal.fire({
        title: "Cargando...",
        text: "Obteniendo cotización del dólar",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      if (!dolarBlue) {
        dolarBlue = await obtenerDolarBlue();
      }

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Cotización obtenida",
        text: `1 USD ≈ ${fmtARS(dolarBlue)}`,
      });

      verEnUSD = true;
      actualizarMonedaUI();
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error al obtener el dólar",
        text: "No se pudo conectar con la API. Mostrando valores en ARS.",
      });
    } finally {
      btn.disabled = false;
    }
  });
});
