const moment = require('moment');

function extractDate(s) {
    let date = new Date();
    date.setSeconds(0);
    let valid = false;
    let re1 = /(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/;
    let re2 = /(\d{1,2})月(\d{1,2})日/;
    let re3 = /(\d{1,2})\/(\d{1,2})(?!\/)/;
    let re4 = /(\d{1,2})[:：時](\d{1,2})/;
    if(s.match(re1)) {
        let match = s.match(re1);
        console.info(match);
        date = new Date(match[1], match[2]-1, match[3]);
        let datestring = moment(date).format();
        console.info(datestring);
        valid = true;
    }
    else if (s.match(re2)) {
        let match = s.match(re2);
        console.info(match);
        date = new Date(new Date().getFullYear(), match[1]-1, match[2]);
        let datestring = moment(date).format();
        console.info(datestring);
        valid = true;
    }
    if (s.match(re3)){
        let match = s.match(re3);
        date.setMonth(match[1]-1);
        date.setDate(match[2]);
        valid = true;
    }
    if (s.match(re4)){
        let match = s.match(re4);
        date.setHours(match[1]);
        date.setMinutes(match[2]);
        valid = true;
    }
    if (valid) {
        let datestring = moment(date).format();
        console.info(datestring);
        return date;
    }
    else {
        return null;
    }
}

function addToCalendar(date) {
    const {BrowserWindow} = require('electron').remote;
    let win = new BrowserWindow({ width: 400, height: 300 });
    window.calendar.push(win);
    win.loadURL('file://' + __dirname + '/calendar/calendar.html');
    // win.webContents.openDevTools();
    let start_time = moment(date).format();
    let end_time = moment(date).add(1, 'hours').format();
    win.webContents.executeJavaScript("document.getElementById('start').value='" + start_time + "'");
    win.webContents.executeJavaScript("document.getElementById('end').value='" + end_time + "'");
}

module.exports = {
    extractDate: extractDate,
    addToCalendar: addToCalendar
}