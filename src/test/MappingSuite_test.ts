// deno-lint-ignore-file no-explicit-any
import * as dntShim from "../_dnt.test_shims.js";

"use strict";

import { describe, it } from "../deps/deno.land/x/deno_mocha@0.3.0/mod.js"
import {
  X12Interchange,
  X12Parser,
  X12Transaction,
  X12TransactionMap,
} from "../mod.js";
import * as assert from "assert";

const edi = dntShim.Deno.readTextFileSync("test/test-data/850.edi");
const edi855 = dntShim.Deno.readTextFileSync("test/test-data/855.edi");
const mapJson = dntShim.Deno.readTextFileSync("test/test-data/850_map.json");
const resultJson = dntShim.Deno.readTextFileSync("test/test-data/850_map_result.json");
const transactionJson = dntShim.Deno.readTextFileSync(
  "test/test-data/Transaction_map.json",
);
const transactionJsonLiquid = dntShim.Deno.readTextFileSync(
  "test/test-data/Transaction_map_liquidjs.json",
);
const transactionData = dntShim.Deno.readTextFileSync(
  "test/test-data/Transaction_data.json",
);

describe("X12Mapping", () => {
  it("should map transaction to data", () => {
    const parser = new X12Parser();
    const interchange = parser.parse(edi) as X12Interchange;
    const transaction = interchange.functionalGroups[0].transactions[0];
    const mapper = new X12TransactionMap(JSON.parse(mapJson), transaction);

    assert.deepStrictEqual(mapper.toObject(), JSON.parse(resultJson));
  });

  it("should map data to transaction with custom macro", () => {
    const transaction = new X12Transaction();
    const mapper = new X12TransactionMap(
      JSON.parse(transactionJson),
      transaction,
    );
    const data = JSON.parse(transactionData);
    const result = mapper.fromObject(data, {
      toFixed: function toFixed(key: string, places: number) {
        return {
          val: parseFloat(key).toFixed(places),
        };
      },
    });

    if (!(result instanceof X12Transaction)) {
      throw new Error(
        "An error occured when mapping an object to a transaction.",
      );
    }
  });

  it("should map data to transaction with LiquidJS", () => {
    const transaction = new X12Transaction();
    const mapper = new X12TransactionMap(
      JSON.parse(transactionJsonLiquid),
      transaction,
      "liquidjs",
    );
    const data = JSON.parse(transactionData);
    const result = mapper.fromObject(data, {
      to_fixed: (value: string, places: number) =>
        parseFloat(value).toFixed(places),
    });

    if (!(result instanceof X12Transaction)) {
      throw new Error(
        "An error occured when mapping an object to a transaction.",
      );
    }
  });

  it("should map empty data when element missing from qualified segment", () => {
    // Addresses issue https://github.com/ahuggins-nhs/node-x12/issues/23
    const mapObject = { author: 'FOREACH(PO1)=>PO109:PO103["UN"]' };
    const parser = new X12Parser();
    const interchange = parser.parse(edi855) as X12Interchange;
    const transaction = interchange.functionalGroups[0].transactions[0];
    const mapperLoose = new X12TransactionMap(mapObject, transaction, "loose");
    const mapperStrict = new X12TransactionMap(
      mapObject,
      transaction,
      "strict",
    );

    const resultLoose: any[] = mapperLoose.toObject();
    const resultStrict: any[] = mapperStrict.toObject();

    assert.strictEqual(Array.isArray(resultLoose), true);
    assert.strictEqual(Array.isArray(resultStrict), true);
    assert.strictEqual(resultLoose.length, 4);
    assert.strictEqual(resultStrict.length, 3);
    assert.deepStrictEqual(resultLoose[2], { author: "" });
    assert.deepStrictEqual(resultStrict[2], { author: "NOT APPLICABLE" });
  });

});
