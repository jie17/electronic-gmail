window.onload = function() {
    var GmailApi = require('node-gmail-new');
    var jquery = require('jquery');
    var page = require('./ui/gmail.js');
    var ipc = require('electron').ipcRenderer;
    var webFrame = require('web-frame');
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
        ipc.send('update-dock', window.Gmail.get.unread_inbox_emails());
    }

    function setDockUpdaters() {
        var updateEvents = ['new_email', 'refresh', 'unread', 'read',
            'delete', 'move_to_inbox', 'move_to_label'
        ];
        for (var i = 0; i < updateEvents.length; i++) {
            window.Gmail.observe.on(updateEvents[i], updateDock);
        }
    }

    ipc.on('start-compose', (event, address) => {
        window.address = address;
        window.Gmail.compose.start_compose();
        // window.Gmail.compose.start_compose.bind(window.page)();
    });
    ipc.on('logout', window.page.logout.bind(window.page));
    ipc.on('navigate', (event, place) => {
        window.page.navigateTo(place);
    });
    ipc.on('zoom', (event, factor) => {
        webFrame.setZoomFactor(factor);
    });
    ipc.on('close-calendar', (event) => {
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
        var interval = 10000 + 4000 * Math.random();
        setTimeout(startRefresh, interval);
    };
    startRefresh();

    config.getZoomFactor(function(factor) {
        webFrame.setZoomFactor(factor);
    });

    const remote = require('electron').remote;

    function extractDate(s) {
        var date;
        if(s.match( /(\d{4})年(\d{1,2})月(\d{1,2})日/ )) {
            var match = s.match( /(\d{4})年(\d{1,2})月(\d{1,2})日/ );
            console.info(match);
            date = new Date(match[1], match[2]-1, match[3]);
            var datestring = moment(date).format();
            console.info(datestring);
            return date;
        }
        else if (!isNaN(date = new Date(s))) {
            var datestring = moment(date).format();
            console.info(datestring);
            return date;
        }
        else {
            return null;
        }
    }
    
    function addToCalendar(date) {
        const BrowserWindow = require('electron').remote.BrowserWindow;
        var win = new BrowserWindow({ width: 400, height: 300 });
        window.calendar.push(win);
        win.loadURL('file://' + __dirname + '/calendar.html');
        win.webContents.openDevTools();
        var date_string = moment(date).format();
        win.webContents.executeJavaScript("document.getElementById('date').innerHTML='" + date_string + "'");
    }
    
    window.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        if (e.target.closest('textarea, input, [contenteditable="true"]')) {
            const buildEditorContextMenu = remote.require('electron-editor-context-menu');
            var menu = buildEditorContextMenu();
            setTimeout(function() {
                menu.popup(remote.getCurrentWindow());
            }, 30);
        }
        else {
            if (!window.getSelection().isCollapsed) {
                console.log(window.getSelection());
                const Menu = remote.Menu;
                const MenuItem = remote.MenuItem;
                var menu = new Menu();
                menu.append(new MenuItem({ label: 'Copy', role: "copy" }));
                menu.append(new MenuItem({ label: 'Search in Google', click: function(){
                    var text = window.getSelection().toString();
                    require('shell').openExternal("https://google.com/search?q="+text);
                }}));
                var date = extractDate(window.getSelection().toString());
                if (date) {
                    console.info(date);
                    menu.append(new MenuItem({ label: 'Add to Calendar', click: addToCalendar }));
                }
                setTimeout(function() {
                    menu.popup(remote.getCurrentWindow());
                }, 30);
            }
        }
    });
};

