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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// deno-lint-ignore-file no-explicit-any
const dntShim = __importStar(require("../_dnt.test_shims.js"));
"use strict";
const mod_js_1 = require("../deps/deno.land/x/deno_mocha@0.3.0/mod.js");
const mod_js_2 = require("../mod.js");
const fs_1 = __importDefault(require("fs"));
(0, mod_js_1.describe)("X12Parser", () => {
    (0, mod_js_1.it)("should parse a valid X12 document without throwing an error", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new mod_js_2.X12Parser();
        parser.parse(edi);
    });
    (0, mod_js_1.it)("should parse a fat X12 document without throwing an error", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850_fat.edi");
        const parser = new mod_js_2.X12Parser(true);
        parser.parse(edi);
    });
    (0, mod_js_1.it)("should parse and reconstruct a valid X12 stream without throwing an error", async () => {
        return await new Promise((resolve, reject) => {
            const ediStream = fs_1.default.createReadStream("test/test-data/850.edi"); // TODO: Replicate utf8 encoding mode
            const parser = new mod_js_2.X12Parser();
            const segments = [];
            ediStream.on("error", (error) => {
                reject(error);
            });
            parser.on("error", (error) => {
                reject(error);
            });
            ediStream
                .pipe(parser)
                .on("data", (data) => {
                segments.push(data);
            })
                .on("end", () => {
                const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
                const interchange = parser.getInterchangeFromSegments(segments);
                if (interchange.toString() !== edi) {
                    reject(new Error("Expected parsed EDI stream to match raw EDI document."));
                }
                resolve();
            });
        });
    });
    (0, mod_js_1.it)("should produce accurate line numbers for files with line breaks", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850_3.edi");
        const parser = new mod_js_2.X12Parser();
        const interchange = parser.parse(edi);
        const segments = [].concat([
            interchange.header,
            interchange.functionalGroups[0].header,
            interchange.functionalGroups[0].transactions[0].header,
        ], interchange.functionalGroups[0].transactions[0].segments, [
            interchange.functionalGroups[0].transactions[0].trailer,
            interchange.functionalGroups[0].trailer,
            interchange.trailer,
        ]);
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            if (i !== segment.range.start.line) {
                throw new Error(`Segment line number incorrect. Expected ${i}, found ${segment.range.start.line}.`);
            }
        }
    });
    (0, mod_js_1.it)("should throw an ArgumentNullError", () => {
        const parser = new mod_js_2.X12Parser();
        let error;
        try {
            parser.parse(undefined);
        }
        catch (err) {
            error = err;
        }
        if (error.name !== "ArgumentNullError") {
            throw new Error("ArgumentNullError expected when first argument to X12Parser.parse() is undefined.");
        }
    });
    (0, mod_js_1.it)("should throw an ParserError", () => {
        const parser = new mod_js_2.X12Parser(true);
        let error;
        try {
            parser.parse("");
        }
        catch (err) {
            error = err;
        }
        if (error.name !== "ParserError") {
            throw new Error("ParserError expected when document length is too short and parser is strict.");
        }
    });
    (0, mod_js_1.it)("should find mismatched elementDelimiter", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new mod_js_2.X12Parser(true);
        let error;
        try {
            parser.parse(edi, { elementDelimiter: "+" });
        }
        catch (err) {
            error = err;
        }
        if (error.name !== "ParserError") {
            throw new Error("ParserError expected when elementDelimiter in document does not match and parser is strict.");
        }
    });
});
