import { X12Segment } from "./X12Segment.js";
import { X12SerializationOptions } from "./X12SerializationOptions.js";
import type { X12QueryMode } from "./X12QueryEngine.js";
export declare class X12Transaction {
    /**
     * @description Create a transaction set.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     */
    constructor(options?: X12SerializationOptions);
    header: X12Segment;
    trailer: X12Segment;
    segments: X12Segment[];
    options: X12SerializationOptions;
    /**
     * @description Set a ST header on this transaction set.
     * @param {string[]} elements - An array of elements for a ST header.
     */
    setHeader(elements: string[]): void;
    /**
     * @description Add a segment to this transaction set.
     * @param {string} tag - The tag for this segment.
     * @param {string[]} elements - An array of elements for this segment.
     * @returns {X12Segment} The segment added to this transaction set.
     */
    addSegment(tag: string, elements: string[]): X12Segment;
    /**
     * @description Map data from a javascript object to this transaction set. Will use the txEngine property for Liquid support from `this.options` if available.
     * @param {object} input - The input object to create the transaction from.
     * @param {object} map - The javascript object containing keys and querys to resolve.
     * @param {object} [macro] - A macro object to add or override methods for the macro directive; properties 'header' and 'segments' are reserved words.
     */
    fromObject(input: any, map: any, macro?: any): void;
    /**
     * @description Map data from a transaction set to a javascript object.
     * @param {object} map - The javascript object containing keys and querys to resolve.
     * @param {Function|'strict'|'loose'} [helper] - A helper function which will be executed on every resolved query value, or the mode for the query engine.
     * @param {'strict'|'loose'} [mode] - The mode for the query engine when performing the transform.
     * @returns {object} An object containing resolved values mapped to object keys.
     */
    toObject(map: object, helper?: Function | X12QueryMode, mode?: X12QueryMode): object;
    /**
     * @description Serialize transaction set to EDI string.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     * @returns {string} This transaction set converted to an EDI string.
     */
    toString(options?: X12SerializationOptions): string;
    /**
     * @description Serialize transaction set to JSON object.
     * @returns {object} This transaction set converted to an object.
     */
    toJSON(): object;
    /**
     * @private
     * @description Set a SE trailer on this transaction set.
     */
    private _setTrailer;
}
