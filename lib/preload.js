window.onload = function() {
    var GmailApi = require('node-gmail-new');
    var jquery = require('jquery');
    var page = require('./ui/gmail.js');
    var ipc = require('electron').ipcRenderer;
    var webFrame = require('web-frame');

    window.j = jquery;
    window.page = new page();
    window.Gmail = GmailApi(jquery);
    window.notified = [];
    window.webFrame = webFrame;

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

    ipc.on('start-compose', window.Gmail.compose.start_compose.bind(window.page));
    ipc.on('logout', window.page.logout.bind(window.page));
    ipc.on('navigate', (event, place) => {
        window.page.navigateTo(place);
    });
    ipc.on('zoom', (event, factor) => {
        webFrame.setZoomFactor(factor);
    });

    updateDock();
    setDockUpdaters();

    var hash = {};
    var first = true;

    function startRefresh(){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://mail.google.com/mail/feed/atom");
        xhr.onload = function(){
            var inner = xhr.responseText;
            var re = /<entry><title>(.+?)<\/title>.+?message_id=(\w+).+?<name>(.+?)<\/name>/g;

            var match;
            while(match = re.exec(inner)) {
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

    ipc.send('init-zoom');
};