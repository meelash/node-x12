"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X12Generator = void 0;
const JSEDINotation_js_1 = require("./JSEDINotation.js");
const X12Interchange_js_1 = require("./X12Interchange.js");
const X12Parser_js_1 = require("./X12Parser.js");
const X12SerializationOptions_js_1 = require("./X12SerializationOptions.js");
class X12Generator {
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
        this.jsen = jsen === undefined ? new JSEDINotation_js_1.JSEDINotation() : jsen;
        if (typeof jsen === "object" && jsen.options !== undefined &&
            options === undefined) {
            this.options = (0, X12SerializationOptions_js_1.defaultSerializationOptions)(jsen.options);
        }
        else {
            this.options = (0, X12SerializationOptions_js_1.defaultSerializationOptions)(options);
        }
        this.interchange = new X12Interchange_js_1.X12Interchange(this.options);
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
        this.options = (0, X12SerializationOptions_js_1.defaultSerializationOptions)(options);
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
        return new X12Parser_js_1.X12Parser(true).parse(this.interchange.toString(this.options));
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
        const genInterchange = new X12Interchange_js_1.X12Interchange(this.options);
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
exports.X12Generator = X12Generator;
