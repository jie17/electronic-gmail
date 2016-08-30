const storage = require('electron-json-storage');

module.exports = {
    getZoomFactor: function(callback) {
        this.get('zoom_factor', (data) => {
            let zoom_factor = data;
            if (!zoom_factor) {
                zoom_factor = 1;
            }
            callback(zoom_factor);
        });
    },

    setZoomFactor: function(data) {
        this.set('zoom_factor', data);
    },
    
    getToken: function(callback) {
        this.get("token", callback);
    },
    
    setToken: function(data) {
        this.set("token", data);    
    },
    
    get: function(name, callback) {
        storage.get(name, function(error, data) {
            if (error) throw error;
            if (Object.keys(data).length) {
                console.info(`${name}: ${data[name]}`);
            }
            callback(data[name]);
        });
    },
    
    set: function(name, data) {
        let param = {};
        param[name] = data;
        storage.set(name, param, function(error) {
            if (error) throw error;
        });
    }
}