// deno-lint-ignore-file ban-types
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X12Interchange = void 0;
const JSEDINotation_js_1 = require("./JSEDINotation.js");
const X12FunctionalGroup_js_1 = require("./X12FunctionalGroup.js");
const X12Segment_js_1 = require("./X12Segment.js");
const X12SegmentHeader_js_1 = require("./X12SegmentHeader.js");
const X12SerializationOptions_js_1 = require("./X12SerializationOptions.js");
class X12Interchange {
    /**
     * @description Create an interchange.
     * @param {string|X12SerializationOptions} [segmentTerminator] - A character to terminate segments when serializing; or an instance of X12SerializationOptions.
     * @param {string} [elementDelimiter] - A character to separate elements when serializing; only required when segmentTerminator is a character.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     */
    constructor(segmentTerminator, elementDelimiter, options) {
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
        Object.defineProperty(this, "functionalGroups", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "segmentTerminator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "elementDelimiter", {
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
        this.functionalGroups = new Array();
        if (typeof segmentTerminator === "string") {
            this.segmentTerminator = segmentTerminator;
            if (typeof elementDelimiter === "string") {
                this.elementDelimiter = elementDelimiter;
            }
            else {
                throw new TypeError('Parameter "elementDelimiter" must be type of string.');
            }
            this.options = (0, X12SerializationOptions_js_1.defaultSerializationOptions)(options);
        }
        else if (typeof segmentTerminator === "object") {
            this.options = (0, X12SerializationOptions_js_1.defaultSerializationOptions)(segmentTerminator);
            this.segmentTerminator = this.options.segmentTerminator;
            this.elementDelimiter = this.options.elementDelimiter;
        }
        else {
            this.options = (0, X12SerializationOptions_js_1.defaultSerializationOptions)(options);
            this.segmentTerminator = this.options.segmentTerminator;
            this.elementDelimiter = this.options.elementDelimiter;
        }
    }
    /**
     * @description Set an ISA header on this interchange.
     * @param {string[]} elements - An array of elements for an ISA header.
     */
    setHeader(elements) {
        this.header = new X12Segment_js_1.X12Segment(X12SegmentHeader_js_1.ISASegmentHeader.tag, this.options);
        this.header.setElements(elements);
        this._setTrailer();
    }
    /**
     * @description Add a functional group to this interchange.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     * @returns {X12FunctionalGroup} The functional group added to this interchange.
     */
    addFunctionalGroup(options) {
        options = options !== undefined
            ? (0, X12SerializationOptions_js_1.defaultSerializationOptions)(options)
            : this.options;
        const functionalGroup = new X12FunctionalGroup_js_1.X12FunctionalGroup(options);
        this.functionalGroups.push(functionalGroup);
        this.trailer.replaceElement(`${this.functionalGroups.length}`, 1);
        return functionalGroup;
    }
    /**
     * @description Serialize interchange to EDI string.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     * @returns {string} This interchange converted to an EDI string.
     */
    toString(options) {
        options = options !== undefined
            ? (0, X12SerializationOptions_js_1.defaultSerializationOptions)(options)
            : this.options;
        let edi = this.header.toString(options);
        if (options.format) {
            edi += options.endOfLine;
        }
        for (let i = 0; i < this.functionalGroups.length; i++) {
            edi += this.functionalGroups[i].toString(options);
            if (options.format) {
                edi += options.endOfLine;
            }
        }
        edi += this.trailer.toString(options);
        return edi;
    }
    /**
     * @description Serialize interchange to JS EDI Notation object.
     * @returns {JSEDINotation} This interchange converted to JS EDI Notation object.
     */
    toJSEDINotation() {
        const jsen = new JSEDINotation_js_1.JSEDINotation(this.header.elements.map((x) => x.value.trim()), this.options);
        this.functionalGroups.forEach((functionalGroup) => {
            const jsenFunctionalGroup = jsen.addFunctionalGroup(functionalGroup.header.elements.map((x) => x.value));
            functionalGroup.transactions.forEach((transaction) => {
                const jsenTransaction = jsenFunctionalGroup.addTransaction(transaction.header.elements.map((x) => x.value));
                transaction.segments.forEach((segment) => {
                    jsenTransaction.addSegment(segment.tag, segment.elements.map((x) => x.value));
                });
            });
        });
        return jsen;
    }
    /**
     * @description Serialize interchange to JSON object.
     * @returns {object} This interchange converted to an object.
     */
    toJSON() {
        return this.toJSEDINotation();
    }
    /**
     * @private
     * @description Set an ISA trailer on this interchange.
     */
    _setTrailer() {
        this.trailer = new X12Segment_js_1.X12Segment(X12SegmentHeader_js_1.ISASegmentHeader.trailer, this.options);
        this.trailer.setElements([
            `${this.functionalGroups.length}`,
            this.header.valueOf(13) ?? "",
        ]);
    }
}
exports.X12Interchange = X12Interchange;
