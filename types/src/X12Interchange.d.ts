import { JSEDINotation } from "./JSEDINotation.js";
import { X12FunctionalGroup } from "./X12FunctionalGroup.js";
import { X12Segment } from "./X12Segment.js";
import { X12SerializationOptions } from "./X12SerializationOptions.js";
export declare class X12Interchange {
    /**
     * @description Create an interchange.
     * @param {string|X12SerializationOptions} [segmentTerminator] - A character to terminate segments when serializing; or an instance of X12SerializationOptions.
     * @param {string} [elementDelimiter] - A character to separate elements when serializing; only required when segmentTerminator is a character.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     */
    constructor(segmentTerminator?: string | X12SerializationOptions, elementDelimiter?: string, options?: X12SerializationOptions);
    header: X12Segment;
    trailer: X12Segment;
    functionalGroups: X12FunctionalGroup[];
    segmentTerminator: string;
    elementDelimiter: string;
    options: X12SerializationOptions;
    /**
     * @description Set an ISA header on this interchange.
     * @param {string[]} elements - An array of elements for an ISA header.
     */
    setHeader(elements: string[]): void;
    /**
     * @description Add a functional group to this interchange.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     * @returns {X12FunctionalGroup} The functional group added to this interchange.
     */
    addFunctionalGroup(options?: X12SerializationOptions): X12FunctionalGroup;
    /**
     * @description Serialize interchange to EDI string.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     * @returns {string} This interchange converted to an EDI string.
     */
    toString(options?: X12SerializationOptions): string;
    /**
     * @description Serialize interchange to JS EDI Notation object.
     * @returns {JSEDINotation} This interchange converted to JS EDI Notation object.
     */
    toJSEDINotation(): JSEDINotation;
    /**
     * @description Serialize interchange to JSON object.
     * @returns {object} This interchange converted to an object.
     */
    toJSON(): object;
    /**
     * @private
     * @description Set an ISA trailer on this interchange.
     */
    private _setTrailer;
}
