import { X12SegmentHeader } from "./X12SegmentHeader.js";
export declare type TxEngine = "liquidjs" | "internal";
/**
 * @description Options for serializing to and from EDI.
 * @typedef {object} X12SerializationOptions
 * @property {string} [elementDelimiter=*] The separator for elements within an EDI segment.
 * @property {string} [endOfLine=\n] The end of line charactor for formatting.
 * @property {boolean} [format=false] A flag to set formatting when serializing back to EDI.
 * @property {string} [segmentTerminator=~] The terminator for each EDI segment.
 * @property {string} [subElementDelimiter=>] A sub-element separator; typically found at element 16 of the ISA header segment.
 * @property {X12SegmentHeader[]} [segmentHeaders] Default array of known, pre-defined segment headers.
 * @property {'liquidjs'|'internal'} [txEngine='internal'] The engine to use for macros when mapping transaction sets from objects.
 */
/**
 * Class instance wrapper for serialization options.
 */
export declare class X12SerializationOptions {
    constructor(options?: X12SerializationOptions);
    elementDelimiter?: string;
    endOfLine?: string;
    format?: boolean;
    segmentTerminator?: string;
    subElementDelimiter?: string;
    repetitionDelimiter?: string;
    segmentHeaders?: X12SegmentHeader[];
    txEngine?: TxEngine;
}
/**
 * @description Set default values for any missing X12SerializationOptions in an options object.
 * @param {X12SerializationOptions} [options] - Options for serializing to and from EDI.
 * @returns {X12SerializationOptions} Serialization options with defaults filled in.
 */
export declare function defaultSerializationOptions(options?: X12SerializationOptions): X12SerializationOptions;
