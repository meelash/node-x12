export declare class Position {
    constructor(line?: number, character?: number);
    line: number;
    character: number;
}
export declare class Range {
    constructor(startLine?: number, startChar?: number, endLine?: number, endChar?: number);
    start: Position;
    end: Position;
}
