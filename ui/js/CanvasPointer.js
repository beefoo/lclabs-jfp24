import Helper from './Helper.js';

export default class CanvasPointer {
    constructor(options = {}) {
        const defaults = {
            debug: false,
            elements: [],
            startX: 0,
            startY: 0,
        };
        this.options = Object.assign(defaults, options);
        this.init();
    }

    init() {
        const {
            canvas, elements, startX, startY,
        } = this.options;
        this.start = { x: startX, y: startY };
        this.elements = elements;
        this.canvas = canvas;
        this.canvasRect = canvas.getBoundingClientRect();
    }

    onMove(xy) {
        const c = this.canvasRect;
        const { start } = this;
        const delta = { x: xy.x - start.x, y: xy.y - start.y };
        this.elements.forEach((element) => {
            const { el, startX, startY } = element;
            el.style.left = `${Helper.pxToPercent(startX + delta.x, c.width)}%`;
            el.style.top = `${Helper.pxToPercent(startY + delta.y, c.height)}%`;
        });
    }

    onMoveEnd(xy) {
        // check to see if elements are inside of canvas
        const c = this.canvasRect;
        const cx2 = c.x + c.width;
        const cy2 = c.y + c.height;
        this.elements.forEach((element, i) => {
            const { el } = element;
            const {
                x, y, width, height,
            } = el.getBoundingClientRect();
            const x1 = x - c.x;
            const y1 = y - c.y;
            const x2 = x + width;
            const y2 = y + height;
            // if not inside canvas, move it inside
            if (!(x1 >= 0 && x2 <= c.width && y1 >= 0 && y2 <= c.height)) {
                const padding = 0.1 + Math.random() * 0.2; // add a little random padding
                const mx1 = c.width * padding;
                const mx2 = c.width - c.width * padding;
                const my1 = c.height * padding;
                const my2 = c.height - c.height * padding;
                const newX = Math.min(Math.max(mx1, x1), mx2);
                const newY = Math.min(Math.max(my1, y1), my2);
                el.classList.add('animating');
                el.style.left = `${Helper.pxToPercent(newX, c.width)}%`;
                el.style.top = `${Helper.pxToPercent(newY, c.height)}%`;
                setTimeout(() => {
                    el.classList.remove('animating');
                }, 550);
            }
        });
    }
}
