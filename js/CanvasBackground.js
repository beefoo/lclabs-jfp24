export default class CanvasBackground {
    constructor(options = {}) {
        const defaults = {
            debug: false,
            canvasEl: 'canvas',
            imgPath: 'img/backgrounds/',
            manifest: 'img/backgrounds/manifest.json',
            storageKey: 'canvas-bg',
        };
        this.options = Object.assign(defaults, options);
        this.init();
    }

    init() {
        this.$el = document.getElementById(this.options.canvasEl);
        this.$link = document.getElementById('bg-link');
        this.$prev = document.getElementById('prev-bg');
        this.$next = document.getElementById('next-bg');
        if (!this.loadHistory()) {
            this.bgIndex = 0;
        }
        this.loadListeners();
    }

    loadHistory() {
        const dataString = localStorage.getItem(this.options.storageKey);
        if (dataString === undefined) return false;
        this.bgIndex = parseInt(dataString, 10);
        return true;
    }

    loadListeners() {
        this.$prev.onclick = (e) => this.go(-1);
        this.$next.onclick = (e) => this.go(1);
    }
}
