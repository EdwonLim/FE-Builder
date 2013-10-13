(function(module) {

    var fs = require('fs'),
        vm = require('vm'),
        debug = require('./debug.js');

    var typeReg = /\.json[p]*$/;

    var queryToJson = function(query) {
        var rs = {};
        if (query) {
            var list = query.split('&');
            for (var i = 0, l = list.length; i < l; i ++) {
                var kv = list[i].split('=');
                if (kv.length == 2) {
                    rs[kv[0]] = kv[1];
                }
            }
        }
        return rs;
    };

    var exec = function(filePath, config) {
        var returnType = (filePath.match(typeReg)[0] == '.json') ? 'json' : 'jsonp',
            queryObj = queryToJson(config.query),
            rs = '';
        if (fs.existsSync(filePath.replace(typeReg, '.json'))) {
            filePath = filePath.replace(typeReg, '.json');
            var code = fs.readFileSync(filePath);
            try {
                rs = JSON.stringify(JSON.parse(code));
            } catch (e) {
                debug.pushLog('Exec Json', 'Json Error', 'error');
                rs = '{"error":true,"message":"Json Error"}';
            }
        } else if (fs.existsSync(filePath.replace(typeReg, '.js'))) {
            filePath = filePath.replace(typeReg, '.js');
            var code = fs.readFileSync(filePath);
            try {
                var r = vm.runInNewContext('var global = this; (' + code + ')(' + JSON.stringify(queryObj) + ')', config.obj);
                if (typeof r === 'object') {
                    rs = JSON.stringify(r);
                } else {
                    debug.pushLog('Exec Json', 'Function Return Error', 'error');
                    rs = '{"error":true,"message":"Function Return Error"}';
                }
            } catch(e) {
                debug.pushLog('Exec Json', 'Function Run Error', 'error');
                rs = '{"error":true,"message":"Function Run Error"}';
            }
        }
        if (returnType == 'jsonp') {
            rs = queryObj.callback + '(' + rs + ')';
        }
        return rs;
    };

    module.exports = function(filePath, baseDir, config, callback) {
        var srcPath = baseDir + 'data/';
        filePath = srcPath + filePath;
        callback(exec(filePath, config));
    };

})(module);