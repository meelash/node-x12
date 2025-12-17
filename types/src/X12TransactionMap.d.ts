import { X12QueryMode } from "./X12QueryEngine.js";
import { X12Transaction } from "./X12Transaction.js";
import { TxEngine } from "./X12SerializationOptions.js";
export declare class X12TransactionMap {
    /**
     * @description Factory for mapping transaction set data to javascript object map.
     * @param {object} map - The javascript object containing keys and querys to resolve.
     * @param {X12Transaction} [transaction] - A transaction set to map.
     * @param {Function|'liquidjs'|'internal'|'strict'|'loose'} [helper] - A helper function which will be executed on every resolved query value, a macro engine, or mode.
     * @param {'liquidjs'|'internal'|'strict'|'loose'} [txEngine] - A macro engine to use; either 'internal' or 'liquidjs'; defaults to internal for backwords compatibility, or the mode.
     * @param {'strict'|'loose'} [mode='strict'] - The mode for transforming, passed to the query engine, and defaults to 'strict'; may be set to 'loose' for new behavior with missing elements in the dom.
     */
    constructor(map: any, transaction?: X12Transaction, mode?: X12QueryMode);
    constructor(map: any, transaction?: X12Transaction, txEngine?: TxEngine);
    constructor(map: any, transaction?: X12Transaction, txEngine?: TxEngine, mode?: X12QueryMode);
    constructor(map: any, transaction?: X12Transaction, helper?: Function, mode?: X12QueryMode);
    constructor(map: any, transaction?: X12Transaction, helper?: Function, txEngine?: TxEngine);
    constructor(map: any, transaction?: X12Transaction, helper?: Function, txEngine?: TxEngine, mode?: X12QueryMode);
    protected _map: any;
    protected _transaction: X12Transaction;
    protected _object: any;
    protected _mode: X12QueryMode;
    helper: Function;
    txEngine: TxEngine;
    /**
     * @description Set the transaction set to map and optionally a helper function.
     * @param {X12Transaction} transaction - A transaction set to map.
     * @param {Function} helper - A helper function which will be executed on every resolved query value.
     */
    setTransaction(transaction: X12Transaction, helper?: Function): void;
    /**
     * @description Set the transaction set to map and optionally a helper function.
     * @returns {X12Transaction} The transaction from this instance.
     */
    getTransaction(): X12Transaction;
    /**
     * @description Map data from the transaction set to a javascript object.
     * @param {object} [map] - The javascript object containing keys and querys to resolve.
     * @param {Function} [callback] - A callback function which will be passed to the helper function.
     * @returns {object|object[]} The transaction set mapped to an object or an array of objects.
     */
    toObject(map?: any, callback?: Function): any;
    /**
     * @description Map data from a javascript object to the transaction set.
     * @param {object} input - The input object to create the transaction from.
     * @param {object} [map] - The map to associate values from the input to the transaction, or a macro object.
     * @param {object} [macroObj={}] - A macro object to add or override methods for the macro directive; properties 'header' and 'segments' are reserved words.
     * @returns {X12Transaction} The transaction created from the object values.
     */
    fromObject(input: any, map?: any, macroObj?: any): X12Transaction;
    /**
     * @private
     * @description Default helper function describing the parameters for other helpers.
     * @param {string} key - The current key being set by the mapper.
     * @param {string} value - The current value as resolved by the query engine.
     * @param {string} [query] - The current query as used by the query engine.
     * @param {Function} [callback] - A callback function for signalling back from the helper function.
     * @returns {string} The value as resolved by the query engine; custom helpers may modify this value further.
     */
    private _helper;
}
