const SERIAL_PORT_PATH = '/dev/tty.Bluetooth-Incoming-Port';

const VehicleState = {
	Startup: 'ST',
	PreApogee: 'PR',
	PostApogee: 'PO',
	Landed: 'LA'
}


class CommunicationService {

  constructor() {
    this.receiveSubscriptions = [];

    console.log(window.SerialPort2.SerialPort.list());

    this.serialport = new window.SerialPort2.SerialPort({path: SERIAL_PORT_PATH, baudRate: 9600 });  
    
    this.parser = this.serialport.pipe(new window.SerialPort2.ReadlineParser());
    this.parser.on('data', this.receive);

    this.serialport.on('open', () =>{
      console.log('Serial port open...');
    });
  }

  receive(rawData) {
    const packet = this.parsePacket(rawData);
    console.debug('Received and parsed packet: ', packet);
    this.receiveSubscriptions.forEach(callback => {
      callback(packet);
    });
  }

  subscribe(onPcktReceived) {
    this.receiveSubscriptions.push(onPcktReceived);
  }

  send(rawData) {

  }


  //<PACKET_COUNT>,<STATE>,<ALTITUDE>,<GPS_LATITUDE>,<GPS_LONGITUDE>');
  parsePacket(rawPacket) {
    const telemetryElements = rawPacket.split(',');
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

