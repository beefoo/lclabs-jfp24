export default class CanvasTools {
    constructor(options = {}) {
        const defaults = {
            debug: false,
            onTriggerAction: (action) => console.log(action),
        };
        this.options = Object.assign(defaults, options);
        this.init();
    }

    init() {
        this.$mainTools = document.querySelectorAll('#main-tools .tool');
        this.$segmentTools = document.querySelectorAll('#segment-tools .tool');
        this.loadListeners();
    }

    activateMainTools(isActive = true) {
        this.$mainTools.forEach(($tool) => {
            if (isActive) $tool.removeAttribute('disabled');
            else $tool.setAttribute('disabled', 'disabled');
        });
    }

    activateSegmentTools(isActive = true) {
        this.$segmentTools.forEach(($tool) => {
            if (isActive) $tool.removeAttribute('disabled');
            else $tool.setAttribute('disabled', 'disabled');
        });
    }

    static activateTool(id, isActive = true) {
        const $tool = document.getElementById(id);
        if (!$tool) return;
        if (isActive) $tool.removeAttribute('disabled');
        else $tool.setAttribute('disabled', 'disabled');
    }

    loadListeners() {
        const $toolMenu = document.getElementById('tool-menu');
        $toolMenu.onclick = (e) => {
            const $tool = e.target.closest('.tool');
            this.onClickTool($tool);
        };
    }

    onClickTool($tool) {
        if ($tool.hasAttribute('disabled')) return;
        this.options.onTriggerAction($tool.getAttribute('data-action'));
    }
}
