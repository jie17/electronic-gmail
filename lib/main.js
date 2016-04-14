import app from 'app';
import BrowserWindow from 'browser-window';
import path from 'path';
import fs from 'fs';
import os from 'os';
import electron from 'electron';
import Promise from 'bluebird';
import {
    menu as appMenu
} from './menu';
import config from './config';

let mainWindow = null;

const gmailURL = 'http://www.gmail.com';
const gmailLogoutRe = 'https://mail.google.com/mail/logout';
const gmailAddAccountRe = 'https://accounts.google.com/AddSession';
const oktaRe = 'https://.*.okta.com/';
const gmailDomainRe = 'https://mail.google.com/';
const editInNewTabRe = 'https://mail.google.com/mail/.*#cmid%253D[0-9]+';
const ipcMain = require('electron').ipcMain;

// Set os specific stuff
electron.ipcMain.on('update-dock', function(event, arg) {
    if (os.platform() === 'darwin') {
        if (arg > 0) {
            // Hide dock badge when unread mail count is 0
            app.dock.setBadge(arg.toString());
        } else {
            app.dock.setBadge('');
        }
    }
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
        titleBarStyle: 'hidden',
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
    electron.Menu.setApplicationMenu(appMenu);

    createWindow();
    let page = mainWindow.webContents;



    page.on('dom-ready', () => {
        page.insertCSS(fs.readFileSync(path.join(__dirname, 'ui', 'gmail.css'), 'utf8'));
    });

    // Open links in default browser
    page.on('new-window', function(e, url) {
        if (url.match(gmailLogoutRe)) {
            e.preventDefault();
            gotoURL(url).then(() => {
                gotoURL(gmailURL)
            });
        } else if (url.match(editInNewTabRe)) {
            e.preventDefault();
            page.send('start-compose');
        } else if (url.match(gmailDomainRe) ||
            url.match(gmailAddAccountRe) ||
            url.match(oktaRe)) {
            // e.preventDefault();
            // page.loadURL(url);
        } else {
            e.preventDefault();
            require('shell').openExternal(url);
        }
    });

    ipcMain.on('init-zoom', function(event, arg) {
        config.getZoomFactor( function(factor){event.sender.send('zoom', factor)} );
    });

    // var win = new BrowserWindow({ width: 800, height: 600,
    //     webPreferences: {
    //                     nodeIntegration: false,
    //         preload: path.join(__dirname, 'preload2.js'),
    //         webSecurity: false,
    //         plugins: true
    //     }
    // });
    // win.on('closed', function() {
    //     win = null;
    // });

    // // win.loadURL("https://mail.google.com/mail/feed/atom");
    // // win.show();
    // // win.webContents.openDevTools();

    // var mails = {};
    // var first = true;

    // electron.ipcMain.on('email', function (event, ids) {
    //     console.log(ids);
    //     if (first) {
    //         for (var id of ids) {
    //             mails[id] = 1;
    //         }
    //         first = false;
    //     }
    //     else {
    //         var ids_nofity = [];
    //         for (var id of ids){
    //             if (id in mails) {
    //                 console.log("duplicate email");
    //             }
    //             else {
    //                 console.log("new mail found, send notification");
    //                 ids_nofity.push(id);
    //                 mails[id] = 1;
    //             }
    //         }
    //         event.sender.send('notify', ids_nofity);
    //     }
    // });

    // Refresh Gmail Inbox Feed
    // function startRefresh(){
    //     win.loadURL("https://mail.google.com/mail/feed/atom");
    //     var interval = 10000 + 4000 * Math.random();
    //     setTimeout(startRefresh, interval);
    // }
    // startRefresh();

    // mainWindow.webContents.session.cookies.get({}, function(error, cookies){
    //     // console.log(cookies);
    //     var request = require('request');
    //     // request = request.defaults({jar: true});
    //     var j = request.jar();
    //     for (var cookie_hash of cookies) {
    //         // console.log(cookie_hash["value"]);
    //         var cookie_string = cookie_hash["name"]+"="+cookie_hash["value"];
    //         var cookie = request.cookie(cookie_string);
    //         var url = cookie_hash["domain"];

    //         // console.log(cookie_string);
    //         // console.log(url);
    //         if (url == "google.com" || url == ".google.com" || ){
    //             j.setCookie(cookie, "https://" + url);
    //         }
    //         if(url == "mail.google.com"){

    //         }
    //     }

    //     console.log(j);
    //     var url = 'https://mail.google.com/mail/feed/atom';
    //     request({url: url, jar: j}, function (error, response, body) {
    //         console.log("there");
    //         console.log(error);
    //         console.log(response.statusCode);
    //         if (!error && response.statusCode == 200) {
    //           console.log(body) // Show the HTML for the Google homepage.
    //         }
    //     });
    // });

    // mainWindow.webContents.openDevTools();
});