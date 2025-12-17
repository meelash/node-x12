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
(0, mod_js_1.describe)("X12Formatting", () => {
    (0, mod_js_1.it)("should replicate the source data unless changes are made", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
        const parser = new mod_js_2.X12Parser(true);
        const interchange = parser.parse(edi);
        const edi2 = interchange.toString();
        if (edi !== edi2) {
            throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`);
        }
    });
    (0, mod_js_1.it)("should replicate the source data for a fat interchange unless changes are made", () => {
        const edi = dntShim.Deno.readTextFileSync("test/test-data/850_fat.edi");
        const parser = new mod_js_2.X12Parser(true);
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
