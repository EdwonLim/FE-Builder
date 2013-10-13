(function(module) {

    var callbacks = [];

    module.exports = {
        pullLog : function(callback) {
            if (callback && typeof callback === 'function') {
                callbacks.push(callback);
            }
        },
        pushLog : function(tag, message, type) {
            for (var i = 0, l = callbacks.length; i < l; i ++) {
                callbacks[i](tag, message, type);
            }
        }
    };


})(module);