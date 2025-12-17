import * as dntShim from "../_dnt.test_shims.js";
"use strict";
import { describe, it } from "../deps/deno.land/x/deno_mocha@0.3.0/mod.js";
import { X12Parser } from "../mod.js";
describe("X12Formatting", () => {
    it("should replicate the source data unless changes are made", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new X12Parser(true);
        const interchange = parser.parse(edi);
        const edi2 = interchange.toString();
        if (edi !== edi2) {
            throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`);
        }
    });
    it("should replicate the source data for a fat interchange unless changes are made", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850_fat.edi");
        const parser = new X12Parser(true);
        const interchange = parser.parse(edi);
        const options = {
            format: true,
            endOfLine: "\n",
        };
        const edi2 = interchange.toString(options);
        if (edi !== edi2) {
            throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`);
        }
    });
});
