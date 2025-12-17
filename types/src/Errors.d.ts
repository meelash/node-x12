export declare class ArgumentNullError extends Error {
    constructor(argumentName: string);
    name: string;
}
export declare class GeneratorError extends Error {
    constructor(message?: string);
    name: string;
}
export declare class ParserError extends Error {
    constructor(message?: string);
    name: string;
}
export declare class QuerySyntaxError extends Error {
    constructor(message?: string);
    name: string;
}
