const fs = require('fs');
const SerialPort = require('serialport');

const { contextBridge } = require("electron");
// contextBridge.exposeInMainWorld(
//   'fs', fs
// );

// contextBridge.exposeInMainWorld(
//   'SerialPort2', SerialPort
// );

window.fs = fs;
window.SerialPort2 = SerialPort;

// contextBridge.exposeInMainWorld('versions', {
//   node: () => process.versions.node,
//   chrome: () => process.versions.chrome,
//   electron: () => process.versions.electron,
//   // we can also expose variables, not just functions
// })