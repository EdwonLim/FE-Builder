(function(module){
    var jsp = require('uglify-js').parser;
    var pro = require('uglify-js').uglify;
    var debug = require('../debug.js');
    var coffee = require('coffee-script');
    var fs = require('fs');

    var reg = /\$Import\(\s*(['|"])([\w\-\.\/]+)\1\s*\)\s*;?/gi;

    var combine = function(filePath, srcPath, config, beCombined) {
        if(fs.existsSync(filePath)) {
            debug.pushLog('Combine JS', 'Read file : "' + filePath + '".', 'info');
            var code = fs.readFileSync(filePath, 'utf-8').replace(/^\xef\xbb\xbf/,'');
            if (config.coffee) {
                code = coffee.compile(code);
            }
            code = code.replace(reg, function() {
                var key = arguments[2], isCoffee = false;
                if (key.match(/\.coffee$/)) {
                    isCoffee = true;
                };
                var path = key.replace(/\.js$/, '').replace(/\.coffee$/, '').replace(/\./g, '/') + (isCoffee ? '.coffee' : '.js');
                if (beCombined[key] !== 0) {
                    beCombined[key] = 0;
                    return combine(srcPath + path, srcPath, {
                        coffee : isCoffee
                    }, beCombined);
                }
                return '';
            });
            try {
                code = jsp.parse(code);
                if (!!config.compress) {
                    code = pro.ast_mangle(code)
                    code = pro.ast_squeeze(code,{
                        make_seqs : true,
                        dead_code : true,
                        no_warnings : false,
                        keep_comps : true
                    });
                }
                code = pro.gen_code(code,{
                    'beautify' : !config.compress
                });
            } catch (e) {
                debug.pushLog('Uglify JS', '"' + filePath + '" does not exist!', 'error');
                return '/* Error in "' + filePath + '":\n' + JSON.stringify(e) + '");\n*/';
            }
            return code + '\n';
        } else {
            debug.pushLog('Combine JS', '"' + filePath + '" does not exist!', 'error');
            return '/* Error : "' + filePath + '" does not exist! */';
        }
    };

    module.exports = function(filePath, baseDir, config, callback) {
        var srcPath = baseDir + 'src/js/';
        filePath = baseDir + 'conf/js/' + filePath;
        config = config || {};
        callback(combine(filePath, srcPath, config, {}));
    };

})(module);