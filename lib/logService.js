(function(module) {

    var io = require('socket.io'),
        fs = require('fs'),
        http = require('http'),
        path = require('path'),
        debug = require('./debug.js');


    var server, service, basePath = path.join(__dirname, '/../logPanel/');


    var start = function() {
        server = http.createServer(function(req, res) {
            console.log(basePath)
            console.log(path.join(basePath, req.url));
            if (fs.existsSync(path.join(basePath, req.url))) {
                console.log(path.join(basePath, req.url));
                res.end(fs.readFileSync(path.join(basePath, req.url)));
            } else {
                res.writeHead(404, {'Content-Length': 0});
                res.end();
            }
            req.connection.destroy();
        }).listen(6888);
        service = io.listen(server);
        service.sockets.on('connection', function (socket) {
            debug.pullLog(function(tag, message, type) {
                socket.emit('log', {
                    tag : tag,
                    message : message,
                    type : type
                });
            });
        });
    };

    module.exports = {
        start : start
    };

})(module);