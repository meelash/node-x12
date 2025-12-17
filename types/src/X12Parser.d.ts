/// <reference types="node" />
import { Transform } from "../deps.js";
import { X12Diagnostic } from "./X12Diagnostic.js";
import { X12FatInterchange } from "./X12FatInterchange.js";
import { X12Interchange } from "./X12Interchange.js";
import { X12Segment } from "./X12Segment.js";
import { X12SerializationOptions } from "./X12SerializationOptions.js";
export declare class X12Parser extends Transform {
    /**
     * @description Factory for parsing EDI into interchange object.
     * @param {boolean|X12SerializationOptions} [strict] - Set true to strictly follow the EDI spec; defaults to false.
     * @param {string|X12SerializationOptions} [encoding] - The encoding to use for this instance when parsing a stream; defaults to UTF-8.
     * @param {X12SerializationOptions} [options] - The options to use when parsing a stream.
     */
    constructor(strict?: boolean | X12SerializationOptions, encoding?: "ascii" | "utf8" | X12SerializationOptions, options?: X12SerializationOptions);
    private readonly _strict;
    private readonly _decoder;
    private _options;
    private _dataCache;
    private _parsedISA;
    private _flushing;
    private _fatInterchange;
    private _interchange;
    private _group;
    private _transaction;
    private _segmentCounter;
    diagnostics: X12Diagnostic[];
    /**
     * @description Parse an EDI document.
     * @param {string} edi - An ASCII or UTF8 string of EDI to parse.
     * @param {X12SerializationOptions} [options] - Options for serializing from EDI.
     * @returns {X12Interchange|X12FatInterchange} An interchange or fat interchange.
     */
    parse(edi: string, options?: X12SerializationOptions): X12Interchange | X12FatInterchange;
    /**
     * @description Method for processing an array of segments into the node-x12 object model; typically used with the finished output of a stream.
     * @param {X12Segment[]} segments - An array of X12Segment objects.
     * @param {X12SerializationOptions} [options] - Options for serializing from EDI.
     * @returns {X12Interchange|X12FatInterchange} An interchange or fat interchange.
     */
    getInterchangeFromSegments(segments: X12Segment[], options?: X12SerializationOptions): X12Interchange | X12FatInterchange;
    private _validateEdiSegmentCount;
    private _validateEdiLength;
    private _validateIsaLength;
    private _detectOptions;
    private _parseSegments;
    private _processSegment;
    private _processISA;
    private _processIEA;
    private _processGS;
    private _processGE;
    private _processST;
    private _processSE;
    private _consumeChunk;
    /**
     * @description Flush method for Node API Transform stream.
     * @param {Function} callback - Callback to execute when finished.
     */
    _flush(callback: Function): void;
    /**
     * @description Transform method for Node API Transform stream.
     * @param {object} chunk - A chunk of data from the read stream.
     * @param {string} encoding - Chunk enoding.
     * @param {Function} callback - Callback signalling chunk is processed and instance is ready for next chunk.
     */
    _transform(chunk: any, _encoding: string, callback: Function): void;
}
