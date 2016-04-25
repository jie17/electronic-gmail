var CLIENT_ID = '966958200227-5iglgjreb095ahp8kldd8icaoljkb3e7.apps.googleusercontent.com';
var CLIENT_SECRET = 'Jtg0ZNQ3q6IfJtWV8bepitV3';
var REDIRECT_URL = 'http://127.0.0.1:54245';
var scopes = 'https://www.googleapis.com/auth/calendar';

var moment = require('moment');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
var calendar = google.calendar('v3');
var config = require("./config");
var ipc = require('electron').ipcRenderer;
const BrowserWindow = require('electron').remote.BrowserWindow;

function addEvent() {
    var start = document.getElementById('start').value;
    var end = document.getElementById('end').value;
    var event = {
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
    var scopes = [
        'https://www.googleapis.com/auth/calendar'
    ];

    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
        scope: scopes // If you only need one scope you can pass it as string
    });

    console.info(url);
    require('shell').openExternal(url);

    var http = require('http');

    const PORT = 54245;

    function handleRequest(request, response) {
        console.info(request.url);
        response.end(request.url + "\n" + "You can close this window now.");

        var match = request.url.match(/code=(.+)$/);
        if (match) {
            console.info(match[1]);
            var code = match[1];
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

    var server = http.createServer(handleRequest);

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