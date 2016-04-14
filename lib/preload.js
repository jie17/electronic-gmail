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

    // function processResponse(response) {
    //     if(response.length == 1) {
    //         var ite = response[0][0];
    //     }
    //     else {
    //         var ite = response[0];
    //     }

    //     for (var i of ite) {
    //         if (i[0] == "stu") {
    //             console.log("stu:", i);
    //             if (i.length == 3) {
    //                 for (var m of i[2]) {
    //                     var id = m[0];
    //                     var email_data = window.Gmail.get.email_data(id);
    //                     var last_email = email_data["last_email"];
    //                     console.log(email_data);
    //                     if (last_email in window.notified) {
    //                         console.log("duplicate email")
    //                     }
    //                     else {
    //                         console.log("new mail found, send notification");
    //                         window.notified[last_email] = 1;
    //                         var subject = email_data["subject"];
    //                         var contact = email_data["threads"][email_data["last_email"]]["from"];
    //                         if (!contact) {
    //                             contact = email_data["threads"][email_data["last_email"]]["from_email"];
    //                         }
    //                         new Notification(contact, {
    //                             title: contact,
    //                             body: subject});
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

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

    // function refresh() {
    //     var refreshButtons = window.j( 'div.T-I.J-J5-Ji.nu.T-I-ax7.L3' ),
    //         buttonsFounds = refreshButtons.length,
    //         visibleButton = 0,
    //         refreshed = false;

    //     if ( buttonsFounds > 0 ) {              // There should be at least one of these buttons
    //         for ( var i = 0; i < buttonsFounds; i++ ) {
    //             var currentButton = window.j(refreshButtons[i]);
    //             if ( currentButton.is(':visible') ) {
    //                 var rButton = window.j(refreshButtons)[i];
    //                 visibleButton++;

    //                 //Trigger mouse down event
    //                 var mouseDown = document.createEvent('MouseEvents');
    //                 mouseDown.initEvent( 'mousedown', true, false );
    //                 rButton.dispatchEvent(mouseDown);

    //                 //Trigger mouse up event
    //                 var mouseUp = document.createEvent('MouseEvents');
    //                 mouseUp.initEvent( 'mouseup', true, false );
    //                 rButton.dispatchEvent(mouseUp);     // This opens the composer

    //                 refreshed = true;

    //                 console.log("Refresh emulated.");
    //             }   // End of IF currentButton.is(':visible')
    //         }       // End of FOR loop
    //     }           // End of IF buttonsFounds > 0

    //     return refreshed;
    // }

    // window.Gmail.observe.after("refresh", function(url, body, data, response, xhr) {
    //     console.log("refresh triggered.")
    //     console.log("url:", url, 'body', body, 'data', data, 'response', response, 'xhr', xhr);
    //     processResponse(response);
    // });

    // window.Gmail.observe.after('new_email', function(id, url, body, response, xhr) {
    //     console.log("new_email triggered.");
    //     console.log("url:", url, 'body', body, 'response', response, 'xhr', xhr);
    //     processResponse(response);
    // });

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
    // var interval = 18000 + 4000 * Math.random();
    // setInterval(refresh, interval);

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
};