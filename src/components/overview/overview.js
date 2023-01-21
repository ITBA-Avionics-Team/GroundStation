const containerTelemetryChartConfig = {
  type: 'line',
  data: {
    labels: ['00:00:00'],
    datasets: [{
      label: 'Altitude',
      backgroundColor: 'rgb(255, 99, 132)', //Red
      borderColor: 'rgb(255, 99, 132)', //Red
      data: [0],
      fill: false,
    }]
  },
  options: {
    responsive: true,
    mantainAspectRation: false,
    title: {
      display: true,
      text: 'Container'
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Mission Time (hh/mm/ss)'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Altitude (m)'
        }
      }]
    }
  }
};


containerTelemetryCanvasCtx = document.getElementById('container-telemetry-canvas').getContext('2d');
containerTelemetryChart = new window.chartjs.Chart(containerTelemetryCanvasCtx, containerTelemetryChartConfig);


function addValueToTelemetryChart(chart, value, label) {
  chart.data.datasets[0].data.push(value);
  chart.data.labels.push(label);
  if (chart.data.labels.length > 20) {
    chart.data.datasets[0].data.shift();
    chart.data.labels.shift();
  }
  console.log(chart);
  chart.update();
}

function generateCurrentTimeFileName(date) {
  return date.toISOString().split('.')[0].replace(/-|T|:/g, '_');
}



const startupTime = new Date();
const flightLogFileName = generateCurrentTimeFileName(startupTime);

const storageService = StorageService();
storageService.createNewFlightLog(flightLogFileName);


const communicationService = CommunicationService();

communicationService.subscribe((telemetryPacket) => {
  console.log('Received telemetry packet in overview component:', telemetryPacket);

  addValueToTelemetryChart(containerTelemetryChart, Number(telemetryPacket.altitude), Math.round((new Date() - startupTime)/1000));

  storageService.addData(flightLogFileName, `${telemetryPacket.packet_count},${telemetryPacket.state},${telemetryPacket.altitude},${telemetryPacket.gpsLat},${telemetryPacket.gpsLng}`);

  setCurrentStateIndicator('telemetry-state', telemetryPacket.state);
  setCurrentGPSCoordsIndicator('telemetry-gps-coordinates', telemetryPacket.gpsLat, telemetryPacket.gpsLng);

});


function setCurrentStateIndicator(id, temp) {
  let elem = document.getElementById(id);
  elem.innerHTML = 'Current temperature: ' + temp;
}

function setCurrentGPSCoordsIndicator(id, lat, lng) {
  let elem = document.getElementById(id);
  elem.innerHTML = 'Current GPS coordinates: ' + lat + ', ' + lng;
}