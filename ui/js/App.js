import Canvas from './Canvas.js';
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
        const canvas = new Canvas(this.options);
        const photo_browser = new PhotoBrowser(this.options);
        this.initialized = true;
    }
}
