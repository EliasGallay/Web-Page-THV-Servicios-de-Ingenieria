export const CONFIG = {
  HM: {
    montoDeObra: [36, 54, 182, 638, 910],
    honorarioMinimo: [2.52, 3.51, 10.92, 35.09, 52.04],
    valorHM: 350000,
    valorKWFactor: 0.967,
  },
  FACTORES: {
    cadistaPorHM: 0.035,
    pipingPorHM: 0.15,
    obraCivil: 0.01,
  },
};

export const fmtARS = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

export const fmtUSD = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n ?? 0);
