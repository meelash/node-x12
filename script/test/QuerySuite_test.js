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
const dntShim = __importStar(require("../_dnt.test_shims.js"));
"use strict";
const mod_js_1 = require("../deps/deno.land/x/deno_mocha@0.3.0/mod.js");
const mod_js_2 = require("../mod.js");
(0, mod_js_1.describe)("X12QueryEngine", () => {
    (0, mod_js_1.it)("should handle basic element references", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new mod_js_2.X12Parser(true);
        const engine = new mod_js_2.X12QueryEngine(parser);
        const results = engine.query(edi, "REF02");
        if (results.length !== 2) {
            throw new Error("Expected two matching elements for REF02.");
        }
    });
    (0, mod_js_1.it)("should handle qualified element references", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new mod_js_2.X12Parser(true);
        const engine = new mod_js_2.X12QueryEngine(parser);
        const results = engine.query(edi, 'REF02:REF01["DP"]');
        if (results.length !== 1) {
            throw new Error('Expected one matching element for REF02:REF01["DP"].');
        }
        else if (results[0].value !== "038") {
            throw new Error('Expected REF02 to be "038".');
        }
    });
    (0, mod_js_1.it)("should handle segment path element references", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new mod_js_2.X12Parser(true);
        const engine = new mod_js_2.X12QueryEngine(parser);
        const results = engine.query(edi, 'PO1-PID05:PID01["F"]');
        if (results.length !== 6) {
            throw new Error(`Expected six matching elements for PO1-PID05:PID01["F"]; received ${results.length}.`);
        }
    });
    (0, mod_js_1.it)("should handle hyphenated qualifiers values", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new mod_js_2.X12Parser(true);
        const engine = new mod_js_2.X12QueryEngine(parser);
        const results = engine.query(edi, 'PO102:PO107["065374-118"]');
        console.log(results.length);
        if (results.length !== 1) {
            throw new Error('Expected one matching elements for PO102:PO107["065374-118"].');
        }
    });
    (0, mod_js_1.it)("should handle HL path element references", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/856.edi");
        const parser = new mod_js_2.X12Parser(true);
        const engine = new mod_js_2.X12QueryEngine(parser);
        const results = engine.query(edi, "HL+S+O+I-LIN03");
        if (results[0].value !== "87787D" || results[1].value !== "99887D") {
            throw new Error("Expected two matching elements for HL+S+O+I-LIN03.");
        }
    });
    (0, mod_js_1.it)("should handle HL paths where HL03 is a number", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/271.edi");
        const parser = new mod_js_2.X12Parser(true);
        const engine = new mod_js_2.X12QueryEngine(parser);
        const results = engine.query(edi, "HL+20+21+22-NM101");
        if (results.length !== 2) {
            throw new Error("Expected two matching elements for HL+20+21+22-NM101.");
        }
    });
    (0, mod_js_1.it)("should handle FOREACH macro references", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new mod_js_2.X12Parser(true);
        const engine = new mod_js_2.X12QueryEngine(parser);
        const result = engine.querySingle(edi, 'FOREACH(PO1)=>PID05:PID01["F"]');
        if (result?.values.length !== 6) {
            throw new Error(`Expected six matching elements for FOREACH(PO1)=>PID05:PID01["F"]; received ${result?.values.length}.`);
        }
    });
    (0, mod_js_1.it)("should handle CONCAT macro references", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new mod_js_2.X12Parser(true);
        const engine = new mod_js_2.X12QueryEngine(parser);
        const result = engine.querySingle(edi, 'CONCAT(REF02:REF01["DP"], & )=>REF02:REF01["PS"]');
        if (result?.value !== "038 & R") {
            throw new Error(`Expected '038 & R'; received '${result?.value}'.`);
        }
    });
    (0, mod_js_1.it)("should return valid range information for segments and elements", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new mod_js_2.X12Parser(true);
        const engine = new mod_js_2.X12QueryEngine(parser);
        const result = engine.querySingle(edi, "BEG03");
        if (result?.segment?.range.start.line !== 3) {
            throw new Error(`Start line for segment is incorrect; found ${result?.segment?.range.start.line}, expected 3.`);
        }
        if (result.segment.range.start.character !== 0) {
            throw new Error(`Start char for segment is incorrect; found ${result.segment.range.start.character}, expected 0.`);
        }
        if (result?.element?.range.start.line !== 3) {
            throw new Error(`Start line for element is incorrect; found ${result?.element?.range.start.line}, expected 3.`);
        }
        if (result.element.range.start.character !== 10) {
            throw new Error(`Start char for element is incorrect; found ${result.element.range.start.character}, expected 10.`);
        }
        if (result.segment.range.end.line !== 3) {
            throw new Error(`End line for segment is incorrect; found ${result.segment.range.end.line}, expected 3.`);
        }
        if (result.segment.range.end.character !== 41) {
            throw new Error(`End char for segment is incorrect; found ${result.segment.range.end.character}, expected 41.`);
        }
        if (result.element.range.end.line !== 3) {
            throw new Error(`End line for element is incorrect; found ${result.element.range.end.line}, expected 3.`);
        }
        if (result.element.range.end.character !== 20) {
            throw new Error(`End char for element is incorrect; found ${result.element.range.end.character}, expected 20.`);
        }
    });
    (0, mod_js_1.it)("should handle envelope queries", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new mod_js_2.X12Parser(true);
        const engine = new mod_js_2.X12QueryEngine(parser);
        const results = engine.query(edi, "ISA06");
        if (results.length === 1) {
            if (results[0]?.value?.trim() !== "4405197800") {
                throw new Error(`Expected 4405197800, found ${results[0].value}.`);
            }
        }
        else {
            throw new Error(`Expected exactly one result. Found ${results.length}.`);
        }
    });
    (0, mod_js_1.it)("should handle queries for files with line feed segment terminators", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850_2.edi");
        const parser = new mod_js_2.X12Parser(true);
        const engine = new mod_js_2.X12QueryEngine(parser);
        const result = engine.querySingle(edi, 'REF02:REF01["DP"]');
        if (result?.value?.trim() !== "038") {
            throw new Error(`Expected 038, found ${result?.value}.`);
        }
    });
    (0, mod_js_1.it)("should handle chained qualifiers", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new mod_js_2.X12Parser(true);
        const engine = new mod_js_2.X12QueryEngine(parser);
        const results = engine.query(edi, 'REF02:REF01["DP"]:BEG02["SA"]');
        if (results.length === 1) {
            if (results[0]?.value?.trim() !== "038") {
                throw new Error(`Expected 038, found ${results[0].value}.`);
            }
        }
        else {
            throw new Error(`Expected exactly one result. Found ${results.length}.`);
        }
    });
});
