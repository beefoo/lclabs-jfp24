export default class PhotoBrowser {
    constructor(options = {}) {
        const defaults = {
            debug: false,
            dataPath: 'data/manifest.json',
            listElement: 'photos',
        };
        this.options = Object.assign(defaults, options);
        this.init();
    }

    async init() {
        const photos = await this.loadData();
        this.listElement = document.getElementById(this.options.listElement);
        this.render(photos);
    }

    async loadData() {
        const response = await fetch(this.options.dataPath);
        const data = await response.json();
        return data.items;
    }

    render(photos) {
        let html = '';
        photos.forEach((photo) => {
            html += `<li><button class="photo"><img src="${photo.thumbnail}" class="photo-thumbnail" alt="${photo.title}" title="${photo.title}" /></button></li>`;
        });
        this.listElement.innerHTML = html;
    }
}
