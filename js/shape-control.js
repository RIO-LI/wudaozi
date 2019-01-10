export class ShapeControl {
    constructor(config) {
        this.config = $.extend(true, {
            selector: 'body',
            css: {
                width: 90,
                height: 90,
                border: '1px solid rgb(136, 51, 51)',
                position: 'absolute',
                left: 0,
                top: 0
            }
        }, config);
        this.$el = null;
        if (!ShapeControl.instance) {
            this.$el = this.init(this.config);
        }
        this.$el.appendTo($(this.config.selector));
        new Draggable(this.$el.get(0), {
            onDragStart: function (element, x, y, event) {
                //  console.log(element, x, y, event);
            },
            onDrag: (element, x, y, event) => {
                //  console.log(element, x, y, event);
            },
            onDragEnd: (element, x, y, event) => {
                console.log(element, x, y, event);
            },
            filterTarget: (target) => {
                const classList = target.classList;
                if (classList.contains('shape_anchor') || classList.contains('shape_controller')) {
                    return false
                }
                return true;
            }
        });
    }

    init(config) {
        const html = `
        <div id="shape_controls">
            <canvas id="controls_bounding"></canvas>
            <div class="shape_controller n w" index="0" resizedir="tl" style="border-color: rgb(136, 51, 51); width: 6px; height: 6px;  display: block; left: -4px; top: -4px;"></div>
            <div class="shape_controller n e" index="1" resizedir="tr" style="border-color: rgb(136, 51, 51); width: 6px; height: 6px;  display: block; right: -4px; top: -4px;"></div>
            <div class="shape_controller s e" index="2" resizedir="br" style="border-color: rgb(136, 51, 51); width: 6px; height: 6px;  display: block; left: -4px; bottom: -4px;"></div>
            <div class="shape_controller s w" index="3" resizedir="bl" style="border-color: rgb(136, 51, 51); width: 6px; height: 6px;  display: block; right: -4px; bottom: -4px;"></div>
            <div class="shape_anchor w" resizedir="l" style="border-color: rgb(136, 51, 51); width: 6px; height: 6px; border-radius: 6px;top:50%; left:-4px;margin-top:-4px;display: block;"></div>
            <div class="shape_anchor n" resizedir="t" style="border-color: rgb(136, 51, 51); width: 6px; height: 6px; border-radius: 6px;top:-4px; left:50%;margin-left:-4px;display: block;"></div>
            <div class="shape_anchor e" resizedir="r" style="border-color: rgb(136, 51, 51); width: 6px; height: 6px; border-radius: 6px;top:50%; right:-4px;margin-top:-4px;display: block;"></div>
            <div class="shape_anchor s" resizedir="b" style="border-color: rgb(136, 51, 51); width: 6px; height: 6px; border-radius: 6px;bottom:-4px; left:50%;margin-left:-4px;display: block;"></div>
            </div>
        `;
        const $el = $(html);
        $el.css(config.css);
        return $el;
    }
}