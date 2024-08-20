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

    async init() {
        this.$canvas = document.getElementById(this.options.canvasEl);
        this.$link = document.getElementById('bg-link');
        this.$prev = document.getElementById('prev-bg');
        this.$next = document.getElementById('next-bg');
        this.images = await this.loadData();
        if (!this.loadHistory()) {
            this.bgIndex = Math.floor(Math.random() * this.images.length);
            this.save();
        }
        this.render();
        this.loadListeners();
    }

    go(incr) {
        const newIndex = this.bgIndex + incr;
        if (newIndex >= this.images.length) {
            this.bgIndex = newIndex % this.images.length;
        } else if (newIndex < 0) {
            this.bgIndex = this.images.length + newIndex;
        } else {
            this.bgIndex = newIndex;
        }
        this.save();
        this.render();
    }

    async loadData() {
        const response = await fetch(this.options.manifest);
        const data = await response.json();
        return data.items;
    }

    loadHistory() {
        const dataString = localStorage.getItem(this.options.storageKey);
        if (dataString === undefined || dataString === null) return false;
        this.bgIndex = parseInt(dataString, 10);
        return true;
    }

    loadListeners() {
        this.$prev.onclick = (e) => this.go(-1);
        this.$next.onclick = (e) => this.go(1);
    }

    render() {
        const image = this.images[this.bgIndex];
        this.$link.setAttribute('href', image.url);
        this.$link.innerText = image.title;
        this.$canvas.style.backgroundImage = `url(${this.options.imgPath}${image.id})`;
    }

    save() {
        localStorage.setItem(this.options.storageKey, this.bgIndex);
    }
}
