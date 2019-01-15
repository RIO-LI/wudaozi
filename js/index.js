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
            Toolkit.init({
                designer: '#designer_viewport',
                data: data.root,
                nodeDoubleClickAction: function (...args) {
                    console.log(args);
                }
            });
        });
    };
    main();
});