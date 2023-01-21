
class StorageService {

  flightLogs;

  constructor() {
    self.flightLogs = {};
  }
  
  createNewFlightLog(logName) {
    if (self.flightLogs[logName]){
      console.error(`Attempted to create a new flight log with name ${logName}, but there is already a flight log with that name!`);
      return;
    }
    self.flightLogs[logName] = window.fs.createWriteStream('telemetry/' + logName, {flags:'w'});
  }

  addData(logName, newData) {
    self.flightLogs[logName].write(newData + "\n");
  }
}