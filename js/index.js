$(function () {
    var main = function () {
        var $shapePanel = $('#shape_panel');

        $(window).resize(function () {
            $shapePanel.css({
                height: document.documentElement.clientHeight
            });
        }).trigger('resize');
        $.when(
            $.ajax({
                url: 'test/shapes-config.json?' + new Date().getTime()
            }),
            $.ajax({
                url: 'test/data.json?' + new Date().getTime()
            })
        ).done(function (shapesConfigData, data) {
            shapesConfigData = shapesConfigData[0];
            data = data[0];
            Wudaozi.init({
                designer: '#designer_viewport',
                shapes: shapesConfigData,
                toolbar: {
                    el: '#shape_panel',
                    actions: {
                        remove: function (event, ctx) {
                            console.info(event, ctx);
                        },
                        add: function (event, ctx) {
                            console.warn(this);
                        }
                    }
                },
                contextMenu: {
                    node: [{
                        text: '删除', id: 'a', icon: 'glyphicon-chevron-right', action: function (event, ctx, data) {
                            ctx.deleteNode(data.id);
                            console.log(event, ctx, data);
                        }
                    }, {
                        text: '编辑', id: 'a', icon: 'glyphicon-chevron-right', action: function (event, ctx, data) {
                            ctx.$$configProperty.show(data);
                        }
                    }, {
                        text: '文本C', id: 'a', icon: 'glyphicon-chevron-right', action: function () {

                            alert(1);
                        }
                    }, {
                        text: '文本D', id: 'a', icon: 'glyphicon-chevron-right', action: function () {

                            alert(1);
                        }
                    }],
                    line: [{
                        text: '删除', id: 'a', icon: 'glyphicon-chevron-right', action: function (event, ctx, data) {
                            ctx.deleteLine(data)
                            console.log(event, ctx, data);
                        }
                    }, {
                        text: '编辑', id: 'a', icon: 'glyphicon-chevron-right', action: function (event, ctx, data) {
                            ctx.$$configProperty.show(data);
                        }
                    }, {
                        text: '文本1', id: 'a', icon: 'glyphicon-chevron-right', action: function () {

                            alert(1);
                        }
                    }, {
                        text: '文本1', id: 'a', icon: 'glyphicon-chevron-right', action: function () {

                            alert(1);
                        }
                    }]
                },
                configProperty: {
                    action: {
                        show: function (...args) {
                            console.log(args);
                            console.log(this);
                        }
                    }
                },
                data: data
            });
        });
    };
    main();
});