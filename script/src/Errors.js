"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuerySyntaxError = exports.ParserError = exports.GeneratorError = exports.ArgumentNullError = void 0;
class ArgumentNullError extends Error {
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
exports.ArgumentNullError = ArgumentNullError;
class GeneratorError extends Error {
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
exports.GeneratorError = GeneratorError;
class ParserError extends Error {
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
exports.ParserError = ParserError;
class QuerySyntaxError extends Error {
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
exports.QuerySyntaxError = QuerySyntaxError;
