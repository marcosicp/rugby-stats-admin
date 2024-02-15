declare var Chart: any;

function generateRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const alpha = 0.2; // Puedes ajustar la opacidad según lo necesites
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function initBarColumnChart(selector: string, labels: any[], datasets: any[], backgroundColor: string[] = [], hoverBorderColor: string = "#ffffff") {
  let canvas = document.querySelector(selector);
  if (backgroundColor.length === 0) {
    backgroundColor = [
      "rgba(0,123,255,0.9)",
      "rgba(0,123,255,0.5)",
      "rgba(0,123,255,0.3)"
    ];
  }
  // debugger;
  const a =datasets.map((data, index) => 
    data.tiempoJuego
  );
  
  
  const numberOfColors = 50;
  const backgroundColors = [];
  
  for (let i = 0; i < numberOfColors; i++) {
    backgroundColors.push(generateRandomColor());
  }

  const chart = new Chart(canvas, {
    type: "bar", // Use "bar" for bar chart or "horizontalBar" for horizontal bar chart
    data: {
      labels: labels,
      datasets: [
        {
        hoverBorderColor: 'green',//hoverBorderColor,
        data: a,
        backgroundColor: backgroundColors,//backgroundColor[index % backgroundColor.length],
        label: "Minutos jugados"
}]
    },
    options: {
      responsive: true,
      legend: { position: "bottom", labels: { padding: 25, boxWidth: 20 } },
      scales: {
        xAxes: [{ stacked: false }],
        yAxes: [{ stacked: false }]
      },
      tooltips: { custom: !1, mode: "index", position: "nearest" }
    }
  });

  return chart;
}
