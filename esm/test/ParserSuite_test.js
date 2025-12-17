// deno-lint-ignore-file no-explicit-any
import * as dntShim from "../_dnt.test_shims.js";
"use strict";
import { describe, it } from "../deps/deno.land/x/deno_mocha@0.3.0/mod.js";
import { X12Parser } from "../mod.js";
import fs from "fs";
describe("X12Parser", () => {
    it("should parse a valid X12 document without throwing an error", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new X12Parser();
        parser.parse(edi);
    });
    it("should parse a fat X12 document without throwing an error", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850_fat.edi");
        const parser = new X12Parser(true);
        parser.parse(edi);
    });
    it("should parse and reconstruct a valid X12 stream without throwing an error", async () => {
        return await new Promise((resolve, reject) => {
            const ediStream = fs.createReadStream("test/test-data/850.edi"); // TODO: Replicate utf8 encoding mode
            const parser = new X12Parser();
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
    it("should produce accurate line numbers for files with line breaks", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850_3.edi");
        const parser = new X12Parser();
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
    it("should throw an ArgumentNullError", () => {
        const parser = new X12Parser();
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
    it("should throw an ParserError", () => {
        const parser = new X12Parser(true);
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
    it("should find mismatched elementDelimiter", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new X12Parser(true);
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
