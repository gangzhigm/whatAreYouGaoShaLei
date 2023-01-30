const { app, BrowserWindow, Menu } = require('electron')
const fs = require('fs');
const path = require('path');
const createWindow = () => {
  const win = new BrowserWindow({
    // titleBarStyle: 'hidden',
    // titleBarOverlay: {
    //     color: '#2f3241',
    //     symbolColor: '#74b1be',
    //     height: 60
    // },

    // icon: 
    hasShadow : true,
    transparent: true,
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 300,
  })

//   win.loadFile('index.html')
  win.loadURL("https://www.gcores.com/")


  win.webContents.on("did-finish-load", function(es) {
    
    // win.webContents.executeJavaScript('alert("this is a test!");');
    
    //const js = require("fs").readFileSync('./insert/js.js').toString();
    // const js = fs.readFileSync(path.join(__dirname, './insert/js.js')).toString();

    // mainWindow.webContents.executeJavaScript(js);



    // console.info(win.webContents.insertCSS);

    // const css = require("fs").readFileSync('./insert/css.css').toString();
    const css = fs.readFileSync(path.join(__dirname, './insert/css.css')).toString();
    win.webContents.insertCSS(css);
        
    });
}




const isMac = process.platform === 'darwin'

const template = [
  // { role: 'appMenu' }
//   ...(isMac ? [{
//     label: app.name,
//     submenu: [
//       { role: 'about' },
//       { type: 'separator' },
//       { role: 'services' },
//       { type: 'separator' },
//       { role: 'hide' },
//       { role: 'hideOthers' },
//       { role: 'unhide' },
//       { type: 'separator' },
//       { role: 'quit' }
//     ]
//   }] : []),
//   // { role: 'fileMenu' }
//   {
//     label: 'File',
//     submenu: [
//       isMac ? { role: 'close' } : { role: 'quit' }
//     ]
//   },
//   // { role: 'editMenu' }
//   {
//     label: 'Edit',
//     submenu: [
//       { role: 'undo' },
//       { role: 'redo' },
//       { type: 'separator' },
//       { role: 'cut' },
//       { role: 'copy' },
//       { role: 'paste' },
//       ...(isMac ? [
//         { role: 'pasteAndMatchStyle' },
//         { role: 'delete' },
//         { role: 'selectAll' },
//         { type: 'separator' },
//         {
//           label: 'Speech',
//           submenu: [
//             { role: 'startSpeaking' },
//             { role: 'stopSpeaking' }
//           ]
//         }
//       ] : [
//         { role: 'delete' },
//         { type: 'separator' },
//         { role: 'selectAll' }
//       ])
//     ]
//   },
//   // { role: 'viewMenu' }
//   {
//     label: 'View',
//     submenu: [
//       { role: 'reload' },
//       { role: 'forceReload' },
//       { role: 'toggleDevTools' },
//       { type: 'separator' },
//       { role: 'resetZoom' },
//       { role: 'zoomIn' },
//       { role: 'zoomOut' },
//       { type: 'separator' },
//       { role: 'togglefullscreen' }
//     ]
//   },
//   // { role: 'windowMenu' }
//   {
//     label: 'Window',
//     submenu: [
//       { role: 'minimize' },
//       { role: 'zoom' },
//       ...(isMac ? [
//         { type: 'separator' },
//         { role: 'front' },
//         { type: 'separator' },
//         { role: 'window' }
//       ] : [
//         { role: 'close' }
//       ])
//     ]
//   },
//   {
//     role: 'help',
//     submenu: [
//       {
//         label: 'Learn More',
//         click: async () => {
//           const { shell } = require('electron')
//           await shell.openExternal('https://electronjs.org')
//         }
//       }
//     ]
//   }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

























































































app.whenReady().then(() => {
  createWindow()
})