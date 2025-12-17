"use strict";
export class ArgumentNullError extends Error {
    constructor(argumentName) {
        super(`The argument, '${argumentName}', cannot be null.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "ArgumentNullError";
    }
}
export class GeneratorError extends Error {
    constructor(message) {
        super(message);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "GeneratorError";
    }
}
export class ParserError extends Error {
    constructor(message) {
        super(message);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "ParserError";
    }
}
export class QuerySyntaxError extends Error {
    constructor(message) {
        super(message);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "QuerySyntaxError";
    }
}
