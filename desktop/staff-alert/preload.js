const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("staffAlertDesktop", {
  getConfig: () => ipcRenderer.invoke("get-config"),
  saveConfig: (config) => ipcRenderer.invoke("save-config", config),
  testConnection: () => ipcRenderer.invoke("test-connection"),
  onAlarmStart: (cb) => {
    ipcRenderer.on("alarm-start", () => cb());
  },
  onAlarmStop: (cb) => {
    ipcRenderer.on("alarm-stop", () => cb());
  },
  notifyStopped: () => ipcRenderer.send("alarm-stopped-by-ui"),
});
