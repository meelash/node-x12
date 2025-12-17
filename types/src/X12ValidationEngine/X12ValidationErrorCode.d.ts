import { ValidationError } from "./Interfaces.js";
export declare const X12ValidationErrorCode: Record<string, (...args: any[]) => ValidationError>;
export declare function errorLookup(codeType?: "group", code?: string, position?: number): ValidationError;
export declare function errorLookup(codeType?: "transaction", code?: string, position?: number): ValidationError;
export declare function errorLookup(codeType?: "segment", code?: string, position?: number): ValidationError;
export declare function errorLookup(codeType?: "element", code?: string, position?: number, dataSample?: string): ValidationError;
