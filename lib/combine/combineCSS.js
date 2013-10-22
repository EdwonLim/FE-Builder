(function(module){

    var less = require('../less/index.js');
    var debug = require('../debug.js');
    var fs = require('fs');
    var prefix = require('./cssPrefix.js');
    var cssmin = require('ycssmin').cssmin;

    var urlReg = /url\s*\(\s*(['|"]?)([^\)\1|\:]+)\s*\)/ig;

    var optimizeUrl = function(data, floor) {
        var baseUrl = '';
        for (var i = 0; i < floor; i ++) {
            baseUrl += '../';
        }
        return data.replace(urlReg, function() {
            var tags = arguments[2].split('/'), i = 0;
            while ( i < tags.length) {
                if (tags[i] == '..' && i > 0) {
                    tags.splice(i - 1, 2);
                    i = i - 2;
                }
                i ++;
            }
            return 'url(' + baseUrl + tags.join('/') + ')';
        });
    };

    var combine = function(filePath, srcPath, config, callback) {
        if(fs.existsSync(filePath)) {
            debug.pushLog('Combine CSS', 'Read file : "' + filePath + '".', 'info');
            var code = fs.readFileSync(filePath, 'utf-8').replace(/^\xef\xbb\xbf/,'');
            less.render(code, {
                yuicompress : false, //!!config.compress,
                paths : [srcPath],
                relativeUrls: true
            }, function(e, data){
                if (e) {
                    callback('/* Error : ' + e.message + '*/');
                    debug.pushLog('Less Build', e.message, 'error');
                } else {
                    var cssText = prefix(optimizeUrl(data, config.floor));
                    if (config.compress) {
                        cssText = cssmin(cssText)
                    }
                    callback(cssText);
                }
            });
        } else {
            debug.pushLog('Combine CSS', '"' + filePath + '" does not exist!', 'error');
            callback('/* Error : "' + filePath + '" does not exist!*/');
        }
    };

    module.exports = function(filePath, baseDir, config, callback) {
        config = config || {};
        config.floor = filePath.split('/').length - 1;
        var srcPath = baseDir + 'src/less/';
        filePath = baseDir + 'conf/css/' + filePath.replace(/\.css$/,'.less');
        return combine(filePath, srcPath, config, callback);
    };

})(module);