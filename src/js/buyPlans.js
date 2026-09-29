/* Pacific Education — Owner-controlled pricing and payment boundary */
(function (global) {
  "use strict";

  const VERSION = "1.1.0";
  const STATUS = Object.freeze({
    READY: "READY",
    FIJI_PROTECTED: "FIJI_PROTECTED",
    INTERNATIONAL: "INTERNATIONAL",
    PRICING_UNAVAILABLE: "PRICING_UNAVAILABLE",
    AUDIT_REJECTED: "AUDIT_REJECTED",
    PRODUCTION_REQUIRED: "PRODUCTION_REQUIRED"
  });

  /* Fiji prices are owner-controlled. Changes must be made through the
     authorized production owner-control service; this browser copy is
     display/prototype configuration only. */
  const FIJI_PLANS = Object.freeze([
    Object.freeze({ planId: "FIJI-STUDENT", name: "Student / Child", category: "student", currency: "FJD", amount: 5, period: "annual" }),
    Object.freeze({ planId: "FIJI-TEACHER", name: "Teacher", category: "teacher", currency: "FJD", amount: 10, period: "annual" }),
    Object.freeze({ planId: "FIJI-PARENT", name: "Parent / Caregiver", category: "parent", currency: "FJD", amount: 10, period: "annual" })
  ]);

  function normalizeCurrencyCode(value) {
    const code = String(value || "").trim().toUpperCase();
    return /^[A-Z]{3}$/.test(code) ? code : null;
  }

  function getGdpEngine() {
    return global.PacificEducationAnnualGdpPricingEngine || null;
  }

  function getPricingAuditGuard() {
    return global.PacificEducationPricingAuditGuard || null;
  }

  function getFijiPlans() {
    return FIJI_PLANS.map(function (p) { return Object.assign({}, p); });
  }

  function auditPlan(plan) {
    const guard = getPricingAuditGuard();
    if (!guard || typeof guard.auditPlan !== "function") {
      return { valid: false, productionVerified: false, errors: ["Pricing Audit Guard is unavailable."], warnings: [] };
    }
    return guard.auditPlan(plan, 0);
  }

  function auditPlans(plans) {
    const guard = getPricingAuditGuard();
    if (!guard || typeof guard.auditPlans !== "function") {
      return { valid: false, productionVerified: false, errors: ["Pricing Audit Guard is unavailable."], warnings: [] };
    }
    return guard.auditPlans(plans);
  }

  function getFijiPricing() {
    const plans = getFijiPlans();
    const audit = auditPlans(plans);
    return {
      status: audit.valid ? STATUS.FIJI_PROTECTED : STATUS.AUDIT_REJECTED,
      market: "FJ",
      pricingStatus: STATUS.FIJI_PROTECTED,
      plans: plans,
      audit: audit,
      ownerControlled: true,
      productionServerRequired: true
    };
  }

  function calculateInternationalPlan(options) {
    const engine = getGdpEngine();
    if (!engine || typeof engine.calculateAnnualPrice !== "function") {
      return { status: STATUS.PRICING_UNAVAILABLE, reason: "Annual GDP Pricing Engine is unavailable." };
    }
    const result = engine.calculateAnnualPrice(options || {});
    if (result.status === "PRODUCTION_REQUIRED") return { status: STATUS.PRODUCTION_REQUIRED, result: result };
    if (result.status !== "CALCULATED") return { status: STATUS.PRICING_UNAVAILABLE, result: result };
    return { status: STATUS.INTERNATIONAL, result: result };
  }

  function getInternationalPricing(options) {
    const calculated = calculateInternationalPlan(options);
    if (calculated.status !== STATUS.INTERNATIONAL) return calculated;
    const result = calculated.result;
    const plan = {
      planId: "INTERNATIONAL-" + String(result.countryCode || "UNKNOWN"),
      name: "International Annual",
      category: options && options.category ? options.category : "customer",
      currency: normalizeCurrencyCode(result.currency),
      amount: result.priceLocalCurrency,
      period: "annual",
      countryCode: result.countryCode,
      gdpDataYear: result.gdpDataYear,
      gdpSource: result.gdpSource,
      gdpPerCapitaUsd: result.gdpPerCapitaUsd
    };
    const audit = auditPlan(plan);
    if (!audit.valid) return { status: STATUS.AUDIT_REJECTED, pricingStatus: STATUS.INTERNATIONAL, plan: plan, engineResult: result, audit: audit };
    return { status: STATUS.INTERNATIONAL, pricingStatus: STATUS.INTERNATIONAL, plan: plan, engineResult: result, audit: audit };
  }

  function createCustomerPlan(plan, options) {
    options = options || {};
    const currency = normalizeCurrencyCode(options.currencyCode);
    if (!currency) return { status: STATUS.PRICING_UNAVAILABLE, reason: "Customer local currency is required." };
    return Object.assign({}, plan, {
      category: String(options.category || plan.category || plan.name || "customer"),
      currency: currency,
      currencySource: "customer-approved-local-currency",
      localCurrencyRequired: true,
      ownerPriceControlled: true
    });
  }

  function createCustomerPaymentRecord(plan, customer) {
    plan = plan || {};
    customer = customer || {};
    const currency = normalizeCurrencyCode(customer.currencyCode || plan.currency);
    if (!currency) return { success: false, status: "CUSTOMER_CURRENCY_REQUIRED" };
    const amount = Number(plan.amount);
    if (!Number.isFinite(amount) || amount <= 0) return { success: false, status: "INVALID_AMOUNT" };
    const record = {
      paymentRecordId: "payment-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      customerCategory: String(customer.category || plan.category || plan.name || "customer"),
      customerId: customer.customerId || null,
      countryCode: customer.countryCode || null,
      currency: currency,
      amount: amount,
      planId: plan.planId || null,
      period: plan.period || "annual",
      currencySource: "customer-approved-local-currency",
      ownerPriceControlled: true,
      paymentStatus: "pending",
      providerTransactionId: null,
      receiptStatus: "pending",
      productionVerified: false,
      entitlementActivated: false,
      createdAt: new Date().toISOString()
    };
    return { success: true, status: "PAYMENT_RECORD_CREATED", record: record };
  }

  function validatePaymentRecord(record) {
    const errors = [];
    if (!record || typeof record !== "object") errors.push("Payment record is required.");
    if (!normalizeCurrencyCode(record && record.currency)) errors.push("Valid customer currency is required.");
    if (!record || !record.planId) errors.push("Plan is required.");
    if (!record || !record.customerCategory) errors.push("Customer category is required.");
    if (record && (!Number.isFinite(Number(record.amount)) || Number(record.amount) <= 0)) errors.push("Positive payment amount is required.");
    if (record && record.ownerPriceControlled !== true) errors.push("Owner-controlled pricing is required.");
    return { valid: errors.length === 0, errors: errors };
  }

  function createPaymentRequest(plan) {
    if (!plan || typeof plan !== "object") return { success: false, status: "INVALID_PAYMENT_REQUEST" };
    if (!normalizeCurrencyCode(plan.currency)) return { success: false, status: "CUSTOMER_CURRENCY_REQUIRED", message: "A valid local customer currency is required before payment." };
    if (!Number.isFinite(Number(plan.amount)) || Number(plan.amount) <= 0) return { success: false, status: "INVALID_AMOUNT" };
    return {
      success: true,
      status: "PAYMENT_REQUEST_CREATED",
      paymentRequired: true,
      paymentVerified: false,
      subscriptionActivated: false,
      planId: plan.planId || null,
      category: plan.category || null,
      currency: plan.currency,
      amount: Number(plan.amount),
      period: plan.period || "annual",
      ownerPriceControlled: true,
      productionVerificationRequired: true,
      message: "Payment must be verified by the production server or approved payment provider."
    };
  }

  global.PacificEducationBuyPlans = Object.freeze({
    version: VERSION,
    status: STATUS,
    fijiPlans: FIJI_PLANS,
    getFijiPlans: getFijiPlans,
    getFijiPricing: getFijiPricing,
    calculateInternationalPlan: calculateInternationalPlan,
    getInternationalPricing: getInternationalPricing,
    auditPlan: auditPlan,
    auditPlans: auditPlans,
    createCustomerPlan: createCustomerPlan,
    createCustomerPaymentRecord: createCustomerPaymentRecord,
    validatePaymentRecord: validatePaymentRecord,
    createPaymentRequest: createPaymentRequest
  });

  global.dispatchEvent(new CustomEvent("pacificEducationBuyPlansLoaded", {
    detail: { version: VERSION, prototypeOnly: true, productionPaymentVerificationRequired: true, ownerControlledPricing: true }
  }));
})(window);