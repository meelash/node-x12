export interface X12SegmentHeader {
    tag: string;
    trailer?: string;
    layout: any;
}
export declare const ISASegmentHeader: X12SegmentHeader;
export declare const GSSegmentHeader: X12SegmentHeader;
export declare const STSegmentHeader: X12SegmentHeader;
