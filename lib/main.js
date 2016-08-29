const {app, ipcMain, BrowserWindow, Menu, shell, dialog} = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const appMenu = require('./menu');
const config = require("./config");

let mainWindow = null;

const gmailURL = 'http://www.gmail.com';
const gmailLogoutRe = 'https://mail.google.com/mail/logout';
const gmailDomainRe = 'https://mail.google.com/';

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


function createWindow() {
    if (mainWindow) return mainWindow;
    mainWindow = new BrowserWindow({
        title: 'Gmail',
        icon: 'lib/media/gmail.png',
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 200,
        // frame: false,
        // titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false,
            plugins: true
        }
    });

    mainWindow.loadURL(gmailURL);
    mainWindow.maximize();
    mainWindow.on('close', app.quit);

    return mainWindow;
}

function gotoURL(url) {
    return new Promise((resolve) => {
        mainWindow.webContents.on('did-finish-load', resolve);
        mainWindow.webContents.loadURL(url);
    });
}

app.on('ready', () => {
    Menu.setApplicationMenu(appMenu);

    createWindow();
    let page = mainWindow.webContents;

    page.on('new-window', (e, url) => {
        if (url.match(gmailLogoutRe)) {
            e.preventDefault();
            gotoURL(url).then(() => {
                gotoURL(gmailURL)
            });
        }
        else if(url.match("https://mail.google.com/.+to%253D(.+)")) {
            // e.preventDefault();
            let match = url.match("https://mail.google.com/.+to%253D(.+?)%252540(.+?)%25");
            mainWindow.webContents.send('start-compose', `${match[1]}@${match[2]}`);
        }
        else if(!(url.match(gmailDomainRe))) {
            e.preventDefault();
            shell.openExternal(url);
        }
    });

    config.get("never_prompts_default", (data) => {
        if(!data){
            if(! app.isDefaultProtocolClient("mailto") ) {
                dialog.showMessageBox({type:"question", buttons:["Yes", "Later", "Never prompt me"], message:"Do you want to use Electron Gmail as your default email client?"}, (response) => {
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

app.on('open-url', (event, url) => {
    if (url.indexOf("mailto") == 0) {
        mainWindow.webContents.send('start-compose', url.substring(7));
    }
});

app.on('browser-window-created', (event, window) => {
    window.webContents.on('did-finish-load', () => {
        let match = window.webContents.getURL().match("https://mail.google.com/.+to%253D(.+?)%252540(.+?)%25");
        if (match) {
            window.destroy();
        }
    })
});