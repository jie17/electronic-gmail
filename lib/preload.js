window.onload = function() {
    const { ipcRenderer, webFrame, shell, remote, clipboard } = require('electron');
    const GmailApi = require('node-gmail-new');
    const jquery = require('jquery');
    const page = require('./gmail');
    const config = require("./config");
    const { extractDate, addToCalendar } = require('./calendar');

    // window.__devtron = {require: require, process: process}
    window.j = jquery;
    window.page = new page();
    window.Gmail = GmailApi(jquery);
    window.notified = [];
    window.webFrame = webFrame;
    window.address = "";
    window.calendar = [];
    window.set_of_emails = new Set();
    window.email_ids_to_notifications = {};

    // Override alert function
    (function(proxied) {
        window.alert = function() {
            if (!arguments[0].match('Grrr')) {
                return proxied.apply(this, arguments);
            }
        };
    })(window.alert);

    function updateDock() {
        ipcRenderer.send('update-dock', window.Gmail.get.unread_inbox_emails());
    }

    function setDockUpdaters() {
        let updateEvents = ['new_email', 'refresh', 'unread', 'read',
            'delete', 'move_to_inbox', 'move_to_label'
        ];
        for (let i = 0; i < updateEvents.length; i++) {
            window.Gmail.observe.on(updateEvents[i], updateDock);
        }
    }

    let parseGmailFeed = (text) => {
        let current_unread_email_ids = [];

        var oParser = new DOMParser();
        var oDOM = oParser.parseFromString(text, "text/xml");

        oDOM.querySelectorAll('entry').forEach( entry => {
            let id = entry.querySelector('id').innerHTML;
            current_unread_email_ids.push(id); 
            if (!(window.set_of_emails.has(id))) {
                window.set_of_emails.add(id);
                let from = entry.querySelector('author').querySelector('name').innerHTML;
                let title = entry.querySelector('title').innerHTML;
                let link = entry.querySelector('link').getAttribute('href');
                console.info(`New email: ${title}`);
                let notification = new Notification(from, {body: title, data: link});
                notification.addEventListener('click', (event) => {
                    location.href = event.target.data;
                })
                window.email_ids_to_notifications[id] = notification;
            }
        })
        window.set_of_emails.forEach( (id) => {
            if (!current_unread_email_ids.includes(id)) {
                window.email_ids_to_notifications[id].close();
            }
        });
    }

    function startRefresh(){
        const feed_url = "https://mail.google.com/mail/feed/atom";
        fetch(feed_url, {credentials: 'include'})
        .then( response => response.text() )
        .then( responseText => parseGmailFeed(responseText) )
        .catch( error => { console.log("An error occurred in fetch."); } )
        let interval = 5000 + 500 * Math.random();
        setTimeout(startRefresh, interval);
    }

    updateDock();
    setDockUpdaters();

    ipcRenderer.on('start-compose', (event, address) => {
        window.address = address;
        window.Gmail.compose.start_compose();
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

    startRefresh();

    window.Gmail.observe.on("compose", function(compose, type) {
        setTimeout(function(compose) {
            if (window.address) {
                compose.$el[0].querySelector("[name=to]").innerHTML = window.address;
            }
        }, 50, compose);
        setTimeout(function() {
            window.address = "";
        }, 500);
    });

    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (e.target.closest('textarea, input, [contenteditable="true"]')) {
            const buildEditorContextMenu = remote.require('electron-editor-context-menu');
            let menu = buildEditorContextMenu();
            setTimeout(() => {
                menu.popup(remote.getCurrentWindow());
            }, 30);
        }
        else {
            if (!window.getSelection().isCollapsed) {
                console.log(window.getSelection());
                const Menu = remote.Menu;
                const MenuItem = remote.MenuItem;
                const menu = new Menu();
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
                    let text = window.getSelection().toString();
                    shell.openExternal("https://google.com/search?q="+text);
                }}));
                let date = extractDate(window.getSelection().toString());
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

