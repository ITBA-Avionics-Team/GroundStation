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
containerTelemetryChart = new Chart(containerTelemetryCanvasCtx, containerTelemetryChartConfig);


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

const storageService = new StorageService();
storageService.createNewFlightLog(flightLogFileName);


const communicationService = new CommunicationService();

communicationService.subscribe((telemetryPacket) => {
  console.log('Received telemetry packet in overview component:', telemetryPacket);

  addValueToTelemetryChart(containerTelemetryChart, Number(telemetryPacket.altitude), Math.round((new Date() - startupTime)/1000));

  storageService.addData(flightLogFileName, `${telemetryPacket.packet_count},${telemetryPacket.state},${telemetryPacket.altitude},${telemetryPacket.gpsLat},${telemetryPacket.gpsLng}`);

  setCurrentStateIndicator('telemetry-state', telemetryPacket.state);
  setCurrentGPSCoordsIndicator('telemetry-gps-coordinates', telemetryPacket.gpsLat, telemetryPacket.gpsLng);
  updateGPSMap(telemetryPacket.gpsLat, telemetryPacket.gpsLng);

});

/*

FOR TESTING PURPOSES ONLY:



*/

communicationService.receive('00000,PR,0058.2,-34.635664,-58.364751\n');


function setCurrentStateIndicator(id, temp) {
  let elem = document.getElementById(id);
  elem.innerHTML = '<b>Current state:</b> ' + temp;
}

function setCurrentGPSCoordsIndicator(id, lat, lng) {
  let elem = document.getElementById(id);
  elem.innerHTML = '<b>Current GPS coordinates:</b> ' + lat + ', ' + lng;
}

function updateGPSMap(lat, lng) {

  const MAPS_API_KEY = "";
  const MAPBOX_ACCESS_TOKEN = "";

  let gmaps_iframe = `<iframe\
                  width="450"\
                  height="250"\
                  frameborder="0" style="border:0"\
                  referrerpolicy="no-referrer-when-downgrade"\
                  src="https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${lat},${lng}"\
                  allowfullscreen>\
                </iframe>`;

  let mapbox_iframe = `<iframe
                  width="100%"
                  height="400px"
                  src='https://api.mapbox.com/styles/v1/mapbox/streets-v12.html?title=false&zoomwheel=false&access_token=${MAPBOX_ACCESS_TOKEN}/${lat}/${lng}'
                  title="Rocket position"
                  style="border:none;"
                ></iframe>`

  let mapContainer = document.getElementById('gps-position-map');
  mapContainer.innerHTML = gmaps_iframe;
}