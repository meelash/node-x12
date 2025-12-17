"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mod_js_1 = require("../deps/deno.land/x/deno_mocha@0.3.0/mod.js");
const Errors_js_1 = require("../src/Errors.js");
const X12Diagnostic_js_1 = require("../src/X12Diagnostic.js");
const core = __importStar(require("../mod.js"));
(0, mod_js_1.describe)("X12Core", () => {
    (0, mod_js_1.it)("should export members", () => {
        if (!Object.keys(core).includes("X12Parser")) {
            throw new Error("X12 core is missing X12Parser.");
        }
    });
    (0, mod_js_1.it)("should create ArgumentNullError", () => {
        const error = new Errors_js_1.ArgumentNullError("test");
        if (error.message !== "The argument, 'test', cannot be null.") {
            throw new Error("ArgumentNullError did not return the correct message.");
        }
    });
    (0, mod_js_1.it)("should create GeneratorError", () => {
        const error = new Errors_js_1.GeneratorError("test");
        if (error.message !== "test") {
            throw new Error("GeneratorError did not return the correct message.");
        }
    });
    (0, mod_js_1.it)("should create ParserError", () => {
        const error = new Errors_js_1.ParserError("test");
        if (error.message !== "test") {
            throw new Error("ParserError did not return the correct message.");
        }
    });
    (0, mod_js_1.it)("should create QuerySyntaxError", () => {
        const error = new Errors_js_1.QuerySyntaxError("test");
        if (error.message !== "test") {
            throw new Error("QuerySyntaxError did not return the correct message.");
        }
    });
    (0, mod_js_1.it)("should create X12Diagnostic", () => {
        const diag = new X12Diagnostic_js_1.X12Diagnostic();
        if (!(diag instanceof X12Diagnostic_js_1.X12Diagnostic)) {
            throw new Error("Could not create X12Diagnostic.");
        }
    });
});
