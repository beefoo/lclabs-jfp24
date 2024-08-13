import Canvas from './Canvas.js';
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
        const toolsOptions = { onTriggerAction: (action) => this.onTriggerAction(action) };
        this.canvasTools = new CanvasTools(Object.assign(options, toolsOptions));
        this.photoBrowser = new PhotoBrowser(options);
        this.initialized = true;
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
            this.canvas.deleteActiveSegment();
            this.onItemSelect(false);
        }
    }
}
