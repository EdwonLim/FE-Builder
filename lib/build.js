(function(module){

    var fs = require('fs');
    var combineJS = require('./combine/combineJS.js');
    var combineCSS = require('./combine/combineCSS.js');

    var version = new Date().getTime().toString(16);

    var walker = function(path, basePath) {
        var rs = [];
        if (fs.existsSync(path)) {
            var files = fs.readdirSync(path);
            basePath = basePath || path;
            for (var i = 0, l = files.length; i < l; i ++) {
                var item = files[i],
                    tmpPath = path + '/' + item,
                    stats = fs.statSync(tmpPath);
                rs.push({
                    path : tmpPath.replace(basePath + '/', ''),
                    isDir : stats.isDirectory()
                });
                if (stats.isDirectory()) {
                    rs = rs.concat(walker(tmpPath, basePath));
                }
            };
        }
        return rs;
    };

    var createProductFolder = function(path) {
        var dir = path + 'production';
        if (fs.existsSync(dir)) {
            deleteFolder(dir);
        }
        fs.mkdirSync(dir);
    };

    var deleteFolder = function(path) {
        var files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function(file){
                var curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()) {
                    deleteFolder(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    var copyOtherResource = function(dir) {
        var srcPath = dir + 'src/', items = walker(srcPath), productPath = dir + 'production/';
        for (var i = 0, l = items.length; i < l; i ++) {
            var item = items[i], path = item.path, isDir = item.isDir;
            if (!path.match(/^[js|css|less]/)) {
                if (isDir) {
                    fs.mkdirSync(productPath + path);
                } else {
                    if (path.match(/\.html$/)) {
                        var info = fs.readFileSync(srcPath + path, 'utf-8').replace(/^\xef\xbb\xbf/,'');
                        info = info.replace(/<script.+src=(.+)['|"| |\/].*><\/script>/ig, function(){
                            var script = arguments[0], src = arguments[1].replace(/["\s]/ig, '');
                            var new_src = src + (src.indexOf('?') > -1 ? '&' : '?') + '_v=' + version;
                            return script.replace(src, new_src);
                        });
                        info = info.replace(/<link.+href=(.+)['|"| |\/].*>/ig, function(){
                            var style = arguments[0], href = arguments[1].replace(/["\s]/ig, '');
                            var new_href = href + (href.indexOf('?') > -1 ? '&' : '?') + '_v=' + version;
                            return style.replace(href, new_href);
                        });
                        fs.writeFileSync(productPath + path, info, 'utf-8');
                    } else {
                        fs.writeFileSync(productPath + path, fs.readFileSync(srcPath + path));
                    }
                }
            }
        }
    };

    var buildJS = function(dir, compress) {
        var confPath = dir + 'conf/js/', items = walker(confPath), productPath = dir + 'production/js/';
        fs.mkdirSync(dir + 'production/js');
        for (var i = 0, l = items.length; i < l; i ++) {
            var item = items[i], path = item.path, isDir = item.isDir;
            if (isDir) {
                fs.mkdirSync(productPath + path);
            } else {
                (function(p, d, c) {
                    combineJS(p, d, {
                        compress : c
                    }, function(data){
                        p = c ? p.replace(/\.js$/, '.min.js') : p;
                        fs.writeFileSync(productPath + p, data, 'utf-8');
                    });
                })(path, dir, compress);
            }
        }
    };

    var buildCSS = function(dir, compress) {
        var confPath = dir + 'conf/css/', items = walker(confPath), productPath = dir + 'production/css/';
        fs.mkdirSync(dir + 'production/css');
        for (var i = 0, l = items.length; i < l; i ++) {
            var item = items[i], path = item.path, isDir = item.isDir;
            if (isDir) {
                fs.mkdirSync(productPath + path);
            } else {
                (function(p, d, c) {
                    combineCSS(p, d, {
                        compress : c,
                        version : version
                    }, function(data){
                        var type = c ? '.min.css' : '.css';
                        p = p.replace(/\.css/, type).replace(/\.less$/, type);
                        fs.writeFileSync(productPath + p, data, 'utf-8');
                    });
                })(path, dir, compress);
            }
        }
    };

    var build = function(tag, path, compress) {
        createProductFolder(path);
        buildJS(path, compress);
        buildCSS(path, compress);
        copyOtherResource(path);
    };

    module.exports = function(tag, path, compress) {
        return build(tag, path, compress);
    }

})(module);