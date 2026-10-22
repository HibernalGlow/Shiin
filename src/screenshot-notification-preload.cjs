const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('shiinOverlay', {
  activate: () => ipcRenderer.send('shiin-overlay:activate'),
  close: () => ipcRenderer.send('shiin-overlay:close'),
  setHovered: (hovered) => ipcRenderer.send('shiin-overlay:hover', Boolean(hovered)),
})
