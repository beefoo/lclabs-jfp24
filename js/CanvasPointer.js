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
        const { elements, startX, startY } = this.options;
        this.start = { x: startX, y: startY };
        this.elements = elements;
    }

    onMove(vec) {
        const { start } = this;
        const delta = { x: vec.x - start.x, y: vec.y - start.y };
        this.elements.forEach((element) => {
            const { el, startX, startY } = element;
            el.style.left = `${startX + delta.x}px`;
            el.style.top = `${startY + delta.y}px`;
        });
    }
}
