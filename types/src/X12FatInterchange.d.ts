import { JSEDINotation } from "./JSEDINotation.js";
import { X12Interchange } from "./X12Interchange.js";
import { X12SerializationOptions } from "./X12SerializationOptions.js";
export declare class X12FatInterchange extends Array<X12Interchange> {
    /**
     * @description Create a fat interchange.
     * @param {X12Interchange[] | X12SerializationOptions} [items] - The items for this array or options for this interchange.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     */
    constructor(items?: X12Interchange[] | X12SerializationOptions, options?: X12SerializationOptions);
    interchanges: X12Interchange[];
    options: X12SerializationOptions;
    /**
     * @description Serialize fat interchange to EDI string.
     * @param {X12SerializationOptions} [options] - Options to override serializing back to EDI.
     * @returns {string} This fat interchange converted to EDI string.
     */
    toString(options?: X12SerializationOptions): string;
    /**
     * @description Serialize interchange to JS EDI Notation object.
     * @returns {JSEDINotation[]} This fat interchange converted to an array of JS EDI notation.
     */
    toJSEDINotation(): JSEDINotation[];
    /**
     * @description Serialize interchange to JSON object.
     * @returns {object[]} This fat interchange converted to an array of objects.
     */
    toJSON(): object[];
}
