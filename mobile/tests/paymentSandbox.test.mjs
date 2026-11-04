import assert from "node:assert/strict";
import test from "node:test";
import { paymentMethods, simulatePayment } from "../src/paymentSandbox.js";

test("every displayed online method can exercise all local outcomes", () => {
  assert.equal(paymentMethods.length, 7);
  for (const method of paymentMethods) {
    for (const [scenario, status] of [
      ["success", "test_success"],
      ["failed", "test_failed"],
      ["pending", "test_pending"],
    ]) {
      const result = simulatePayment({ methodId: method.id, scenario, amount: 4500 });
      assert.equal(result.methodName, method.name);
      assert.equal(result.status, status);
      assert.equal(result.currency, "CDF");
      assert.equal(result.country, "CD");
      assert.equal(result.amount, 4500);
      assert.equal(result.provider, "simulation_locale");
      assert.match(result.reference, /^TEST-/);
    }
  }
});

test("unknown methods, scenarios and invalid amounts are rejected", () => {
  for (const input of [
    { methodId: "unknown", scenario: "success", amount: 1000 },
    { methodId: "orange", scenario: "unknown", amount: 1000 },
    { methodId: "orange", scenario: "success", amount: 0 },
    { methodId: "orange", scenario: "success", amount: 3.5 },
  ]) {
    assert.throws(() => simulatePayment(input));
  }
});
