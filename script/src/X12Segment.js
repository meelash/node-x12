// deno-lint-ignore-file ban-types no-explicit-any
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X12Segment = void 0;
const JSEDINotation_js_1 = require("./JSEDINotation.js");
const Positioning_js_1 = require("./Positioning.js");
const X12Element_js_1 = require("./X12Element.js");
const X12SerializationOptions_js_1 = require("./X12SerializationOptions.js");
const X12SegmentHeader_js_1 = require("./X12SegmentHeader.js");
const Errors_js_1 = require("./Errors.js");
class X12Segment {
    /**
     * @description Create a segment.
     * @param {string} tag - The tag for this segment.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     */
    constructor(tag = "", options) {
        Object.defineProperty(this, "tag", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "elements", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "range", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.tag = tag;
        this.elements = new Array();
        this.range = new Positioning_js_1.Range();
        this.options = (0, X12SerializationOptions_js_1.defaultSerializationOptions)(options);
    }
    /**
     * @description Set the tag name for the segment if not provided when constructed.
     * @param {string} tag - The tag for this segment.
     */
    setTag(tag) {
        this.tag = tag;
    }
    /**
     * @description Set the elements of this segment.
     * @param {string[]} values - An array of element values.
     * @returns {X12Segment} The current instance of X12Segment.
     */
    setElements(values) {
        this._formatValues(values);
        this.elements = new Array();
        values.forEach((value) => {
            this.elements.push(new X12Element_js_1.X12Element(value));
        });
        return this;
    }
    /**
     * @description Add an element to this segment.
     * @param {string} value - A string value.
     * @returns {X12Element} The element that was added to this segment.
     */
    addElement(value = "") {
        const element = new X12Element_js_1.X12Element(value);
        this.elements.push(element);
        return element;
    }
    /**
     * @description Replace an element at a position in the segment.
     * @param {string} value - A string value.
     * @param {number} segmentPosition - A 1-based number indicating the position in the segment.
     * @returns {X12Element} The new element if successful, or a null if failed.
     */
    replaceElement(value, segmentPosition) {
        const index = segmentPosition - 1;
        if (this.elements.length <= index) {
            return null;
        }
        else {
            this.elements[index] = new X12Element_js_1.X12Element(value);
        }
        return this.elements[index];
    }
    /**
     * @description Insert an element at a position in the segment.
     * @param {string} value - A string value.
     * @param {number} segmentPosition - A 1-based number indicating the position in the segment.
     * @returns {boolean} True if successful, or false if failed.
     */
    insertElement(value = "", segmentPosition = 1) {
        const index = segmentPosition - 1;
        if (this.elements.length <= index) {
            return false;
        }
        return this.elements.splice(index, 0, new X12Element_js_1.X12Element(value)).length === 1;
    }
    /**
     * @description Remove an element at a position in the segment.
     * @param {number} segmentPosition - A 1-based number indicating the position in the segment.
     * @returns {boolean} True if successful.
     */
    removeElement(segmentPosition) {
        const index = segmentPosition - 1;
        if (this.elements.length <= index) {
            return false;
        }
        return this.elements.splice(index, 1).length === 1;
    }
    /**
     * @description Get the value of an element in this segment.
     * @param {number} segmentPosition - A 1-based number indicating the position in the segment.
     * @param {string} [defaultValue] - A default value to return if there is no element found.
     * @returns {string} If no element is at this position, null or the default value will be returned.
     */
    valueOf(segmentPosition, defaultValue) {
        const index = segmentPosition - 1;
        if (this.elements.length <= index) {
            return defaultValue === undefined ? null : defaultValue;
        }
        return this.elements[index].value === undefined
            ? defaultValue === undefined ? null : defaultValue
            : this.elements[index].value;
    }
    /**
     * @description Serialize segment to EDI string.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     * @returns {string} This segment converted to an EDI string.
     */
    toString(options) {
        options = options !== undefined
            ? (0, X12SerializationOptions_js_1.defaultSerializationOptions)(options)
            : this.options;
        let edi = this.tag;
        for (let i = 0; i < this.elements.length; i++) {
            edi += options.elementDelimiter;
            if ((this.tag === "ISA" && i === 12) || (this.tag === "IEA" && i === 1)) {
                edi += String.prototype.padStart.call(this.elements[i].value, 9, "0");
            }
            else {
                edi += this.elements[i].value;
            }
        }
        edi += options.segmentTerminator;
        return edi;
    }
    /**
     * @description Serialize transaction set to JSON object.
     * @returns {object} This segment converted to an object.
     */
    toJSON() {
        return new JSEDINotation_js_1.JSEDISegment(this.tag, this.elements.map((x) => x.value));
    }
    /**
     * @private
     * @description Check to see if segment is predefined.
     * @returns {boolean} True if segment is predefined.
     */
    _checkSupportedSegment() {
        return ((this.options.segmentHeaders?.findIndex((sh) => {
            return sh.tag === this.tag;
        }) ?? -1) > -1);
    }
    /**
     * @private
     * @description Get the definition of this segment.
     * @returns {object} The definition of this segment.
     */
    _getX12Enumerable() {
        const match = this.options.segmentHeaders?.find((sh) => {
            return sh.tag === this.tag;
        });
        if (match !== undefined) {
            return match.layout;
        }
        else {
            throw Error(`Unable to find segment header for tag '${this.tag}' even though it should be supported.`);
        }
    }
    /**
     * @private
     * @description Format and validate the element values according the segment definition.
     * @param {string[]} values - An array of element values.
     */
    _formatValues(values) {
        if (this._checkSupportedSegment()) {
            const enumerable = this._getX12Enumerable();
            if (this.tag === X12SegmentHeader_js_1.ISASegmentHeader.tag &&
                this.options.subElementDelimiter.length === 1) {
                values[15] = this.options.subElementDelimiter;
            }
            if (values.length === enumerable.COUNT ||
                values.length === enumerable.COUNT_MIN) {
                for (let i = 0; i < values.length; i++) {
                    const name = `${this.tag}${String.prototype.padStart.call(i + 1, 2, "0")}`;
                    const max = enumerable[name];
                    const min = enumerable[`${name}_MIN`] === undefined
                        ? 0
                        : enumerable[`${name}_MIN`];
                    values[i] = `${values[i]}`;
                    if (values[i].length > max && values[i].length !== 0) {
                        throw new Errors_js_1.GeneratorError(`Segment element "${name}" with value of "${values[i]}" exceeds maximum of ${max} characters.`);
                    }
                    if (values[i].length < min && values[i].length !== 0) {
                        throw new Errors_js_1.GeneratorError(`Segment element "${name}" with value of "${values[i]}" does not meet minimum of ${min} characters.`);
                    }
                    if (enumerable.PADDING &&
                        ((values[i].length < max && values[i].length > min) ||
                            values[i].length === 0)) {
                        if (name === "ISA13") {
                            values[i] = String.prototype.padStart.call(values[i], max, "0");
                        }
                        else {
                            values[i] = String.prototype.padEnd.call(values[i], max, " ");
                        }
                    }
                }
            }
            else {
                throw new Errors_js_1.GeneratorError(typeof enumerable.COUNT_MIN === "number"
                    ? `Segment "${this.tag}" with ${values.length} elements does not meet the required count of min ${enumerable.COUNT_MIN} or max ${enumerable.COUNT}.`
                    : `Segment "${this.tag}" with ${values.length} elements does not meet the required count of ${enumerable.COUNT}.`);
            }
        }
    }
}
exports.X12Segment = X12Segment;
