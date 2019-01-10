import { Shapes, ThumbShapes, DesignerShapes } from './shapes-types.js';
import { Utils } from './utils.js';
import { ShapeControl } from './shape-control.js';

const initSidebarShapes = () => {
    const $panel = $('#panel_basic');
    const panelItems = [];
    const types = Object.keys(Shapes);
    $panel.height(document.documentElement.clientHeight);
    types.forEach((type) => {
        const $shapeDiv = $(`<div class="panel_box" data-shapename="${type}">`);
        const $canvas = $(`<canvas class="panel_item" width="37" height="37" data-shapename="${type}">`);
        const fc = new fabric.StaticCanvas($canvas.get(0));
        fc.add(new fabric[type]({
            top: 0, left: 0, ...Shapes[type]
        }));
        $shapeDiv.append($canvas);
        panelItems.push($shapeDiv);
    });
    $panel.append(panelItems);
};

const initShapeThumbPreViewEvent = () => {
    $(document).on('mouseover', '.panel_box', (e) => {
        const $el = $(e.target);
        const $thumb = $('#shape_thumb');
        const $canvas = $thumb.find('canvas');
        const type = $el.attr('data-shapename');
        $thumb.find('.js-text').text(type);
        $thumb.attr('data-current', type);
        const fc = new fabric.StaticCanvas($canvas.get(0));
        fc.clear();
        fc.add(new fabric[type]({
            ...ThumbShapes[type]
        }));
        $thumb.show();
    });
    $(document).on('mouseleave', '.panel_box', (e) => {
        const $thumb = $('#shape_thumb');
        $thumb.hide();
    });
};



const initDrapShapeToDesignerViewport = () => {
    $(document).on('mousedown', '.panel_box', (e) => {
        const $canvasContainer = $('#canvas_container');
        const $el = $(e.target);
        const type = $el.attr('data-shapename');
        const $designer = $('#designer_viewport');
        const desigerLeft = $designer.offset().left;
        const $container = $('#creating_shape_container');
        const $canvas = $('#creating_shape_canvas');
        const fc = new fabric.StaticCanvas($canvas.get(0));
        let hasSacle = false;
        fc.clear();
        fc.add(new fabric[type]({
            ...Shapes[type]
        }));
        const move = (e) => {
            const left = e.clientX + 20;
            const top = e.clientY;
            if (left > desigerLeft - 2 & !hasSacle) {
                hasSacle = true;
                const config = Object.assign({}, DesignerShapes[type]);
                config.width = config.width || 0;
                config.height = config.height || 0;
                config.radius = config.radius || 0;
                fc.clear();
                fc.add(new fabric[type]({
                    ...config
                }));
            }
            $container.css({
                top,
                left
            }).show();
        };
        const stopMove = (e) => {
            $(document).off('mousemove', move);
            hasSacle = false;
            $(document).off('mouseup', stopMove);
            console.log(e.clientX, e.clientY);
            $container.hide();
            const config = Object.assign({}, DesignerShapes[type]);
            config.width = config.width || 50;
            config.height = config.height || 50;
            config.radius = config.radius || 0;
            const $div = $('<div>');
            const $canvas = $(`<canvas width="90" height="90">`);
            $div.css({
                position: 'absolute',
                left: e.clientX - 149,
                top: e.clientY,
                border: '1px solid yellow',
                width: 90,
                height: 90
            });
            $div.append($canvas).appendTo($designer);
            const fc = new fabric.StaticCanvas($canvas.get(0));
            fc.clear();
            fc.add(new fabric[type]({
                ...config
            }));
        };
        $(document).on('mouseup', stopMove);
        $(document).on('mousemove', move);
    });
}

const initEvents = () => {
    initShapeThumbPreViewEvent();
    initDrapShapeToDesignerViewport();
}

const initDesignerViewport = () => {
    const $designer = $('#designer_viewport');
    const $drawContainer = $('#canvas_container');
    const width = $designer.width();
    const height = document.documentElement.clientHeight;
    $drawContainer.append(`<canvas id="designer_grids" width="${width}" height="${height}">`);
    Utils.drawGrid(document.querySelector('#designer_grids'), width, height);
}

const main = () => {
    initSidebarShapes();
    initDesignerViewport();
    initEvents();

    new ShapeControl({
        selector: '#designer_layout'
    });
}

main();