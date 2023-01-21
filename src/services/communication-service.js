
const VehicleState = {
	Startup: 'ST',
	PreApogee: 'PR',
	PostApogee: 'PO',
	Landed: 'LA'
}


class CommunicationService {

  constructor() {
    self.receiveSubscriptions = [];
    self.serialport = new window.SerialPort("COM3", { baudRate: 9600 });
    
    
    self.parser = self.serialport.pipe(new ReadlineParser());
    self.parser.on('data', self.receive);

    self.serialport.on("open", function() {
      console.log("Serial port open...");
    });
    
  }

  receive(rawData) {
    const packet = self.parsePacket(rawData);
    console.debug('Received and parsed packet: ', packet);
    self.receiveSubscriptions.forEach(callback => {
      callback(packet);
    });
  }

  subscribe(onPcktReceived) {
    self.receiveSubscriptions.push(onPcktReceived);
  }

  send(rawData) {

  }


  //<PACKET_COUNT>,<STATE>,<ALTITUDE>,<GPS_LATITUDE>,<GPS_LONGITUDE>');
  parsePacket(rawPacket) {
    const telemetryElements = content.split(',');
    if (telemetryElements.length === 5) { 
      return {
        packet_count: Number(telemetryElements[0]),
        state: telemetryElements[1],
        altitude: Number(telemetryElements[2]),
        gpsLat: Number(telemetryElements[3]),
        gpsLng: Number(telemetryElements[4])
      };
    } else {
      console.log('Received invalid telemetry packet:');
      console.log(rawPacket);
    }
  }

  // Sample result: 00021,PO,0604.2,-34.43555,-58.92193
  createTelemetryString(telemPacket) {
    return `${String(telemPacket.packet_count).padStart(5, '0')},${telemPacket.state},${telemPacket.altitude},${telemPacket.gpsLat},${telemPacket.gpsLng}`;
  }
}

