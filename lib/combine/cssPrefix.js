(function(module) {

    var CSSOM = require('CSSOM');

    var prefix = ["-webkit-", "-moz-", "-o-", "-ms-"];

    var RULES = {
        'background-origin' : 01100,
        'background-size' : 01100,
        'border-image' : 01100,
        'border-image-outset' : 01100,
        'border-image-repeat' : 01100,
        'border-image-source' : 01100,
        'border-image-width' : 01100,
        'border-radius' : 01100,
        'box-shadow' : 01100,
        'column-count' : 01100,
        'column-gap' : 01100,
        'column-rule' : 01100,
        'column-rule-color' : 01100,
        'column-rule-style' : 01100,
        'column-rule-width' : 01100,
        'column-width' : 01100,
        'box-flex' : 01101,
        'box-orient' : 01101,
        'box-align' : 01101,
        'box-ordinal-group' : 01101,
        'box-flex-group' : 01101,
        'box-pack' : 01101,
        'box-direction' : 01101,
        'box-lines' : 01101,
        'box-sizing' : 01101,
        'animation-duration' : 01101,
        'animation-name' : 01101,
        'animation-delay' : 01101,
        'animation-direction' : 01101,
        'animation-iteration-count' : 01101,
        'animation-play-state' : 01101,
        'animation-timing-function' : 01101,
        'animation-fill-mode' : 01101,
        'transform' : 01111,
        'transform-origin' : 01111,
        'transition' : 01111,
        'transition-property' : 01111,
        'transition-duration' : 01111,
        'transition-timing-function' : 01111,
        'transition-delay' : 01111,
        'user-select' : 01111,
        'background-clip' : function(value) {
            var rs = [];
            if (value == "padding-box") {
                rs.push('-webkit-background-clip: padding-box');
                rs.push('-moz-background-clip: padding');
            }
            return rs;
        },
        'border-top-left-radius' : function(value) {
            var rs = [];
            rs.push('-webkit-border-top-left-radius: ' + value);
            rs.push('-moz-border-radius-top-left: ' + value);
            return rs;
        },
        'border-top-right-radius' : function(value) {
            var rs = [];
            rs.push('-webkit-border-top-right-radius: ' + value);
            rs.push('-moz-border-radius-top-right: ' + value);
            return rs;
        },
        'border-bottom-left-radius' : function(value) {
            var rs = [];
            rs.push('-webkit-border-bottom-left-radius: ' + value);
            rs.push('-moz-border-radius-bottom-left: ' + value);
            return rs;
        },
        'border-bottom-right-radius' : function(value) {
            var rs = [];
            rs.push('-webkit-border-bottom-right-radius: ' + value);
            rs.push('-moz-border-radius-bottom-right: ' + value);
            return rs;
        },
        'display' : function(value) {
            var rs = [];
            if (value == "box") {
                rs.push('display: -webkit-box');
                rs.push('display: -moz-box');
                rs.push('display: -ms-box');
            } else if (value == "inline-block") {
                rs.push('display: -moz-inline-stack', 'zoom: 1', '*display: inline');
            }
            return rs;
        },
        'opacity' : function(value) {
            var rs = [];
            var opacity = Math.round(value * 100);
            rs.push('-webkit-opacity: ' + value);
            rs.push('-moz-opacity: ' + value);
            rs.push("-ms-filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=" + opacity + ")");
            rs.push("filter: alpha(opacity=" + opacity + ")");
            return rs;
        },
        'text-overflow' : function(value) {
            var rs = [];
            if (value == "ellipsis") {
                rs.push('-o-text-overflow: ' + value);
            }
            return rs;
        }
    };

    var processCSS = function(cssText) {
        var rules = CSSOM.parse(cssText).cssRules, cssResult ='';
        for (var i = 0, l = rules.length; i < l; i ++) {
            var rule = rules[i],
                selector = rule.selectorText,
                styles = rule.style;
            cssResult += selector + ' {\n';
            for (var k = 0, o = styles.length; k < o; k ++) {
                var key = styles[k], value = styles[key];
                cssResult += '\t' + key + ': ' + value + ';\n';
                if (RULES[key]) {
                    if (RULES[key] == 01100) {
                        if (!styles[prefix[0] + key]) {
                            cssResult += '\t' + prefix[0] + key + ': ' + value + ';\n';
                        }
                        if (!styles[prefix[1] + key]) {
                            cssResult += '\t' + prefix[1] + key + ': ' + value + ';\n';
                        }
                    } else if (RULES[key] == 01101) {
                        if (!styles[prefix[0] + key]) {
                            cssResult += '\t' + prefix[0] + key + ': ' + value + ';\n';
                        }
                        if (!styles[prefix[1] + key]) {
                            cssResult += '\t' + prefix[1] + key + ': ' + value + ';\n';
                        }
                        if (!styles[prefix[3] + key]) {
                            cssResult += '\t' + prefix[3] + key + ': ' + (key == 'box-align') ? 'middle' : value + ';\n';
                        }
                    } else if (RULES[key] == 01111) {
                        for (var j = 0; j < 4; j ++) {
                            var current_prefix = prefix[j];
                            if (key == "transition") {
                                var trans_prop = value.split(" ")[0];
                                if (RULES[trans_prop]) {
                                    cssResult += '\t' + current_prefix + key + ': ' + value.replace(trans_prop, current_prefix + trans_prop) + ';\n';
                                } else {
                                    cssResult += '\t' + current_prefix + key + ': ' + value + ';\n';
                                }
                            } else if (key == "transition-property") {
                                if (j == 1) {
                                    var trans_props = value.split(",");
                                    var replaced_props = [];
                                    for (var p = 0, q = replaced_props.length; p < q; p ++) {
                                        var prop = trans_props[p].replace(/\n/gm, '').replace(/^\s*|\s*$/g, '').replace(/\s{2,}|\t/gm, ' ');
                                        if (RULES[[prop]]) {
                                            replaced_props.push(current_prefix + prop);
                                        }
                                    }
                                    cssResult += '\t' + current_prefix + key + ': ' + replaced_props.join(',') + ';\n';
                                }
                            } else {
                                cssResult += '\t' + current_prefix + key + ': ' + value + ';\n';
                            }
                        }
                    } else {
                        var rs = RULES[key](value);
                        if (rs.length) {
                            cssResult += '\t' + rs.join(';\n\t') + ';\n';
                        }
                    }
                }
            }
            cssResult += '}\n'
        }
        return cssResult;
    };

    module.exports = function(cssText) {
        return processCSS(cssText);
    };

})(module);