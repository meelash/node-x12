"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X12ValidationEngine = exports.ValidationEngineError = void 0;
const X12Segment_js_1 = require("../X12Segment.js");
const X12Element_js_1 = require("../X12Element.js");
const X12Transaction_js_1 = require("../X12Transaction.js");
const X12FunctionalGroup_js_1 = require("../X12FunctionalGroup.js");
const X12Interchange_js_1 = require("../X12Interchange.js");
const X12ValidationRule_js_1 = require("./X12ValidationRule.js");
const simpleAckMap = {
    header: ["997", "{{ macro | random }}"],
    segments: [
        {
            tag: "AK1",
            elements: ["{{ input.group.groupId }}", "{{ input.group.groupNumber }}"],
        },
        {
            tag: "AK2",
            elements: [
                '{{ input.transactions | map: "transactionId" | in_loop }}',
                '{{ input.transactions | map: "transactionNumber" | in_loop }}',
            ],
            loopStart: true,
            loopLength: "{{ input.transactions | size }}",
        },
        {
            tag: "AK5",
            elements: [
                '{% assign len = input.transactions | size %}{% if len > 0 %}{% if input.group.responseLevel == "note_errors" %}E{% else %}R{% endif %}{% endif %}',
                '{{ input.transactions | map: "transaction.errors.0.code" }}',
            ],
            loopEnd: true,
        },
        {
            tag: "AK9",
            elements: [
                "{{ input.group.groupResponse }}",
                "{{ input.group.transactionCount }}",
                "{{ input.group.transactionCount }}",
                "{% assign errors = input.transactions | size %}{{ input.group.transactionCount | minus: errors }}",
            ],
        },
    ],
};
class ValidationEngineError extends Error {
    constructor(message, report) {
        super(message);
        Object.defineProperty(this, "report", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.setPrototypeOf(this, ValidationEngineError.prototype);
        this.report = report;
    }
}
exports.ValidationEngineError = ValidationEngineError;
class X12ValidationEngine {
    constructor(options = {}) {
        Object.defineProperty(this, "pass", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "report", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "acknowledgement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hardErrors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "throwError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // deno-lint-ignore no-explicit-any
        Object.defineProperty(this, "ackMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const { acknowledgement, throwError, ackMap } = options;
        this.pass = true;
        this.throwError = false;
        this.ackMap = typeof ackMap === "object" ? ackMap : simpleAckMap;
        if (typeof acknowledgement === "object") {
            const { isa, gs, options: x12options } = acknowledgement;
            this.setAcknowledgement(isa, gs, { ...x12options, txEngine: "liquidjs" });
        }
        if (throwError)
            this.throwError = true;
    }
    setAcknowledgement(isa, gs, options) {
        if (isa instanceof X12Segment_js_1.X12Segment && gs instanceof X12Segment_js_1.X12Segment) {
            this.acknowledgement = new X12Interchange_js_1.X12Interchange(options);
            this.acknowledgement.setHeader(isa.elements.map((element) => element.value));
            this.acknowledgement.addFunctionalGroup().setHeader(gs.elements.map((element) => element.value));
        }
    }
    // deno-lint-ignore no-explicit-any
    assert(actual, expected, _groupResponse) {
        const setReport = (results) => {
            if (results !== true) {
                this.pass = false;
                this.report = results;
            }
        };
        const passingReport = function (groupId, groupNumber, transactionCount) {
            return {
                group: {
                    groupId,
                    groupNumber,
                    transactionCount,
                    groupResponse: "A",
                    errors: [],
                },
                transactions: [],
            };
        };
        if (actual instanceof X12Interchange_js_1.X12Interchange && expected instanceof X12ValidationRule_js_1.X12InterchangeRule) {
            const groupId = actual.functionalGroups[0].header.valueOf(1) ?? "";
            const groupNumber = parseFloat(actual.functionalGroups[0].header.valueOf(6, "0") ?? "0");
            const transactionCount = actual.functionalGroups[0].transactions.length;
            setReport(expected.assert?.(actual) ?? {});
            if (this.pass) {
                this.report = {
                    groups: [passingReport(groupId, groupNumber, transactionCount)],
                };
            }
        }
        if (actual instanceof X12FunctionalGroup_js_1.X12FunctionalGroup && expected instanceof X12ValidationRule_js_1.X12GroupRule) {
            const groupId = actual.header.valueOf(1) ?? "";
            const groupNumber = parseFloat(actual.header.valueOf(6, "0") ?? "0");
            const transactionCount = actual.transactions.length;
            setReport(expected.assert?.(actual, groupNumber) ?? {});
            if (this.pass) {
                this.report = passingReport(groupId, groupNumber, transactionCount);
            }
        }
        if (actual instanceof X12Transaction_js_1.X12Transaction && expected instanceof X12ValidationRule_js_1.X12TransactionRule) {
            const transactionNumber = parseFloat(actual.header.valueOf(2, "0") ?? "0");
            setReport(expected.assert?.(actual, transactionNumber) ?? {});
        }
        if (actual instanceof X12Segment_js_1.X12Segment && expected instanceof X12ValidationRule_js_1.X12SegmentRule) {
            setReport(expected.assert?.(actual) ?? {});
        }
        if (actual instanceof X12Element_js_1.X12Element && expected instanceof X12ValidationRule_js_1.X12ElementRule) {
            setReport(expected.assert?.(actual) ?? {});
        }
        if (this.throwError && !this.pass) {
            throw new ValidationEngineError("The actual X12 document did not meet the expected validation.", this.report ?? {});
        }
        return this.pass || (this.report ?? {});
    }
    acknowledge(isa, gs, options) {
        this.setAcknowledgement(isa, gs, options);
        if (this.acknowledgement instanceof X12Interchange_js_1.X12Interchange &&
            typeof this.report === "object" &&
            (Array.isArray(this.report.groups) ||
                typeof this.report.group === "object")) {
            this.acknowledgement.functionalGroups[0].addTransaction().fromObject({
                group: typeof this.report.groups === "object"
                    ? this.report.groups[0].group
                    : this.report.group,
            }, this.ackMap);
            return this.acknowledgement;
        }
    }
}
exports.X12ValidationEngine = X12ValidationEngine;
