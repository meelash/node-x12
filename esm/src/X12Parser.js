// deno-lint-ignore-file no-inferrable-types no-explicit-any ban-types
"use strict";
import { StringDecoder, Transform } from "../deps.js";
import { ArgumentNullError, ParserError } from "./Errors.js";
import { Position, Range } from "./Positioning.js";
import { X12Diagnostic, X12DiagnosticLevel } from "./X12Diagnostic.js";
import { X12FatInterchange } from "./X12FatInterchange.js";
import { X12Interchange } from "./X12Interchange.js";
import { X12FunctionalGroup } from "./X12FunctionalGroup.js";
import { X12Transaction } from "./X12Transaction.js";
import { X12Segment } from "./X12Segment.js";
import { X12Element } from "./X12Element.js";
import { defaultSerializationOptions, } from "./X12SerializationOptions.js";
const DOCUMENT_MIN_LENGTH = 113; // ISA = 106, IEA > 7
const SEGMENT_TERMINATOR_POS = 105;
const END_OF_LINE_POS = 106;
const ELEMENT_DELIMITER_POS = 3;
const SUBELEMENT_DELIMITER_POS = 104;
const REPETITION_DELIMITER_POS = 82;
// Legacy note: const INTERCHANGE_CACHE_SIZE: number = 10
export class X12Parser extends Transform {
    /**
     * @description Factory for parsing EDI into interchange object.
     * @param {boolean|X12SerializationOptions} [strict] - Set true to strictly follow the EDI spec; defaults to false.
     * @param {string|X12SerializationOptions} [encoding] - The encoding to use for this instance when parsing a stream; defaults to UTF-8.
     * @param {X12SerializationOptions} [options] - The options to use when parsing a stream.
     */
    constructor(strict, encoding, options) {
        if (strict === undefined) {
            strict = false;
        }
        else if (typeof strict !== "boolean") {
            options = strict;
            strict = false;
        }
        if (encoding === undefined) {
            encoding = "utf8";
        }
        else if (typeof encoding !== "string") {
            options = encoding;
            encoding = "utf8";
        }
        super({
            readableObjectMode: true,
            writableObjectMode: true,
            objectMode: true,
            defaultEncoding: encoding,
        });
        Object.defineProperty(this, "_strict", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_decoder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_dataCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_parsedISA", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_flushing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_fatInterchange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_interchange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_group", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_transaction", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_segmentCounter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "diagnostics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.diagnostics = new Array();
        this._strict = strict;
        this._options = options;
        this._decoder = new StringDecoder(encoding);
        this._parsedISA = false;
        this._flushing = false;
        this._dataCache = "";
        this._segmentCounter = 0;
    }
    /**
     * @description Parse an EDI document.
     * @param {string} edi - An ASCII or UTF8 string of EDI to parse.
     * @param {X12SerializationOptions} [options] - Options for serializing from EDI.
     * @returns {X12Interchange|X12FatInterchange} An interchange or fat interchange.
     */
    parse(edi, options) {
        if (edi === undefined) {
            throw new ArgumentNullError("edi");
        }
        this.diagnostics.splice(0);
        this._validateEdiLength(edi);
        this._detectOptions(edi, options);
        this._validateIsaLength(edi, this._options.elementDelimiter);
        const segments = this._parseSegments(edi, this._options.segmentTerminator, this._options.elementDelimiter);
        if (segments.length > 2) {
            segments.forEach((segment) => {
                this._processSegment(segment);
            });
        }
        else {
            this._validateEdiSegmentCount();
        }
        return this._fatInterchange === undefined
            ? this._interchange
            : this._fatInterchange;
    }
    /**
     * @description Method for processing an array of segments into the node-x12 object model; typically used with the finished output of a stream.
     * @param {X12Segment[]} segments - An array of X12Segment objects.
     * @param {X12SerializationOptions} [options] - Options for serializing from EDI.
     * @returns {X12Interchange|X12FatInterchange} An interchange or fat interchange.
     */
    getInterchangeFromSegments(segments, options) {
        this._options = options === undefined
            ? this._options
            : defaultSerializationOptions(options);
        segments.forEach((segment) => {
            this._processSegment(segment);
        });
        return this._fatInterchange === undefined
            ? this._interchange
            : this._fatInterchange;
    }
    _validateEdiSegmentCount() {
        const errorMessage = "X12 Standard: An EDI document must contain at least one functional group; verify the document contains valid control characters.";
        if (this._strict) {
            throw new ParserError(errorMessage);
        }
        this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, new Range(0, 0, 0, 1)));
    }
    _validateEdiLength(edi) {
        if (edi.length < DOCUMENT_MIN_LENGTH) {
            const errorMessage = `X12 Standard: Document is too short. Document must be at least ${DOCUMENT_MIN_LENGTH} characters long to be well-formed X12.`;
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, new Range(0, 0, 0, edi.length - 1)));
        }
    }
    _validateIsaLength(edi, elementDelimiter) {
        if (edi.charAt(103) !== elementDelimiter) {
            const errorMessage = "X12 Standard: The ISA segment is not the correct length (106 characters, including segment terminator).";
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, new Range(0, 0, 0, 2)));
        }
    }
    _detectOptions(edi, options) {
        const segmentTerminator = edi.charAt(SEGMENT_TERMINATOR_POS);
        const elementDelimiter = edi.charAt(ELEMENT_DELIMITER_POS);
        const subElementDelimiter = edi.charAt(SUBELEMENT_DELIMITER_POS);
        const repetitionDelimiter = edi.charAt(REPETITION_DELIMITER_POS);
        let endOfLine = edi.charAt(END_OF_LINE_POS);
        let format = false;
        if (options === undefined) {
            if (endOfLine !== "\r" && endOfLine !== "\n") {
                endOfLine = undefined;
            }
            else {
                format = true;
            }
            if (endOfLine === "\r" && edi.charAt(END_OF_LINE_POS + 1) === "\n") {
                endOfLine = "\r\n";
            }
            this._options = defaultSerializationOptions({
                segmentTerminator,
                elementDelimiter,
                subElementDelimiter,
                repetitionDelimiter,
                endOfLine,
                format,
            });
        }
        else {
            this._options = defaultSerializationOptions(options);
        }
    }
    _parseSegments(edi, segmentTerminator, elementDelimiter) {
        const segments = new Array();
        let tagged = false;
        let currentSegment = new X12Segment();
        let currentElement = new X12Element();
        for (let i = 0, l = 0, c = 0; i < edi.length; i++) {
            // segment not yet named and not whitespace or delimiter - begin naming segment
            if (!tagged && edi[i].search(/\s/) === -1 && edi[i] !== elementDelimiter &&
                edi[i] !== segmentTerminator) {
                currentSegment.tag += edi[i];
                if (currentSegment.range.start === undefined) {
                    currentSegment.range.start = new Position(l, c);
                }
                // trailing line breaks - consume them and increment line number
            }
            else if (!tagged && edi[i].search(/\s/) > -1) {
                if (edi[i] === "\n") {
                    l++;
                    c = -1;
                }
                // segment tag/name is completed - mark as tagged
            }
            else if (!tagged && edi[i] === elementDelimiter) {
                tagged = true;
                currentElement = new X12Element();
                currentElement.range.start = new Position(l, c);
                // segment terminator
            }
            else if (edi[i] === segmentTerminator) {
                currentElement.range.end = new Position(l, c - 1);
                currentSegment.elements.push(currentElement);
                if (currentSegment.tag === "IEA" && currentSegment.elements.length === 2) {
                    currentSegment.elements[1].value = `${parseInt(currentSegment.elements[1].value, 10)}`;
                }
                currentSegment.range.end = new Position(l, c);
                segments.push(currentSegment);
                currentSegment = new X12Segment();
                tagged = false;
                if (segmentTerminator === "\n") {
                    l++;
                    c = -1;
                }
                // element delimiter
            }
            else if (tagged && edi[i] === elementDelimiter) {
                currentElement.range.end = new Position(l, c - 1);
                currentSegment.elements.push(currentElement);
                if (currentSegment.tag === "ISA" && currentSegment.elements.length === 13) {
                    currentSegment.elements[12].value = `${parseInt(currentSegment.elements[12].value, 10)}`;
                }
                currentElement = new X12Element();
                currentElement.range.start = new Position(l, c + 1);
                // element data
            }
            else {
                currentElement.value += edi[i];
            }
            c++;
        }
        return segments;
    }
    _processSegment(seg) {
        if (seg.tag === "ISA") {
            if (this._strict && this._interchange !== undefined &&
                this._interchange.header !== undefined) {
                if (this._fatInterchange === undefined) {
                    this._fatInterchange = new X12FatInterchange(this._options);
                    this._fatInterchange.interchanges.push(this._interchange);
                }
                this._interchange = new X12Interchange(this._options);
            }
            if (this._interchange === undefined) {
                this._interchange = new X12Interchange(this._options);
            }
            this._processISA(this._interchange, seg);
            this._parsedISA = true;
        }
        else if (seg.tag === "IEA") {
            this._processIEA(this._interchange, seg);
            if (this._fatInterchange !== undefined) {
                this._fatInterchange.interchanges.push(this._interchange);
            }
        }
        else if (seg.tag === "GS") {
            this._group = new X12FunctionalGroup(this._options);
            this._processGS(this._group, seg);
            this._interchange.functionalGroups.push(this._group);
        }
        else if (seg.tag === "GE") {
            if (this._group === undefined) {
                const errorMessage = "X12 Standard: Missing GS segment!";
                if (this._strict) {
                    throw new ParserError(errorMessage);
                }
                this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range));
            }
            this._processGE(this._group, seg);
            this._group = undefined;
        }
        else if (seg.tag === "ST") {
            if (this._group === undefined) {
                const errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`;
                if (this._strict) {
                    throw new ParserError(errorMessage);
                }
                this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range));
            }
            this._transaction = new X12Transaction(this._options);
            this._processST(this._transaction, seg);
            this._group.transactions.push(this._transaction);
        }
        else if (seg.tag === "SE") {
            if (this._group === undefined) {
                const errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`;
                if (this._strict) {
                    throw new ParserError(errorMessage);
                }
                this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range));
            }
            if (this._transaction === undefined) {
                const errorMessage = "X12 Standard: Missing ST segment!";
                if (this._strict) {
                    throw new ParserError(errorMessage);
                }
                this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range));
            }
            this._processSE(this._transaction, seg);
            this._transaction = undefined;
        }
        else {
            if (this._group === undefined) {
                const errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`;
                if (this._strict) {
                    throw new ParserError(errorMessage);
                }
                this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range));
            }
            if (this._transaction === undefined) {
                const errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a transaction.`;
                if (this._strict) {
                    throw new ParserError(errorMessage);
                }
                this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range));
            }
            else {
                this._transaction.segments.push(seg);
            }
        }
    }
    _processISA(interchange, segment) {
        interchange.header = segment;
    }
    _processIEA(interchange, segment) {
        interchange.trailer = segment;
        if (parseInt(segment.valueOf(1) ?? "") !== interchange.functionalGroups.length) {
            const errorMessage = `X12 Standard: The value in IEA01 (${segment.valueOf(1)}) does not match the number of GS segments in the interchange (${interchange.functionalGroups.length}).`;
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range));
        }
        if (segment.valueOf(2) !== interchange.header.valueOf(13)) {
            const errorMessage = `X12 Standard: The value in IEA02 (${segment.valueOf(2)}) does not match the value in ISA13 (${interchange.header.valueOf(13)}).`;
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[1].range));
        }
    }
    _processGS(group, segment) {
        group.header = segment;
    }
    _processGE(group, segment) {
        group.trailer = segment;
        if (parseInt(segment.valueOf(1) ?? "") !== group.transactions.length) {
            const errorMessage = `X12 Standard: The value in GE01 (${segment.valueOf(1)}) does not match the number of ST segments in the functional group (${group.transactions.length}).`;
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range));
        }
        if (segment.valueOf(2) !== group.header.valueOf(6)) {
            const errorMessage = `X12 Standard: The value in GE02 (${segment.valueOf(2)}) does not match the value in GS06 (${group.header.valueOf(6)}).`;
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[1].range));
        }
    }
    _processST(transaction, segment) {
        transaction.header = segment;
    }
    _processSE(transaction, segment) {
        transaction.trailer = segment;
        const expectedNumberOfSegments = transaction.segments.length + 2;
        if (parseInt(segment.valueOf(1) ?? "") !== expectedNumberOfSegments) {
            const errorMessage = `X12 Standard: The value in SE01 (${segment.valueOf(1)}) does not match the number of segments in the transaction (${expectedNumberOfSegments}).`;
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range));
        }
        if (segment.valueOf(2) !== transaction.header.valueOf(2)) {
            const errorMessage = `X12 Standard: The value in SE02 (${segment.valueOf(2)}) does not match the value in ST02 (${transaction.header.valueOf(2)}).`;
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[1].range));
        }
    }
    _consumeChunk(chunk) {
        chunk = this._dataCache + chunk;
        let rawSegments;
        if (!this._parsedISA && chunk.length >= DOCUMENT_MIN_LENGTH) {
            this._detectOptions(chunk, this._options);
            this._validateIsaLength(chunk, this._options.elementDelimiter);
            rawSegments = chunk.split(this._options.segmentTerminator);
            if (chunk.charAt(chunk.length - 1) !== this._options.segmentTerminator) {
                this._dataCache = rawSegments[rawSegments.length - 1];
                rawSegments.splice(rawSegments.length - 1, 1);
            }
        }
        if (this._parsedISA) {
            rawSegments = chunk.split(this._options.segmentTerminator);
            if (chunk.charAt(chunk.length - 1) !== this._options.segmentTerminator &&
                !this._flushing) {
                this._dataCache = rawSegments[rawSegments.length - 1];
                rawSegments.splice(rawSegments.length - 1, 1);
            }
        }
        if (Array.isArray(rawSegments)) {
            for (let i = 0; i < rawSegments.length; i += 1) {
                if (rawSegments[i].length > 0) {
                    const segments = this._parseSegments(rawSegments[i] + this._options.segmentTerminator, this._options.segmentTerminator, this._options.elementDelimiter);
                    segments.forEach((segment) => {
                        this.push(segment);
                        this._segmentCounter += 1;
                    });
                }
            }
        }
    }
    /**
     * @description Flush method for Node API Transform stream.
     * @param {Function} callback - Callback to execute when finished.
     */
    _flush(callback) {
        this._flushing = true;
        this._consumeChunk(this._dataCache);
        this._flushing = false;
        callback();
        this._validateEdiSegmentCount();
    }
    /**
     * @description Transform method for Node API Transform stream.
     * @param {object} chunk - A chunk of data from the read stream.
     * @param {string} encoding - Chunk enoding.
     * @param {Function} callback - Callback signalling chunk is processed and instance is ready for next chunk.
     */
    _transform(chunk, _encoding, callback) {
        this._consumeChunk(this._decoder.write(chunk));
        callback();
    }
}
