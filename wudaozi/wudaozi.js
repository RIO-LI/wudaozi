; $(function () {

    function flattenDownDepth(array, result, depth) {
        depth--
        for (var i = 0;i < array.length;i++) {
            var value = array[i]

            if (depth > -1 && Array.isArray(value)) {
                flattenDownDepth(value, result, depth)
            } else {
                result.push(value)
            }
        }

        return result
    }

    function flattenFromDepth(array, depth) {
        if (typeof depth !== 'number') {
            throw new TypeError('Expected the depth to be a number')
        }

        return flattenDownDepth(array, [], depth)
    }

    function flattenDepth(array, depth) {
        if (!Array.isArray(array)) {
            throw new TypeError('Expected value to be an array')
        }

        return flattenFromDepth(array, depth)
    }




    var uuid = 0;
    var hasInit = false;
    var Toolkit = {
        eventManager: $({}),
        $designer: null,
        jsPlumb: null,
        currentFocusNode: null,
        _crrentSelectToAddDetails: null,
        // 初始化时的配置
        initConfig: null,
        data: null,
        // jsPlumb可视化配置对象
        visoConfig: {
            // 基本连接线样式
            connectorPaintStyle: {
                lineWidth: 2,
                strokeStyle: '#ffff',
                // joinstyle: 'round',
                // fill: 'pink',
                outlineColor: '',
                outlineWidth: ''
            },
            // 鼠标悬浮在连接线上的样式
            connectorHoverStyle: {
                lineWidth: 2,
                strokeStyle: 'red',
                outlineWidth: 10,
                outlineColor: ''
            },
            // 链接线样式
            lineStyle: {
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
            }
        },

        // 控件描述集合
        shapes: {
            start: {
                template: ' \
                    <div class="pa" data-type="start">\
                        <a class="btn btn-info" data-role="content" href="javascript:void(0)">\
                        </a>\
                    </div>\
                ',
                defaultText: '开始'
            },
            common: {
                template: '\
                    <div class="pa" data-type="common">\
                        <a class="btn btn-default" data-role="content" href="javascript:void(0)">\
                        </a>\
                    </div>\
                ',
                defaultText: '节点'
            },
            people: {
                template: '\
                    <div class="pa" data-type="people">\
                        <a class="btn btn-default" data-role="content" href="javascript:void(0)">\
                        </a>\
                    </div>\
                ',
                defaultText: '节点'
            },
            end: {
                template: '\
                    <div class="pa" data-type="end">\
                        <a class="btn btn-danger" data-role="content" href="javascript:void(0)">\
                        </a>\
                    </div>\
                ',
                defaultText: '结束'
            }
        },
        /**
         * 初始化吴道子绘图板
         * @param {Object} config 配置对象
         */
        init: function (config) {
            this.initConfig = $.extend(true, {}, config);
            this.$designer = $(this.initConfig.designer);
            jsPlumb.setContainer(this.$designer.get(0));
            this.jsPlumb = jsPlumb;
            this.initDesignerViewport();
            this.initEvent();
            return this;
        },
        /**
         * 根据数据渲染画图板中的内容
         * @param {{lines: Array, nodes: Array}} data 渲染数据
         */
        renderDesignerViewport: function (data) {
            this.clearDesignerViewport();
            if (!data) {
                return this;
            }
            console.table(data);
            var that = this;
            var nodes = data.nodes || [];
            var lines = data.lines || [];
            nodes.forEach(function (node) {
                that.addNode(node);
            });
            lines.forEach(function (line) {
                that.addLine(line);
            });
            return this;
        },
        /**
         * 清空画图板中的内容
         */
        clearDesignerViewport: function () {
            this.$designer
                .find('#canvas_container')
                .siblings()
                .hide()
                .remove();
            return this;
        },
        /**
         * 初始化设计视图
         */
        initDesignerViewport: function () {
            this.$designer.append('<div id="canvas_container">');
            var $drawContainer = $('#canvas_container');
            var width = this.$designer.width();
            var height = document.documentElement.clientHeight;
            var $canvas = $('<canvas>');
            $canvas.attr({
                id: 'designer_grids',
                width: width,
                height: height
            }).hide();
            $drawContainer.append($canvas);
            this.drawGrid($('#designer_grids').get(0), width, height);
            $canvas.show();
            this.initConfig && this.initConfig.data && this.renderDesignerViewport(this.initConfig.data);
            return this;
        },
        /**
         * 在制定canvas 2D渲染上下文中渲染网格
         * @param {CanvasRenderingContext2D} ctx canvas 2D渲染上下文
         * @param {number} w 网格的每格子的宽度
         * @param {number} h 网格的每格子的高度
         * @param {string} [strokeStyle="#eee"] 网格边框的颜色，默认为#eee色 
         * @param {number} [step=10]  网格的每格子的间隔
         */
        drawGrid: function (ctx, w, h, strokeStyle, step) {
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
            return this;
        },
        /**
         * 初始化绘图板的事件
         */
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
            // 监听页面的动作控件，例如带有data-actio属性的新增、删除、保存等按钮
            $(document)
                .off('click', '[data-action]')
                .on('click', '[data-action]', function (e) {
                    var $target = $(e.target);
                    var type = $target.attr('data-type') || 'common';
                    var action = $target.attr('data-action') || 'add';
                    that._crrentSelectToAddDetails = {
                        type: type,
                        action: action
                    };
                });
            // 监听画板点击事件，如果存在已选中待添加的控件，往画板中新增该类型控件
            this.$designer
                .on('click', function (e) {
                    if (!that._crrentSelectToAddDetails) {
                        return;
                    }
                    var mousePos = that.getMousePos(e);
                    var offset = that.getDesignerOffset();
                    that.addNode({
                        left: mousePos.x - offset.left,
                        top: mousePos.y - offset.top,
                        type: that._crrentSelectToAddDetails.type
                    });
                    that._crrentSelectToAddDetails = null;
                });
            // 监听画板上对于形状控件双击点击事件
            this.$designer
                .on('dblclick', '.shape_node', function (e) {
                    var $target = $(e.currentTarget);
                    var data = $target.data('property');
                    that.shapeNodeDoubleClickAction(e, data);
                });
            return this;
        },
        shapeNodeDoubleClickAction: function (event, data) {
            if (this.initConfig && this.initConfig.shapeNodeDoubleClickAction) {
                this.initConfig.shapeNodeDoubleClickAction(event, data, this);
            }
            this.trigger('shape-node-double-click', event, data, this);
            return this;
        },
        /**
         * 获取一个uuid
         * @returns {string} 格式 'uuid_${number}'
         */
        createUUID: function () {
            uuid += 1;
            return 'uuid_' + uuid;
        },
        /**
         * 获取画板坐标位置
         * @returns {{left: number, top: number}}
         */
        getDesignerOffset: function () {
            return this.$designer != null ? this.$designer.offset() : { left: 0, top: 0 };
        },
        /**
         * 根据事件对象，获取事件对象发生的位置坐标系
         * @param {Event} event 事件对象
         * @returns {x: number, y: number}
         */
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
            return this;
        },
        hideEndPoints: function (element) {
            $(element).nextAll('.jtk-endpoint:lt(4)').hide();
            return this;
        },
        /**
         * 根据描述数据对象，向画图板指定坐标位置新增相关类型的控件
         * @param {{left: number, top: number, type: string, width: number, height: number, name: string}} 
         *  desc 描述数据对象
         */
        addNode: function (desc) {
            var shape = this.shapes[desc.type] || this.shapes.common;
            var $node = $(shape.template);
            var uuid = this.createUUID();
            var id = this.getField(desc, 'id', uuid);
            $node.addClass('shape_node');
            $node.find('[data-role="content"]').html(this.getField(desc, 'name', shape.defaultText));
            $node.css({
                position: 'absolute',
                left: parseFloat(desc.left),
                top: parseFloat(desc.top)
            }).attr({
                'data-type': desc.type,
                id: id,
                'data-id': id
            }).appendTo(this.$designer);
            ['Top', 'Bottom', 'Left', 'Right'].filter(function (direction) {
                // if (desc.type == 'start' || desc.type == 'end') {
                //     return direction == 'Bottom';
                // } else {
                return true;
                // }
            }).forEach(function (direction) {
                var config = $.extend(true, {}, this.visoConfig.lineStyle);
                if (desc.type == 'end') {
                    config.isSource = false;
                }
                this.jsPlumb.addEndpoint($node, {
                    anchors: direction,
                    uuid: id + '_' + direction
                }, config);
            }, this);
            jsPlumb.draggable($node.get(0), {
                containment: 'parent'
            });
            return this;
        },
        /**
         * 根据数据描述对象添加链接线
         * @param {{from: string, to: string}} desc 数据描述对象 
         */
        addLine: function (desc) {
            jsPlumb.connect({ uuids: [desc.from, desc.to] });
            return this;
        },
        /**
         * 获取所有链接线的数据
         * @returns {Array<{from: string, to: string}>}
         */
        getLinesData: function () {
            var data = (jsPlumb.getAllConnections() || []).map(function (connection) {
                if (connection && connection.endpoints) {

                    return connection.endpoints || [];
                }
                return [];
            }).map(function (endpoints) {
                var fromAnchor = endpoints[0]['anchor'];
                var toAnchor = endpoints[1]['anchor'];
                return {
                    from: fromAnchor.elementId + '_' + fromAnchor.type,
                    to: toAnchor.elementId + '_' + toAnchor.type
                };
            });
            return data;
        },
        /**
         * 获取选择器对应的元素的几何信息
         * @param {string} selector 
         * @returns {left: number, top: number,right: number, bottom: number, width: number, height: number, middleX: number, middleY: number}
         */
        getElementGeometry: function (selector) {
            var $el = $(selector);
            var offset = $el.offset();
            var width = $el.outerWidth();
            var height = $el.outerHeight();
            var geometry = {
                left: offset.left,
                top: offset.top,
                right: offset.left + width,
                bottom: offset.top + height,
                width: width,
                height: height,
                middleX: offset.left + (width / 2),
                middleY: offset.top + (height / 2)
            };
            return geometry;
        },
        /**
         * 获取对象的指定属性的值，如果没有并指定默认值的话，返回这个默认值
         * @param {any} obj 目标对象
         * @param {string|number} field 数学字段或索引 
         * @param {any} [defaultValue=undefined] 默认值
         * @returns {any} 
         */
        getField: function (obj, field, defaultValue) {
            try {
                if (obj == null) {
                    return null || undefined;
                } else {
                    return obj[field] != null ? obj[field] : defaultValue;
                }
            } catch (e) {
                return defaultValue;
            }
        },
        on: function () {
            var args = [].slice.call(arguments);
            this.eventManager.on.apply(this.eventManager, args);
            return this;
        },
        trigger: function () {
            var args = [].slice.call(arguments);
            this.eventManager.trigger.apply(this.eventManager, args);
            return this;
        },
        off: function () {
            var args = [].slice.call(arguments);
            this.eventManager.off.apply(this.eventManager, args);
            return this;
        }
    };
    window.Toolkit = Toolkit;
});