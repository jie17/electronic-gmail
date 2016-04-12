window.onload = function() {
    var GmailApi = require('node-gmail-new');
    var jquery = require('jquery');
    var page = require('./ui/gmail.js');
    var ipc = require('electron').ipcRenderer;


    window.j = jquery;
    window.page = new page();
    window.Gmail = GmailApi(jquery);

    console.info(window.Gmail.get.user_email());
    console.info(window.Gmail.get.unread_emails());


    window.Gmail.observe.after("refresh", function(url, body, data, response, xhr) {
        // console.log("url:", url, 'body', body, 'data', data, 'response', response, 'xhr', xhr);

        for (var i of response[0]) {
            if (i[0] == "stu") {

                if (i[1].length == 0 && i[2].length == 0) {

                }
                else if (i.length == 3) {
                    console.log("stu");
                    console.log(i);
                    for (var m of i[2]) {
                        console.info("notify");
                        var id = m[0];
                        var email_data = window.Gmail.get.email_data(id);
                        console.log(email_data);
                        var subject = email_data["subject"];
                        var contact = email_data["threads"][email_data["last_email"]]["from"];
                        new Notification(contact, {
                            title: contact,
                            body: subject});
                    }
                }
            }
        }
    });

    window.Gmail.observe.after('new_email', function(id, url, body, response, xhr) {
        console.log("url:", url, 'body', body, 'response', response, 'xhr', xhr);
        console.log("new_email triggered.");
    });

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

    function refresh() {
        var refreshButtons = window.j( 'div.T-I.J-J5-Ji.nu.T-I-ax7.L3' ),
            buttonsFounds = refreshButtons.length,
            visibleButton = 0,
            refreshed = false;

        if ( buttonsFounds > 0 ) {              // There should be at least one of these buttons
            for ( var i = 0; i < buttonsFounds; i++ ) {
                var currentButton = window.j(refreshButtons[i]);
                if ( currentButton.is(':visible') ) {
                    var rButton = window.j(refreshButtons)[i];
                    visibleButton++;

                    //Trigger mouse down event
                    var mouseDown = document.createEvent('MouseEvents');
                    mouseDown.initEvent( 'mousedown', true, false );
                    rButton.dispatchEvent(mouseDown);

                    //Trigger mouse up event
                    var mouseUp = document.createEvent('MouseEvents');
                    mouseUp.initEvent( 'mouseup', true, false );
                    rButton.dispatchEvent(mouseUp);     // This opens the composer

                    refreshed = true;
                }   // End of IF currentButton.is(':visible')
            }       // End of FOR loop
        }           // End of IF buttonsFounds > 0

        return refreshed;
    }

    updateDock();
    setDockUpdaters();
    var interval = 18000 + 4000 * Math.random();
    setInterval(refresh, interval);
    // window.page.adjustProfilePicture();
    // window.page.adjustLogoutButton();
    // window.page.applyHangoutsCss();
};