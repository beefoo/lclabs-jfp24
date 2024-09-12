import Canvas from './Canvas.js';
import CanvasBackground from './CanvasBackground.js';
import CanvasTools from './CanvasTools.js';
import PhotoBrowser from './PhotoBrowser.js';

export default class App {
    constructor(options = {}) {
        const defaults = {
            debug: false,
        };
        this.options = Object.assign(defaults, options);
        this.init();
    }

    init() {
        const { options } = this;

        this.itemDetails = document.getElementById('item-details');
        this.itemLink = document.getElementById('item-link');

        const canvasOptions = { onItemSelect: (resourceId) => this.onItemSelect(resourceId) };
        this.canvas = new Canvas(Object.assign(options, canvasOptions));
        this.canvasBackground = new CanvasBackground(options);
        const toolsOptions = { onTriggerAction: (action) => this.onTriggerAction(action) };
        this.canvasTools = new CanvasTools(Object.assign(options, toolsOptions));
        this.photoBrowser = new PhotoBrowser(options);
        this.loadListeners();
    }

    loadListeners() {
        const startButton = document.getElementById('start');
        startButton.onclick = (e) => {
            Canvas.start();
        };
        // keyboard events
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey) return;
            const keyName = event.key;
            const moveAmount = 1; // in %
            if (keyName === 'ArrowLeft') {
                // move left
                const moved = this.canvas.moveActive(-moveAmount, 0);
                if (moved) event.preventDefault();
            } else if (keyName === 'ArrowRight') {
                // move right
                const moved = this.canvas.moveActive(moveAmount, 0);
                if (moved) event.preventDefault();
            } else if (keyName === 'ArrowUp') {
                // move up
                const moved = this.canvas.moveActive(0, -moveAmount);
                if (moved) event.preventDefault();
            } else if (keyName === 'ArrowDown') {
                // move down
                const moved = this.canvas.moveActive(0, moveAmount);
                if (moved) event.preventDefault();
            } else if (keyName === '=') {
                // scale up
                this.canvas.scaleActive(0.1);
            } else if (keyName === '-') {
                // scale down
                this.canvas.scaleActive(-0.1);
            } else if (keyName === '[') {
                // rotate left
                this.canvas.rotateActive(-5);
            } else if (keyName === ']') {
                // rotate right
                this.canvas.rotateActive(5);
            } else if (keyName === 'Escape') {
                // deselect all
                this.canvas.selectSegment(false);
            }
        }, false);
    }

    onItemSelect(resourceId) {
        this.canvasTools.activateSegmentTools(resourceId !== false);
        if (!resourceId) {
            this.itemDetails.classList.remove('active');
            return;
        }
        const photo = this.photoBrowser.getItemById(resourceId);
        if (!photo) return;

        this.itemLink.setAttribute('href', photo.item_url);
        this.itemLink.innerText = photo.title;
        this.itemDetails.classList.add('active');
    }

    onTriggerAction(action) {
        if (action === 'delete') {
            this.canvas.deleteActive();
            this.onItemSelect(false);
        } else if (action === 'backward') {
            this.canvas.sendBackwardActive();
        } else if (action === 'front') {
            this.canvas.sendFrontActive();
        } else if (action === 'save') {
            this.canvas.save();
        }
    }
}
