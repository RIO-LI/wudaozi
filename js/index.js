$(function () {
    var main = function () {
        var $shapePanel = $('#shape_panel');

        $(window).resize(function () {
            $shapePanel.css({
                height: document.documentElement.clientHeight
            });
        }).trigger('resize');
        $.ajax({
            url: 'test/data.json?' + new Date().getTime()
        }).then(function (data) {
            console.log(data);
            Wudaozi.init({
                designer: '#designer_viewport',
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
                        text: '文本A', id: 'a', icon: 'glyphicon-chevron-right', action: function (event, data) {

                            console.log(event, data);
                        }
                    }, {
                        text: '文本B', id: 'a', icon: 'glyphicon-chevron-right', action: function () {

                            alert(1);
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
                        text: '删除', id: 'a', icon: 'glyphicon-chevron-right', action: function (event, data) {
                            Wudaozi.deleteLine(data)
                            console.log(event, data);
                        }
                    }, {
                        text: '文本1', id: 'a', icon: 'glyphicon-chevron-right', action: function () {

                            alert(1);
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
                data: data.root,
                nodeDoubleClickAction: function (...args) {
                    console.log(args);
                }
            });
        });
    };
    main();
});