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
                    <button type="button" class="btn btn-primary">保存</button>\
                </div>\
            </div>\
        </div>\
        </div>\
    ';

    function bindAction(ctx, actionName) {
        var config = ctx.W.getField(ctx.W, 'initConfig.configProperty', {});
        if ($.isFunction(config.action[actionName])) {
            var eventName = actionName + '.bs.modal';
            ctx.$modal
                .off(eventName)
                .on(eventName, function (event) {
                    config.action[actionName].apply(null, [event, ctx.W]);
                });
        }
    }

    W.plugin('configProperty', {
        $modal: null,
        show: function (data) {
            var config = this.W.initConfig.configProperty;
            if (!config) {
                return this;
            }
            config = $.extend(true, {
                modal: {
                    keyboard: false,
                    backdrop: 'static'
                },
                action: {
                    show: $.noop,
                    shown: $.noop,
                    hide: $.noop,
                    hidden: $.noop
                }
            }, this.W.initConfig.configProperty);
            if (!this.$modal) {
                this.$modal = $(modalTpl).appendTo('body').modal(config.modal);
            }
            bindAction(this, 'show');
            bindAction(this, 'shown');
            this.$modal.modal('show');
            return this;
        },
        hide: function () {
            bindAction(this, 'hide');
            bindAction(this, 'hidden');
            this.$modal.modal('hide');
            return this;
        }
    });
});