// deno-lint-ignore-file ban-types
"use strict";
import { JSEDINotation } from "./JSEDINotation.js";
import { X12FunctionalGroup } from "./X12FunctionalGroup.js";
import { X12Segment } from "./X12Segment.js";
import { ISASegmentHeader } from "./X12SegmentHeader.js";
import { defaultSerializationOptions, } from "./X12SerializationOptions.js";
export class X12Interchange {
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
            this.options = defaultSerializationOptions(options);
        }
        else if (typeof segmentTerminator === "object") {
            this.options = defaultSerializationOptions(segmentTerminator);
            this.segmentTerminator = this.options.segmentTerminator;
            this.elementDelimiter = this.options.elementDelimiter;
        }
        else {
            this.options = defaultSerializationOptions(options);
            this.segmentTerminator = this.options.segmentTerminator;
            this.elementDelimiter = this.options.elementDelimiter;
        }
    }
    /**
     * @description Set an ISA header on this interchange.
     * @param {string[]} elements - An array of elements for an ISA header.
     */
    setHeader(elements) {
        this.header = new X12Segment(ISASegmentHeader.tag, this.options);
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
            ? defaultSerializationOptions(options)
            : this.options;
        const functionalGroup = new X12FunctionalGroup(options);
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
            ? defaultSerializationOptions(options)
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
        const jsen = new JSEDINotation(this.header.elements.map((x) => x.value.trim()), this.options);
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
        this.trailer = new X12Segment(ISASegmentHeader.trailer, this.options);
        this.trailer.setElements([
            `${this.functionalGroups.length}`,
            this.header.valueOf(13) ?? "",
        ]);
    }
}
