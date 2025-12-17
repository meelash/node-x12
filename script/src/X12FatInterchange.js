// deno-lint-ignore-file ban-types
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X12FatInterchange = void 0;
const X12SerializationOptions_js_1 = require("./X12SerializationOptions.js");
class X12FatInterchange extends Array {
    /**
     * @description Create a fat interchange.
     * @param {X12Interchange[] | X12SerializationOptions} [items] - The items for this array or options for this interchange.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     */
    constructor(items, options) {
        super();
        Object.defineProperty(this, "interchanges", {
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
        if (Array.isArray(items)) {
            super.push(...items);
        }
        else {
            options = items;
        }
        this.options = (0, X12SerializationOptions_js_1.defaultSerializationOptions)(options);
        this.interchanges = this;
    }
    /**
     * @description Serialize fat interchange to EDI string.
     * @param {X12SerializationOptions} [options] - Options to override serializing back to EDI.
     * @returns {string} This fat interchange converted to EDI string.
     */
    toString(options) {
        options = options !== undefined
            ? (0, X12SerializationOptions_js_1.defaultSerializationOptions)(options)
            : this.options;
        let edi = "";
        for (let i = 0; i < this.interchanges.length; i++) {
            edi += this.interchanges[i].toString(options);
            if (options.format) {
                edi += options.endOfLine;
            }
        }
        return edi;
    }
    /**
     * @description Serialize interchange to JS EDI Notation object.
     * @returns {JSEDINotation[]} This fat interchange converted to an array of JS EDI notation.
     */
    toJSEDINotation() {
        const jsen = new Array();
        this.interchanges.forEach((interchange) => {
            jsen.push(interchange.toJSEDINotation());
        });
        return jsen;
    }
    /**
     * @description Serialize interchange to JSON object.
     * @returns {object[]} This fat interchange converted to an array of objects.
     */
    toJSON() {
        return this.toJSEDINotation();
    }
}
exports.X12FatInterchange = X12FatInterchange;
