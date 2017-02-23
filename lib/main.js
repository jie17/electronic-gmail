const { app, ipcMain, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const appMenu = require('./menu');
const config = require("./config");
require('electron-debug')({showDevTools: true});

let mainWindow;

ipcMain.on('update-dock', (event, arg) => {
    if (os.platform() === 'darwin') {
        if (arg > 0) {
            // Hide dock badge when unread mail count is 0
            app.dock.setBadge(arg.toString());
        } else {
            app.dock.setBadge('');
        }
    }
});

ipcMain.on('close-calendar', (event) => {
    mainWindow.webContents.send("close-calendar");
});


function createWindow(zoom_factor) {
    if (mainWindow) return mainWindow;
        mainWindow = new BrowserWindow({
            title: 'Gmail',
            icon: 'lib/media/gmail.png',
            minWidth: 400,
            minHeight: 200,
            webPreferences: {
                nodeIntegration: false,
                preload: path.join(__dirname, 'preload.js'),
                webSecurity: false,
                zoomFactor: zoom_factor
            }
        });

    mainWindow.loadURL('https://mail.google.com');
    mainWindow.maximize();
    mainWindow.on('close', app.quit);

    return mainWindow;

}

app.on('ready', () => {
    let p = new Promise( (resolve, reject) => {
        config.getZoomFactor( (factor) => {
            resolve(factor);
        });
    });
    p.then( (zoom_factor) => {
        Menu.setApplicationMenu(appMenu);
        createWindow(zoom_factor);

        let page = mainWindow.webContents;

        page.on('new-window', (e, url) => {
            let re1 = "https://mail.google.com/.+to%253D(.+?)%252540(.+?)%25";
            let re2 = "https://mail.google.com/";
            if(url.match(re1)) {
                e.preventDefault();
                let match = url.match(re1);
                mainWindow.webContents.send('start-compose', `${match[1]}@${match[2]}`);
            }
            else if(!(url.match(re2))) {
                e.preventDefault();
                shell.openExternal(url);
            }
        });

        config.get("never_prompts_default", (data) => {
            if(!data){
                if(! app.isDefaultProtocolClient("mailto") ) {
                    dialog.showMessageBox({
                        type: "question",
                        buttons: [ "Yes", "Later", "Never prompt me" ],
                        message: "Do you want to use Electron Gmail as your default email client?"
                    }, (response) => {
                        if(response == 0) {
                            app.setAsDefaultProtocolClient("mailto");
                        }
                        if(response == 2) {
                            config.set("never_prompts_default", true);
                        }
                    });
                }
            }
        });
    });
});

app.on('open-url', (event, url) => {
    if (url.indexOf("mailto") == 0) {
        mainWindow.webContents.send('start-compose', url.substring(7));
    }
});