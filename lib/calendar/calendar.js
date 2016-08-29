const CLIENT_ID = '966958200227-5iglgjreb095ahp8kldd8icaoljkb3e7.apps.googleusercontent.com';
const CLIENT_SECRET = 'Jtg0ZNQ3q6IfJtWV8bepitV3';
const REDIRECT_URL = 'http://127.0.0.1:54245';
const scopes = 'https://www.googleapis.com/auth/calendar';
const moment = require('moment');
const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
const calendar = google.calendar('v3');
const config = require("../config");
const ipc = require('electron').ipcRenderer;
const BrowserWindow = require('electron').remote.BrowserWindow;

function addEvent() {
    let start = document.getElementById('start').value;
    let end = document.getElementById('end').value;
    let event = {
        'summary': document.getElementById("title").value,
        'location': 'location',
        'description': 'description',
        'start': {
            'dateTime': moment(start).format()
        },
        'end': {
            'dateTime': moment(end).format()
        }
    };

    calendar.events.insert({
        auth: oauth2Client,
        calendarId: "primary",
        resource: event
    }, function(err, response) {
        if(err) {
            console.info(err);
        }
        else {
            console.info(response);
            ipc.send("close-calendar");
        }
    });
}

function getToken() {
    let scopes = [
        'https://www.googleapis.com/auth/calendar'
    ];

    let url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
        scope: scopes // If you only need one scope you can pass it as string
    });

    console.info(url);
    require('shell').openExternal(url);

    let http = require('http');

    const PORT = 54245;

    function handleRequest(request, response) {
        console.info(request.url);
        response.end(request.url + "\n" + "You can close this window now.");

        let match = request.url.match(/code=(.+)$/);
        if (match) {
            console.info(match[1]);
            let code = match[1];
            server.close();
            oauth2Client.getToken(code, function(err, tokens) {
                if (!err) {
                    console.info(tokens);
                    oauth2Client.setCredentials(tokens);
                    config.setToken(tokens);
                    document.getElementById("ready").innerHTML = "Ready";
                    document.getElementById("ready").className = "label label-success";
                } else {
                    console.info(err);
                }
            });
        }
    }

    let server = http.createServer(handleRequest);

    server.listen(PORT, function() {
        console.log("Server listening on: http://localhost:%s", PORT);
    });
}

config.getToken((tokens) => {
    console.info("token:" + tokens);
    if (!tokens) {
        getToken();
    } else {
        console.info("Tokens loaded.");
        oauth2Client.setCredentials(tokens);
        document.getElementById("ready").innerHTML = "Ready";
        document.getElementById("ready").className = "label label-success";
    }
});