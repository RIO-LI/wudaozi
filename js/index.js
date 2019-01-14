$(function () {
    var main = function () {
        var $shapePanel = $('#shape_panel');
        $shapePanel.css({
            height: document.documentElement.clientHeight
        });
        $.ajax({
            url: 'test/data.json?' + new Date().getTime()
        }).then(function (data) {
            console.log(data);
            Toolkit.init({
                designer: '#designer_viewport',
                data: data.root,
                shapeNodeDoubleClickAction: function (...args) {
                    console.log(args);
                }
            });
        });
    };
    main();
});