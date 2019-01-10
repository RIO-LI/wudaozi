; $(function () {
    var uuid = 0;
    var hasInit = false;
    var Toolkit = {
        $designer: null,
        jsPlumb: null,
        currentFocusNode: null,
        _crrentSelectToAddDetails: null,
        init: function (config) {
            this.$designer = $(config.designer);
            jsPlumb.setContainer(this.$designer.get(0));
            this.jsPlumb = jsPlumb;
            this.initEvent();
        },
        initEvent: function () {
            if (hasInit) {
                return;
            }
            var that = this;
            // $(document).on('click', function (e) {
            //     var $target = $(e.target);
            //     if ($target.hasClass('shape_node')) {
            //         if (that.currentFocusNode) {
            //             that.hideEndPoints(that.currentFocusNode);
            //             that.currentFocusNode = null;
            //         }
            //         that.showEndPoints($target);
            //         that.currentFocusNode = e.target;
            //     } else {
            //         that.hideEndPoints(that.currentFocusNode);
            //         that.currentFocusNode = null;
            //     }
            // });
            $(document).on('click', '[data-action]', function (e) {
                var $target = $(e.target);
                var type = $target.attr('data-type') || 'common';
                var action = $target.attr('data-action') || 'add';
                that._crrentSelectToAddDetails = {
                    type: type,
                    action: action
                };
            });
            this.$designer.on('click', function (e) {
                if (!that._crrentSelectToAddDetails) {
                    return;
                }
                var mousePos = that.getMousePos(e);
                var offset = that.getDesignerOffset();
                that.addNode(mousePos.x - offset.left, mousePos.y - offset.top, that._crrentSelectToAddDetails.type);
                that._crrentSelectToAddDetails = null;
            });
        },
        createUUID: function () {
            uuid += 1;
            return 'uuid_' + uuid;
        },
        getDesignerOffset: function () {
            return this.$designer != null ? this.$designer.offset() : { left: 0, top: 0 };
        },
        getMousePos: function (event) {
            var e = event || window.event;
            var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
            var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
            var x = e.pageX || e.clientX + scrollX;
            var y = e.pageY || e.clientY + scrollY;
            return { x: x, y: y };
        },
        showEndPoints: function (element) {
            $(element).nextAll('.jtk-endpoint:lt(4)').show();
        },
        hideEndPoints: function (element) {
            $(element).nextAll('.jtk-endpoint:lt(4)').hide();
        },
        addNode: function (x, y, type, width, height) {
            var shape = this.shapes[type] || this.shapes.common;
            var $node = $(shape.template);
            var uuid = this.createUUID();
            $node.addClass('shape_node');
            $node.find('[data-role="content"]').html(shape.defaultText);
            $node.css({
                position: 'absolute',
                left: x,
                top: y
            }).attr({
                'data-type': type,
                id: uuid
            }).appendTo(this.$designer);
            ['Top', 'Bottom', 'Left', 'Right'].filter(function (direction) {
                if (type == 'begin') {
                    return direction == 'Bottom';
                } else if (type == 'end') {
                    return direction == 'Top';
                } else {
                    return true;
                }
            }).forEach(function (direction) {
                var config = $.extend(true, {}, this.visoConfig.lineStyle);
                if (type == 'begin') {
                    config.maxConnections = 1;
                    config.isTarget = false;
                } else if (type == 'end') {
                    config.maxConnections = 1;
                    config.isSource = false;
                }
                this.jsPlumb.addEndpoint($node, {
                    anchors: direction,
                    uuid: uuid + '_' + direction
                }, config);
            }, this);
            jsPlumb.draggable($node.get(0), {
                containment: 'parent'
            });
        },
    };

    Toolkit.shapes = {};

    Toolkit.shapes.begin = {
        template: ' \
            <div class="pa" data-type="begin">\
                <a class="btn btn-info" data-role="content" href="javascript:void(0)">\
                </a>\
            </div>\
        ',
        defaultText: '开始'
    };

    Toolkit.shapes.common = {
        template: '\
            <div class="pa" data-type="common">\
                <a class="btn btn-default" data-role="content" href="javascript:void(0)">\
                </a>\
            </div>\
        ',
        defaultText: '节点'
    };

    Toolkit.shapes.end = {
        template: '\
            <div class="pa" data-type="end">\
                <a class="btn btn-danger" data-role="content" href="javascript:void(0)">\
                </a>\
            </div>\
        ',
        defaultText: '结束'
    };

    // 可视化配置对象
    Toolkit.visoConfig = {};
    // 基本连接线样式
    Toolkit.visoConfig.connectorPaintStyle = {
        lineWidth: 2,
        strokeStyle: '#ffff',
        // joinstyle: 'round',
        // fill: 'pink',
        outlineColor: '',
        outlineWidth: ''
    };

    // 鼠标悬浮在连接线上的样式
    Toolkit.visoConfig.connectorHoverStyle = {
        lineWidth: 2,
        strokeStyle: 'red',
        outlineWidth: 10,
        outlineColor: ''
    };

    // 链接线样式
    Toolkit.visoConfig.lineStyle = {
        paintStyle: {
            stroke: '#7AB02C',
            fill: '#7AB02C',
            radius: 6,
            lineWidth: 2
        },
        isSource: true, // 是否可以拖动（作为连线起点）
        connector: ['Flowchart', { gap: 10, cornerRadius: 5, alwaysRespectStubs: true }],  // 连接线的样式种类有[Bezier],[Flowchart],[StateMachine ],[Straight ]
        isTarget: true, // 是否可以放置（连线终点）
        maxConnections: -1, // 设置连接点最多可以连接几条线
        connectorOverlays: [
            ['Arrow', {
                width: 10,
                length: 10,
                location: 1
            }],
            ['Arrow', {
                width: 10,
                length: 10,
                location: 0.2
            }],
            ['Arrow', {
                width: 10,
                length: 10,
                location: 0.7
            }]
        ]
    };

    var drawGrid = function (ctx, w, h, strokeStyle, step) {
        var _ctx = null;
        step = step ? step : 10;
        strokeStyle = strokeStyle ? strokeStyle : '#eee';
        if (ctx instanceof HTMLCanvasElement) {
            _ctx = ctx.getContext('2d');
        } else {
            _ctx = ctx;
        }
        _ctx.beginPath();
        for (var x = 0.5;x < w;x += step) {
            _ctx.moveTo(x, 0);
            _ctx.lineTo(x, h);
        }

        for (var y = 0.5;y < h;y += step) {
            _ctx.moveTo(0, y);
            _ctx.lineTo(w, y);
        }
        _ctx.closePath();
        _ctx.strokeStyle = strokeStyle;
        _ctx.stroke();
    }

    var initView = function () {
        initToolsViewport();
        initDesignerViewport();
    };

    var initToolsViewport = function () {
        var $shapePanel = $('#shape_panel');
        $shapePanel.css({
            height: document.documentElement.clientHeight
        });
    };

    var initDesignerViewport = function () {
        var $designer = $('#designer_viewport');
        var $drawContainer = $('#canvas_container');
        var width = $designer.width();
        var height = document.documentElement.clientHeight;
        $drawContainer.append(`<canvas id="designer_grids" width="${width}" height="${height}">`);
        drawGrid($('#designer_grids').get(0), width, height);
    }

    var main = function () {
        initView();
        jsPlumb.connect({
            source: 'item_left',
            target: 'item_right',
            endpoint: 'Dot'
        });
        Toolkit.init({
            designer: '#designer_viewport'
        });
        window.Toolkit = Toolkit;
    };
    main();
});