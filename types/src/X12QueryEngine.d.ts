import { X12Parser } from "./X12Parser.js";
import { X12Interchange } from "./X12Interchange.js";
import { X12FunctionalGroup } from "./X12FunctionalGroup.js";
import { X12Transaction } from "./X12Transaction.js";
import { X12Segment } from "./X12Segment.js";
import { X12Element } from "./X12Element.js";
export declare type X12QueryMode = "strict" | "loose";
export declare class X12QueryEngine {
    /**
     * @description Factory for querying EDI using the node-x12 object model.
     * @param {X12Parser|boolean} [parser] - Pass an external parser or set the strictness of the internal parser.
     * @param {'strict'|'loose'} [mode='strict'] - Sets the mode of the query engine, defaults to classic 'strict'; adds new behavior of 'loose', which will return an empty value for a missing element so long as the segment exists.
     */
    constructor(parser?: X12Parser | boolean, mode?: X12QueryMode);
    private readonly _parser;
    private readonly _mode;
    private readonly _forEachPattern;
    private readonly _concatPattern;
    /**
     * @description Query all references in an EDI document.
     * @param {string|X12Interchange} rawEdi - An ASCII or UTF8 string of EDI to parse, or an interchange.
     * @param {string} reference - The query string to resolve.
     * @param {string} [defaultValue=null] - A default value to return if result not found.
     * @returns {X12QueryResult[]} An array of results from the EDI document.
     */
    query(rawEdi: string | X12Interchange, reference: string, defaultValue?: string | null): X12QueryResult[];
    /**
     * @description Query all references in an EDI document and return the first result.
     * @param {string|X12Interchange} rawEdi - An ASCII or UTF8 string of EDI to parse, or an interchange.
     * @param {string} reference - The query string to resolve.
     * @param {string} [defaultValue=null] - A default value to return if result not found.
     * @returns {X12QueryResult} A result from the EDI document.
     */
    querySingle(rawEdi: string | X12Interchange, reference: string, _defaultValue?: string | null): X12QueryResult | null;
    private _getMacroParts;
    private _evaluateForEachQueryPart;
    private _evaluateConcatQueryPart;
    private _evaluateHLQueryPart;
    private _evaluateSegmentPathQueryPart;
    private _evaluateElementReferenceQueryPart;
    private _testQualifiers;
}
/**
 * @description A result as resolved by the query engine.
 * @typedef {object} X12QueryResult
 * @property {X12Interchange} interchange
 * @property {X12FunctionalGroup} functionalGroup
 * @property {X12Transaction} transaction
 * @property {X12Segment} segment
 * @property {X12Element} element
 * @property {string} [value=null]
 * @property {Array<string | string[]>} [values=[]]
 */
export declare class X12QueryResult {
    constructor(interchange?: X12Interchange, functionalGroup?: X12FunctionalGroup, transaction?: X12Transaction, segment?: X12Segment, element?: X12Element, value?: string);
    interchange?: X12Interchange;
    functionalGroup?: X12FunctionalGroup;
    transaction?: X12Transaction;
    segment?: X12Segment;
    element?: X12Element;
    value: string | null;
    values: Array<string | null | string[]>;
}
