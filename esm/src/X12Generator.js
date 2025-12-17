"use strict";
import { JSEDINotation } from "./JSEDINotation.js";
import { X12Interchange } from "./X12Interchange.js";
import { X12Parser } from "./X12Parser.js";
import { defaultSerializationOptions, } from "./X12SerializationOptions.js";
export class X12Generator {
    /**
     * @description Factory for generating EDI from JS EDI Notation.
     * @param {JSEDINotation} [jsen] - Javascript EDI Notation object to serialize.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     */
    constructor(jsen, options) {
        Object.defineProperty(this, "jsen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "interchange", {
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
        this.jsen = jsen === undefined ? new JSEDINotation() : jsen;
        if (typeof jsen === "object" && jsen.options !== undefined &&
            options === undefined) {
            this.options = defaultSerializationOptions(jsen.options);
        }
        else {
            this.options = defaultSerializationOptions(options);
        }
        this.interchange = new X12Interchange(this.options);
    }
    /**
     * @description Set the JS EDI Notation for this instance.
     * @param {JSEDINotation} [jsen] - Javascript EDI Notation object to serialize.
     */
    setJSEDINotation(jsen) {
        this.jsen = jsen;
    }
    /**
     * @description Get the JS EDI Notation for this instance.
     * @returns {JSEDINotation} The JS EDI Notation for this instance.
     */
    getJSEDINotation() {
        return this.jsen;
    }
    /**
     * @description Set the serialization options for this instance.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     */
    setOptions(options) {
        this.options = defaultSerializationOptions(options);
    }
    /**
     * @description Get the serialization options for this instance.
     * @returns {X12SerializationOptions} The serialization options for this instance.
     */
    getOptions() {
        return this.options;
    }
    /**
     * @description Validate the EDI in this instance.
     * @returns {X12Interchange} This instance converted to an interchange.
     */
    validate() {
        this._generate();
        return new X12Parser(true).parse(this.interchange.toString(this.options));
    }
    /**
     * @description Serialize the EDI in this instance.
     * @returns {string} This instance converted to an EDI string.
     */
    toString() {
        return this.validate().toString(this.options);
    }
    /**
     * @private
     * @description Generate an interchange from the JS EDI Notation in this instance.
     */
    _generate() {
        const genInterchange = new X12Interchange(this.options);
        genInterchange.setHeader(this.jsen.header);
        this.jsen.functionalGroups.forEach((functionalGroup) => {
            const genFunctionalGroup = genInterchange.addFunctionalGroup();
            genFunctionalGroup.setHeader(functionalGroup.header);
            functionalGroup.transactions.forEach((transaction) => {
                const genTransaction = genFunctionalGroup.addTransaction();
                genTransaction.setHeader(transaction.header);
                transaction.segments.forEach((segment) => {
                    genTransaction.addSegment(segment.tag, segment.elements);
                });
            });
        });
        this.interchange = genInterchange;
    }
}
