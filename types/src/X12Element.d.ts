import { Range } from "./Positioning.js";
export declare class X12Element {
    /**
     * @description Create an element.
     * @param {string} value - A value for this element.
     */
    constructor(value?: string);
    range: Range;
    value: string;
}
