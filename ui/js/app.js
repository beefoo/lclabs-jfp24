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
        const photo_browser = new PhotoBrowser();
    }
}
