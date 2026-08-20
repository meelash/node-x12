// deno-lint-ignore-file no-explicit-any ban-types
"use strict";
import { QuerySyntaxError } from "./Errors.js";
import { X12Interchange } from "./X12Interchange.js";
import { X12QueryEngine } from "./X12QueryEngine.js";
import { X12Transaction } from "./X12Transaction.js";
import { crypto, Liquid } from "../deps.js";
/**
 * @private
 * @description Check if a value is empty.
 * @param {any} val - A value to check.
 * @returns {boolean} Whether the value is empty.
 */
function isEmpty(val) {
    if (val === undefined || val === null)
        return true;
    if (typeof val === "string" && val.trim() === "")
        return true;
    return false;
}
/**
 * @private
 * @description Check if a string is query mode.
 * @param {any} str - The string to check.
 * @returns {boolean} Whether the string is a query mode.
 */
function isX12QueryMode(str) {
    return str === "loose" || str === "strict";
}
/**
 * @private
 * @description Check if a string is query mode.
 * @param {any} str - The string to check.
 * @returns {boolean} Whether the string is a query mode.
 */
function isTxEngine(str) {
    return str === "internal" || str === "liquidjs";
}
export class X12TransactionMap {
    constructor(map, transaction, helper, txEngine, mode) {
        Object.defineProperty(this, "_map", {
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
        Object.defineProperty(this, "_object", {
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
        Object.defineProperty(this, "helper", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "txEngine", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._map = map;
        if (transaction)
            this._transaction = transaction;
        this.helper = typeof helper === "function" ? helper : this._helper;
        if (typeof helper === "string" &&
            (typeof txEngine === "undefined" || typeof mode === "undefined")) {
            if (isTxEngine(helper)) {
                if (isX12QueryMode(txEngine)) {
                    mode = txEngine;
                }
                txEngine = helper;
            }
            else if (isX12QueryMode(helper)) {
                mode = helper;
            }
        }
        if (typeof txEngine === "string" && typeof mode === "undefined" &&
            isX12QueryMode(txEngine)) {
            mode = txEngine;
        }
        this.txEngine = isTxEngine(txEngine) ? txEngine : "internal";
        this._mode = isX12QueryMode(mode) ? mode : "strict";
    }
    /**
     * @description Set the transaction set to map and optionally a helper function.
     * @param {X12Transaction} transaction - A transaction set to map.
     * @param {Function} helper - A helper function which will be executed on every resolved query value.
     */
    setTransaction(transaction, helper) {
        this._transaction = transaction;
        this.helper = helper === undefined ? this._helper : helper;
    }
    /**
     * @description Set the transaction set to map and optionally a helper function.
     * @returns {X12Transaction} The transaction from this instance.
     */
    getTransaction() {
        return this._transaction;
    }
    /**
     * @description Map data from the transaction set to a javascript object.
     * @param {object} [map] - The javascript object containing keys and querys to resolve.
     * @param {Function} [callback] - A callback function which will be passed to the helper function.
     * @returns {object|object[]} The transaction set mapped to an object or an array of objects.
     */
    toObject(map, callback) {
        map = map === undefined ? this._map : map;
        const clone = JSON.parse(JSON.stringify(map));
        let clones = null;
        // `clone` starts life holding the map's own query strings, and once a FOREACH
        // key has produced `clones` it is `clones` that gets returned. So a key
        // resolved after that point has to be written to every row too; writing it to
        // `clone` alone leaves each row showing the raw query string it was cloned
        // with. Object values are copied per row so rows never share a reference.
        const assign = (key, value) => {
            clone[key] = value;
            if (Array.isArray(clones)) {
                clones.forEach((cloned) => {
                    cloned[key] = value !== null && typeof value === "object"
                        ? JSON.parse(JSON.stringify(value))
                        : value;
                });
            }
        };
        const engine = new X12QueryEngine(false, this._mode);
        const interchange = new X12Interchange();
        interchange.setHeader([
            "00",
            "",
            "00",
            "",
            "ZZ",
            "00000000",
            "01",
            "00000000",
            "000000",
            "0000",
            "|",
            "00000",
            "00000000",
            "0",
            "P",
            ">",
        ]);
        interchange.addFunctionalGroup().transactions = [this._transaction];
        Object.keys(map).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(map, key)) {
                if (Array.isArray(map[key]) && typeof map[key][0] === "string") {
                    const typedArray = map[key];
                    const newArray = new Array();
                    typedArray.forEach((query) => {
                        try {
                            const result = engine.querySingle(interchange, query, "");
                            if (result === null) {
                                newArray.push(null);
                            }
                            else if (result.value === null || Array.isArray(clone[key][0])) {
                                if (result.value !== null) {
                                    clone[key].forEach((array) => {
                                        array.push(this.helper(key, result.value, query, callback));
                                    });
                                }
                                else {
                                    let superArray = new Array();
                                    if (Array.isArray(clone[key][0])) {
                                        superArray = clone[key];
                                    }
                                    result.values.forEach((value, index) => {
                                        if (!Array.isArray(superArray[index])) {
                                            superArray[index] = new Array();
                                        }
                                        superArray[index].push(this.helper(key, value, query, callback));
                                    });
                                    newArray.push(...superArray);
                                }
                            }
                            else {
                                newArray.push(this.helper(key, result.value, query, callback));
                            }
                        }
                        catch (err) {
                            const message = err instanceof Error ? err.message : String(err);
                            throw new QuerySyntaxError(`${message}; bad query in ${map[key]}`);
                        }
                    });
                    assign(key, newArray);
                }
                else if (typeof map[key] === "string") {
                    try {
                        const result = engine.querySingle(interchange, map[key], "");
                        if (result === null) {
                            assign(key, null);
                        }
                        else if (result.value === null || Array.isArray(clones)) {
                            if (result.value !== null) {
                                clones.forEach((cloned) => {
                                    cloned[key] = this.helper(key, result.value, map[key], callback);
                                });
                            }
                            else {
                                if (!Array.isArray(clones)) {
                                    clones = [];
                                }
                                result.values.forEach((value, index) => {
                                    if (clones[index] === undefined) {
                                        clones[index] = JSON.parse(JSON.stringify(clone));
                                    }
                                    clones[index][key] = this.helper(key, value, map[key], callback);
                                });
                            }
                        }
                        else {
                            assign(key, this.helper(key, result.value, map[key], callback));
                        }
                    }
                    catch (err) {
                        const message = err instanceof Error ? err.message : String(err);
                        throw new QuerySyntaxError(`${message}; bad query in ${map[key]}`);
                    }
                }
                else {
                    assign(key, this.toObject(map[key]));
                }
            }
        });
        return Array.isArray(clones) ? clones : clone;
    }
    /**
     * @description Map data from a javascript object to the transaction set.
     * @param {object} input - The input object to create the transaction from.
     * @param {object} [map] - The map to associate values from the input to the transaction, or a macro object.
     * @param {object} [macroObj={}] - A macro object to add or override methods for the macro directive; properties 'header' and 'segments' are reserved words.
     * @returns {X12Transaction} The transaction created from the object values.
     */
    fromObject(input, map, macroObj = {}) {
        const counter = {};
        const levels = {};
        let liquidjs;
        const macro = {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            counter: {},
            currentDate: `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, "0")}${new Date()
                .getDate()
                .toString()
                .padStart(2, "0")}`,
            sequence: function sequence(value) {
                if (macro.counter[value] === undefined) {
                    macro.counter[value] = 1;
                }
                else {
                    macro.counter[value] += 1;
                }
                return {
                    val: macro.counter[value],
                };
            },
            json: function json(value) {
                return {
                    val: JSON.parse(value),
                };
            },
            length: function length(value) {
                return {
                    val: value.length,
                };
            },
            map: function (value, property) {
                return {
                    val: value.map((item) => item[property]),
                };
            },
            sum: function (value, property, dec) {
                let sum = 0;
                value.forEach((item) => {
                    sum += item[property];
                });
                return {
                    val: sum.toFixed(dec === undefined ? 0 : dec),
                };
            },
            random: function random() {
                return {
                    val: Math.floor(1000 + Math.random() * 10000),
                };
            },
            truncate: function truncate(value, maxChars) {
                if (Array.isArray(value)) {
                    value = value.map((str) => str.substring(0, maxChars));
                }
                else {
                    value = `${value}`.substring(0, maxChars);
                }
                return {
                    val: value,
                };
            },
        };
        const LIQUID_FILTERS = {
            hl_root: (value, depth = 0) => {
                if (counter[value] === undefined) {
                    counter[value] = 0;
                }
                counter[value] += 1;
                levels[value][depth] = counter[value];
                return counter[value];
            },
            hl_parent: (value, depth) => {
                if (levels[value][depth] === undefined) {
                    return 1;
                }
                return levels[value][depth];
            },
            sequence: (value) => {
                if (counter[value] === undefined) {
                    counter[value] = 1;
                }
                else {
                    counter[value] += 1;
                }
                return counter[value];
            },
            sum_array: (value) => {
                if (typeof value === "undefined")
                    return 0;
                let sum = 0;
                value.forEach((item) => {
                    sum += item;
                });
                return sum;
            },
            in_loop: (value) => {
                return LIQUID_FILTERS.json_stringify(value);
            },
            json_stringify: (value) => {
                return JSON.stringify(value);
            },
            json_parse: (value) => {
                if (typeof value === "undefined")
                    return "";
                return JSON.parse(value);
            },
            truncate: (value, maxChars) => {
                if (typeof value === "undefined")
                    return "";
                if (Array.isArray(value)) {
                    return value.map((str) => {
                        if (typeof str === "undefined")
                            return "";
                        return str.substring(0, maxChars);
                    });
                }
                return `${value}`.substring(0, maxChars);
            },
            random: (_val, maxLength = 4) => {
                const bytes = Math.ceil(maxLength / 2);
                const buffer = crypto.randomBytes(bytes);
                const hex = buffer.toString("hex");
                return parseInt(hex, 16)
                    .toString()
                    .substring(0, maxLength);
            },
            edi_date: (val, length = "long") => {
                const date = !isEmpty(val) ? new Date(val) : new Date();
                const ediDate = `${date.getUTCFullYear()}${(date.getUTCMonth() + 1).toString().padStart(2, "0")}${date
                    .getUTCDate()
                    .toString()
                    .padStart(2, "0")}`;
                if (length !== "long") {
                    return ediDate.substring(2, ediDate.length);
                }
                return ediDate;
            },
            edi_time: (val) => {
                const date = !isEmpty(val) ? new Date(val) : new Date();
                return `${date
                    .getUTCHours()
                    .toString()
                    .padStart(2, "0")}${date
                    .getUTCMinutes()
                    .toString()
                    .padStart(2, "0")}`;
            },
        };
        const resolveKey = function resolveKey(key) {
            if (typeof liquidjs !== "undefined") {
                const result = liquidjs.parseAndRenderSync(key, { input });
                return key.indexOf("in_loop }}") > -1 ? JSON.parse(result) : result;
            }
            else {
                const clean = /(^(`\${)*(input|macro)\[.*(}`)*$)/g;
                if (clean.test(key)) {
                    // eslint-disable-next-line no-eval
                    const result = eval(key);
                    return result === undefined ? "" : result;
                }
                else {
                    return key;
                }
            }
        };
        const resolveLoop = function resolveLoop(lp, tx) {
            const start = lp[0];
            const length = parseFloat(resolveKey(start.loopLength));
            for (let i = 0; i < length; i += 1) {
                lp.forEach((segment) => {
                    const elements = [];
                    for (const segElement of segment.elements) {
                        const resolved = resolveKey(segElement);
                        if (Array.isArray(resolved)) {
                            elements.push(resolved[i]);
                        }
                        else {
                            elements.push(resolved);
                        }
                    }
                    tx.addSegment(segment.tag, elements);
                });
            }
        };
        if (map !== undefined) {
            if (map.header === undefined || map.segments === undefined) {
                macroObj = map;
                map = undefined;
            }
        }
        map = map === undefined ? this._map : map;
        if (this.txEngine === "liquidjs") {
            const engine = new Liquid({ strictFilters: true });
            for (const [name, func] of Object.entries(LIQUID_FILTERS)) {
                engine.registerFilter(name, func);
            }
            if (typeof macroObj === "object") {
                for (const [name, func] of Object.entries(macroObj)) {
                    if (typeof name === "string" && typeof func === "function") {
                        engine.registerFilter(name, func);
                    }
                }
            }
            liquidjs = engine;
        }
        else {
            Object.assign(macro, macroObj);
        }
        const transaction = this._transaction === undefined
            ? new X12Transaction()
            : this._transaction;
        const header = [];
        let looper = [];
        let loop = false;
        for (const headerElement of map.header) {
            header.push(resolveKey(headerElement));
        }
        transaction.setHeader(header);
        for (const segment of map.segments) {
            const elements = [];
            if (segment.loopStart) {
                looper.push(segment);
                loop = true;
            }
            else if (loop) {
                looper.push(segment);
            }
            if (!loop) {
                for (const segElement of segment.elements) {
                    elements.push(resolveKey(segElement));
                }
                transaction.addSegment(segment.tag, elements);
            }
            if (segment.loopEnd) {
                resolveLoop(looper, transaction);
                looper = [];
                loop = false;
            }
        }
        this._transaction = transaction;
        return transaction;
    }
    /**
     * @private
     * @description Default helper function describing the parameters for other helpers.
     * @param {string} key - The current key being set by the mapper.
     * @param {string} value - The current value as resolved by the query engine.
     * @param {string} [query] - The current query as used by the query engine.
     * @param {Function} [callback] - A callback function for signalling back from the helper function.
     * @returns {string} The value as resolved by the query engine; custom helpers may modify this value further.
     */
    _helper(key, value, query, callback) {
        if (callback !== undefined) {
            callback(key, value, query);
        }
        return value;
    }
}
