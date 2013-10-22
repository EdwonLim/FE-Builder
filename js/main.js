(function() {
    var GUI = require('nw.gui'),
        win = GUI.Window.get(),
        debug = require('./lib/debug.js'),
        control = require('./lib/control.js'),
        logService = require('./lib/logService.js');

    var projects = {}, doms, port = 8080;

    var getProjects = function(){
        projects = JSON.parse(localStorage.getItem('projects') || '{}') || {};
        for (var key in projects) {
            addProject(key, projects[key]);
        }
    };

    var saveProjects = function() {
        localStorage.setItem('projects', JSON.stringify(projects));
    };

    var li_html = [
        '<li data-id="NAME">',
            '<div class="item">',
                '<span class="label label-info name" data-id="NAME">NAME</span>',
                '<span class="label label-danger right-btn remove-btn" data-id="NAME">Remove</span>',
                '<span class="label label-primary right-btn min-btn" data-id="NAME">Minify</span>',
                '<span class="label label-success right-btn product-btn" data-id="NAME">Product</span>',
            '</div>',
            '<div class="item">',
                '<span class="address" data-id="NAME">PATH</span>',
            '</div>',
        '</li>'
    ].join('');

    var initDoms = function() {
        doms = {
            title : $('#top-bar .navbar-header .navbar-brand'),
            min : $('#minBtn'),
            close : $('#closeBtn'),
            folderChose : $('#folder_chose'),
            plusProject : $('#bottom-bar .glyphicon-plus'),
            serverMenu : $('#bottom-bar .glyphicon-globe'),
            logMenu : $('#bottom-bar .glyphicon-tasks'),
            serverControl : $('#serverControl'),
            portInput : $('#serverControl #port'),
            serverSwitch : $('#serverControl .switch1'),
            productSwitch : $('#serverControl .switch2'),
            projectControl : $('#content'),
            projectContent : $('#ul-list')
        };
        doms.projectControl.mCustomScrollbar({
            autoHideScrollbar : true,
            advanced:{
                updateOnContentResize: true
            },
            theme : 'dark'
        });
    };

    var showMessage = (function() {
        var timer = null, timeout = 2000;
        return function(message, type) {
            type = type || 'info';
            debug.pushLog('Main', message, type);
            timer && window.clearTimeout(timer);
            doms.title.popover('destroy');
            doms.title.popover({
                html : true,
                content : '<span class="tip ' + type + '">' + message + '</span>',
                trigger : 'manual',
                delay : 1000
            });
            doms.title.popover('show');
            timer = window.setTimeout(function(){
                doms.title.popover('hide');
                timer = null;
            }, timeout);
        }
    })();

    var bindTitleBtnEvent = function() {
        doms.close.click(function(){
            win.close();
        });
        doms.min.click(function(){
            win.minimize();
        });
    };

    var bindMenuBtnEvent = function() {
        doms.plusProject.click((function(){
            doms.folderChose[0].onchange = function() {
                var name = window.prompt('Project Name :');
                addProject(name, doms.folderChose.val());
                sowMessage('Project "' + name + '" has been added!');
                doms.folderChose.val('');
            };
            return function() {
                doms.folderChose.click();
            }
        })());

        doms.serverMenu.click(function(){
            if (doms.serverControl.is(':hidden')) {
                doms.serverControl.show();
                doms.serverMenu.addClass('active');
            } else {
                doms.serverControl.hide();
                doms.serverMenu.removeClass('active');
            }
        });

        doms.logMenu.click(function(){
            GUI.Shell.openExternal('http://127.0.0.1:6888/index.html');
        });

        doms.serverSwitch.on('switch-change', function (e, data) {
            port = parseInt(doms.portInput.val());
            if (data.value) {
                control.start(port)
                showMessage('Start server on port : ' + port + ' .');
            } else {
                control.stop();
                showMessage('Stop server.');
            }
        });

        doms.productSwitch.on('switch-change', function (e, data) {
            control[data.value ? 'toDEV' : 'toPD']();
            showMessage('Change environment to "' + (data.value ? 'Development' : 'Product')  + '" .');
        });
    };

    var addProject = function(name, path) {
        doms.projectContent.find('li h1').parents('li').remove();
        var item = $(li_html.replace(/NAME/g, name).replace(/PATH/g, path)).appendTo($('#ul-list'));
        item.find('.name').dblclick(function(){
            var name = $(this).attr('data-id');
            GUI.Shell.openExternal('http://127.0.0.1:' + port + '/' + name + '/index.html');
        });
        item.find('.remove-btn').click(function(){
            var name = $(this).attr('data-id');
            if (window.confirm('Remove the preject "' + name + '"?')) {
                doms.projectContent.find('li[data-id=' + name + ']').remove();
                delete projects[name];
                saveProjects();
                control.remove(name);
                showMessage('Project "' + name + '" has been removed!');
            }
        });
        item.find('.min-btn').click(function(){
            try {
                control.minify(name);
                showMessage('Project "' + name + '" minify success!');
            } catch (e) {
                showMessage('Project "' + name + '" minify error!', 'error');
            }
        });
        item.find('.product-btn').click(function(){
            try {
                control.product(name);
                showMessage('Project "' + name + '" protuct success!');
            } catch (e) {
                showMessage('Project "' + name + '" protuct error!', 'error');
            }
        });
        item.find('.address').dblclick(function(){
            var name = $(this).attr('data-id');
            if (projects[name]) {
                GUI.Shell.showItemInFolder(projects[name]);
            }
        });
        projects[name] = path;
        saveProjects();
        control.add(name, path);
        setTimeout(function() {
            doms.projectControl.mCustomScrollbar("scrollTo", "bottom");
        }, 500);
    };

    var execException = function() {
        process.on('uncaughtException', function( err ) {
            switch (err.syscall) {
                case 'listen' :
                    setTimeout(function() {
                        showMessage('Server Error!', 'error');
                        doms.serverSwitch.bootstrapSwitch('setState', false);
                    }, 0);
                    break;
                default :
                    setTimeout(function() {
                        showMessage('System Error!', 'error');
                    }, 0);
            }
        });
    };

    var execLog = function() {
        logService.start();
    };

    $(document).ready(function() {
        initDoms();
        bindTitleBtnEvent();
        bindMenuBtnEvent();
        getProjects();
        execException();
        execLog();
        control.start(port);
    });

})();