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
// deno-lint-ignore-file no-explicit-any
const dntShim = __importStar(require("../_dnt.test_shims.js"));
"use strict";
const mod_js_1 = require("../deps/deno.land/x/deno_mocha@0.3.0/mod.js");
const mod_js_2 = require("../mod.js");
const assert = __importStar(require("assert"));
const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
const edi855 = dntShim.Deno.readTextFileSync("test/test-data/855.edi");
const mapJson = dntShim.Deno.readTextFileSync("test/test-data/850_map.json");
const resultJson = dntShim.Deno.readTextFileSync("test/test-data/850_map_result.json");
const transactionJson = dntShim.Deno.readTextFileSync("test/test-data/Transaction_map.json");
const transactionJsonLiquid = dntShim.Deno.readTextFileSync("test/test-data/Transaction_map_liquidjs.json");
const transactionData = dntShim.Deno.readTextFileSync("test/test-data/Transaction_data.json");
(0, mod_js_1.describe)("X12Mapping", () => {
    (0, mod_js_1.it)("should map transaction to data", () => {
        const parser = new mod_js_2.X12Parser();
        const interchange = parser.parse(edi);
        const transaction = interchange.functionalGroups[0].transactions[0];
        const mapper = new mod_js_2.X12TransactionMap(JSON.parse(mapJson), transaction);
        assert.deepStrictEqual(mapper.toObject(), JSON.parse(resultJson));
    });
    (0, mod_js_1.it)("should map data to transaction with custom macro", () => {
        const transaction = new mod_js_2.X12Transaction();
        const mapper = new mod_js_2.X12TransactionMap(JSON.parse(transactionJson), transaction);
        const data = JSON.parse(transactionData);
        const result = mapper.fromObject(data, {
            toFixed: function toFixed(key, places) {
                return {
                    val: parseFloat(key).toFixed(places),
                };
            },
        });
        if (!(result instanceof mod_js_2.X12Transaction)) {
            throw new Error("An error occured when mapping an object to a transaction.");
        }
    });
    (0, mod_js_1.it)("should map data to transaction with LiquidJS", () => {
        const transaction = new mod_js_2.X12Transaction();
        const mapper = new mod_js_2.X12TransactionMap(JSON.parse(transactionJsonLiquid), transaction, "liquidjs");
        const data = JSON.parse(transactionData);
        const result = mapper.fromObject(data, {
            to_fixed: (value, places) => parseFloat(value).toFixed(places),
        });
        if (!(result instanceof mod_js_2.X12Transaction)) {
            throw new Error("An error occured when mapping an object to a transaction.");
        }
    });
    (0, mod_js_1.it)("should map empty data when element missing from qualified segment", () => {
        // Addresses issue https://github.com/ahuggins-nhs/node-x12/issues/23
        const mapObject = { author: 'FOREACH(PO1)=>PO109:PO103["UN"]' };
        const parser = new mod_js_2.X12Parser();
        const interchange = parser.parse(edi855);
        const transaction = interchange.functionalGroups[0].transactions[0];
        const mapperLoose = new mod_js_2.X12TransactionMap(mapObject, transaction, "loose");
        const mapperStrict = new mod_js_2.X12TransactionMap(mapObject, transaction, "strict");
        const resultLoose = mapperLoose.toObject();
        const resultStrict = mapperStrict.toObject();
        assert.strictEqual(Array.isArray(resultLoose), true);
        assert.strictEqual(Array.isArray(resultStrict), true);
        assert.strictEqual(resultLoose.length, 4);
        assert.strictEqual(resultStrict.length, 3);
        assert.deepStrictEqual(resultLoose[2], { author: "" });
        assert.deepStrictEqual(resultStrict[2], { author: "NOT APPLICABLE" });
    });
});
