window.onload = function() {
    var GmailApi = require('node-gmail-new');
    var jquery = require('jquery');
    var page = require('./ui/gmail.js');
    var ipc = require('electron').ipcRenderer;
    new Notification("Ready", {
    title: "Basic Notification",
    body: "Short message part"});

    window.j = jquery;
    window.page = new page();
    window.Gmail = GmailApi(jquery);

    console.info(window.Gmail.get.user_email());
    console.info(window.Gmail.get.unread_emails());


window.Gmail.observe.after("refresh", function(url, body, data, response, xhr) {
  console.log("url:", url, 'body', body, 'data', data, 'response', response, 'xhr', xhr);
console.log(response[0][0]);
          for (var i of response[0]) {
            if (i[0] == "stu") {
                console.log("stu");
                console.log(i);
                if (i[1].length == 0 && i[2].length == 0) {

                }
                else {
                    for (var m of i[2]) {
                        var id = m[0];
                        var email_data = window.Gmail.get.email_data(id);
                        console.log(email_data);
                        var subject = email_data["subject"];

                    }
                }
            }
        }
});

    window.Gmail.observe.after('new_email', function(id, url, body, response, xhr) {
        console.log("url:", url, 'body', body, 'response', response, 'xhr', xhr);
        for (var i in response[0]) {
            if (i[0] == "stu") {
                console.log("stu");
                if (i[1].length == 0 && i[2].length == 0) {

                }
                else {
                    for (var m in i[2]) {
                        var id = m[0];
                        var email_data = window.Gmail.get.email_data(id);
                        console.log(email_data);
                    }
                }
            }
        }
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

    updateDock();
    setDockUpdaters();
    window.page.adjustProfilePicture();
    window.page.adjustLogoutButton();
    // window.page.applyHangoutsCss();
};