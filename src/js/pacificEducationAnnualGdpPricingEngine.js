/*
 * =========================================================
 * PACIFIC EDUCATION
 * ANNUAL GDP-BASED PRICING ENGINE
 * =========================================================
 *
 * File:
 * src/js/pacificEducationAnnualGdpPricingEngine.js
 *
 * Version: 1.1.0
 * Status: PROTOTYPE / OWNER-CONTROLLED SPECIFICATION
 *
 * IMPORTANT
 * ---------
 * This browser-side module is NOT a production security
 * boundary and does NOT retrieve or authorize live payments.
 *
 * Production GDP data, exchange rates, pricing policy,
 * authorization, payment processing and audit records MUST
 * be verified server-side.
 *
 * =========================================================
 */

(function (global) {
  "use strict";

  const ENGINE_VERSION = "1.1.0";

  const STORAGE_KEY =
    "pacificEducationAnnualGdpPricing";

  const AUDIT_KEY =
    "pacificEducationAnnualGdpPricingAudit";

  const POLICY = Object.freeze({
    minimumUsdPerChildPerYear: 0.50,
    maximumUsdPerChildPerYear: 10.00,

    defaultCurrency: "USD",

    pricingFrequency: "ANNUAL",

    protectedMarkets: Object.freeze({
      FJ: true
    }),

    formulaVersion: "GDP_INDEX_V1",

    /*
     * Prototype reference values only.
     * These are NOT live economic data.
     */
    referenceGdpPerCapitaUsd: 10000,
    referencePriceUsd: 3.00,

    maxAuditRecords: 200
  });

  /*
   * ---------------------------------------------------------
   * STATUS VALUES
   * ---------------------------------------------------------
   */

  const STATUS = Object.freeze({
    CALCULATED: "CALCULATED",
    PROTECTED_MARKET: "PROTECTED_MARKET",
    DATA_UNAVAILABLE: "DATA_UNAVAILABLE",
    DATA_INVALID: "DATA_INVALID",
    PRODUCTION_REQUIRED: "PRODUCTION_REQUIRED",
    FALLBACK_TO_LAST_VERIFIED_PRICE:
      "FALLBACK_TO_LAST_VERIFIED_PRICE",
    NO_VERIFIED_PRICE: "NO_VERIFIED_PRICE"
  });

  /*
   * ---------------------------------------------------------
   * BASIC UTILITIES
   * ---------------------------------------------------------
   */

  function currentYear() {
    return new Date().getUTCFullYear();
  }

  function roundCurrency(value) {
    return Math.round(
      (Number(value) + Number.EPSILON) * 100
    ) / 100;
  }

  function isPositiveFiniteNumber(value) {
    return (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value > 0
    );
  }

  function isValidYear(value) {
    const year = Number(value);

    return (
      Number.isInteger(year) &&
      year >= 1900 &&
      year <= currentYear() + 1
    );
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function hasLocalStorage() {
    return (
      typeof global !== "undefined" &&
      typeof global.localStorage !== "undefined"
    );
  }

  /*
   * ---------------------------------------------------------
   * GDP RECORD VALIDATION
   * ---------------------------------------------------------
   */

  function validateGdpRecord(record) {
    const errors = [];

    if (!record || typeof record !== "object") {
      errors.push("GDP record is required.");
    } else {
      if (
        typeof record.countryCode !== "string" ||
        record.countryCode.trim().length !== 2
      ) {
        errors.push(
          "countryCode must be a two-letter country code."
        );
      }

      if (!isPositiveFiniteNumber(record.gdpPerCapitaUsd)) {
        errors.push(
          "gdpPerCapitaUsd must be greater than zero."
        );
      }

      if (!isValidYear(record.dataYear)) {
        errors.push(
          "dataYear must be a valid economic-data year."
        );
      }

      if (
        typeof record.source !== "string" ||
        record.source.trim().length === 0
      ) {
        errors.push(
          "An authoritative GDP data source is required."
        );
      }
    }

    if (errors.length > 0) {
      return {
        valid: false,
        status: STATUS.DATA_INVALID,
        errors
      };
    }

    return {
      valid: true,
      status: STATUS.CALCULATED,
      errors: []
    };
  }

  /*
   * ---------------------------------------------------------
   * OWNER-CONTROLLED FORMULA
   * ---------------------------------------------------------
   *
   * This is deliberately isolated.
   *
   * It must be replaced or formally approved before commercial
   * activation.
   */

  function calculateRawUsdPrice(gdpPerCapitaUsd) {
    if (!isPositiveFiniteNumber(gdpPerCapitaUsd)) {
      throw new Error(
        "GDP per capita must be greater than zero."
      );
    }

    const ratio =
      gdpPerCapitaUsd /
      POLICY.referenceGdpPerCapitaUsd;

    return (
      POLICY.referencePriceUsd *
      ratio
    );
  }

  /*
   * ---------------------------------------------------------
   * PRICE LIMITS
   * ---------------------------------------------------------
   */

  function applyPriceLimits(priceUsd) {
    if (!Number.isFinite(Number(priceUsd))) {
      throw new Error(
        "Price must be a finite number."
      );
    }

    return roundCurrency(
      Math.min(
        POLICY.maximumUsdPerChildPerYear,
        Math.max(
          POLICY.minimumUsdPerChildPerYear,
          Number(priceUsd)
        )
      )
    );
  }

  /*
   * ---------------------------------------------------------
   * LOCAL CURRENCY CONVERSION
   * ---------------------------------------------------------
   *
   * exchangeRate:
   *
   * 1 USD = exchangeRate units of local currency
   *
   * Exchange rates must come from an approved source.
   */

  function convertUsdToLocalCurrency(
    priceUsd,
    currencyCode,
    exchangeRate
  ) {
    const currency =
      typeof currencyCode === "string" &&
      currencyCode.trim()
        ? currencyCode.trim().toUpperCase()
        : POLICY.defaultCurrency;

    if (!isPositiveFiniteNumber(priceUsd)) {
      throw new Error(
        "USD price must be greater than zero."
      );
    }

    if (currency === POLICY.defaultCurrency) {
      return {
        currency,
        amount: roundCurrency(priceUsd),
        exchangeRate: 1
      };
    }

    if (!isPositiveFiniteNumber(exchangeRate)) {
      throw new Error(
        "A valid approved exchange rate is required."
      );
    }

    return {
      currency,
      amount: roundCurrency(
        priceUsd * exchangeRate
      ),
      exchangeRate
    };
  }

  /*
   * ---------------------------------------------------------
   * DATA AVAILABILITY CHECK
   * ---------------------------------------------------------
   */

  function checkDataAvailability(gdpRecord) {
    if (!gdpRecord) {
      return {
        available: false,
        status: STATUS.DATA_UNAVAILABLE,
        reason: "No GDP data supplied."
      };
    }

    const validation =
      validateGdpRecord(gdpRecord);

    if (!validation.valid) {
      return {
        available: false,
        status: STATUS.DATA_INVALID,
        reason: validation.errors.join(" ")
      };
    }

    return {
      available: true,
      status: STATUS.CALCULATED,
      reason: null
    };
  }

  /*
   * ---------------------------------------------------------
   * ANNUAL PRICE CALCULATION
   * ---------------------------------------------------------
   */

  function calculateAnnualPrice(options) {
    if (!options || typeof options !== "object") {
      return {
        status: STATUS.DATA_INVALID,
        reason: "Pricing options are required."
      };
    }

    const gdpRecord =
      options.gdpRecord || null;

    const dataStatus =
      checkDataAvailability(gdpRecord);

    if (!dataStatus.available) {
      return {
        status: dataStatus.status,
        pricingYear:
          Number(
            options.pricingYear || currentYear()
          ),
        reason: dataStatus.reason
      };
    }

    const countryCode =
      String(
        gdpRecord.countryCode
      ).trim().toUpperCase();

    const pricingYear =
      Number(
        options.pricingYear || currentYear()
      );

    if (!isValidYear(pricingYear)) {
      return {
        status: STATUS.DATA_INVALID,
        reason: "Invalid pricing year."
      };
    }

    /*
     * Fiji and any future protected market must not be
     * overwritten by the international GDP formula.
     */

    if (
      POLICY.protectedMarkets[countryCode]
    ) {
      return {
        engineVersion: ENGINE_VERSION,
        status: STATUS.PROTECTED_MARKET,
        countryCode,
        pricingYear,
        formulaVersion: null,
        currency:
          options.currencyCode || "FJD",
        priceUsdPerChildPerYear: null,
        priceLocalCurrency: null,
        reason:
          "Protected market requires separately approved owner-controlled pricing."
      };
    }

    /*
     * Prototype production boundary.
     *
     * Live commercial pricing must not be authorized merely
     * from browser-side GDP data.
     */

    if (
      options.productionAuthorization === true
    ) {
      return {
        engineVersion: ENGINE_VERSION,
        status: STATUS.PRODUCTION_REQUIRED,
        countryCode,
        pricingYear,
        reason:
          "Production pricing authorization must be performed server-side."
      };
    }

    const rawPriceUsd =
      calculateRawUsdPrice(
        Number(
          gdpRecord.gdpPerCapitaUsd
        )
      );

    const finalPriceUsd =
      applyPriceLimits(
        rawPriceUsd
      );

    let localCurrency;

    try {
      localCurrency =
        convertUsdToLocalCurrency(
          finalPriceUsd,
          options.currencyCode || "USD",
          options.exchangeRate
        );
    } catch (error) {
      return {
        engineVersion: ENGINE_VERSION,
        status: STATUS.DATA_INVALID,
        countryCode,
        pricingYear,
        reason: error.message
      };
    }

    return {
      engineVersion: ENGINE_VERSION,

      status: STATUS.CALCULATED,

      countryCode,

      pricingYear,

      formulaVersion:
        POLICY.formulaVersion,

      gdpPerCapitaUsd:
        Number(
          gdpRecord.gdpPerCapitaUsd
        ),

      gdpDataYear:
        Number(
          gdpRecord.dataYear
        ),

      gdpSource:
        String(
          gdpRecord.source
        ),

      gdpRetrievedAt:
        gdpRecord.retrievedAt || null,

      rawPriceUsd:
        roundCurrency(
          rawPriceUsd
        ),

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
   * ANNUAL CHANGE CHECK
   * ---------------------------------------------------------
   *
   * The engine does not silently overwrite an existing price
   * merely because the calendar year changed.
   */

  function shouldCalculateNewAnnualPrice(
    existingRecord,
    requestedYear
  ) {
    const year =
      Number(
        requestedYear || currentYear()
      );

    if (!existingRecord) {
      return true;
    }

    if (
      Number(existingRecord.pricingYear) <
      year
    ) {
      return true;
    }

    return false;
  }

  /*
   * ---------------------------------------------------------
   * AUDIT LOG
   * ---------------------------------------------------------
   */

  function getAuditLog() {
    if (!hasLocalStorage()) {
      return [];
    }

    return safeJsonParse(
      global.localStorage.getItem(
        AUDIT_KEY
      ),
      []
    );
  }

  function saveAuditRecord(record) {
    if (!hasLocalStorage()) {
      return false;
    }

    const auditLog =
      getAuditLog();

    auditLog.push({
      ...record,
      engineVersion:
        ENGINE_VERSION,
      timestamp:
        new Date().toISOString()
    });

    const limitedLog =
      auditLog.slice(
        -POLICY.maxAuditRecords
      );

    global.localStorage.setItem(
      AUDIT_KEY,
      JSON.stringify(
        limitedLog
      )
    );

    return true;
  }

  /*
   * ---------------------------------------------------------
   * PRICE SNAPSHOT
   * ---------------------------------------------------------
   */

  function savePriceSnapshot(
    priceRecord
  ) {
    if (!hasLocalStorage()) {
      return false;
    }

    if (
      !priceRecord ||
      typeof priceRecord !== "object"
    ) {
      return false;
    }

    global.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        priceRecord
      )
    );

    saveAuditRecord({
      event:
        "ANNUAL_PRICE_SNAPSHOT_SAVED",

      pricingYear:
        priceRecord.pricingYear,

      countryCode:
        priceRecord.countryCode,

      status:
        priceRecord.status,

      priceUsdPerChildPerYear:
        priceRecord.priceUsdPerChildPerYear ??
        null,

      currency:
        priceRecord.currency ||
        null,

      priceLocalCurrency:
        priceRecord.priceLocalCurrency ??
        null
    });

    return true;
  }

  function getSavedPriceSnapshot() {
    if (!hasLocalStorage()) {
      return null;
    }

    return safeJsonParse(
      global.localStorage.getItem(
        STORAGE_KEY
      ),
      null
    );
  }

  /*
   * ---------------------------------------------------------
   * SAFE FALLBACK
   * ---------------------------------------------------------
   *
   * If current economic data cannot be verified, the engine
   * must NOT invent a new price.
   */

  function getLastVerifiedPrice() {
    const previous =
      getSavedPriceSnapshot();

    if (!previous) {
      return {
        status:
          STATUS.NO_VERIFIED_PRICE,

        priceRecord:
          null,

        message:
          "No previously verified annual price is available."
      };
    }

    return {
      status:
        STATUS.FALLBACK_TO_LAST_VERIFIED_PRICE,

      priceRecord:
        previous,

      message:
        "Current pricing data is unavailable or invalid. The last saved price remains available for controlled fallback."
    };
  }

  /*
   * ---------------------------------------------------------
   * ANNUAL PRICING DECISION
   * ---------------------------------------------------------
   *
   * This function determines whether a new calculation is
   * needed. It does NOT fetch external data.
   */

  function evaluateAnnualPricing(options) {
    const existingRecord =
      getSavedPriceSnapshot();

    const pricingYear =
      Number(
        options &&
        options.pricingYear
          ? options.pricingYear
          : currentYear()
      );

    if (
      existingRecord &&
      !shouldCalculateNewAnnualPrice(
        existingRecord,
        pricingYear
      )
    ) {
      return {
        status:
          "CURRENT_PRICE_ALREADY_VERIFIED",

        pricingYear,

        priceRecord:
          existingRecord
      };
    }

    if (
      !options ||
      !options.gdpRecord
    ) {
      return getLastVerifiedPrice();
    }

    const calculated =
      calculateAnnualPrice({
        ...options,
        pricingYear
      });

    if (
      calculated.status !==
      STATUS.CALCULATED
    ) {
      return calculated;
    }

    savePriceSnapshot(
      calculated
    );

    return calculated;
  }

  /*
   * ---------------------------------------------------------
   * PRODUCTION DATA BOUNDARY
   * ---------------------------------------------------------
   *
   * This prototype intentionally does not make network calls.
   *
   * Production implementation should supply verified GDP data
   * from a secure server/API layer.
   */

  function getProductionDataBoundary() {
    return {
      status:
        STATUS.PRODUCTION_REQUIRED,

      engineVersion:
        ENGINE_VERSION,

      message:
        "Live GDP data, exchange rates, commercial pricing authorization and payment decisions must be verified server-side.",

      requiredData: [
        "countryCode",
        "gdpPerCapitaUsd",
        "dataYear",
        "source",
        "retrievedAt",
        "currencyCode",
        "exchangeRate"
      ]
    };
  }

  /*
   * ---------------------------------------------------------
   * PUBLIC API
   * ---------------------------------------------------------
   */

  const api = Object.freeze({

    engineVersion:
      ENGINE_VERSION,

    status:
      STATUS,

    policy:
      POLICY,

    validateGdpRecord,

    checkDataAvailability,

    calculateRawUsdPrice,

    applyPriceLimits,

    convertUsdToLocalCurrency,

    calculateAnnualPrice,

    shouldCalculateNewAnnualPrice,

    evaluateAnnualPricing,

    savePriceSnapshot,

    getSavedPriceSnapshot,

    getLastVerifiedPrice,

    getAuditLog,

    getProductionDataBoundary
  });

  /*
   * ---------------------------------------------------------
   * GLOBAL EXPORT
   * ---------------------------------------------------------
   */

  global.PacificEducationAnnualGdpPricingEngine =
    api;

})(window);
