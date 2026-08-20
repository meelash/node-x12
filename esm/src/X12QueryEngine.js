// deno-lint-ignore-file no-explicit-any
"use strict";
import { QuerySyntaxError } from "./Errors.js";
import { X12Parser } from "./X12Parser.js";
import { X12Element } from "./X12Element.js";
export class X12QueryEngine {
    /**
     * @description Factory for querying EDI using the node-x12 object model.
     * @param {X12Parser|boolean} [parser] - Pass an external parser or set the strictness of the internal parser.
     * @param {'strict'|'loose'} [mode='strict'] - Sets the mode of the query engine, defaults to classic 'strict'; adds new behavior of 'loose', which will return an empty value for a missing element so long as the segment exists.
     */
    constructor(parser = true, mode = "strict") {
        Object.defineProperty(this, "_parser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_mode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_forEachPattern", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: /FOREACH\([A-Z0-9]{2,3}\)=>.+/g
        });
        Object.defineProperty(this, "_concatPattern", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: /CONCAT\(.+,.+\)=>.+/g
        });
        this._parser = typeof parser === "boolean" ? new X12Parser(parser) : parser;
        this._mode = mode;
    }
    /**
     * @description Query all references in an EDI document.
     * @param {string|X12Interchange} rawEdi - An ASCII or UTF8 string of EDI to parse, or an interchange.
     * @param {string} reference - The query string to resolve.
     * @param {string} [defaultValue=null] - A default value to return if result not found.
     * @returns {X12QueryResult[]} An array of results from the EDI document.
     */
    query(rawEdi, reference, defaultValue = null) {
        const interchange = typeof rawEdi === "string"
            ? this._parser.parse(rawEdi)
            : rawEdi;
        const forEachMatch = reference.match(this._forEachPattern); // ex. FOREACH(LX)=>MAN02
        if (forEachMatch !== null) {
            reference = this._evaluateForEachQueryPart(forEachMatch[0]);
        }
        const concathMatch = reference.match(this._concatPattern); // ex. CONCAT(MAN01,-)=>MAN02
        let concat;
        if (concathMatch !== null) {
            concat = this._evaluateConcatQueryPart(interchange, concathMatch[0]);
            reference = concat.query;
        }
        const hlPathMatch = reference.match(/HL\+(\w\+?)+[+-]/g); // ex. HL+O+P+I
        // A segment path always precedes the element reference and a qualifier always
        // follows it, so only search ahead of the first ":". Searching the whole
        // reference reads a hyphen inside a qualifier value (ex. REF02["SELF-FUNDED"])
        // as a segment path.
        const [segPathAndElmRef] = reference.split(":");
        const segPathMatch = segPathAndElmRef.match(/((?<!\+)[A-Z0-9]{2,3}-)+/g); // ex. PO1-N9-
        const elmRefMatch = reference.match(/[A-Z][A-Z0-9]{1,2}[0-9]{2}[^[]?/g); // ex. REF02; need to remove trailing ":" if exists
        const qualMatch = reference.match(/:[A-Z0-9]{2,3}[0-9]{2,}\[["'][^[\]"']+["']\]/g); // ex. :REF01["PO"]
        const results = new Array();
        for (const group of interchange.functionalGroups) {
            for (const txn of group.transactions) {
                let segments = txn.segments;
                if (hlPathMatch !== null) {
                    segments = this._evaluateHLQueryPart(txn, hlPathMatch[0]);
                }
                if (segPathMatch !== null) {
                    segments = this._evaluateSegmentPathQueryPart(segments, segPathMatch[0]);
                }
                if (elmRefMatch === null) {
                    throw new QuerySyntaxError("Element reference queries must contain an element reference!");
                }
                const txnResults = this._evaluateElementReferenceQueryPart(interchange, group, txn, [].concat(segments, [
                    interchange.header,
                    group.header,
                    txn.header,
                    txn.trailer,
                    group.trailer,
                    interchange.trailer,
                ]), elmRefMatch[0], qualMatch, defaultValue);
                txnResults.forEach((res) => {
                    if (concat !== undefined) {
                        res.value = `${concat.value}${concat.separator}${res.value}`;
                    }
                    results.push(res);
                });
            }
        }
        return results;
    }
    /**
     * @description Query all references in an EDI document and return the first result.
     * @param {string|X12Interchange} rawEdi - An ASCII or UTF8 string of EDI to parse, or an interchange.
     * @param {string} reference - The query string to resolve.
     * @param {string} [defaultValue=null] - A default value to return if result not found.
     * @returns {X12QueryResult} A result from the EDI document.
     */
    querySingle(rawEdi, reference, _defaultValue = null) {
        const results = this.query(rawEdi, reference);
        if (reference.match(this._forEachPattern) !== null) {
            const values = results.map((result) => result.value);
            if (values.length !== 0) {
                results[0].value = null;
                results[0].values = values;
            }
        }
        return results.length === 0 ? null : results[0];
    }
    _getMacroParts(macroQuery) {
        const macroPart = macroQuery.substr(0, macroQuery.indexOf("=>"));
        const queryPart = macroQuery.substr(macroQuery.indexOf("=>") + 2);
        const parameters = macroPart.substr(macroPart.indexOf("(") + 1, macroPart.length - macroPart.indexOf("(") - 2);
        return {
            macroPart,
            queryPart,
            parameters,
        };
    }
    _evaluateForEachQueryPart(forEachSegment) {
        const { queryPart, parameters } = this._getMacroParts(forEachSegment);
        return `${parameters}-${queryPart}`;
    }
    _evaluateConcatQueryPart(interchange, concatSegment) {
        const { queryPart, parameters } = this._getMacroParts(concatSegment);
        let value = "";
        const expandedParams = parameters.split(",");
        if (expandedParams.length === 3) {
            expandedParams[1] = ",";
        }
        const result = this.querySingle(interchange, expandedParams[0]);
        if (result !== null) {
            if (result.value !== null && result.value !== undefined) {
                value = result.value;
            }
            else if (Array.isArray(result.values)) {
                value = result.values.join(expandedParams[1]);
            }
        }
        return {
            value,
            separator: expandedParams[1],
            query: queryPart,
        };
    }
    _evaluateHLQueryPart(transaction, hlPath) {
        let qualified = false;
        const pathParts = hlPath
            .replace("-", "")
            .split("+")
            .filter((value) => {
            return value !== "HL" && value !== "" && value !== null;
        });
        const matches = new Array();
        let lastParentIndex = -1;
        for (let i = 0, j = 0; i < transaction.segments.length; i++) {
            const segment = transaction.segments[i];
            if (qualified && segment.tag === "HL") {
                const parentIndex = parseInt(segment.valueOf(2, "-1") ?? "-1");
                if (parentIndex !== lastParentIndex) {
                    j = 0;
                    qualified = false;
                }
            }
            if (!qualified && transaction.segments[i].tag === "HL" &&
                transaction.segments[i].valueOf(3) === pathParts[j]) {
                lastParentIndex = parseInt(segment.valueOf(2, "-1") ?? "-1");
                j++;
                if (j === pathParts.length) {
                    qualified = true;
                }
            }
            if (qualified) {
                matches.push(transaction.segments[i]);
            }
        }
        return matches;
    }
    _evaluateSegmentPathQueryPart(segments, segmentPath) {
        let qualified = false;
        const pathParts = segmentPath.split("-").filter((value) => {
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            return !!value;
        });
        const matches = new Array();
        for (let i = 0, j = 0; i < segments.length; i++) {
            if (qualified &&
                (segments[i].tag === "HL" || pathParts.indexOf(segments[i].tag) > -1)) {
                j = 0;
                qualified = false;
            }
            if (!qualified && segments[i].tag === pathParts[j]) {
                j++;
                if (j === pathParts.length) {
                    qualified = true;
                }
            }
            if (qualified) {
                matches.push(segments[i]);
            }
        }
        return matches;
    }
    _evaluateElementReferenceQueryPart(interchange, functionalGroup, transaction, segments, elementReference, qualifiers, defaultValue = null) {
        const reference = elementReference.replace(":", "");
        const tag = reference.substr(0, reference.length - 2);
        const pos = reference.substr(reference.length - 2, 2);
        const posint = parseInt(pos);
        const results = new Array();
        for (const segment of segments) {
            if (segment === null || segment === undefined) {
                continue;
            }
            if (segment.tag !== tag) {
                continue;
            }
            const value = segment.valueOf(posint, defaultValue ?? undefined);
            if (this._testQualifiers(transaction, segment, qualifiers)) {
                if ((typeof value !== "undefined" && value !== null)) {
                    results.push(new X12QueryResult(interchange, functionalGroup, transaction, segment, segment.elements[posint - 1], value));
                }
                else if (this._mode === "loose") {
                    results.push(new X12QueryResult(interchange, functionalGroup, transaction, segment, new X12Element(), undefined));
                }
            }
        }
        return results;
    }
    _testQualifiers(transaction, segment, qualifiers) {
        if (qualifiers === undefined || qualifiers === null) {
            return true;
        }
        for (const qualifierValue of qualifiers) {
            const qualifier = qualifierValue.substr(1);
            const elementReference = qualifier.substring(0, qualifier.indexOf("["));
            const elementValue = qualifier.substring(qualifier.indexOf("[") + 2, qualifier.lastIndexOf("]") - 1);
            const tag = elementReference.substr(0, elementReference.length - 2);
            const pos = elementReference.substr(elementReference.length - 2, 2);
            const posint = parseInt(pos);
            for (let j = transaction.segments.indexOf(segment); j > -1; j--) {
                const seg = transaction.segments[j];
                const value = seg.valueOf(posint);
                if (seg.tag === tag && seg.tag === segment.tag && value !== elementValue) {
                    return false;
                }
                else if (seg.tag === tag && value === elementValue) {
                    break;
                }
                if (j === 0) {
                    return false;
                }
            }
        }
        return true;
    }
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
export class X12QueryResult {
    constructor(interchange, functionalGroup, transaction, segment, element, value) {
        Object.defineProperty(this, "interchange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "functionalGroup", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "transaction", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "segment", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "element", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "values", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.interchange = interchange;
        this.functionalGroup = functionalGroup;
        this.transaction = transaction;
        this.segment = segment;
        this.element = element;
        this.value = value === null || value === undefined
            ? element?.value ?? null
            : value;
        this.values = new Array();
    }
}
