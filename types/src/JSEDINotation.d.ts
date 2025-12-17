import { X12SerializationOptions } from "./X12SerializationOptions.js";
export declare class JSEDINotation {
    constructor(header?: string[], options?: X12SerializationOptions);
    options?: X12SerializationOptions;
    header: string[];
    functionalGroups: JSEDIFunctionalGroup[];
    addFunctionalGroup(header: string[]): JSEDIFunctionalGroup;
}
export declare class JSEDIFunctionalGroup {
    constructor(header?: string[]);
    header: string[];
    transactions: JSEDITransaction[];
    addTransaction(header: string[]): JSEDITransaction;
}
export declare class JSEDITransaction {
    constructor(header?: string[]);
    header: string[];
    segments: JSEDISegment[];
    addSegment(tag: string, elements: string[]): JSEDISegment;
}
export declare class JSEDISegment {
    constructor(tag: string, elements: string[]);
    tag: string;
    elements: string[];
}
