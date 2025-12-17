import { BDD } from "./lib/bdd.js";
export function describe(nameOrSuiteOrOpts, nameOrFn, func) {
    return BDD.describe(nameOrSuiteOrOpts, nameOrFn, func);
}
export function it(nameOrSuite, nameOrFn, func) {
    BDD.it(nameOrSuite, nameOrFn, func);
}
export function before(fn) {
    BDD.registerHook("beforeAll", fn);
}
export function beforeAll(fn) {
    BDD.registerHook("beforeAll", fn);
}
export function after(fn) {
    BDD.registerHook("afterAll", fn);
}
export function afterAll(fn) {
    BDD.registerHook("afterAll", fn);
}
export function beforeEach(fn) {
    BDD.registerHook("beforeEach", fn);
}
export function afterEach(fn) {
    BDD.registerHook("afterEach", fn);
}
