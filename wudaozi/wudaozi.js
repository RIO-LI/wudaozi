; $(function () {

    /**
     * ========================================================================
     * 
     * 右键菜单编辑功能模块
     * 
     * ========================================================================
     */
    // 右键菜单对象
    var ContextMenu = {
        _cacheId: null,
        _show: false,
        menuTemplate: '<ul class="context-menu-list"></ul>',
        menuItemTemplate: '<li class="context-menu-item"><span class="context-menu-item-icon glyphicon"></span><span class="context-menu-item-text"></span></li>',
        /**
         * 根据配置渲染右键菜单内容
         * @param {{el: string, menus: Array<{text: string, id: string, action: Function,icon: string}>,data: any}} config 
         */
        render: function (settting) {
            this.destroy();
            var config = $.extend(true, {
                position: {
                    left: 0,
                    top: 0
                },
                css: {
                    munuItem: {
                        height: 22,
                        padding: 4
                    }
                }
            }, settting);
            var that = this;
            var uuid = 'uuid_' + new Date().getTime();
            this._cacheId = uuid;
            var $menu = $(this.menuTemplate);
            var $lis = [];
            (config.menus || []).forEach(function (item) {
                var icon = item.icon != null ? item.icon : 'glyphicon-list-alt';
                var action = $.isFunction(item.action) ? item.action : $.noop;
                var text = !$.isEmptyObject(item.text) ? item.text : '';
                var id = !$.isEmptyObject(item.id) ? item.id : '';
                var $li = $(that.menuItemTemplate);
                $li.attr({ id: id }).css(config.css.munuItem);
                $li.find('.context-menu-item-text').html(text);
                $li.find('.context-menu-item-icon').addClass(icon);;
                $li.on('click', function (event) {
                    action.apply(null, [event, Wudaozi, config.data]);
                });
                $lis.push($li);
            });
            $menu
                .attr({ id: uuid })
                .css({
                    left: config.position.left,
                    top: config.position.top
                })
                .append($lis)
                .appendTo($(config.el));
            this._show = true;
            return this;
        },
        destroy: function () {
            this._show = false;
            if (this._cacheId) {
                $('#' + this._cacheId).hide().remove();
            }
        }
    };




    /**
   * ========================================================================
   * 
   * 画图板功能模块
   * 
   * ========================================================================
   */
    jsPlumb.init(); // 强行调用使完成jsPlumb，避免因jsPlumb一些内部初始化未完成造成的bug;
    var uuid = new Date().getTime();
    var hasInit = false;
    var Wudaozi = {
        // 插件缓存对象
        plugins: {},
        // 邮件菜单管理者
        $$contextMenu: ContextMenu,
        // 事件管理者
        eventManager: $({}),
        // 画图板jQuery DOM对象
        $designer: null,
        // Canvas网格 jQuery DOM对象
        $grids: null,
        // 工具栏jQuery DOM对象
        $toolbar: null,
        // jsPlumb对象缓存
        jsPlumb: null,
        // 当前选中的节点
        currentFocusNode: null,
        // 当前选择待添加的信息详情
        _crrentSelectToAddDetails: null,
        // 初始化时的配置
        initConfig: null,
        // 初始化绘图的数据
        data: null,
        // jsPlumb可视化配置对象
        visoConfig: {
            // 基本连接线样式
            connectorPaintStyle: {
                lineWidth: 2,
                strokeStyle: '#ffff',
                outlineColor: '',
                outlineWidth: ''
            },
            // 鼠标悬浮在连接线上的样式
            hoverPaintStyle: {
                lineWidth: 2,
                stroke: 'red',
                strokeWidth: 2
            },
            // 链接线样式
            lineStyle: {
                connectorStyle: {
                    lineWidth: 2,
                    strokeWidth: 3,
                    stroke: '#61B7CF'
                },
                connectorHoverStyle: {
                    lineWidth: 2,
                    stroke: 'red',
                    strokeWidth: 3
                },
                paintStyle: {
                    stroke: '#7AB02C',
                    fill: '#7AB02C',
                    radius: 6,
                    lineWidth: 2,
                    strokeWidth: 2
                },
                isSource: true, // 是否可以拖动（作为连线起点）
                connector: ['Flowchart', { gap: 8, cornerRadius: 5, alwaysRespectStubs: true }],  // 连接线的样式种类有[Bezier],[Flowchart],[StateMachine ],[Straight ]
                isTarget: true, // 是否可以放置（连线终点）
                maxConnections: 999, // 设置连接点最多可以连接几条线
                connectorOverlays: [
                    // ['Arrow', {
                    //     width: 20,
                    //     length: 15,
                    //     location: 1
                    // }],
                    // ['Arrow', {
                    //     width: 20,
                    //     length: 15,
                    //     location: 0.2
                    // }],
                    ['Arrow', {
                        width: 20,
                        length: 15,
                        location: 0.97
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
                defaultText: '开始',
                properties: []
            },
            common: {
                template: '\
                    <div class="pa" data-type="common">\
                        <a class="btn btn-default" data-role="content" href="javascript:void(0)">\
                        </a>\
                    </div>\
                ',
                defaultText: '节点',
                properties: []
            },
            people: {
                template: '\
                    <div class="pa" data-type="people">\
                        <a class="btn btn-default" data-role="content" href="javascript:void(0)">\
                        </a>\
                    </div>\
                ',
                defaultText: '节点',
                properties: []
            },
            end: {
                template: '\
                    <div class="pa" data-type="end">\
                        <a class="btn btn-danger" data-role="content" href="javascript:void(0)">\
                        </a>\
                    </div>\
                ',
                defaultText: '结束',
                properties: []
            }
        },
        /**
         * 初始化绘图板
         * @param {Object} config 配置对象
         */
        init: function (config) {
            this.initConfig = $.extend(true, {
                shapes: this.shapes
            }, config);
            this.$designer = $(this.initConfig.designer);
            this.$toolbar = $(this.getField(this.initConfig, 'toolbar.el'));
            jsPlumb.setContainer(this.$designer.get(0));
            this.jsPlumb = jsPlumb;
            this.initDesignerViewport();
            this._initEvent();
            this._initPlugins();
            return this;
        },
        /**
         * 注册插件
         * @param {string} name 插件对象的名称，注册成功之后会在Wudaozi对象下生成对应$${name}值的属性
         * @param {object} pluginObject 拓展插件对象
         */
        plugin: function (name, pluginObject) {
            if (typeof name !== 'string' && typeof pluginObject === 'object') {
                return this;
            }
            pluginObject.$$w = this; // 在插件对象上挂载一个$w属性，使之可以访问Wudaozi对象
            this.plugins['$$' + name] = this['$$' + name] = pluginObject;
            return this;
        },
        /**
         * 初始化所有插件，调用插件的init方法
         */
        _initPlugins: function () {
            var that = this;
            Object.keys(this.plugins).forEach(function (pluginName) {
                var initFn = that.getField(that, 'plugins.' + pluginName + '.init');
                if ($.isFunction(initFn)) {
                    initFn.apply(that.getField(that, 'plugins.' + pluginName), [that]);
                }
            });
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
            jsPlumb.deleteEveryConnection();
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
            this.$grids = $canvas;
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
            _ctx._drawWidth = w;
            _ctx._drawHeight = h;
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
         * 重新调整画图板大小
         */
        resize: function () {
            if (this.$grids && this.$grids.length > 0) {
                var gridsEl = this.$grids.get(0);
                var ctx = gridsEl.getContext('2d');
                var width = this.$designer.width();
                var height = document.documentElement.clientHeight;
                this.$grids.attr({
                    width: width,
                    height: height
                })
                ctx.clearRect(0, 0, ctx._drawWidth, ctx._drawHeight);
                this.drawGrid(ctx, width, height);
            }
        },
        /**
         * 初始化事件
         */
        _initEvent: function () {
            if (hasInit) {
                return;
            }
            var that = this;

            this._initToolbarEvent();

            this._initDesignerEvent();
            // 监听窗口的大小变化，及时跳转画布、网格的大小
            $(window).resize(function () {
                // TODO 算法还不够精确，待重构
                that.resize();
            });
            return this;
        },
        /**
         * 初始化绘图板事件
         */
        _initDesignerEvent: function () {
            if (!this.$designer) {
                return this;
            }
            var that = this;
            // 禁止画图板的默认右键
            this.$designer
                .on("contextmenu", function () {
                    return false;
                });
            // 监听画板点击事件，如果存在已选中待添加的控件，往画板中新增该类型控件
            this.$designer
                .on('click', function (e) {
                    // 如果有右键菜单显示的话，将其销毁
                    if (that.$$contextMenu._show) {
                        that.$$contextMenu.destroy();
                    }
                    if (!that._crrentSelectToAddDetails) {
                        return;
                    }
                    var mousePos = that.getDesignerMousePos(e);
                    that.addNode({
                        left: mousePos.x,
                        top: mousePos.y,
                        type: that._crrentSelectToAddDetails.type
                    });
                    that._crrentSelectToAddDetails = null;
                });
            // 监听画板上对于形状控件双击点击事件
            // TODO 目前没什么用，之后如果还有用要删除
            this.$designer
                .on('dblclick', '.shape_node', function (e) {
                    var $target = $(e.currentTarget);
                    var data = $target.data('property');
                    that.nodeDoubleClickAction(e, data);
                });
            // 监听画布节点的右键事件
            this.$designer
                .on('contextmenu', '.shape_node', function (event) {
                    if (!that.$$contextMenu) {
                        return;
                    }
                    var config = that.initConfig;
                    var eventPosition = that.getDesignerMousePos(event);
                    var $target = $(event.target);
                    var $el = $target.hasClass('shape_node') ? $target : $target.parent();
                    var nodeMenus = that.getField(config, 'contextMenu.node', []);

                    if (nodeMenus.length > 0) {
                        that.$$contextMenu.render({
                            el: that.getField(config, 'contextMenu.el', that.$designer),
                            menus: that.getField(config, 'contextMenu.node', []),
                            position: that.getField(config, 'contextMenu.position', { left: eventPosition.x, top: eventPosition.y }),
                            data: {
                                id: $el.prop('id'),
                                element: $el.get(0),
                                desc: $el.data('desc')
                            }
                        });
                    }
                });
            //监听jsPlumb节点链接时的事件
            // TODO 目前还没有做两个节点在同一方向重复连线的问题,如果有重复连线应该不响应绘制
            jsPlumb.bind('connection', function (info, originalEvent) {
                var desc = {
                    from: info.sourceId + '_' + info.sourceEndpoint.anchor.type,
                    to: info.targetId + '_' + info.targetEndpoint.anchor.type,
                    shapeConfig: that.getField(that, 'shapes.line'),
                    type: 'line'
                };
                info.connection.desc = desc;
            });
            // 监听jsPlumb节点链接线jsPlumb的右键事件
            jsPlumb.bind('contextmenu', function (component, event) {
                if (!that.$$contextMenu) {
                    return;
                }
                var config = that.initConfig;
                var lineMenus = that.getField(config, 'contextMenu.line', []);
                // 当右键事件发生在连接线上时
                if (component instanceof jsPlumb.Connection && lineMenus.length > 0) {
                    var pointsStart = component.endpoints[0];
                    var pointsEnd = component.endpoints[1];
                    var sourceId = pointsStart.anchor.elementId + '_' + pointsStart.anchor.type;
                    var targetId = pointsEnd.anchor.elementId + '_' + pointsEnd.anchor.type;
                    var eventPosition = that.getDesignerMousePos(event);
                    that.$$contextMenu.render({
                        el: that.getField(config, 'contextMenu.el', that.$designer),
                        menus: lineMenus,
                        position: that.getField(config, 'contextMenu.position', { left: eventPosition.x, top: eventPosition.y }),
                        data: {
                            from: sourceId,
                            to: targetId,
                            desc: component.desc,
                            component: component
                        }
                    });
                }
            });
            return this;
        },
        /**
         * 初始化工具栏事件
         */
        _initToolbarEvent: function () {
            if (!this.$toolbar) {
                return this;
            }
            var that = this;
            // 监听工具栏的动作控件，例如带有data-actio属性的新增、删除、保存等按钮
            this.$toolbar.each(function (index, el) {
                $(el).off('click', '[data-action]')
                    .on('click', '[data-action]', function (e) {
                        var $target = $(e.target);
                        var action = $target.attr('data-action');
                        var type = $target.attr('data-type') || 'common';
                        if (action == 'add') {
                            that._crrentSelectToAddDetails = {
                                type: type,
                                action: action
                            };
                        }

                        var fn = that.getField(that.initConfig, 'toolbar.actions.' + action, function () { });
                        fn.apply(null, [e, that]);
                    });
            });
            return this;
        },
        /**
         * 画图板上节点双击时的事件动作
         * // TODO
         * @param {jQuery.Event} event 事件对象
         * @param {any} data 事件需要传播的数据
         */
        nodeDoubleClickAction: function (event, data) {
            if (this.initConfig && this.initConfig.shapeNodeDoubleClickAction) {
                this.initConfig.shapeNodeDoubleClickAction(event, data, this);
            }
            this.trigger('node-double-click', event, data, this);
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
         * 根据事件对象，获取事件对象发生的画图板位置坐标系
         * @param {Event} event 
         * @returns {x: number, y: number}
         */
        getDesignerMousePos: function (event) {
            var mousePos = this.getMousePos(event);
            var offset = this.getDesignerOffset();
            return { x: mousePos.x - offset.left, y: mousePos.y - offset.top };
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
            desc.shapeConfig = this.getField(desc, 'shapeConfig', shape);
            $node.data('desc', desc);
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
            ['Top', 'Bottom', 'Left', 'Right'].forEach(function (direction) {
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
         * 删除节点元素
         * @param {string} id 节点元素的ID
         */
        deleteNode: function (id) {
            jsPlumb.remove(id);
            return this;
        },
        /**
         * 根据数据描述对象添加链接线
         * @param {{from: string, to: string}} desc 数据描述对象 
         */
        addLine: function (desc) {
            var shapeConfig = this.getField(this, 'shapes.line');
            desc.shapeConfig = this.getField(desc, 'shapeConfig', shapeConfig);
            var connect = jsPlumb.connect({
                uuids: [desc.from, desc.to],
                desc: desc
            });
            // 将描述数据挂载到链接组件对象上，以便于其他地方从链接组件对象上获取渲染时的数据
            connect.desc = desc;
            return this;
        },
        /**
         * 根据数据描述对象删除链接线
         * @param {{from: string, to: string}} desc 数据描述对象 
         */
        deleteLine: function (desc) {
            var sourceId = desc.from.replace(/[_a-zA-Z]+$/gi, '');
            var targetId = desc.to.replace(/[_a-zA-Z]+$/gi, '');
            var connector = (jsPlumb.getConnections({ source: sourceId, target: targetId }) || []).filter(function (connection) {
                var endpoints = connection.endpoints;
                var fromAnchor = endpoints[0]['anchor'];
                var toAnchor = endpoints[1]['anchor'];
                var fromAnchorId = fromAnchor.elementId + '_' + fromAnchor.type;
                var toAnchorId = toAnchor.elementId + '_' + toAnchor.type;
                return desc.from == fromAnchorId && desc.to == toAnchorId;
            });
            if (connector.length > 0) {
                jsPlumb.deleteConnection(connector[0]);
            }
            return this;
        },
        /**
         * 获取所有节点的数据
         * @returns {Array<{left: number, top: number, width: number, height:number, type: string, name: string}>}
         */
        getAllNodesData: function () {
            var that = this;
            return [].slice.call(this.$designer.find('.shape_node').map((index, item) => {
                var $item = $(item);
                var position = $item.position();
                var width = $item.width();
                var height = $item.height();
                var id = $item.attr('id');
                var type = $item.attr('data-type');
                var name = $item.find('[data-role="content"]').text() || '';
                var desc = $item.data('desc');
                return {
                    left: position.left,
                    top: position.top,
                    width: width,
                    height: height,
                    id: id,
                    type: type,
                    name: name,
                    properties: that.getField(desc, 'properties', [])
                }
            }));
        },
        /**
         * 获取所有链接线的数据
         * @returns {Array<{from: string, to: string, shapeConfig: {properties: Array<any>}, type: string}>}
         */
        getAllLinesData: function () {
            return (jsPlumb.getAllConnections() || []).map(function (connection) {
                return connection.desc;
            });
        },
        /**
         * 获取当前状态的数据
         * @returns {lines: Array, nodes: Array}
         */
        getAllData: function () {
            return { nodes: this.getAllNodesData(), lines: this.getAllLinesData() };
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
                    try {
                        var result = field.split('.').reduce(function (prev, currKey) {
                            return prev[currKey];
                        }, obj);
                        return result != null ? result : defaultValue;
                    } catch (e) {
                        return defaultValue;
                    }
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
    window.Wudaozi = Wudaozi;
});