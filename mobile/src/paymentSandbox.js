// Local, credential-free payment simulation. No provider request or money transfer occurs here.
export const paymentMethods = [
  { id: "orange", name: "Orange Money", group: "Mobile Money" },
  { id: "airtel", name: "Airtel Money", group: "Mobile Money" },
  { id: "mpesa", name: "M-Pesa", group: "Mobile Money" },
  { id: "visa", name: "Visa", group: "Cartes bancaires" },
  { id: "mastercard", name: "Mastercard", group: "Cartes bancaires" },
  { id: "bitcoin", name: "Bitcoin (BTC)", group: "Cryptomonnaies" },
  { id: "ethereum", name: "Ethereum (ETH)", group: "Cryptomonnaies" },
];

export const paymentScenarios = [
  { id: "success", label: "Réussite" },
  { id: "failed", label: "Refus" },
  { id: "pending", label: "En attente" },
];

export function simulatePayment({ methodId, scenario, amount }) {
  const method = paymentMethods.find((item) => item.id === methodId);
  if (!method || !paymentScenarios.some((item) => item.id === scenario)) {
    throw new Error("Moyen ou scénario de test inconnu.");
  }
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("Le montant de test doit être positif et entier.");
  }
  return {
    reference: `TEST-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    methodId,
    methodName: method.name,
    scenario,
    status: scenario === "success" ? "test_success" : scenario === "failed" ? "test_failed" : "test_pending",
    amount,
    currency: "CDF",
    country: "CD",
    provider: "simulation_locale",
    createdAt: new Date().toISOString(),
  };
}
