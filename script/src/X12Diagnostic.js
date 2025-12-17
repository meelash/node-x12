"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X12Diagnostic = exports.X12DiagnosticLevel = void 0;
const Positioning_js_1 = require("./Positioning.js");
var X12DiagnosticLevel;
(function (X12DiagnosticLevel) {
    X12DiagnosticLevel[X12DiagnosticLevel["Info"] = 0] = "Info";
    X12DiagnosticLevel[X12DiagnosticLevel["Warning"] = 1] = "Warning";
    X12DiagnosticLevel[X12DiagnosticLevel["Error"] = 2] = "Error";
})(X12DiagnosticLevel = exports.X12DiagnosticLevel || (exports.X12DiagnosticLevel = {}));
class X12Diagnostic {
    constructor(level, message, range) {
        Object.defineProperty(this, "level", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "message", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "range", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.level = level === undefined ? X12DiagnosticLevel.Error : level;
        this.message = message === undefined ? "" : message;
        this.range = range ?? new Positioning_js_1.Range();
    }
}
exports.X12Diagnostic = X12Diagnostic;
