import { JSEDINotation } from "./JSEDINotation.js";
import { X12Interchange } from "./X12Interchange.js";
import { X12SerializationOptions } from "./X12SerializationOptions.js";
export declare class X12Generator {
    /**
     * @description Factory for generating EDI from JS EDI Notation.
     * @param {JSEDINotation} [jsen] - Javascript EDI Notation object to serialize.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     */
    constructor(jsen?: JSEDINotation, options?: X12SerializationOptions);
    private jsen;
    private interchange;
    private options;
    /**
     * @description Set the JS EDI Notation for this instance.
     * @param {JSEDINotation} [jsen] - Javascript EDI Notation object to serialize.
     */
    setJSEDINotation(jsen: JSEDINotation): void;
    /**
     * @description Get the JS EDI Notation for this instance.
     * @returns {JSEDINotation} The JS EDI Notation for this instance.
     */
    getJSEDINotation(): JSEDINotation;
    /**
     * @description Set the serialization options for this instance.
     * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
     */
    setOptions(options: X12SerializationOptions): void;
    /**
     * @description Get the serialization options for this instance.
     * @returns {X12SerializationOptions} The serialization options for this instance.
     */
    getOptions(): X12SerializationOptions;
    /**
     * @description Validate the EDI in this instance.
     * @returns {X12Interchange} This instance converted to an interchange.
     */
    validate(): X12Interchange;
    /**
     * @description Serialize the EDI in this instance.
     * @returns {string} This instance converted to an EDI string.
     */
    toString(): string;
    /**
     * @private
     * @description Generate an interchange from the JS EDI Notation in this instance.
     */
    private _generate;
}
