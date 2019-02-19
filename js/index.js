$(function () {
    var getData = function () {
        var deferred = $.Deferred();
        var request = function () {
            return $.when(
                $.ajax({
                    url: 'test/shapes-config.json?' + new Date().getTime()
                }),
                $.ajax({
                    url: 'test/data.json?' + new Date().getTime()
                })
            ).then(function (shapesConfigData, data) {
                return deferred.resolve(shapesConfigData[0], data[0]);
            });
            return deferred.resolve([], []);
        };
        try {
            var data = JSON.parse(localStorage.getItem('data'));
            var shapesConfigData = JSON.parse(localStorage.getItem('shapesConfigData'));
            if (!data || !shapesConfigData) {
                return request();
            } else {
                return deferred.resolve(shapesConfigData, data);
            }
        } catch (e) {
            localStorage.clear();
            return request();
        }
    };


    var main = function () {
        var $shapePanel = $('#shape_panel');

        $(window).resize(function () {
            $shapePanel.css({
                height: document.documentElement.clientHeight
            });
        }).trigger('resize');
        getData()
            .done(function (shapesConfigData, data) {
                localStorage.setItem('shapesConfigData', JSON.stringify(shapesConfigData));
                localStorage.setItem('data', JSON.stringify(data));
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
                            },
                            save: function (event, ctx) {
                                console.info(ctx.getAllData());
                                localStorage.setItem('data', JSON.stringify(ctx.getAllData()));
                            },
                            clear: function (event, ctx) {
                                ctx.clearDesignerViewport();
                                localStorage.removeItem('data');
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
                            },
                            save: function (event, instance) {
                                console.info(instance.getAllData());
                                localStorage.setItem('data', JSON.stringify(instance.getAllData()));
                            }
                        }
                    },
                    data: data
                });
            });
    };
    main();
});