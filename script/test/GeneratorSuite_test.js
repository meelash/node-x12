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
(0, mod_js_1.describe)("X12Generator", () => {
    (0, mod_js_1.it)("should create X12Generator", () => {
        const generator = new mod_js_2.X12Generator();
        const notation = generator.getJSEDINotation();
        const options = generator.getOptions();
        generator.setJSEDINotation(new mod_js_2.JSEDINotation());
        generator.setOptions({});
        if (!(notation instanceof mod_js_2.JSEDINotation) || typeof options !== "object") {
            throw new Error("Could not correctly create instance of X12Generator.");
        }
    });
    (0, mod_js_1.it)("should replicate the source data unless changes are made", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new mod_js_2.X12Parser(true);
        const notation = parser.parse(edi)
            .toJSEDINotation();
        const generator = new mod_js_2.X12Generator(notation);
        const edi2 = generator.toString();
        if (edi !== edi2) {
            throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`);
        }
    });
    (0, mod_js_1.it)("should replicate the source data to and from JSON unless changes are made", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new mod_js_2.X12Parser(true);
        const interchange = parser.parse(edi);
        const json = JSON.stringify(interchange);
        const generator = new mod_js_2.X12Generator(JSON.parse(json));
        const edi2 = generator.toString();
        if (edi !== edi2) {
            throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`);
        }
    });
    (0, mod_js_1.it)("should not generate 271 with 4 ST elements using default segment headers", () => {
        const fileEdi = dntShim.Deno.readTextFileSync("test/test-data/271.edi").split("~");
        const i = new mod_js_2.X12Interchange();
        i.setHeader(fileEdi[0].split("*").slice(1));
        const fg = i.addFunctionalGroup();
        fg.setHeader(fileEdi[1].split("*").slice(1));
        const t = fg.addTransaction();
        let error;
        try {
            t.setHeader([...fileEdi[2].split("*").slice(1), "N"]);
        }
        catch (err) {
            error = err.message;
        }
        if (error !==
            'Segment "ST" with 4 elements does not meet the required count of min 2 or max 3.') {
            throw new Error("271 with 4 ST elements parsing succeed which should not happen");
        }
    });
    (0, mod_js_1.it)("should generate 271 with 3 ST elements using custom segment headers", () => {
        const fileEdi = dntShim.Deno.readTextFileSync("test/test-data/271.edi").split("~");
        const i = new mod_js_2.X12Interchange({
            segmentHeaders: [
                mod_js_2.ISASegmentHeader,
                mod_js_2.GSSegmentHeader,
                {
                    tag: "ST",
                    layout: {
                        ST01: 3,
                        ST02: 9,
                        ST02_MIN: 4,
                        ST03: 35,
                        ST03_MIN: 1,
                        COUNT: 3,
                        PADDING: false,
                    },
                },
            ],
        });
        i.setHeader(fileEdi[0].split("*").slice(1));
        const fg = i.addFunctionalGroup();
        fg.setHeader(fileEdi[1].split("*").slice(1));
        const t = fg.addTransaction();
        t.setHeader(fileEdi[2].split("*").slice(1));
    });
    (0, mod_js_1.it)("should validate custom segment headers", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/271.edi");
        const options = {
            segmentHeaders: [
                mod_js_2.ISASegmentHeader,
                mod_js_2.GSSegmentHeader,
                {
                    tag: "ST",
                    layout: {
                        ST01: 3,
                        ST02: 9,
                        ST02_MIN: 4,
                        ST03: 35,
                        ST03_MIN: 1,
                        COUNT: 3,
                        PADDING: false,
                    },
                },
                {
                    tag: "HL",
                    layout: {
                        HL01: 3,
                        HL02: 9,
                        HL02_MIN: 4,
                        HL03: 35,
                        HL03_MIN: 1,
                        COUNT: 3,
                        PADDING: false,
                    },
                },
            ],
        };
        const parser = new mod_js_2.X12Parser(true);
        const interchange = parser.parse(edi);
        const json = JSON.stringify(interchange);
        let error;
        try {
            const generator = new mod_js_2.X12Generator(JSON.parse(json), options);
            generator.toString();
        }
        catch (err) {
            error = err.message;
        }
        if (error !==
            'Segment "HL" with 4 elements does not meet the required count of 3.') {
            throw new Error("271 with custom segment headers parsing succeed which should not happen");
        }
    });
});
