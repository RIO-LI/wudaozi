; $(function () {
    var W = window.Wudaozi;
    if (!W) {
        throw new Error('没有引入Wudaozi依赖');
    }
    var modalTpl = '\
        <div class="modal fade">\
        <div class="modal-dialog">\
            <div class="modal-content">\
                <div class="modal-header">\
                    <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span></button>\
                    <h4 class="modal-title"></h4>\
                </div>\
                <div class="modal-body">\
                </div>\
                <div class="modal-footer">\
                    <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>\
                    <button type="button" class="btn btn-primary" data-action="save">保存</button>\
                </div>\
            </div>\
        </div>\
        </div>\
    ';

    var tabContainerTpl = '\
        <div>\
            <ul class="nav nav-tabs" role="tablist">\
            </ul>\
            <div class="tab-content" style="padding-top: 15px;">\
            </div>\
        </div>\
    ';

    var tabItemTpl = '\
        <li role="presentation"><a href="" aria-controls="" role="tab" data-toggle="tab"></a></li>\
    ';

    var tabContentItemTpl = '\
        <div role="tabpanel" class="tab-pane" id="">\
            <form class="form-horizontal">\
            </form>\
        </div>\
    ';

    var controlWrapperTpl = '\
        <div class="form-group">\
            <label class="col-sm-2 control-label"></label>\
            <div class="col-sm-10 control-input">\
            </div>\
        </div>\
    ';

    function bindAction(ctx, actionName) {
        var config = W.getField(W, 'initConfig.configProperty', {});
        if ($.isFunction(config.action[actionName])) {
            var eventName = actionName + '.bs.modal';
            ctx.$modal
                .off(eventName)
                .on(eventName, function (event) {
                    config.action[actionName].apply(null, [event, ctx.W]);
                });
        }
    }

    function createTab(data) {
        var schema = data.desc.shapeConfig.properties;
        var properties = data.desc.properties || [];
        var $tabContainer = $(tabContainerTpl);
        var tabItems = [];
        var tabContentItems = [];
        schema.forEach(function (group, index) {
            var tabId = W.getField(group, 'groupId');
            var tabLabel = W.getField(group, 'label', '字段' + index + 1);
            var tabData = W.getField(properties.filter(function (groupData) {
                return groupData.groupId == tabId;
            })[0], 'controls', {});
            var $ti = $(tabItemTpl);
            $ti.toggleClass('active', index === 0);
            $ti.find('[role="tab"]').attr({
                href: '#' + tabId,
                'aria-controls': tabId
            }).text(tabLabel);
            var $tci = $(tabContentItemTpl).attr({
                id: tabId
            }).toggleClass('active', index == 0);
            $tci.find('form').attr('id', tabId + '-form');
            var controls = [];
            (group.controls || []).forEach(function (control) {
                var id = W.getField(control, 'id', '');
                var label = W.getField(control, 'label', '');
                var $wrapper = $(controlWrapperTpl);
                var $input = $('<input type="text" class="form-control">');
                $input.attr({
                    id: id,
                    name: id
                }).val(W.getField(tabData, id + '.value', ''));
                $wrapper.find('.control-input').append($input);
                $wrapper.find('.control-label').text(label);
                controls.push($wrapper);
            });
            tabItems.push($ti);
            $tci.find('.form-horizontal').append(controls);
            tabContentItems.push($tci);
        });
        $tabContainer.find('.nav-tabs').append(tabItems);
        $tabContainer.find('.tab-content').append(tabContentItems);
        return $tabContainer;
    }

    W.plugin('configProperty', {
        // 模态框jQuery DOM 对象
        $modal: null,
        // 模态框关联的数据
        data: null,
        /**
         * 初始化插件入口，将会在Wudaozi对象初始化完毕后调用
         * @param {Wudaozi} w 
         */
        init: function (w) {
            if (this.$modal) {
                return this;
            }
            var config = w.initConfig.configProperty;
            if (!config) {
                return this;
            }
            config = $.extend(true, {
                modal: {
                    keyboard: false,
                    backdrop: 'static',
                    show: false
                },
                action: {
                    show: $.noop,
                    shown: $.noop,
                    hide: $.noop,
                    hidden: $.noop
                }
            }, w.initConfig.configProperty);
            this.$modal = $(modalTpl).appendTo('body').modal(config.modal);
            this._initEvent();
            return this;
        },
        /**
         * 初始化一些事件
         */
        _initEvent: function () {
            if (!this.$modal) {
                return this;
            }
            var that = this;
            this.$modal
                .off('click', '[data-action="save"]')
                .on('click', '[data-action="save"]', function (e) {
                    that.updateData();
                    that.hide();
                });
            return this;
        },
        /**
         * 传入数据并展示模态框
         * @param {*} data 
         */
        show: function (data) {
            this.data = data;
            this.$modal.find('.modal-body').empty().append(createTab(data));
            bindAction(this, 'show');
            bindAction(this, 'shown');
            this.$modal.modal('show');
            return this;
        },
        /**
         * 关闭模态框
         */
        hide: function () {
            this.data = null;
            bindAction(this, 'hide');
            bindAction(this, 'hidden');
            this.$modal.modal('hide');
            return this;
        },
        /**
         * 更新相关节点或线的数据
         */
        updateData: function () {
            var desc = this.$$w.getField(this.data, 'desc');
            var id = this.$$w.getField(this.data, 'id');
            var type = this.$$w.getField(desc, 'type');
            this.data.desc.properties = this.getAllTabsData();
            // 如果当前是‘线’的配置模态框
            if (type === 'line') {
                var component = this.$$w.getField(this.data, 'component');
                if (component) {
                    desc = $.extend(true, desc, this.data.desc);
                    component.desc = desc;
                }
            } else {
                var $el = $('#' + id);
                $el.data('desc', $.extend(true, {}, desc, this.data.desc));
            }
        },
        /**
         * 获取所有标签页的数据
         * @returns {Array<{id: string, controls:{[prop:string]: {value: any}}}>}
         */
        getAllTabsData: function () {
            if (!this.$modal) {
                return null;
            }
            var that = this;
            var allTabsData = [];

            this.$modal.find('form').each(function (index, form) {
                var $form = $(form);
                var formId = $form.prop('id');
                var groupId = formId.replace('-form', '');
                var groupData = {
                    groupId: groupId,
                    controls: that._getFormData('#' + formId)
                };
                allTabsData.push(groupData);
            });
            return allTabsData;
        },
        /**
         * @description 获取表单中所有数据对象
         * @function
         * @param {string|HTMLFormElement|jQuery} form 目标表单元素或选择器
         * @returns {[key:string]: {value: any}} 数据对象
         */
        _getFormData: function (form) {
            var rCRLF = /\r?\n/g;
            var rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i;
            var rsubmittable = /^(?:input|select|textarea|keygen)/i;
            var rcheckableType = (/^(?:checkbox|radio)$/i);
            return $(form)
                .map(function () {
                    // Can add propHook for "elements" to filter or add form elements
                    var elements = jQuery.prop(this, "elements");
                    return elements ? jQuery.makeArray(elements) : this;
                })
                .filter(function () {
                    var type = this.type;
                    // 不获取带有 data-no-send为true的元素的值
                    if ($(this).attr('data-no-send') == "true") {
                        return false;
                    }
                    return this.name &&
                        rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
                })
                .map(function (i, elem) {
                    var val = jQuery(this).val();
                    if (val == null) {
                        return null;
                    } else if (jQuery.isArray(val)) {
                        return jQuery.map(val, function (val) {
                            var obj = {};
                            obj[elem.name] = { value: val.replace(rCRLF, "\r\n") };
                            return obj;
                        });
                    } else {
                        var obj = {};
                        obj[elem.name] = { value: val.replace(rCRLF, "\r\n") };
                        return obj;
                    }
                })
                .get()
                .reduce(function (prev, curr) {
                    return $.extend(prev, curr);
                }, {});
        }

    });
});