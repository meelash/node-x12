"use strict";
export class Position {
    constructor(line, character) {
        Object.defineProperty(this, "line", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "character", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (typeof line === "number" && typeof character === "number") {
            this.line = line;
            this.character = character;
        }
    }
}
export class Range {
    constructor(startLine, startChar, endLine, endChar) {
        Object.defineProperty(this, "start", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "end", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (typeof startLine === "number" &&
            typeof startChar === "number" &&
            typeof endLine === "number" &&
            typeof endChar === "number") {
            this.start = new Position(startLine, startChar);
            this.end = new Position(endLine, endChar);
        }
    }
}
