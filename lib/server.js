(function(module) {

    var http = require('http');
    var fs = require('fs');
    var combineJS = require('./combine/combineJS.js');
    var combineCSS = require('./combine/combineCSS.js');
    var execJson = require('./execJson');
    var debug = require('./debug.js');
    var URL = require('url');

    var projects = {}, isProduct = false, objs = {};

    var server;

    var execute = function(req, res) {
        var urlObj = URL.parse(req.url),
            tags = urlObj.pathname.split('/'),
            project = tags[1] || '';
        if (projects[project]) {
            if (urlObj.pathname.match(/\.json[p]*$/)) {
                var filePath = tags.slice(2, tags.length).join('/');
                objs[project] = objs[project] || {};
                execJson(filePath, projects[project], {
                    query : urlObj.query,
                    obj : objs[project]
                }, function(data) {
                    res.end(data);
                    req.connection.destroy();
                    debug.pushLog('Server', 'Response for "' + project + '/' + filePath + '" is ready.', 'info');
                });
            } else if (isProduct) {
                tags[0] = projects[project];
                tags[1] = 'production';
                var filePath = tags.join('/').replace(/\/\//g, '/');
                if(fs.existsSync(filePath)) {
                    res.end(fs.readFileSync(filePath));
                    req.connection.destroy();
                    debug.pushLog('Server', 'Response for "' + filePath + '" is ready.', 'info');
                } else {
                    if (filePath.match(/\.js$/) || filePath.match(/\.css$/)) {
                        var fix_filePath = '';
                        if (filePath.match(/\.min\./)) {
                            fix_filePath = filePath.replace(/\.min\./, '.');
                        } else {
                            fix_filePath = filePath.replace(/\.js$/, '.min.js').replace(/\.css$/, '.min.css');
                        }
                        if(fs.existsSync(fix_filePath)) {
                            debug.pushLog('Server', '"' + filePath + ' does not exist, bug "' + fix_filePath + ' exist.', 'warn');
                            res.end(fs.readFileSync(fix_filePath));
                            req.connection.destroy();
                            debug.pushLog('Server', 'Response for "' + fix_filePath + '" is ready.', 'info');
                        } else {
                            res.end('/*"' + filePath + ' does not exist!*/');
                            req.connection.destroy();
                            debug.pushLog('Server', '"' + filePath + ' does not exist!', 'error');
                        }
                    } else {
                        res.end();
                        req.connection.destroy();
                        debug.pushLog('Server', '"' + filePath + ' does not exist!', 'error');
                        debug.pushLog('Server', 'Response for "' + filePath + '" is ready.', 'info');
                    }
                }
            } else {
                var type = tags[2];
                if (type == 'js') {
                    var compress = false,
                        filename = tags.slice(3, tags.length).join('/').replace(/\.min\./g, function(){
                            compress = true;
                            return '.';
                        });
                    combineJS(filename, projects[project], {
                        compress : compress
                    }, function(data){
                        res.setHeader('Content-Type','application/x-javascript;Charset=UTF-8');
                        res.end(data);
                        req.connection.destroy();
                        debug.pushLog('Server', 'Response for "' + projects[project] + filename + '" is ready.', 'info');
                    });
                } else if (type == 'css') {
                    var compress = false,
                        filename = tags.slice(3, tags.length).join('/').replace(/\.min\./g, function(){
                            compress = true;
                            return '.';
                        });
                    combineCSS(filename, projects[project], {
                        compress : compress
                    }, function(data){
                        res.setHeader('Content-Type','text/css;Charset=UTF-8');
                        res.end(data);
                        req.connection.destroy();
                        debug.pushLog('Server', 'Response for "' + projects[project] + filename + '" is ready.', 'info');
                    });
                } else {
                    tags[1] = 'src';
                    var filePath = (projects[project] + tags.join('/')).replace('src/src', 'src').replace('//', '/');
                    if(fs.existsSync(filePath)) {
                        if (filePath.match(/\.html$/)){
                            var info = fs.readFileSync(filePath, 'utf-8').replace(/^\xef\xbb\xbf/,'');
                            info = info.replace(/<script.+src=(.+)['|"| ].*><\/script>/ig, function(){
                                var script = arguments[0], src = arguments[1].replace(/["\s]/ig, '');
                                var new_src = src + (src.indexOf('?') > -1 ? '&' : '?') + '_v=' + (new Date().getTime().toString(16));
                                return script.replace(src, new_src);
                            });
                            info = info.replace(/<link.+href=(.+)['|"| ].*>/ig, function(){
                                var style = arguments[0], href = arguments[1].replace(/["\s]/ig, '');
                                var new_href = href + (href.indexOf('?') > -1 ? '&' : '?') + '_v=' + (new Date().getTime().toString(16));
                                return style.replace(href, new_href);
                            });
                            res.end(info);
                        } else {
                            res.end(fs.readFileSync(filePath));
                        }
                        req.connection.destroy();
                        debug.pushLog('Server', 'Response for "' + filePath + '" is ready.', 'info');
                    } else {
                        res.writeHead(404, {'Content-Length': 0});
                        res.end();
                        req.connection.destroy();
                        debug.pushLog('Server', '"' + filePath + '" does not exist!', 'error');
                    }
                }
            }
        } else {
            if (project == 'favicon.ico') {
                res.end(fs.readFileSync(__dirname + '/favicon.ico'));
                req.connection.destroy();
            } else {
                res.end('/*Project "' + project + '" does not exist!*/');
                req.connection.destroy();
                debug.pushLog('Server', 'Project "' + project + '" does not exist!', 'error');
            }
        }
    };

    var startServer = function(port) {
        try {
            server =http.createServer(function(req, res) {
                execute(req, res);
            }).listen(parseInt(port) || 80, function() {
                debug.pushLog('Server', 'Start Success', 'info');
            });
        } catch (e) {
            debug.pushLog('Server', 'Start Error : ' + e.message, 'error');
        }
    };

    var stopServer = function() {
        server && server.close(function(e){
            if (e) {
                debug.pushLog('Server', 'Stop Error : ' + e.message, 'error');
            } else {
                debug.pushLog('Server', 'Stop Success', 'info');
            }
        });
    };

    module.exports = {
        start : startServer,
        stop : stopServer,
        setProject : function(tag, path) {
            projects[tag] = path + '/';
        },
        removeProject : function(tag) {
            delete projects[tag];
        },
        getProject : function(tag) {
            return projects[tag];
        },
        toPD : function() {
            isProduct = true;
        },
        toDEV : function() {
            isProduct = false;
        }
    }

})(module);