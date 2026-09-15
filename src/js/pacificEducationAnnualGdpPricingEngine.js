/*
 * =========================================================
 * PACIFIC EDUCATION
 * ANNUAL GDP-BASED PRICING ENGINE
 * =========================================================
 *
 * File:
 * src/js/pacificEducationAnnualGdpPricingEngine.js
 *
 * Version: 1.0.0
 * Status: PROTOTYPE / OWNER-CONTROLLED SPECIFICATION
 *
 * PURPOSE
 * -------
 * Calculates an annual Pacific Education subscription price
 * using an approved annual GDP-per-capita economic indicator.
 *
 * IMPORTANT
 * ---------
 * This browser-side prototype is NOT a security boundary.
 * Production pricing decisions MUST be performed or verified
 * server-side.
 *
 * Educational quality, curriculum, assessment, safeguarding,
 * fairness, accessibility and student rights MUST NEVER depend
 * on the price calculated by this module.
 *
 * =========================================================
 */

(function (global) {
  "use strict";

  const ENGINE_VERSION = "1.0.0";
  const STORAGE_KEY = "pacificEducationAnnualGdpPricing";
  const AUDIT_KEY = "pacificEducationAnnualGdpPricingAudit";

  /*
   * ---------------------------------------------------------
   * OWNER-CONTROLLED PRICING POLICY
   * ---------------------------------------------------------
   *
   * These values define the current policy.
   *
   * They are NOT secret credentials.
   * They MUST NOT be treated as authorization credentials.
   *
   * Production systems must obtain the authoritative policy
   * from a protected server-side configuration.
   */

  const POLICY = Object.freeze({
    minimumUsdPerChildPerYear: 0.50,
    maximumUsdPerChildPerYear: 10.00,

    defaultCurrency: "USD",

    pricingFrequency: "ANNUAL",

    /*
     * Fiji may use its separately approved owner-controlled
     * Fiji pricing policy.
     */
    protectedMarkets: Object.freeze({
      FJ: true
    }),

    /*
     * The formula is deliberately isolated here.
     *
     * This prototype uses a GDP-per-capita index rather than
     * directly charging a percentage of GDP.
     *
     * Production formula must be approved by the owner before
     * commercial activation.
     */
    formulaVersion: "GDP_INDEX_V1",

    /*
     * Reference GDP-per-capita value used by the prototype
     * formula.
     *
     * This is a configuration placeholder, NOT a live official
     * economic-data value.
     */
    referenceGdpPerCapitaUsd: 10000,

    /*
     * Reference annual price.
     *
     * The final price is bounded by the minimum and maximum.
     */
    referencePriceUsd: 3.00
  });

  /*
   * ---------------------------------------------------------
   * UTILITIES
   * ---------------------------------------------------------
   */

  function roundCurrency(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function isFinitePositiveNumber(value) {
    return (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value >= 0
    );
  }

  function currentYear() {
    return new Date().getUTCFullYear();
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  /*
   * ---------------------------------------------------------
   * GDP DATA VALIDATION
   * ---------------------------------------------------------
   */

  function validateGdpRecord(record) {
    if (!record || typeof record !== "object") {
      throw new Error("GDP record is required.");
    }

    if (!record.countryCode) {
      throw new Error("GDP record requires countryCode.");
    }

    if (!isFinitePositiveNumber(record.gdpPerCapitaUsd)) {
      throw new Error(
        "GDP record requires a valid gdpPerCapitaUsd value."
      );
    }

    if (!Number.isInteger(Number(record.dataYear))) {
      throw new Error("GDP record requires a valid dataYear.");
    }

    if (!record.source) {
      throw new Error("GDP record requires an authoritative source.");
    }

    return true;
  }

  /*
   * ---------------------------------------------------------
   * OWNER-CONTROLLED FORMULA
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   * This is the only function that should determine the
   * unbounded USD price from GDP data.
   *
   * It can later be replaced by a formally approved formula
   * without rewriting the rest of the pricing engine.
   */

  function calculateRawUsdPrice(gdpPerCapitaUsd) {
    const ratio =
      gdpPerCapitaUsd /
      POLICY.referenceGdpPerCapitaUsd;

    return POLICY.referencePriceUsd * ratio;
  }

  /*
   * ---------------------------------------------------------
   * PRICE LIMITS
   * ---------------------------------------------------------
   */

  function applyPriceLimits(priceUsd) {
    const limited = Math.min(
      POLICY.maximumUsdPerChildPerYear,
      Math.max(
        POLICY.minimumUsdPerChildPerYear,
        priceUsd
      )
    );

    return roundCurrency(limited);
  }

  /*
   * ---------------------------------------------------------
   * LOCAL CURRENCY CONVERSION
   * ---------------------------------------------------------
   *
   * exchangeRate means:
   *
   * 1 USD = exchangeRate units of local currency
   *
   * Example:
   * 1 USD = 2.25 FJD
   */

  function convertUsdToLocalCurrency(priceUsd, currencyCode, exchangeRate) {
    if (!currencyCode) {
      return {
        currency: POLICY.defaultCurrency,
        amount: roundCurrency(priceUsd),
        exchangeRate: 1
      };
    }

    if (currencyCode === POLICY.defaultCurrency) {
      return {
        currency: POLICY.defaultCurrency,
        amount: roundCurrency(priceUsd),
        exchangeRate: 1
      };
    }

    if (!isFinitePositiveNumber(exchangeRate) || exchangeRate <= 0) {
      throw new Error(
        "A valid exchange rate is required for local-currency pricing."
      );
    }

    return {
      currency: currencyCode,
      amount: roundCurrency(priceUsd * exchangeRate),
      exchangeRate: exchangeRate
    };
  }

  /*
   * ---------------------------------------------------------
   * PRICE CALCULATION
   * ---------------------------------------------------------
   */

  function calculateAnnualPrice(options) {
    if (!options || typeof options !== "object") {
      throw new Error("Pricing options are required.");
    }

    const gdpRecord = options.gdpRecord;

    validateGdpRecord(gdpRecord);

    const countryCode =
      String(gdpRecord.countryCode).toUpperCase();

    /*
     * Protected market handling.
     *
     * Fiji pricing is intentionally not automatically replaced
     * by the international GDP formula.
     */
    if (POLICY.protectedMarkets[countryCode]) {
      return {
        engineVersion: ENGINE_VERSION,
        status: "PROTECTED_MARKET",
        countryCode: countryCode,
        pricingYear: Number(options.pricingYear || currentYear()),
        formulaVersion: null,
        currency: options.currencyCode || "FJD",
        priceUsdEquivalent: null,
        priceLocalCurrency: null,
        reason:
          "Protected market requires separately approved owner-controlled pricing."
      };
    }

    const rawPriceUsd =
      calculateRawUsdPrice(
        Number(gdpRecord.gdpPerCapitaUsd)
      );

    const finalPriceUsd =
      applyPriceLimits(rawPriceUsd);

    const localCurrency =
      convertUsdToLocalCurrency(
        finalPriceUsd,
        options.currencyCode || "USD",
        options.exchangeRate
      );

    return {
      engineVersion: ENGINE_VERSION,
      status: "CALCULATED",

      countryCode: countryCode,

      pricingYear:
        Number(options.pricingYear || currentYear()),

      formulaVersion:
        POLICY.formulaVersion,

      gdpPerCapitaUsd:
        Number(gdpRecord.gdpPerCapitaUsd),

      gdpDataYear:
        Number(gdpRecord.dataYear),

      gdpSource:
        String(gdpRecord.source),

      gdpRetrievedAt:
        gdpRecord.retrievedAt || null,

      rawPriceUsd:
        roundCurrency(rawPriceUsd),

      priceUsdPerChildPerYear:
        finalPriceUsd,

      currency:
        localCurrency.currency,

      priceLocalCurrency:
        localCurrency.amount,

      exchangeRate:
        localCurrency.exchangeRate,

      minimumUsd:
        POLICY.minimumUsdPerChildPerYear,

      maximumUsd:
        POLICY.maximumUsdPerChildPerYear,

      calculatedAt:
        new Date().toISOString()
    };
  }

  /*
   * ---------------------------------------------------------
   * AUDIT LOG
   * ---------------------------------------------------------
   */

  function getAuditLog() {
    if (typeof localStorage === "undefined") {
      return [];
    }

    return safeJsonParse(
      localStorage.getItem(AUDIT_KEY),
      []
    );
  }

  function saveAuditRecord(record) {
    if (typeof localStorage === "undefined") {
      return false;
    }

    const auditLog = getAuditLog();

    auditLog.push(record);

    /*
     * Keep the prototype audit log bounded.
     */
    const limitedLog = auditLog.slice(-200);

    localStorage.setItem(
      AUDIT_KEY,
      JSON.stringify(limitedLog)
    );

    return true;
  }

  /*
   * ---------------------------------------------------------
   * PRICE SNAPSHOT
   * ---------------------------------------------------------
   */

  function savePriceSnapshot(priceRecord) {
    if (typeof localStorage === "undefined") {
      return false;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(priceRecord)
    );

    saveAuditRecord({
      event: "ANNUAL_PRICE_CALCULATED",
      engineVersion: ENGINE_VERSION,
      pricingYear: priceRecord.pricingYear,
      countryCode: priceRecord.countryCode,
      priceUsdPerChildPerYear:
        priceRecord.priceUsdPerChildPerYear || null,
      currency: priceRecord.currency || null,
      priceLocalCurrency:
        priceRecord.priceLocalCurrency || null,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  function getSavedPriceSnapshot() {
    if (typeof localStorage === "undefined") {
      return null;
    }

    return safeJsonParse(
      localStorage.getItem(STORAGE_KEY),
      null
    );
  }

  /*
   * ---------------------------------------------------------
   * SAFE FALLBACK
   * ---------------------------------------------------------
   *
   * If current official data is unavailable, do not invent
   * a new price.
   *
   * The last verified price may remain temporarily active.
   */

  function getLastVerifiedPrice() {
    const previous = getSavedPriceSnapshot();

    if (!previous) {
      return {
        status: "NO_VERIFIED_PRICE",
        message:
          "No previously verified annual price is available."
      };
    }

    return {
      status: "FALLBACK_TO_LAST_VERIFIED_PRICE",
      priceRecord: previous
    };
  }

  /*
   * ---------------------------------------------------------
   * PUBLIC API
   * ---------------------------------------------------------
   */

  const api = Object.freeze({

    engineVersion: ENGINE_VERSION,

    policy: POLICY,

    validateGdpRecord,

    calculateRawUsdPrice,

    applyPriceLimits,

    convertUsdToLocalCurrency,

    calculateAnnualPrice,

    savePriceSnapshot,

    getSavedPriceSnapshot,

    getLastVerifiedPrice,

    getAuditLog
  });

  /*
   * ---------------------------------------------------------
   * GLOBAL EXPORT
   * ---------------------------------------------------------
   *
   * No credentials.
   * No payment secrets.
   * No server authorization.
   */

  global.PacificEducationAnnualGdpPricingEngine = api;

})(window);
