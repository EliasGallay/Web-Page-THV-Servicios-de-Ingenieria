export async function obtenerDolarBlue() {
  try {
    const res = await fetch("https://api.bluelytics.com.ar/v2/latest");
    if (!res.ok) throw new Error("Error de red");
    const data = await res.json();
    const valor = data?.blue?.value_avg;
    if (!valor) throw new Error("Dato no disponible");
    return valor;
  } catch (err) {
    console.error("Fallo obtenerDolarBlue:", err);
    throw err;
  }
}
