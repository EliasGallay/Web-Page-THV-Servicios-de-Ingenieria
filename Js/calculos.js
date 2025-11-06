// calculos.js
import { CONFIG } from "./config.js";

/** Calcula el honorario mínimo por tramos usando reduce */
export function calcularHonorarioMinimoHM(valorHMNormalizado, cfg = CONFIG.HM) {
  const { montoDeObra, honorarioMinimo, valorHM } = cfg;

  const acc = montoDeObra.reduce(
    (acc, seg, i) => {
      if (acc.remaining > seg) {
        return {
          remaining: acc.remaining - seg,
          sumMin: acc.sumMin + (honorarioMinimo[i] ?? 0),
        };
      }
      return acc;
    },
    { remaining: Number(valorHMNormalizado) || 0, sumMin: 0 },
  );

  const resto = Math.max(0, acc.remaining) * 0.05;
  return (acc.sumMin + resto) * valorHM;
}

/** CAD */
export function calcularDigitalizacionPlanos(horas, cfg = CONFIG) {
  const hm = cfg.HM.valorHM;
  const valorHoraCadista = hm * cfg.FACTORES.cadistaPorHM;
  return Number(horas) * valorHoraCadista;
}

/** Instalación Eléctrica */
export function calcularInstalacionElectrica(potenciaInstalada, cfg = CONFIG) {
  const { valorHM, valorKWFactor } = cfg.HM;
  const valorKW = valorHM * valorKWFactor;
  const valorInstalacion = Number(potenciaInstalada) * valorKW;
  const valorEnHM = valorInstalacion / valorHM;
  return calcularHonorarioMinimoHM(valorEnHM, cfg.HM);
}

/** Ingeniería Básica */
export function calcularIngenieriaBasica(presuCad, presuElec, montoObraCivil, cfg = CONFIG) {
  const civil = Number(montoObraCivil) * cfg.FACTORES.obraCivil;
  return Number(presuCad) + Number(presuElec) + civil;
}

/** Piping */
export function calcularPiping(presuCad, presuElec, metrosLineales, cfg = CONFIG) {
  const valorMetro = cfg.HM.valorHM * cfg.FACTORES.pipingPorHM;
  return Number(presuCad) + Number(presuElec) + Number(metrosLineales) * valorMetro;
}
