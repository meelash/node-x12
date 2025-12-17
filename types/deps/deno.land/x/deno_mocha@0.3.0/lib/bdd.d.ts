import * as dntShim from "../../../../../_dnt.test_shims.js";
import { DescribeOpts, Func, Hook, HookFunc, HookName, Test, TestSuite } from "./types.js";
/** Class representing a group of test suite hooks, tests, and nested groups. */
declare class SuiteGroup<T extends Record<string | symbol | number, any>> implements TestSuite<T> {
    context: T;
    items: [string, SuiteGroup<any> | Test<any>][];
    beforeAll: HookFunc<T>[];
    beforeEach: HookFunc<T>[];
    afterAll: HookFunc<T>[];
    afterEach: HookFunc<T>[];
    symbol: symbol;
    fn(): (t: dntShim.Deno.TestContext) => Promise<void>;
}
/** Static class for maintaining the state of all test suite groups in a behavior-driven development style. */
export declare class BDD {
    static suiteGroups: Map<symbol, SuiteGroup<any>>;
    static currentSuiteGroup?: SuiteGroup<any>;
    static describe<T = unknown>(nameOrSuiteOrOpts: DescribeOpts<T> | TestSuite<T> | string, nameOrFn?: string | (() => void), func?: () => void): {
        symbol: symbol;
    };
    static it<T = unknown>(nameOrSuite: TestSuite<T> | string, nameOrFn: string | Func<T>, func?: Func<T>): void;
    static registerHook(hookName: HookName, hook?: Hook<any>): void;
    static getDescribeOpts<T>(nameOrSuiteOrOpts: DescribeOpts<T> | TestSuite<T> | string, nameOrFn?: string | (() => void), func?: () => void): DescribeOpts<T>;
}
export {};
