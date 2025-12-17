"use strict";
export class JSEDINotation {
    constructor(header, options) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "header", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "functionalGroups", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.header = header === undefined ? new Array() : header;
        this.options = options === undefined ? {} : options;
        this.functionalGroups = new Array();
    }
    addFunctionalGroup(header) {
        const functionalGroup = new JSEDIFunctionalGroup(header);
        this.functionalGroups.push(functionalGroup);
        return functionalGroup;
    }
}
export class JSEDIFunctionalGroup {
    constructor(header) {
        Object.defineProperty(this, "header", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "transactions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.header = header === undefined ? new Array() : header;
        this.transactions = new Array();
    }
    addTransaction(header) {
        const transaction = new JSEDITransaction(header);
        this.transactions.push(transaction);
        return transaction;
    }
}
export class JSEDITransaction {
    constructor(header) {
        Object.defineProperty(this, "header", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "segments", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.header = header === undefined ? new Array() : header;
        this.segments = new Array();
    }
    addSegment(tag, elements) {
        const segment = new JSEDISegment(tag, elements);
        this.segments.push(segment);
        return segment;
    }
}
export class JSEDISegment {
    constructor(tag, elements) {
        Object.defineProperty(this, "tag", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "elements", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.tag = tag;
        this.elements = elements;
    }
}
