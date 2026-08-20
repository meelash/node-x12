import * as dntShim from "../_dnt.test_shims.js";
"use strict";
import { describe, it } from "../deps/deno.land/x/deno_mocha@0.3.0/mod.js";
import { X12Parser, X12QueryEngine } from "../mod.js";
describe("X12QueryEngine", () => {
    it("should handle basic element references", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new X12Parser(true);
        const engine = new X12QueryEngine(parser);
        const results = engine.query(edi, "REF02");
        if (results.length !== 2) {
            throw new Error("Expected two matching elements for REF02.");
        }
    });
    it("should handle qualified element references", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new X12Parser(true);
        const engine = new X12QueryEngine(parser);
        const results = engine.query(edi, 'REF02:REF01["DP"]');
        if (results.length !== 1) {
            throw new Error('Expected one matching element for REF02:REF01["DP"].');
        }
        else if (results[0].value !== "038") {
            throw new Error('Expected REF02 to be "038".');
        }
    });
    it("should handle segment path element references", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new X12Parser(true);
        const engine = new X12QueryEngine(parser);
        const results = engine.query(edi, 'PO1-PID05:PID01["F"]');
        if (results.length !== 6) {
            throw new Error(`Expected six matching elements for PO1-PID05:PID01["F"]; received ${results.length}.`);
        }
    });
    it("should scope a segment path to the innermost loop", () => {
        // 835.edi carries an OA adjustment on the claim (CAS*OA*109*-494.94) and one
        // on each service line (CAS*OA*100 and CAS*OA*45). All three qualify on
        // CAS01 === "OA", so only the CLP-SVC- path prefix can separate them.
        //
        // Note the result is the first service line alone: a multi-part path stops
        // qualifying at the second SVC and never sees a second CLP to restart from.
        // A single-part path such as PO1- re-qualifies on every loop.
        const edi = dntShim.Deno.readTextFileSync("test/test-data/835.edi");
        const parser = new X12Parser(true);
        const engine = new X12QueryEngine(parser);
        const results = engine.query(edi, 'CLP-SVC-CAS03:CAS01["OA"]');
        const values = results.map((result) => result.value);
        if (values.includes("-494.94")) {
            throw new Error(`Expected CLP-SVC-CAS03:CAS01["OA"] to exclude the claim-level adjustment; received ${values.join(", ")}.`);
        }
        else if (values.length !== 1 || values[0] !== "88.80") {
            throw new Error(`Expected the service line adjustment 88.80; received ${values.join(", ")}.`);
        }
    });
    it("should return every matching segment when there is no segment path", () => {
        // The same query without the path prefix reaches the claim-level adjustment
        // too; this is what makes the prefix in the test above load-bearing.
        const edi = dntShim.Deno.readTextFileSync("test/test-data/835.edi");
        const parser = new X12Parser(true);
        const engine = new X12QueryEngine(parser);
        const results = engine.query(edi, 'CAS03:CAS01["OA"]');
        if (results.length !== 3) {
            throw new Error(`Expected three matching elements for CAS03:CAS01["OA"]; received ${results.length}.`);
        }
    });
    it("should handle hyphenated qualifiers values", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new X12Parser(true);
        const engine = new X12QueryEngine(parser);
        const results = engine.query(edi, 'PO102:PO107["065374-118"]');
        console.log(results.length);
        if (results.length !== 1) {
            throw new Error('Expected one matching elements for PO102:PO107["065374-118"].');
        }
    });
    it("should handle HL path element references", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/856.edi");
        const parser = new X12Parser(true);
        const engine = new X12QueryEngine(parser);
        const results = engine.query(edi, "HL+S+O+I-LIN03");
        if (results[0].value !== "87787D" || results[1].value !== "99887D") {
            throw new Error("Expected two matching elements for HL+S+O+I-LIN03.");
        }
    });
    it("should handle HL paths where HL03 is a number", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/271.edi");
        const parser = new X12Parser(true);
        const engine = new X12QueryEngine(parser);
        const results = engine.query(edi, "HL+20+21+22-NM101");
        if (results.length !== 2) {
            throw new Error("Expected two matching elements for HL+20+21+22-NM101.");
        }
    });
    it("should handle FOREACH macro references", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new X12Parser(true);
        const engine = new X12QueryEngine(parser);
        const result = engine.querySingle(edi, 'FOREACH(PO1)=>PID05:PID01["F"]');
        if (result?.values.length !== 6) {
            throw new Error(`Expected six matching elements for FOREACH(PO1)=>PID05:PID01["F"]; received ${result?.values.length}.`);
        }
    });
    it("should handle CONCAT macro references", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new X12Parser(true);
        const engine = new X12QueryEngine(parser);
        const result = engine.querySingle(edi, 'CONCAT(REF02:REF01["DP"], & )=>REF02:REF01["PS"]');
        if (result?.value !== "038 & R") {
            throw new Error(`Expected '038 & R'; received '${result?.value}'.`);
        }
    });
    it("should return valid range information for segments and elements", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new X12Parser(true);
        const engine = new X12QueryEngine(parser);
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
    it("should handle envelope queries", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new X12Parser(true);
        const engine = new X12QueryEngine(parser);
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
    it("should handle queries for files with line feed segment terminators", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850_2.edi");
        const parser = new X12Parser(true);
        const engine = new X12QueryEngine(parser);
        const result = engine.querySingle(edi, 'REF02:REF01["DP"]');
        if (result?.value?.trim() !== "038") {
            throw new Error(`Expected 038, found ${result?.value}.`);
        }
    });
    it("should handle chained qualifiers", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new X12Parser(true);
        const engine = new X12QueryEngine(parser);
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
