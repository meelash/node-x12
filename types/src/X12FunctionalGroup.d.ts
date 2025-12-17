import { X12Segment } from "./X12Segment.js";
import { X12Transaction } from "./X12Transaction.js";
import { X12SerializationOptions } from "./X12SerializationOptions.js";
export declare class X12FunctionalGroup {
    /**
     * @description Create a functional group.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     */
    constructor(options?: X12SerializationOptions);
    header: X12Segment;
    trailer: X12Segment;
    transactions: X12Transaction[];
    options: X12SerializationOptions;
    /**
     * @description Set a GS header on this functional group.
     * @param {string[]} elements - An array of elements for a GS header.
     */
    setHeader(elements: string[]): void;
    /**
     * @description Add a transaction set to this functional group.
     * @returns {X12Transaction} The transaction which was added to this functional group.
     */
    addTransaction(): X12Transaction;
    /**
     * @description Serialize functional group to EDI string.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     * @returns {string} This functional group converted to EDI string.
     */
    toString(options?: X12SerializationOptions): string;
    /**
     * @description Serialize functional group to JSON object.
     * @returns {object} This functional group converted to an object.
     */
    toJSON(): object;
    /**
     * @private
     * @description Set a GE trailer on this functional group.
     */
    private _setTrailer;
}
