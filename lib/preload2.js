// Deprecated due to the bug of Electron which causes preload JavaScript to not be executed correctly on XML files.
window.onload = function() {
    var ipc = require('electron').ipcRenderer;

    setTimeout(2000, function(){
        ipc.send("email", [123]);
        var inner = document.body.innerHTML;
        var re = /<title>(.+?)<\/title>.+?message_id=(\w+).+?<name>(.+?)<\/name>/g;
        var hash = {};
        var match;
        var ids = [];
        while(match = re.exec(inner)) {
            if (!(match[2] in hash)) {
                hash[match[2]] = match;
                ids.push(match[2]);
            }
        }
        ipc.send("email", ids);

        ipc.on('notify', (event, ids) => {
            for (var id of ids){
                // console.log("received", id);
                if (id in hash){
                    var data = hash[id];
                    var contact = data[3];
                    var subject = data[1];
                    new Notification(contact, {
                        title: contact,
                        body: subject});
                }
            }
        });
    });
};

