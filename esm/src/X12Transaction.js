// deno-lint-ignore-file no-explicit-any ban-types
"use strict";
import { JSEDITransaction } from "./JSEDINotation.js";
import { X12Segment } from "./X12Segment.js";
import { STSegmentHeader } from "./X12SegmentHeader.js";
import { X12TransactionMap } from "./X12TransactionMap.js";
import { defaultSerializationOptions, } from "./X12SerializationOptions.js";
export class X12Transaction {
    /**
     * @description Create a transaction set.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     */
    constructor(options) {
        Object.defineProperty(this, "header", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "trailer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "segments", {
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
        this.segments = new Array();
        this.options = defaultSerializationOptions(options);
    }
    /**
     * @description Set a ST header on this transaction set.
     * @param {string[]} elements - An array of elements for a ST header.
     */
    setHeader(elements) {
        this.header = new X12Segment(STSegmentHeader.tag, this.options);
        this.header.setElements(elements);
        this._setTrailer();
    }
    /**
     * @description Add a segment to this transaction set.
     * @param {string} tag - The tag for this segment.
     * @param {string[]} elements - An array of elements for this segment.
     * @returns {X12Segment} The segment added to this transaction set.
     */
    addSegment(tag, elements) {
        const segment = new X12Segment(tag, this.options);
        segment.setElements(elements);
        this.segments.push(segment);
        this.trailer.replaceElement(`${this.segments.length + 2}`, 1);
        return segment;
    }
    /**
     * @description Map data from a javascript object to this transaction set. Will use the txEngine property for Liquid support from `this.options` if available.
     * @param {object} input - The input object to create the transaction from.
     * @param {object} map - The javascript object containing keys and querys to resolve.
     * @param {object} [macro] - A macro object to add or override methods for the macro directive; properties 'header' and 'segments' are reserved words.
     */
    fromObject(input, map, macro) {
        const mapper = new X12TransactionMap(map, this, this.options.txEngine);
        mapper.fromObject(input, macro);
    }
    /**
     * @description Map data from a transaction set to a javascript object.
     * @param {object} map - The javascript object containing keys and querys to resolve.
     * @param {Function|'strict'|'loose'} [helper] - A helper function which will be executed on every resolved query value, or the mode for the query engine.
     * @param {'strict'|'loose'} [mode] - The mode for the query engine when performing the transform.
     * @returns {object} An object containing resolved values mapped to object keys.
     */
    toObject(map, helper, mode) {
        const mapper = new X12TransactionMap(map, this, helper, mode);
        return mapper.toObject();
    }
    /**
     * @description Serialize transaction set to EDI string.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     * @returns {string} This transaction set converted to an EDI string.
     */
    toString(options) {
        options = options !== undefined
            ? defaultSerializationOptions(options)
            : this.options;
        let edi = this.header.toString(options);
        if (options.format) {
            edi += options.endOfLine;
        }
        for (const segment of this.segments) {
            edi += segment.toString(options);
            if (options.format) {
                edi += options.endOfLine;
            }
        }
        edi += this.trailer.toString(options);
        return edi;
    }
    /**
     * @description Serialize transaction set to JSON object.
     * @returns {object} This transaction set converted to an object.
     */
    toJSON() {
        const jsen = new JSEDITransaction(this.header.elements.map((x) => x.value));
        this.segments.forEach((segment) => {
            jsen.addSegment(segment.tag, segment.elements.map((x) => x.value));
        });
        return jsen;
    }
    /**
     * @private
     * @description Set a SE trailer on this transaction set.
     */
    _setTrailer() {
        this.trailer = new X12Segment(STSegmentHeader.trailer, this.options);
        this.trailer.setElements([
            `${this.segments.length + 2}`,
            this.header?.valueOf(2) ?? "",
        ]);
    }
}
