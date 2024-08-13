import CanvasHistory from './CanvasHistory.js';
import CanvasPointer from './CanvasPointer.js';
import Helper from './Helper.js';

export default class Canvas {
    constructor(options = {}) {
        const defaults = {
            canvasEl: 'canvas',
            debug: false,
            onItemSelect: (resourceId) => console.log('Override this'),
            pointerTarget: 'main-ui',
        };
        this.options = Object.assign(defaults, options);
        this.init();
    }

    init() {
        this.pointer = false;
        this.pointerTarget = document.getElementById(this.options.pointerTarget);
        this.canvas = document.getElementById(this.options.canvasEl);
        this.history = new CanvasHistory(this.options);
        this.loadListeners();
    }

    deleteActiveSegment() {
        const $segment = this.canvas.querySelector('.canvas-segment.selected');
        if (!$segment) return;
        $segment.remove();
        this.history.pushState();
    }

    loadListeners() {
        // listen to pointer events to account for mouse and touch
        const el = this.pointerTarget;
        el.onpointerdown = (event) => this.onPointerDown(event);
        el.onpointermove = (event) => this.onPointerMove(event);
        el.onpointerup = (event) => this.onPointerUp(event);
        el.onpointercancel = (event) => this.onPointerUp(event);
    }

    onPointerDown(event) {
        // only listen for primary pointer (i.e. not multitouch)
        if (!event.isPrimary) return;

        let foundValidPointer = false;

        // check to see if we are clicking a tool; don't do anything
        const tool = event.target.closest('.tool');
        if (tool) return;

        // check to see if we are scaling/rotating an existing segment instance
        const handle = event.target.closest('.canvas-segment-handle');
        if (handle) {
            if (this.options.debug) console.log('Segment handle detected');
            foundValidPointer = true;
            this.onSegmentManipulateStart(event, handle);
        }

        // check to see if we should select an existing segment instance
        if (!foundValidPointer) {
            const segmentInstance = event.target.closest('.canvas-segment');
            if (segmentInstance) {
                if (this.options.debug) console.log('Canvas segment detected');
                foundValidPointer = true;
                this.onSegmentTouchStart(event, segmentInstance);
            }
        }

        // check to see if we should create a new instances of segments from a photo
        if (!foundValidPointer) {
            this.selectSegment(false); // deselect all segments
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
        this.pointer.onPointerMove({ x: clientX, y: clientY });
    }

    onPointerUp(event) {
        // only listen for primary pointer (i.e. not multitouch)
        if (!event.isPrimary) return;
        if (!this.pointer) return;

        const { clientX, clientY } = event;
        this.pointer.onPointerUp({ x: clientX, y: clientY });
        if (this.pointer.changed) this.history.pushState();
        this.pointer = false;
    }

    onPhotoTouchStart(event, target) {
        const { canvas } = this;
        const c = canvas.getBoundingClientRect();
        const { clientX, clientY } = event;
        const itemId = target.getAttribute('data-item');
        const segments = target.querySelectorAll('.photo-segment');
        const segInstances = [];
        segments.forEach((segment, i) => {
            const {
                x, y, width, height,
            } = segment.getBoundingClientRect();
            const imageURL = segment.getAttribute('data-image');
            const el = document.createElement('div');
            el.classList.add('canvas-segment');
            if (i === 0) el.classList.add('selected');
            const elWidth = Helper.pxToPercent(width, c.width);
            const elHeight = Helper.pxToPercent(height, c.height);
            const elLeft = Helper.pxToPercent(x - c.x, c.width);
            const elTop = Helper.pxToPercent(y - c.y, c.height);
            el.style.width = `${elWidth}%`;
            el.style.height = `${elHeight}%`;
            el.style.left = `${elLeft}%`;
            el.style.top = `${elTop}%`;
            el.style.backgroundImage = `url(${imageURL})`;
            el.innerHTML = `<div class="canvas-segment-bar"><div class="canvas-segment-handle" data-item="${itemId}"></div></div>`;
            el.setAttribute('data-item', itemId);
            // store position, size, and rotation data directly in the element
            el.setAttribute('data-x', elLeft);
            el.setAttribute('data-y', elTop);
            el.setAttribute('data-width', elWidth);
            el.setAttribute('data-height', elHeight);
            el.setAttribute('data-rotation', '0.0');
            canvas.appendChild(el);
            segInstances.push({
                el,
                startX: x - c.x,
                startY: y - c.y,
                width,
                height,
            });
        });
        this.pointer = new CanvasPointer({
            id: event.pointerId,
            canvas,
            startX: clientX,
            startY: clientY,
            elements: segInstances,
        });
        this.pointer.changed = true;
        this.options.onItemSelect(itemId);
    }

    onSegmentManipulateStart(event, target) {
        const segment = target.closest('.canvas-segment');
        const { canvas } = this;
        const { clientX, clientY } = event;
        const c = canvas.getBoundingClientRect();
        const x = parseFloat(segment.getAttribute('data-x'));
        const y = parseFloat(segment.getAttribute('data-y'));
        const width = parseFloat(segment.getAttribute('data-width'));
        const height = parseFloat(segment.getAttribute('data-height'));
        const itemId = segment.getAttribute('data-item');
        const element = {
            el: segment,
            rotationStart: parseFloat(segment.getAttribute('data-rotation')),
            startX: x,
            startY: y,
            startWidth: width,
            startHeight: height,
        };
        this.pointer = new CanvasPointer({
            id: event.pointerId,
            canvas,
            mode: 'manipulate',
            startX: clientX,
            startY: clientY,
            elements: [element],
        });
        this.options.onItemSelect(itemId);
    }

    onSegmentTouchStart(event, target) {
        const { canvas } = this;
        const { clientX, clientY } = event;
        const c = canvas.getBoundingClientRect();
        const x = parseFloat(target.getAttribute('data-x'));
        const y = parseFloat(target.getAttribute('data-y'));
        const width = parseFloat(target.getAttribute('data-width'));
        const height = parseFloat(target.getAttribute('data-height'));
        const itemId = target.getAttribute('data-item');
        const element = {
            el: target,
            startX: (x / 100.0) * c.width,
            startY: (y / 100.0) * c.height,
            width: (width / 100.0) * c.width,
            height: (height / 100.0) * c.height,
        };
        this.pointer = new CanvasPointer({
            id: event.pointerId,
            canvas,
            startX: clientX,
            startY: clientY,
            elements: [element],
        });
        this.selectSegment(target);
        this.options.onItemSelect(itemId);
    }

    selectSegment(target = false) {
        // select this segment and de-select others
        const segments = document.querySelectorAll('.canvas-segment');
        segments.forEach((segment) => {
            if (segment === target && !segment.classList.contains('selected')) {
                segment.classList.add('selected');
            } else if (segment !== target && segment.classList.contains('selected')) {
                segment.classList.remove('selected');
            }
        });
        if (!target) this.options.onItemSelect(false);
    }
}
