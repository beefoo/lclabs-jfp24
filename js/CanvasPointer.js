import Helper from './Helper.js';

export default class CanvasPointer {
    constructor(options = {}) {
        const defaults = {
            debug: false,
            elements: [],
            mode: 'move',
            startX: 0,
            startY: 0,
        };
        this.options = Object.assign(defaults, options);
        this.init();
    }

    init() {
        const {
            canvas, elements, mode, startX, startY,
        } = this.options;
        this.canvas = canvas;
        this.elements = elements;
        this.mode = mode;
        this.start = { x: startX, y: startY };
        this.canvasRect = canvas.getBoundingClientRect();
        this.onPointerDown();
    }

    onManipulate(xy) {
        const [segment] = this.elements;
        const { el, rotationStart } = segment;
        const rotation = Helper.degreesBetweenPoints(xy, this.segmentCenter);
        const rotationDelta = rotation - this.rotationStart;
        const newRotation = (rotationStart + rotationDelta) % 360.0;
        el.style.transform = `rotate3d(0, 0, 1, ${newRotation}deg)`;
        this.newRotation = newRotation;
    }

    onManipulateEnd(xy) {
        const [segment] = this.elements;
        const { el } = segment;
        el.setAttribute('data-rotation', this.newRotation);
    }

    onManipulateStart() {
        const [segment] = this.elements;
        const s = segment.el.getBoundingClientRect();
        this.segmentCenter = { x: s.x + s.width * 0.5, y: s.y + s.height * 0.5 };
        this.rotationStart = Helper.degreesBetweenPoints(this.start, this.segmentCenter);
    }

    onMove(xy) {
        const c = this.canvasRect;
        const { start } = this;
        const delta = { x: xy.x - start.x, y: xy.y - start.y };
        this.elements.forEach((element, i) => {
            const { el, startX, startY } = element;
            const left = Helper.pxToPercent(startX + delta.x, c.width);
            const top = Helper.pxToPercent(startY + delta.y, c.height);
            el.style.left = `${left}%`;
            el.style.top = `${top}%`;
            this.elements[i].x = left;
            this.elements[i].y = top;
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
                const left = Helper.pxToPercent(newX, c.width);
                const top = Helper.pxToPercent(newY, c.height);
                el.classList.add('animating');
                el.style.left = `${left}%`;
                el.style.top = `${top}%`;
                el.setAttribute('data-x', left);
                el.setAttribute('data-y', top);
                setTimeout(() => {
                    el.classList.remove('animating');
                }, 550);
            } else {
                el.setAttribute('data-x', element.x);
                el.setAttribute('data-y', element.y);
            }
        });
    }

    onMoveStart() {

    }

    onPointerDown() {
        if (this.mode === 'manipulate') return this.onManipulateStart();
        return this.onMoveStart();
    }

    onPointerMove(xy) {
        if (this.mode === 'manipulate') return this.onManipulate(xy);
        return this.onMove(xy);
    }

    onPointerUp(xy) {
        if (this.mode === 'manipulate') return this.onManipulateEnd(xy);
        return this.onMoveEnd(xy);
    }
}
