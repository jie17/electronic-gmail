const storage = require('electron-json-storage');

var configWrapper = function() {
    return {
        getZoomFactor: function(callback) {
            storage.get('config', function(error, data) {
                if (error) throw error;
                if (Object.keys(data).length) {
                    var zoom_factor = data["zoom_factor"];
                }
                else {
                    var zoom_factor = 1;
                }
                callback(zoom_factor);
            });
        },

        setZoomFactor: function(data) {
            storage.set('config', { zoom_factor: data }, function(error) {
                if (error) throw error;
            });
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
                    console.info(data[name]);
                }  
                callback(data[name]);
            });
        },
        
        set: function(name, data) {
            var param = {};
            param[name] = data;
            storage.set(name, param, function(error) {
                if (error) throw error;
            });
        }
    };
}

module.exports = configWrapper();