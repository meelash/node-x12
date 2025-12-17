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
const JSEDINotation_js_1 = require("../src/JSEDINotation.js");
const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
(0, mod_js_1.describe)("X12ObjectModel", () => {
    (0, mod_js_1.it)("should create X12Interchange with string delimiters", () => {
        const interchange = new mod_js_2.X12Interchange("~", "*");
        if (interchange.elementDelimiter !== "*") {
            throw new Error("Instance of X12Interchange not successfully created.");
        }
    });
    (0, mod_js_1.it)("should create X12FatInterchange", () => {
        const parser = new mod_js_2.X12Parser();
        const interchange = parser.parse(edi);
        const fatInterchange = new mod_js_2.X12FatInterchange([interchange]);
        const str = fatInterchange.toString();
        const json = fatInterchange.toJSON();
        if (!Array.isArray(json) || typeof str !== "string") {
            throw new Error("Instance of X12FatInterchange not successfully created.");
        }
    });
    (0, mod_js_1.it)("should create X12Segment", () => {
        const segment = new mod_js_2.X12Segment();
        const noElement = segment.replaceElement("1", 1);
        const noInsert = segment.insertElement("1", 1);
        const noneToRemove = segment.removeElement(1);
        const defaultVal = segment.valueOf(1, "2");
        segment.setTag("WX");
        segment.addElement("1");
        segment.insertElement("2", 1);
        segment.removeElement(2);
        if (noElement !== null ||
            noInsert !== false ||
            typeof noneToRemove !== "boolean" ||
            defaultVal !== "2" ||
            segment.elements.length !== 1 ||
            segment.elements[0].value !== "2") {
            throw new Error("Instance of segment or methods did not execute as expected.");
        }
    });
    (0, mod_js_1.it)("should cast functional group to JSON", () => {
        const parser = new mod_js_2.X12Parser();
        const interchange = parser.parse(edi);
        const functionalGroup = interchange.functionalGroups[0];
        if (typeof functionalGroup.toJSON() !== "object") {
            throw new Error("Instance of X12FunctionalGroup not cast to JSON.");
        }
    });
    (0, mod_js_1.it)("should cast transaction set to JSON", () => {
        const parser = new mod_js_2.X12Parser();
        const interchange = parser.parse(edi);
        const functionalGroup = interchange.functionalGroups[0];
        const transaction = functionalGroup.transactions[0];
        if (typeof transaction.toJSON() !== "object") {
            throw new Error("Instance of X12FunctionalGroup not cast to JSON.");
        }
    });
    (0, mod_js_1.it)("should cast segment to JSON", () => {
        const parser = new mod_js_2.X12Parser();
        const interchange = parser.parse(edi);
        const functionalGroup = interchange.functionalGroups[0];
        const transaction = functionalGroup.transactions[0];
        const segment = transaction.segments[0];
        if (typeof segment.toJSON() !== "object") {
            throw new Error("Instance of X12FunctionalGroup not cast to JSON.");
        }
    });
    (0, mod_js_1.it)("should construct JSEDINotation objects", () => {
        const notation = new mod_js_2.JSEDINotation();
        const group = new JSEDINotation_js_1.JSEDIFunctionalGroup();
        const transaction = new JSEDINotation_js_1.JSEDITransaction();
        if (!(notation instanceof mod_js_2.JSEDINotation) ||
            !(group instanceof JSEDINotation_js_1.JSEDIFunctionalGroup) ||
            !(transaction instanceof JSEDINotation_js_1.JSEDITransaction)) {
            throw new Error("One or more JS EDI Notation objects could not be constructed.");
        }
    });
});
