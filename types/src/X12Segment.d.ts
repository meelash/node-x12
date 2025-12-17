import { Range } from "./Positioning.js";
import { X12Element } from "./X12Element.js";
import { X12SerializationOptions } from "./X12SerializationOptions.js";
export declare class X12Segment {
    /**
     * @description Create a segment.
     * @param {string} tag - The tag for this segment.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     */
    constructor(tag?: string, options?: X12SerializationOptions);
    tag: string;
    elements: X12Element[];
    range: Range;
    options: X12SerializationOptions;
    /**
     * @description Set the tag name for the segment if not provided when constructed.
     * @param {string} tag - The tag for this segment.
     */
    setTag(tag: string): void;
    /**
     * @description Set the elements of this segment.
     * @param {string[]} values - An array of element values.
     * @returns {X12Segment} The current instance of X12Segment.
     */
    setElements(values: string[]): X12Segment;
    /**
     * @description Add an element to this segment.
     * @param {string} value - A string value.
     * @returns {X12Element} The element that was added to this segment.
     */
    addElement(value?: string): X12Element;
    /**
     * @description Replace an element at a position in the segment.
     * @param {string} value - A string value.
     * @param {number} segmentPosition - A 1-based number indicating the position in the segment.
     * @returns {X12Element} The new element if successful, or a null if failed.
     */
    replaceElement(value: string, segmentPosition: number): X12Element | null;
    /**
     * @description Insert an element at a position in the segment.
     * @param {string} value - A string value.
     * @param {number} segmentPosition - A 1-based number indicating the position in the segment.
     * @returns {boolean} True if successful, or false if failed.
     */
    insertElement(value?: string, segmentPosition?: number): boolean;
    /**
     * @description Remove an element at a position in the segment.
     * @param {number} segmentPosition - A 1-based number indicating the position in the segment.
     * @returns {boolean} True if successful.
     */
    removeElement(segmentPosition: number): boolean;
    /**
     * @description Get the value of an element in this segment.
     * @param {number} segmentPosition - A 1-based number indicating the position in the segment.
     * @param {string} [defaultValue] - A default value to return if there is no element found.
     * @returns {string} If no element is at this position, null or the default value will be returned.
     */
    valueOf(segmentPosition: number, defaultValue?: string): string | null;
    /**
     * @description Serialize segment to EDI string.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     * @returns {string} This segment converted to an EDI string.
     */
    toString(options?: X12SerializationOptions): string;
    /**
     * @description Serialize transaction set to JSON object.
     * @returns {object} This segment converted to an object.
     */
    toJSON(): object;
    /**
     * @private
     * @description Check to see if segment is predefined.
     * @returns {boolean} True if segment is predefined.
     */
    private _checkSupportedSegment;
    /**
     * @private
     * @description Get the definition of this segment.
     * @returns {object} The definition of this segment.
     */
    private _getX12Enumerable;
    /**
     * @private
     * @description Format and validate the element values according the segment definition.
     * @param {string[]} values - An array of element values.
     */
    private _formatValues;
}
