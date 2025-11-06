import {
  calcularHonorarioMinimoHM,
  calcularDigitalizacionPlanos,
  calcularInstalacionElectrica,
  calcularIngenieriaBasica,
  calcularPiping,
} from "./calculos.js";
import { fmtARS } from "./config.js";
import {
  debounce,
  setBusy,
  validatePositiveNumber,
  validateSelection,
} from "./utils.js";
import {
  leerHistorial,
  escribirHistorial,
  renderHistorial,
} from "./historial.js";
import { renderGraficoResumen } from "./charts.js";

let total = 0;
const menuOpciones = document.getElementById("menuOpciones");
const input = document.getElementById("inputCotizador");

const setTotalOf = (valueId, value) => {
  const el = document.getElementById(valueId);
  if (!el) return;
  el.dataset.raw = value != null ? String(value) : "0";
  el.textContent = value != null ? fmtARS(value) : "";
};

const getRawNumber = (valueId) =>
  Number(
    document.getElementById(valueId)?.dataset?.raw ??
      document.getElementById(valueId)?.textContent ??
      0
  ) || 0;

const actualizartotal = (valor) => {
  total = (Number(total) || 0) + Number(valor || 0);
  setTotalOf("total", total);
};

const guardarPresupuestos = () => {
  const presupuestos = {
    cadista: getRawNumber("finalCad"),
    electricas: getRawNumber("finalElectrica"),
    piping: getRawNumber("finalPiping"),
    basica: getRawNumber("finalBasica"),
    total: getRawNumber("total"),
  };
  localStorage.setItem("presupuestos", JSON.stringify(presupuestos));
};

const cargarPresupuestos = () => {
  const presupuestos = JSON.parse(localStorage.getItem("presupuestos") || "{}");
  setTotalOf("total", presupuestos.total ?? 0);
  setTotalOf("finalCad", presupuestos.cadista ?? 0);
  setTotalOf("finalElectrica", presupuestos.electricas ?? 0);
  setTotalOf("finalPiping", presupuestos.piping ?? 0);
  setTotalOf("finalBasica", presupuestos.basica ?? 0);
  total = getRawNumber("total");
};

const HIST_KEY = "historialPresupuestos";

function snapshotPresupuestos() {
  return {
    cadista: getRawNumber("finalCad"),
    electricas: getRawNumber("finalElectrica"),
    piping: getRawNumber("finalPiping"),
    basica: getRawNumber("finalBasica"),
    total: getRawNumber("total"),
  };
}

function addToHistorial(entry) {
  const arr = leerHistorial();
  arr.unshift({ ...entry, fecha: new Date().toISOString() });
  escribirHistorial(arr);
  renderHistorial();
  renderGraficoResumen(snapshotPresupuestos());
}

function recomputeEntry(item) {
  const next = { ...item };

  switch (item.tipo) {
    case "planos": {
      next.cadista = calcularDigitalizacionPlanos(item.input);
      break;
    }
    case "electricas": {
      next.electricas = calcularInstalacionElectrica(item.input);
      break;
    }
    case "piping": {
      const cad = Number(item.cadista || 0);
      const elec = Number(item.electricas || 0);
      next.piping = calcularPiping(cad, elec, item.input);
      break;
    }
    case "basica": {
      const cad = Number(item.cadista || 0);
      const elec = Number(item.electricas || 0);
      next.basica = calcularIngenieriaBasica(
        cad,
        elec,
        item.montoObraCivil || 0
      );
      break;
    }
  }

  next.total =
    Number(next.cadista || 0) +
    Number(next.electricas || 0) +
    Number(next.piping || 0) +
    Number(next.basica || 0);

  next.fecha = new Date().toISOString();
  return next;
}

const normalizeKey = (v) =>
  String(v || "")
    .toLowerCase()
    .replace(/^calcular\s+/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

input?.addEventListener(
  "input",
  debounce(() => {
    validatePositiveNumber(input.value, input);
  }, 300)
);

menuOpciones?.addEventListener("change", () => {
  document
    .querySelectorAll(".contenido")
    .forEach((div) => (div.style.display = "none"));
  const key = normalizeKey(menuOpciones.value);
  const opcSelected = document.querySelector(`.contenido#${key}`);
  const inputAndButton = document.getElementById("inputAndButton");
  if (menuOpciones.value) inputAndButton.style.display = "block";
  if (opcSelected) opcSelected.style.display = "block";

  const i = document.getElementById("inputCotizador");
  if (i) {
    i.value = "";
    i.classList.remove("is-invalid", "is-valid");
  }
});

document
  .getElementById("formularioCotizador")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const opcionesRaw = formData.get("opcionesCotizador");
    const opcionesCotizador = normalizeKey(opcionesRaw);
    const valStr = String(formData.get("inputCotizador") ?? "").trim();
    const val = Number(valStr);
    const inputEl = document.getElementById("inputCotizador");

    if (!validateSelection(opcionesCotizador)) {
      Swal.fire({
        title: "Seleccioná una opción",
        text: "Elegí el tipo de cálculo antes de enviar.",
        icon: "info",
        confirmButtonText: "Ok",
      });
      return;
    }

    if (!validatePositiveNumber(valStr, inputEl)) {
      Swal.fire({
        title: "Dato inválido",
        text: "Ingresá un número mayor a 0.",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    setBusy(true);
    try {
      switch (opcionesCotizador) {
        case "electricas": {
          const final = calcularInstalacionElectrica(val);
          actualizartotal(final);
          setTotalOf("finalElectrica", final);
          break;
        }
        case "planos": {
          const final = calcularDigitalizacionPlanos(val);
          actualizartotal(final);
          setTotalOf("finalCad", final);
          break;
        }
        case "piping": {
          const presuCad = getRawNumber("finalCad");
          const presuElec = getRawNumber("finalElectrica");
          const final = calcularPiping(presuCad, presuElec, val);
          actualizartotal(final);
          setTotalOf("finalPiping", final);
          break;
        }
        case "basica": {
          const presuCad = getRawNumber("finalCad");
          const presuElec = getRawNumber("finalElectrica");
          if (presuCad <= 0 || presuElec <= 0) {
            Swal.fire({
              title: "Falta información",
              text: "Primero calculá Digitalización de Planos y Obra Eléctrica.",
              icon: "error",
              confirmButtonText: "Ok",
            });
            return;
          }
          const final = calcularIngenieriaBasica(presuCad, presuElec, val);
          actualizartotal(final);
          setTotalOf("finalBasica", final);
          break;
        }
      }

      guardarPresupuestos();
      renderGraficoResumen(snapshotPresupuestos());
      addToHistorial({
        tipo: opcionesCotizador,
        input: val,
        ...snapshotPresupuestos(),
        ...(opcionesCotizador === "basica" ? { montoObraCivil: val } : {}),
      });
    } finally {
      setBusy(false);
    }
  });

document
  .getElementById("historialBody")
  ?.addEventListener("click", async (ev) => {
    const btn = ev.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const index = Number(btn.dataset.index);
    const arr = leerHistorial();
    const item = arr[index];
    if (!item) return;

    setBusy(true);
    try {
      if (action === "eliminar") {
        arr.splice(index, 1);
        escribirHistorial(arr);
        renderHistorial();
        renderGraficoResumen(snapshotPresupuestos());
        return;
      }

      if (action === "recalcular") {
        const next = recomputeEntry(item);
        arr[index] = next;
        escribirHistorial(arr);
        renderHistorial();
        renderGraficoResumen(snapshotPresupuestos());
      }
    } finally {
      setBusy(false);
    }
  });

document.getElementById("botonLimpiar")?.addEventListener("click", () => {
  localStorage.removeItem("presupuestos");
  total = 0;
  setTotalOf("total", 0);
  setTotalOf("finalCad", 0);
  setTotalOf("finalElectrica", 0);
  setTotalOf("finalPiping", 0);
  setTotalOf("finalBasica", 0);
  renderGraficoResumen(snapshotPresupuestos());
});

window.addEventListener("load", () => {
  cargarPresupuestos();
  renderHistorial();
  renderGraficoResumen(snapshotPresupuestos());

  const sel = document.getElementById("menuOpciones");
  if (sel && sel.value) {
    const key = normalizeKey(sel.value);
    const opcSelected = document.querySelector(`.contenido#${key}`);
    if (opcSelected) {
      document
        .getElementById("inputAndButton")
        ?.style?.setProperty("display", "block");
      opcSelected.style.display = "block";
    }
  }
});

document
  .getElementById("botonLimpiarHistorial")
  ?.addEventListener("click", () => {
    Swal.fire({
      title: "¿Borrar todo el historial?",
      text: "Se eliminarán todos los registros guardados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, borrar todo",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("historialPresupuestos");
        renderHistorial();
        renderGraficoResumen(snapshotPresupuestos());
        Swal.fire(
          "Historial eliminado",
          "Los registros fueron borrados.",
          "success"
        );
      }
    });
  });
