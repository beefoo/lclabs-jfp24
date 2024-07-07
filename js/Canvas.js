import CanvasPointer from './CanvasPointer.js';

export default class Canvas {
    constructor(options = {}) {
        const defaults = {
            canvasEl: 'canvas',
            debug: false,
            pointerTarget: 'main-ui',
        };
        this.options = Object.assign(defaults, options);
        this.init();
    }

    init() {
        this.pointer = false;
        this.pointerTarget = document.getElementById(this.options.pointerTarget);
        this.canvas = document.getElementById(this.options.canvasEl);
        this.loadListeners();
    }

    loadListeners() {
        // listen to pointer events to account for mouse and touch
        const el = this.pointerTarget;
        el.onpointerdown = (event) => this.onPointerDown(event);
        el.onpointermove = (event) => this.onPointerMove(event);
        el.onpointerup = (event) => this.onPointerUp(event);
    }

    onPointerDown(event) {
        // only listen for primary pointer (i.e. not multitouch)
        if (!event.isPrimary) return;

        let foundValidPointer = false;

        // check to see if we should select an existing segment instance
        const segmentInstance = event.target.closest('.canvas-segment');
        if (segmentInstance) {
            foundValidPointer = true;
            this.onSegmentTouchStart(event, segmentInstance);
        }

        // check to see if we should create a new instances of segments from a photo
        if (!foundValidPointer) {
            const photo = event.target.closest('.photo');
            if (photo) {
                if (this.options.debug) console.log('Photo detected');
                foundValidPointer = true;
                this.onPhotoTouchStart(event, photo);
            }
        }

        if (foundValidPointer) {
            // keep track of this pointer until pointerup, even if it goes outside of container
            this.pointerTarget.setPointerCapture(event.pointerId);
        }
    }

    onPointerMove(event) {
        // only listen for primary pointer (i.e. not multitouch)
        if (!event.isPrimary) return;
        if (!this.pointer) return;

        const { clientX, clientY } = event;
        this.pointer.onMove({ x: clientX, y: clientY });
    }

    onPointerUp(event) {
        // only listen for primary pointer (i.e. not multitouch)
        if (!event.isPrimary) return;
        this.pointer = false;
    }

    onPhotoTouchStart(event, target) {
        const { canvas } = this;
        const c = canvas.getBoundingClientRect();
        const { clientX, clientY } = event;
        const segments = target.querySelectorAll('.photo-segment');
        const segInstances = [];
        segments.forEach((segment) => {
            const {
                x, y, width, height,
            } = segment.getBoundingClientRect();
            const imageURL = segment.getAttribute('data-image');
            const el = document.createElement('div');
            el.classList.add('canvas-segment');
            el.style.width = `${width}px`;
            el.style.height = `${height}px`;
            el.style.left = `${x - c.x}px`;
            el.style.top = `${y - c.y}px`;
            el.style.backgroundImage = `url(${imageURL})`;
            canvas.appendChild(el);
            segInstances.push({
                el,
                startX: x - c.x,
                startY: y - c.y,
            });
        });
        this.pointer = new CanvasPointer({
            id: event.pointerId,
            startX: clientX,
            startY: clientY,
            elements: segInstances,
        });
    }

    onSegmentTouchStart(event, target) {

    }
}
