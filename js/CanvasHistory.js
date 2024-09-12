export default class CanvasHistory {
    constructor(options = {}) {
        const defaults = {
            debug: false,
            canvasEl: 'canvas',
            maxItems: 5,
            storageKey: 'canvas-history',
        };
        this.options = Object.assign(defaults, options);
        this.init();
    }

    init() {
        this.$el = document.getElementById(this.options.canvasEl);
        this.$undoButton = document.getElementById('tool-undo');
        this.$redoButton = document.getElementById('tool-redo');
        this.$resetButton = document.getElementById('tool-reset');
        if (!this.loadHistory()) {
            this.history = [];
            this.reset();
        }
        this.loadListeners();
    }

    hasRedo() {
        return this.index < (this.history.length - 1);
    }

    hasUndo() {
        return this.index > 0;
    }

    loadHistory() {
        const dataString = localStorage.getItem(this.options.storageKey);
        if (!dataString) return false;
        const data = JSON.parse(dataString);
        this.history = data.history;
        this.index = data.index;
        this.updateState(this.index);
        this.updateButtons();
        return true;
    }

    loadListeners() {
        this.$undoButton.onclick = (e) => this.undo();
        this.$redoButton.onclick = (e) => this.redo();
        this.$resetButton.onclick = (e) => {
            // eslint-disable-next-line no-alert
            if (window.confirm('Do you want to reset this canvas?')) {
                this.reset();
            }
        };
    }

    pushState() {
        if (this.options.debug) console.log('Pushing state');
        const html = this.$el.innerHTML;
        if (this.history.length > 0) this.history = this.history.slice(0, this.index + 1);
        this.history.push(html);
        if (this.history.length > this.options.maxItems) {
            const offset = this.history.length - this.options.maxItems;
            this.history = this.history.slice(offset);
        }
        this.index = this.history.length - 1;
        this.updateButtons();
        this.saveHistory();
    }

    redo() {
        this.index = Math.min(this.index + 1, this.history.length - 1);
        this.updateState(this.index);
        this.saveHistory();
    }

    reset() {
        this.$el.innerHTML = '';
        this.pushState();
    }

    saveHistory() {
        const data = {
            index: this.index,
            history: this.history,
        };
        localStorage.setItem(this.options.storageKey, JSON.stringify(data));
    }

    undo() {
        this.index = Math.max(0, this.index - 1);
        this.updateState(this.index);
        this.saveHistory();
    }

    updateButtons() {
        if (!this.hasRedo()) this.$redoButton.setAttribute('disabled', 'disabled');
        else this.$redoButton.removeAttribute('disabled');
        if (!this.hasUndo()) {
            this.$undoButton.setAttribute('disabled', 'disabled');
            this.$resetButton.setAttribute('disabled', 'disabled');
        } else {
            this.$undoButton.removeAttribute('disabled');
            this.$resetButton.removeAttribute('disabled');
        }
    }

    updateState(index) {
        const html = this.history[index];
        this.$el.innerHTML = html;
        const animating = this.$el.querySelectorAll('.animating');
        animating.forEach((el) => el.classList.remove('animating'));
        this.updateButtons();
    }
}
