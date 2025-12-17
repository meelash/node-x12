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
const assert = __importStar(require("assert"));
const mod_js_2 = require("../mod.js");
const index_js_1 = require("../src/X12ValidationEngine/index.js");
const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
const edi2 = dntShim.Deno.readTextFileSync("test/test-data/856.edi");
const validationRule850 = dntShim.Deno.readTextFileSync("test/test-data/850_validation.rule.json");
const validationRuleSimple850 = dntShim.Deno.readTextFileSync("test/test-data/850_validation_simple.rule.json");
const validationRuleNoHeader850 = dntShim.Deno.readTextFileSync("test/test-data/850_validation_no_headers.rule.json");
(0, mod_js_1.describe)("X12ValidationEngine", () => {
    (0, mod_js_1.it)("should create validation rule", () => {
        const rule = new index_js_1.X12ValidationRule({ engine: /ab+c/gu });
        assert.deepStrictEqual(rule instanceof index_js_1.X12ValidationRule, true);
    });
    (0, mod_js_1.it)("should create validation rule from JSON", () => {
        const ruleJson = JSON.parse(validationRule850);
        const rule = new index_js_1.X12InterchangeRule(ruleJson);
        const stringJson = JSON.stringify(rule);
        assert.deepStrictEqual(JSON.parse(stringJson), ruleJson);
        // fs.writeFileSync('test/test-data/850_validation.rule.json', JSON.stringify(rule, null, 2))
    });
    (0, mod_js_1.it)("should create validation rule regardless of header or trailer", () => {
        const ruleJson = JSON.parse(validationRuleNoHeader850);
        const rule = new index_js_1.X12InterchangeRule(ruleJson);
        assert.deepStrictEqual(rule instanceof index_js_1.X12InterchangeRule, true);
        // fs.writeFileSync('test/test-data/850_validation.rule.json', JSON.stringify(rule, null, 2))
    });
    (0, mod_js_1.it)("should validate X12 document", () => {
        const ruleJson = JSON.parse(validationRuleSimple850);
        const parser = new mod_js_2.X12Parser();
        const interchange = parser.parse(edi);
        const validator = new mod_js_2.X12ValidationEngine();
        let rule = new index_js_1.X12InterchangeRule(ruleJson);
        let report = validator.assert(interchange, rule);
        assert.strictEqual(report, true);
        rule = new index_js_1.X12GroupRule(ruleJson.group);
        report = validator.assert(interchange.functionalGroups[0], rule);
        assert.strictEqual(report, true);
        rule = new index_js_1.X12TransactionRule(ruleJson.group.transaction);
        report = validator.assert(interchange.functionalGroups[0].transactions[0], rule);
        assert.strictEqual(report, true);
        rule = new index_js_1.X12SegmentRule(ruleJson.group.transaction.segments[0]);
        report = validator.assert(interchange.functionalGroups[0].transactions[0].segments[0], rule);
        assert.strictEqual(report, true);
        rule = new index_js_1.X12ElementRule(ruleJson.group.transaction.segments[0].elements[0]);
        report = validator.assert(interchange.functionalGroups[0].transactions[0].segments[0].elements[0], rule);
        assert.strictEqual(report, true);
    });
    (0, mod_js_1.it)("should invalidate X12 document", () => {
        const ruleJson = JSON.parse(validationRuleSimple850);
        const parser = new mod_js_2.X12Parser();
        const interchange = parser.parse(edi2);
        const rule = new index_js_1.X12InterchangeRule(ruleJson);
        const validator = new mod_js_2.X12ValidationEngine({
            throwError: true,
            acknowledgement: {
                isa: new mod_js_2.X12Segment("ISA").setElements([
                    "00",
                    "",
                    "00",
                    "",
                    "ZZ",
                    "TEST1",
                    "ZZ",
                    "TEST2",
                    "200731",
                    "0430",
                    "U",
                    "00401",
                    "1",
                    "1",
                    "P",
                    ">",
                ]),
                gs: new mod_js_2.X12Segment("GS").setElements([
                    "FA",
                    "TEST1",
                    "TEST2",
                    "20200731",
                    "0430",
                    "1",
                    "X",
                    "004010",
                ]),
            },
        });
        try {
            validator.assert(interchange, rule);
        }
        catch (error) {
            const { report } = error;
            assert.strictEqual(typeof report, "object");
        }
        const acknowledgement = validator.acknowledge();
        assert.strictEqual(acknowledgement instanceof mod_js_2.X12Interchange, true);
    });
    (0, mod_js_1.it)("should resolve error codes", () => {
        const errorTypes = ["element", "segment", "transaction", "group"];
        const ackCodes = "AMPRWXE";
        for (const errorType of errorTypes) {
            for (let i = 1, j = 1; i <= j; i += 1) {
                const result = (0, mod_js_2.errorLookup)(errorType, j.toString());
                assert.strictEqual(typeof result, "object");
                if (parseFloat(result.code) > i - 1) {
                    j += 1;
                }
            }
        }
        for (const char of ackCodes) {
            const result = mod_js_2.X12ValidationErrorCode.acknowledgement("group", char);
            assert.strictEqual(typeof result, "object");
        }
    });
});
