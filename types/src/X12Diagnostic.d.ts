import { Range } from "./Positioning.js";
export declare enum X12DiagnosticLevel {
    Info = 0,
    Warning = 1,
    Error = 2
}
export declare class X12Diagnostic {
    constructor(level?: X12DiagnosticLevel, message?: string, range?: Range);
    level: X12DiagnosticLevel;
    message: string;
    range: Range;
}
