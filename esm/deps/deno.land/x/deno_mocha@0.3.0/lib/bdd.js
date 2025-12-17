// deno-lint-ignore-file no-explicit-any
import * as dntShim from "../../../../../_dnt.test_shims.js";
/** Class representing a group of test suite hooks, tests, and nested groups. */
class SuiteGroup {
    constructor() {
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "items", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "beforeAll", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "beforeEach", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "afterAll", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "afterEach", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "symbol", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Symbol()
        });
    }
    fn() {
        return async (t) => {
            const { context } = this;
            // Run the before callbacks.
            for (const fn of this.beforeAll) {
                await fn.call(context);
            }
            for (const [name, item] of this.items) {
                // If the item is a group, recurse into it, else use the test fn.
                const fn = "items" in item ? item.fn() : item.fn.bind(context);
                // Register this test with the tester.
                await t.step(name, async (t) => {
                    // Run the beforeEach callbacks.
                    for (const fn of this.beforeEach) {
                        await fn.call(context);
                    }
                    // Run the test / group fn.
                    await fn(t);
                    // Run the afterEach callbacks.
                    for (const fn of this.afterEach) {
                        await fn.call(context);
                    }
                });
            }
            // Run the after callbacks.
            for (const fn of this.afterAll) {
                await fn.call(context);
            }
        };
    }
}
/** Static class for maintaining the state of all test suite groups in a behavior-driven development style. */
export class BDD {
    static describe(nameOrSuiteOrOpts, nameOrFn, func) {
        const { suite, fn, name, beforeAll, afterAll, beforeEach, afterEach } = BDD
            .getDescribeOpts(nameOrSuiteOrOpts, nameOrFn, func);
        const symbol = Symbol();
        // Save the current group so we can restore it after the callback.
        const existingGroup = BDD.currentSuiteGroup;
        // Create a new group, and set it as the current group.
        const group = BDD.currentSuiteGroup = new SuiteGroup();
        fn?.();
        BDD.registerHook("beforeAll", beforeAll);
        BDD.registerHook("afterAll", afterAll);
        BDD.registerHook("beforeEach", beforeEach);
        BDD.registerHook("afterEach", afterEach);
        // Restore the previous group.
        BDD.currentSuiteGroup = existingGroup;
        // Add the new group to the existing group if there was one. If there was no
        // existing group, this is the top-level group, so we register the group with
        // `Deno.test`.
        if (suite !== undefined) {
            const parentGroup = BDD.suiteGroups.get(suite.symbol);
            if (parentGroup !== undefined)
                parentGroup.items.push([name, group]);
        }
        else if (existingGroup !== undefined) {
            existingGroup.items.push([name, group]);
        }
        else {
            dntShim.Deno.test(name, group.fn());
        }
        BDD.suiteGroups.set(symbol, group);
        return { symbol };
    }
    static it(nameOrSuite, nameOrFn, func) {
        const group = typeof nameOrSuite === "object"
            ? BDD.suiteGroups.get(nameOrSuite.symbol)
            : BDD.currentSuiteGroup;
        const fn = typeof nameOrFn === "function" ? nameOrFn : func;
        const name = typeof nameOrSuite === "string"
            ? nameOrSuite
            : typeof nameOrFn === "string"
                ? nameOrFn
                : fn?.name ?? "";
        if (group === undefined) {
            throw new TypeError("Can not call it() outside of a describe().");
        }
        if (fn === undefined) {
            throw new TypeError("Can not call an undefined test function.");
        }
        group.items.push([name, { fn }]);
    }
    static registerHook(hookName, hook) {
        if (BDD.currentSuiteGroup === undefined) {
            throw new TypeError(`Can not call ${hookName}() outside of a describe().`);
        }
        if (Array.isArray(hook)) {
            BDD.currentSuiteGroup[hookName]?.push(...hook);
        }
        else if (hook) {
            BDD.currentSuiteGroup[hookName]?.push(hook);
        }
    }
    static getDescribeOpts(nameOrSuiteOrOpts, nameOrFn, func) {
        const suite = typeof nameOrSuiteOrOpts === "object"
            ? "symbol" in nameOrSuiteOrOpts
                ? nameOrSuiteOrOpts
                : nameOrSuiteOrOpts.suite
            : undefined;
        const fn = typeof nameOrSuiteOrOpts === "object" && "fn" in nameOrSuiteOrOpts
            ? nameOrSuiteOrOpts.fn ?? (() => { })
            : typeof nameOrFn === "function"
                ? nameOrFn
                : typeof func === "function"
                    ? func
                    : (() => { });
        const name = typeof nameOrSuiteOrOpts === "object" && "name" in nameOrSuiteOrOpts
            ? nameOrSuiteOrOpts.name
            : typeof nameOrSuiteOrOpts === "string"
                ? nameOrSuiteOrOpts
                : typeof nameOrFn === "string"
                    ? nameOrFn
                    : fn.name;
        return {
            suite,
            fn,
            name,
            beforeAll: typeof nameOrSuiteOrOpts === "object" && "name" in nameOrSuiteOrOpts
                ? nameOrSuiteOrOpts.beforeAll
                : undefined,
            afterAll: typeof nameOrSuiteOrOpts === "object" && "name" in nameOrSuiteOrOpts
                ? nameOrSuiteOrOpts.afterAll
                : undefined,
            beforeEach: typeof nameOrSuiteOrOpts === "object" && "name" in nameOrSuiteOrOpts
                ? nameOrSuiteOrOpts.beforeEach
                : undefined,
            afterEach: typeof nameOrSuiteOrOpts === "object" && "name" in nameOrSuiteOrOpts
                ? nameOrSuiteOrOpts.afterEach
                : undefined,
        };
    }
}
Object.defineProperty(BDD, "suiteGroups", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Map()
});
