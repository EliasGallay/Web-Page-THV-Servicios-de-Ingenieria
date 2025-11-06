// charts.js
let chartDonut = null;
let chartBars = null;

/**
 * Renderiza/actualiza los gráficos de composición a partir del "presupuestoActual"
 * @param {{ cadista:number, electricas:number, piping:number, basica:number, total:number }} p
 */
export function renderGraficoResumen(p) {
  const labels = ["CAD", "Eléctrica", "Piping", "Básica"];
  const data = [
    Number(p.cadista || 0),
    Number(p.electricas || 0),
    Number(p.piping || 0),
    Number(p.basica || 0),
  ];

  // Si no hay datos (>0), mostramos todo en cero pero evitando NaN
  const hasAny = data.some((v) => v > 0);

  // Donut
  const ctxDonut = document.getElementById("chartResumenDonut");
  if (ctxDonut) {
    const donutCfg = {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: data.map((v) => (hasAny ? v : 0)),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: { callbacks: { label: (c) => `${c.label}: ${c.raw?.toLocaleString("es-AR")}` } },
          legend: { position: "bottom" },
          title: { display: true, text: "Distribución por rubro" },
        },
        cutout: "55%",
      },
    };

    if (chartDonut) {
      chartDonut.data = donutCfg.data;
      chartDonut.options = donutCfg.options;
      chartDonut.update();
    } else {
      chartDonut = new Chart(ctxDonut, donutCfg);
    }
  }

  // Barras
  const ctxBars = document.getElementById("chartResumenBarras");
  if (ctxBars) {
    const barsCfg = {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "ARS",
            data: data.map((v) => (hasAny ? v : 0)),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: "Montos por rubro (ARS)" },
          tooltip: { callbacks: { label: (c) => ` ${c.raw?.toLocaleString("es-AR")}` } },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => Number(v).toLocaleString("es-AR") },
          },
        },
      },
    };

    if (chartBars) {
      chartBars.data = barsCfg.data;
      chartBars.options = barsCfg.options;
      chartBars.update();
    } else {
      chartBars = new Chart(ctxBars, barsCfg);
    }
  }
}
