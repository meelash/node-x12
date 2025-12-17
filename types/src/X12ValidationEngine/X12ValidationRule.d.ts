import { X12Segment } from "../X12Segment.js";
import { X12Element } from "../X12Element.js";
import { X12Transaction } from "../X12Transaction.js";
import { X12FunctionalGroup } from "../X12FunctionalGroup.js";
import { X12Interchange } from "../X12Interchange.js";
import { ValidationReport, ValidationType } from "./Interfaces.js";
export declare class X12ValidationRule {
    constructor(options: X12ValidationRule);
    engine?: RegExp | "rule" | string;
    ruleType?: ValidationType;
    failureCode?: string;
    assert?(value: any, position?: number): true | ValidationReport;
    toJSON?(): this;
}
export declare class X12InterchangeRule extends X12ValidationRule {
    constructor(options: X12InterchangeRule);
    engine?: "rule";
    ruleType?: "interchange";
    group: X12GroupRule;
    header: X12SegmentRule;
    trailer: X12SegmentRule;
    assert?(interchange: X12Interchange): true | ValidationReport;
}
export declare class X12GroupRule extends X12ValidationRule {
    constructor(options: X12GroupRule);
    engine?: "rule";
    ruleType?: "group";
    transaction: X12TransactionRule;
    header: X12SegmentRule;
    trailer: X12SegmentRule;
    assert?(group: X12FunctionalGroup, controlNumber: number): true | ValidationReport;
}
export declare class X12TransactionRule extends X12ValidationRule {
    constructor(options: X12TransactionRule);
    engine?: "rule";
    ruleType?: "transaction";
    segments: X12SegmentRule[];
    header: X12SegmentRule;
    trailer: X12SegmentRule;
    assert?(transaction: X12Transaction, controlNumber: number): true | ValidationReport;
}
export declare class X12SegmentRule extends X12ValidationRule {
    constructor(options: X12SegmentRule);
    engine?: "rule";
    ruleType?: "segment";
    tag: string;
    elements: X12ElementRule[] | "skip";
    loopStart?: boolean;
    loopEnd?: boolean;
    mandatory?: boolean;
    assert?(segment: X12Segment, position?: number): true | ValidationReport;
}
export declare class X12ElementRule extends X12ValidationRule {
    constructor(options: X12ElementRule);
    engine?: RegExp | "rule";
    ruleType?: "element";
    expect?: string;
    allowBlank?: boolean;
    minLength?: number;
    maxLength?: number;
    minMax?: [number, number];
    padLength?: boolean;
    mandatory?: boolean;
    skip?: boolean;
    checkType?: "date" | "datelong" | "dateshort" | "time" | "timelong" | "timeshort" | "number" | "decimal" | "alphanumeric" | "id" | "gs01" | "st01";
    assert?(element: X12Element, position?: number): true | ValidationReport;
}
