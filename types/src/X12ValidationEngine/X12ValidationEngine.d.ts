import { X12Segment } from "../X12Segment.js";
import { X12Element } from "../X12Element.js";
import { X12Transaction } from "../X12Transaction.js";
import { X12FunctionalGroup } from "../X12FunctionalGroup.js";
import { X12Interchange } from "../X12Interchange.js";
import { X12SerializationOptions } from "../X12SerializationOptions.js";
import { GroupResponseCode, ValidationEngineOptions, ValidationReport } from "./Interfaces.js";
import { X12ElementRule, X12GroupRule, X12InterchangeRule, X12SegmentRule, X12TransactionRule } from "./X12ValidationRule.js";
export declare class ValidationEngineError extends Error {
    constructor(message: string, report: ValidationReport);
    report: ValidationReport;
}
export declare class X12ValidationEngine {
    constructor(options?: ValidationEngineOptions);
    pass: boolean;
    report?: ValidationReport;
    acknowledgement?: X12Interchange;
    hardErrors?: Error[];
    throwError: boolean;
    private readonly ackMap;
    private setAcknowledgement;
    assert(actual: X12Element, expected: X12ElementRule): true | ValidationReport;
    assert(actual: X12Segment, expected: X12SegmentRule): true | ValidationReport;
    assert(actual: X12Transaction, expected: X12TransactionRule): true | ValidationReport;
    assert(actual: X12FunctionalGroup, expected: X12GroupRule, groupResponse?: GroupResponseCode): true | ValidationReport;
    assert(actual: X12Interchange, expected: X12InterchangeRule, groupResponse?: GroupResponseCode): true | ValidationReport;
    acknowledge(isa?: X12Segment, gs?: X12Segment, options?: X12SerializationOptions): X12Interchange | undefined;
}
