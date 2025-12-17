"use strict";
import { Range } from "./Positioning.js";
export class X12Element {
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
        this.range = new Range();
        this.value = value;
    }
}
