const {Menu, MenuItem} = require('electron');
const {app} = require('electron');
const os = require('os');
const config = require('./config');
const path = require('path');
const openAboutWindow = require('about-window').default;

const appName = app.getName();

const template = [{
    label: appName,
    submenu: [{
        label: `About ${appName}`,
        click(item, focusedWindow) {
            openAboutWindow({
                icon_path: path.join(__dirname, 'images', 'gmail.png')
            });
        }
    }, 
    {
        label: 'Log Out',
        click(item, focusedWindow) {
            if (focusedWindow)
                focusedWindow.webContents.send('logout');
        }
    },
    {
        role: 'quit'
    }
    ]
}, 
{
    label: 'Edit',
    submenu: [{
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
    }, {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
    }, {
        type: 'separator'
    }, {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
    }, {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
    }, {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
    }, {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
    }]
}, {
    label: 'Window',
    role: 'window',
    submenu: [{
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
    }, {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
    }, {
        type: 'separator'
    }, {
        label: 'Go Back',
        accelerator: 'CmdOrCtrl+Backspace',
        click(item, focusedWindow) {
            if (focusedWindow && focusedWindow.webContents.canGoBack())
                focusedWindow.webContents.goBack();
        }
    }, {
        label: 'Go Forward',
        accelerator: 'Cmd+Ctrl+F',
        click(item, focusedWindow) {
            if (focusedWindow && focusedWindow.webContents.canGoForward())
                focusedWindow.webContents.goForward();
        }
    }, {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click(item, focusedWindow) {
            if (focusedWindow)
                focusedWindow.webContents.reload();
        }
    }, {
        type: 'separator'
    }, {
        label: 'Bring All to Front',
        role: 'front'
    }, {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Cmd+F',
        click(item, focusedWindow) {
            if (focusedWindow)
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
    }]
}, {
    label: 'Settings',
    submenu: [
        {
        label: 'Open Developer Tools',
        click(item, focusedWindow) {
            if (focusedWindow)
                focusedWindow.webContents.openDevTools();
        }
    }, {
        type: 'separator'
    }, {
        label: 'Zoom to 150%',
        click(item, focusedWindow) {
            focusedWindow.webContents.setZoomFactor(1.5);
            config.setZoomFactor(1.5);
        }
    }, {
        label: 'Zoom to 125%',
        click(item, focusedWindow) {
            focusedWindow.webContents.setZoomFactor(1.25);
            config.setZoomFactor(1.25);
        }
    }, {
        label: 'Zoom to 100%',
        click(item, focusedWindow) {
            focusedWindow.webContents.setZoomFactor(1);
            config.setZoomFactor(1);
        }
    }, {
        type: 'separator'
    }, {
        label: 'Set as default email application',
        click(item, focusedWindow) {
            app.setAsDefaultProtocolClient("mailto");
        }
    }]
}];

module.exports = Menu.buildFromTemplate(template);