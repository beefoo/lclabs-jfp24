export default class PhotoBrowser {
    constructor(options = {}) {
        const defaults = {
            debug: false,
            dataPath: 'dummy-data/',
            displayCount: 10,
            listElement: 'photos',
        };
        this.options = Object.assign(defaults, options);
        this.init();
    }

    async init() {
        this.photos = await this.loadData();
        this.listElement = document.getElementById(this.options.listElement);
        this.shufflePhotos();
        this.loadListeners();
    }

    async loadData() {
        const manifestFile = `${this.options.dataPath}manifest.json`;
        const response = await fetch(manifestFile);
        const data = await response.json();
        const parsedData = PhotoBrowser.parseData(data);
        return parsedData;
    }

    loadListeners() {
        document.getElementById('photo-shuffle').onclick = (e) => {
            this.shufflePhotos();
        };
    }

    static parseData(rawData) {
        return rawData.items.map((rawItem) => {
            const item = rawItem;
            if (!('title' in item)) item.title = 'Untitled';
            item.is_valid = 'thumbnail' in item && 'original_format' in item && 'segments' in item && item.segments.length > 0;
            // parse segments
            if (item.is_valid) {
                // retrieve the labels as a list for convenience
                item.labels = item.segments.map((segment) => segment.label);
                const [width, height] = item.original_format;
                // convert segments to percentages
                item.segments = item.segments.map((segment) => {
                    const s = segment;
                    const [x1, y1, x2, y2] = s.bounding_box;
                    const w = x2 - x1;
                    const h = y2 - y1;
                    s.bounding_box = [
                        (x1 / width) * 100,
                        (y1 / height) * 100,
                        (w / width) * 100,
                        (h / height) * 100,
                    ];
                    return s;
                });
            }
            return item;
        });
    }

    render(photos) {
        let html = '';
        const { dataPath, displayCount } = this.options;
        photos.slice(0, displayCount).forEach((photo) => {
            if (!photo.is_valid) return;
            html += '<li><button class="photo">';
            html += `  <img src="${dataPath}${photo.thumbnail}" class="photo-thumbnail" alt="${photo.title}" title="${photo.title}" />`;
            html += '  <div class="photo-segments">';
            photo.segments.forEach((segment) => {
                const [left, top, width, height] = segment.bounding_box;
                html += `<div class="photo-segment" style="width: ${width}%; height: ${height}%; top: ${top}%; left: ${left}%; background-image: url(${dataPath}${segment.cutout})"></div>`;
            });
            html += '  </div>';
            html += '</button></li>';
        });
        this.listElement.innerHTML = html;
    }

    shufflePhotos() {
        const photos = this.photos.slice(0);
        for (let i = photos.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [photos[i], photos[j]] = [photos[j], photos[i]];
        }
        this.render(photos);
    }
}
