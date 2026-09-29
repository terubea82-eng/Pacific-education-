/* Pacific Education — Provider-neutral payment gateway boundary
 * Prototype only. Never confirms payment in the browser.
 */
(function (global) {
  "use strict";
  const VERSION = "1.0.0";
  const STATES = Object.freeze(["created","pending","requires_action","paid","failed","refunded","cancelled"]);

  function currency(value) {
    const code = String(value || "").trim().toUpperCase();
    return /^[A-Z]{3}$/.test(code) ? code : null;
  }

  function createCheckoutRequest(customer, plan) {
    customer = customer || {};
    plan = plan || {};
    const ccy = currency(customer.currencyCode || plan.currency);
    const amount = Number(plan.amount);
    if (!ccy) return { success:false, status:"CUSTOMER_CURRENCY_REQUIRED" };
    if (!Number.isFinite(amount) || amount <= 0) return { success:false, status:"INVALID_AMOUNT" };
    if (!plan.planId) return { success:false, status:"PLAN_REQUIRED" };
    return {
      success:true,
      status:"CHECKOUT_REQUEST_CREATED",
      checkout:{
        checkoutId:"checkout-" + Date.now() + "-" + Math.random().toString(36).slice(2,8),
        customerId:customer.customerId || null,
        customerCategory:customer.category || plan.category || null,
        countryCode:customer.countryCode || null,
        currency:ccy,
        amount:amount,
        planId:plan.planId,
        period:plan.period || "annual",
        provider:null,
        providerCheckoutId:null,
        providerTransactionId:null,
        paymentState:"created",
        createdAt:new Date().toISOString(),
        verifiedAt:null,
        productionServerVerificationRequired:true,
        ownerPriceControlled:true
      }
    };
  }

  function validateState(state) {
    return STATES.indexOf(String(state || "")) !== -1;
  }

  function buildProviderAdapter(name) {
    return {
      provider:String(name || "unselected"),
      createCheckout:function(){ return {status:"PROVIDER_NOT_CONNECTED",productionRequired:true}; },
      verifyPayment:function(){ return {status:"SERVER_VERIFICATION_REQUIRED",productionRequired:true}; }
    };
  }

  global.PacificEducationPaymentGateway = Object.freeze({
    version:VERSION,
    states:STATES,
    normalizeCurrency:currency,
    createCheckoutRequest:createCheckoutRequest,
    validateState:validateState,
    buildProviderAdapter:buildProviderAdapter,
    providerConnected:false,
    productionServerVerificationRequired:true
  });
  global.dispatchEvent(new CustomEvent("pacificEducationPaymentGatewayLoaded", {
    detail:{version:VERSION,providerConnected:false,productionServerVerificationRequired:true}
  }));
})(window);