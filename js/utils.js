export const Utils = {
    drawGrid: (ctx, w, h, strokeStyle = '#eee', step = 10) => {
        let _ctx = null;
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
}