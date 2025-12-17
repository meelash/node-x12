// deno-lint-ignore-file ban-types
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X12FunctionalGroup = void 0;
const JSEDINotation_js_1 = require("./JSEDINotation.js");
const X12Segment_js_1 = require("./X12Segment.js");
const X12SegmentHeader_js_1 = require("./X12SegmentHeader.js");
const X12Transaction_js_1 = require("./X12Transaction.js");
const X12SerializationOptions_js_1 = require("./X12SerializationOptions.js");
class X12FunctionalGroup {
    /**
     * @description Create a functional group.
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
        Object.defineProperty(this, "transactions", {
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
        this.transactions = new Array();
        this.options = (0, X12SerializationOptions_js_1.defaultSerializationOptions)(options);
    }
    /**
     * @description Set a GS header on this functional group.
     * @param {string[]} elements - An array of elements for a GS header.
     */
    setHeader(elements) {
        this.header = new X12Segment_js_1.X12Segment(X12SegmentHeader_js_1.GSSegmentHeader.tag, this.options);
        this.header.setElements(elements);
        this._setTrailer();
    }
    /**
     * @description Add a transaction set to this functional group.
     * @returns {X12Transaction} The transaction which was added to this functional group.
     */
    addTransaction() {
        const transaction = new X12Transaction_js_1.X12Transaction(this.options);
        this.transactions.push(transaction);
        this.trailer.replaceElement(`${this.transactions.length}`, 1);
        return transaction;
    }
    /**
     * @description Serialize functional group to EDI string.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     * @returns {string} This functional group converted to EDI string.
     */
    toString(options) {
        options = options !== undefined
            ? (0, X12SerializationOptions_js_1.defaultSerializationOptions)(options)
            : this.options;
        let edi = this.header.toString(options);
        if (options.format) {
            edi += options.endOfLine;
        }
        for (let i = 0; i < this.transactions.length; i++) {
            edi += this.transactions[i].toString(options);
            if (options.format) {
                edi += options.endOfLine;
            }
        }
        edi += this.trailer.toString(options);
        return edi;
    }
    /**
     * @description Serialize functional group to JSON object.
     * @returns {object} This functional group converted to an object.
     */
    toJSON() {
        const jsen = new JSEDINotation_js_1.JSEDIFunctionalGroup(this.header.elements.map((x) => x.value));
        this.transactions.forEach((transaction) => {
            const jsenTransaction = jsen.addTransaction(transaction.header.elements.map((x) => x.value));
            transaction.segments.forEach((segment) => {
                jsenTransaction.addSegment(segment.tag, segment.elements.map((x) => x.value));
            });
        });
        return jsen;
    }
    /**
     * @private
     * @description Set a GE trailer on this functional group.
     */
    _setTrailer() {
        this.trailer = new X12Segment_js_1.X12Segment(X12SegmentHeader_js_1.GSSegmentHeader.trailer, this.options);
        this.trailer.setElements([
            `${this.transactions.length}`,
            this.header.valueOf(6) ?? "",
        ]);
    }
}
exports.X12FunctionalGroup = X12FunctionalGroup;
