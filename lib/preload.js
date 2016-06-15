window.onload = function() {
    const {ipcRenderer, webFrame, shell, remote, clipboard} = require('electron');
    var GmailApi = require('node-gmail-new');
    var jquery = require('jquery');
    var page = require('./gmail');
    var config = require("./config");
    var moment = require('moment');

    window.j = jquery;
    window.page = new page();
    window.Gmail = GmailApi(jquery);
    window.notified = [];
    window.webFrame = webFrame;
    window.address = "";
    window.calendar = [];

    function updateDock() {
        ipcRenderer.send('update-dock', window.Gmail.get.unread_inbox_emails());
    }

    function setDockUpdaters() {
        var updateEvents = ['new_email', 'refresh', 'unread', 'read',
            'delete', 'move_to_inbox', 'move_to_label'
        ];
        for (var i = 0; i < updateEvents.length; i++) {
            window.Gmail.observe.on(updateEvents[i], updateDock);
        }
    }

    ipcRenderer.on('start-compose', (event, address) => {
        window.address = address;
        window.Gmail.compose.start_compose();
        // window.Gmail.compose.start_compose.bind(window.page)();
    });
    ipcRenderer.on('logout', window.page.logout.bind(window.page));
    ipcRenderer.on('navigate', (event, place) => {
        window.page.navigateTo(place);
    });
    ipcRenderer.on('zoom', (event, factor) => {
        webFrame.setZoomFactor(factor);
    });
    ipcRenderer.on('close-calendar', (event) => {
        if (window.calendar) {
            window.calendar[0].close();
            window.calendar = [];
        }
    });

    window.Gmail.observe.on("compose", function(compose, type) {
        console.log('api.dom.compose object:', compose, 'type is:', type );  // gmail.dom.compose object
        console.log(compose.$el[0]);
        setTimeout(function(compose) {
            if (window.address) {
                compose.$el[0].querySelector("[name=to]").innerHTML = window.address;
            }
        }, 50, compose);
        setTimeout(function() {
            window.address = "";
        }, 500);
    });

    updateDock();
    setDockUpdaters();

    var hash = {};
    var first = true;

    function startRefresh(){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://mail.google.com/mail/feed/atom");
        xhr.onload = function(){
            var text = xhr.responseText;
            var txt = document.createElement("textarea");
            txt.innerHTML = text;
            text = txt.value;
            console.log(text);
            var re = /<entry><title>(.+?)<\/title>.+?message_id=(\w+).+?<name>(.+?)<\/name>/g;

            var match;
            while(match = re.exec(text)) {
                if (!(match[2] in hash)) {
                    hash[match[2]] = 1;
                    var contact = match[3];
                    var subject = match[1];
                    if (!first){
                        new Notification(contact, {
                        title: contact,
                        body: subject});
                    }
                }
            }
            first = false;
        };
        xhr.send();
        var interval = 5000 + 2000 * Math.random();
        setTimeout(startRefresh, interval);
    };
    startRefresh();

    config.getZoomFactor(function(factor) {
        webFrame.setZoomFactor(factor);
    });

    function extractDate(s) {
        var date = new Date();
        date.setSeconds(0);
        var valid = false;
        let re1 = /(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/;
        let re2 = /(\d{1,2})月(\d{1,2})日/;
        let re3 = /(\d{1,2})\/(\d{1,2})/;
        let re4 = /(\d{1,2})[:：時](\d{1,2})/;
        if(s.match(re1)) {
            var match = s.match(re1);
            console.info(match);
            date = new Date(match[1], match[2]-1, match[3]);
            var datestring = moment(date).format();
            console.info(datestring);
            valid = true;
        }
        else if (s.match(re2)) {
            var match = s.match(re2);
            console.info(match);
            date = new Date(new Date().getFullYear(), match[1]-1, match[2]);
            var datestring = moment(date).format();
            console.info(datestring);
            valid = true;
        }
        if (s.match(re3)){
            var match = s.match(re3);
            date.setMonth(match[1]-1);
            date.setDate(match[2]);
            valid = true;
        }
        if (s.match(re4)){
            var match = s.match(re4);
            date.setHours(match[1]);
            date.setMinutes(match[2]);
            valid = true;
        }
        if (valid) {
            var datestring = moment(date).format();
            console.info(datestring);
            return date;
        }
        else {
            return null;
        }
    }

    function addToCalendar(date) {
        const {BrowserWindow} = require('electron').remote;
        var win = new BrowserWindow({ width: 400, height: 300 });
        window.calendar.push(win);
        win.loadURL('file://' + __dirname + '/calendar.html');
        // win.webContents.openDevTools();
        var start_time = moment(date).format();
        var end_time = moment(date).add(1, 'hours').format();
        win.webContents.executeJavaScript("document.getElementById('start').value='" + start_time + "'");
        win.webContents.executeJavaScript("document.getElementById('end').value='" + end_time + "'");
    }

    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (e.target.closest('textarea, input, [contenteditable="true"]')) {
            const buildEditorContextMenu = remote.require('electron-editor-context-menu');
            var menu = buildEditorContextMenu();
            setTimeout(() => {
                menu.popup(remote.getCurrentWindow());
            }, 30);
        }
        else {
            if (!window.getSelection().isCollapsed) {
                console.log(window.getSelection());
                const Menu = remote.Menu;
                const MenuItem = remote.MenuItem;
                var menu = new Menu();
                menu.append(new MenuItem({ label: 'Copy Text', role: "copy" }));
                if (window.getSelection().focusNode instanceof HTMLElement && window.getSelection().focusNode.closest("a") != null){
                    url = window.getSelection().focusNode.closest("a").getAttribute("href");
                    menu.append(new MenuItem({ label: 'Copy URL', click: () => {
                        clipboard.writeText(url);
                    } }));
                }
                else if (window.getSelection().focusNode.parentElement instanceof HTMLElement && window.getSelection().focusNode.parentElement.closest("a") != null) {
                    url = window.getSelection().focusNode.parentElement.closest("a").getAttribute("href");
                    menu.append(new MenuItem({ label: 'Copy URL', click: () => {
                        clipboard.writeText(url);
                    } }));
                }
                menu.append(new MenuItem({ label: 'Search in Google', click: () => {
                    var text = window.getSelection().toString();
                    shell.openExternal("https://google.com/search?q="+text);
                }}));
                var date = extractDate(window.getSelection().toString());
                if (date) {
                    console.info(date);
                    menu.append(new MenuItem({ label: 'Add to Calendar', click: () => {
                        addToCalendar(date);
                    } }));
                }
                setTimeout(function() {
                    menu.popup(remote.getCurrentWindow());
                }, 30);
            }
        }
    });
};

