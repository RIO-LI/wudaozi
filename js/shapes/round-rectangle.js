fabric.RoundRectangle = fabric.util.createClass(fabric.Line, fabric.Observable, {
    initialize: function (e, t) {
        this.callSuper("initialize", e, t)
        this.set({ type: 'roundRectangle' });
    },
    _render: function (e) {
        e.beginPath();
        var r = this.calcLinePoints();
        var fromX = r.x1;
        var fromY = r.y1;
        var toX = r.x2;
        var toY = r.y2;
        var headlen = 18;
        var theta = this.theta != null ? this.theta : 30;
        // 计算各角度和对应的P2,P3坐标
        var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI;
        var angle1 = (angle + theta) * Math.PI / 180;
        var angle2 = (angle - theta) * Math.PI / 180;
        var topX = headlen * Math.cos(angle1);
        var topY = headlen * Math.sin(angle1);
        var botX = headlen * Math.cos(angle2);
        var botY = headlen * Math.sin(angle2);

        var arrowX = fromX - topX;
        var arrowY = fromY - topY;

        var s = e.strokeStyle;

        e.beginPath();
        e.moveTo(arrowX, arrowY);
        e.moveTo(fromX, fromY);
        e.lineTo(toX, toY);
        arrowX = toX + topX;
        arrowY = toY + topY;
        e.moveTo(arrowX, arrowY);
        e.lineTo(toX, toY);
        arrowX = toX + botX;
        arrowY = toY + botY;
        e.lineTo(arrowX, arrowY);

        e.lineWidth = this.strokeWidth;

        e.strokeStyle = this.stroke || e.fillStyle, this.stroke && this._renderStroke(e), e.strokeStyle = s

    },
    complexity: function () {
        return 2
    }
});

fabric.Arrow.fromObject = function (e) {
    var n = [e.x1, e.y1, e.x2, e.y2];
    return new fabric.Arrow(n, e)
}