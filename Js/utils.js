// utils.js
export function debounce(fn, wait = 350) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), wait);
  };
}

export function setBusy(isBusy) {
  document.body.classList.toggle("busy", isBusy);
}

export function validatePositiveNumber(raw, inputEl) {
  const v = Number(raw);
  const ok = Number.isFinite(v) && v > 0;
  if (inputEl) {
    inputEl.classList.toggle("is-invalid", !ok);
    inputEl.classList.toggle("is-valid", ok);
  }
  return ok;
}

export function validateSelection(value) {
  return ["piping", "electricas", "planos", "basica"].includes(value);
}
