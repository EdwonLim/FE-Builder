(function(module) {

    var server = require('./server.js');
    var build = require('./build.js');

    module.exports = {
        start : server.start,
        stop : server.stop,
        add : server.setProject,
        update : server.setProject,
        remove : server.removeProject,
        info : server.getProject,
        toPD : server.toPD,
        toDEV : server.toDEV,
        product : function(tag) {
            build(tag, server.getProject(tag), false);
        },
        minify : function(tag) {
            build(tag, server.getProject(tag), true);
        }
    };

})(module);