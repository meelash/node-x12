"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X12Element = void 0;
const Positioning_js_1 = require("./Positioning.js");
class X12Element {
    /**
     * @description Create an element.
     * @param {string} value - A value for this element.
     */
    constructor(value = "") {
        Object.defineProperty(this, "range", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.range = new Positioning_js_1.Range();
        this.value = value;
    }
}
exports.X12Element = X12Element;
