"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.afterEach = exports.beforeEach = exports.afterAll = exports.after = exports.beforeAll = exports.before = exports.it = exports.describe = void 0;
const bdd_js_1 = require("./lib/bdd.js");
function describe(nameOrSuiteOrOpts, nameOrFn, func) {
    return bdd_js_1.BDD.describe(nameOrSuiteOrOpts, nameOrFn, func);
}
exports.describe = describe;
function it(nameOrSuite, nameOrFn, func) {
    bdd_js_1.BDD.it(nameOrSuite, nameOrFn, func);
}
exports.it = it;
function before(fn) {
    bdd_js_1.BDD.registerHook("beforeAll", fn);
}
exports.before = before;
function beforeAll(fn) {
    bdd_js_1.BDD.registerHook("beforeAll", fn);
}
exports.beforeAll = beforeAll;
function after(fn) {
    bdd_js_1.BDD.registerHook("afterAll", fn);
}
exports.after = after;
function afterAll(fn) {
    bdd_js_1.BDD.registerHook("afterAll", fn);
}
exports.afterAll = afterAll;
function beforeEach(fn) {
    bdd_js_1.BDD.registerHook("beforeEach", fn);
}
exports.beforeEach = beforeEach;
function afterEach(fn) {
    bdd_js_1.BDD.registerHook("afterEach", fn);
}
exports.afterEach = afterEach;
