export default class Helper {
    static degreesBetweenPoints(p1, p2) {
        const dy = p2.y - p1.y;
        const dx = p2.x - p1.x;
        const radians = Math.atan2(dy, dx);
        return (radians * 180.0) / Math.PI;
    }

    static distance(p1, p2) {
        const x = p2.x - p1.x;
        const y = p2.y - p1.y;
        return Math.sqrt(x * x + y * y);
    }

    static pxToPercent(px, containerPx) {
        return (px / containerPx) * 100;
    }
}
