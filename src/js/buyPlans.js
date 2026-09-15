/* =========================================================
   PACIFIC EDUCATION — BUY PLANS
   Annual Subscription Plans
   Fiji: Owner-Controlled FJD Pricing
   International: Annual GDP-Based Pricing

   PAYMENT MODES:
   - Online payment request
   - Offline payment request

   SECURITY:
   - Never store passwords, payment secrets, API keys,
     card details, bank credentials, or provider secrets here.
   - Payment processing and payment verification MUST be
     handled server-side or by an approved payment provider.
   - Client-side payment status is NEVER proof of payment.
   - Pricing remains owner-controlled.
   - Fiji pricing remains protected from the international
     GDP formula.
   ========================================================= */

(function () {
    "use strict";

    const BUY_PLANS_VERSION = "1.1.0";

    /*
     * ---------------------------------------------------------
     * OWNER-CONTROLLED FIJI PRICING
     * ---------------------------------------------------------
     *
     * These prices are intentionally separate from the
     * international GDP-based pricing engine.
     */

    const FIJI_PRICES = Object.freeze({
        student: 1,
        individual: 10,
        parent: 10,
        organization: 100
    });

    /*
     * ---------------------------------------------------------
     * PLAN DEFINITIONS
     * ---------------------------------------------------------
     *
     * The international price is NOT permanently stored here.
     * It must come from the annual GDP pricing engine.
     */

    const PLANS = Object.freeze({
        student: Object.freeze({
            id: "student",
            name: "Student",
            billing: "annual",
            description:
                "Affordable annual access for students."
        }),

        individual: Object.freeze({
            id: "individual",
            name: "Individual",
            billing: "annual",
            description:
                "Annual Pacific Education access for individual learners."
        }),

        parent: Object.freeze({
            id: "parent",
            name: "Parent",
            billing: "annual",
            description:
                "Annual access for parents supporting home learning."
        }),

        organization: Object.freeze({
            id: "organization",
            name: "Organization",
            billing: "annual",
            description:
                "Annual organization access for schools and education organizations."
        })
    });

    /*
     * ---------------------------------------------------------
     * COUNTRY IDENTIFIERS
     * ---------------------------------------------------------
     */

    const FIJI_CODES = Object.freeze([
        "FJ",
        "FIJI",
        "FIJI ISLANDS"
    ]);

    /*
     * ---------------------------------------------------------
     * PAYMENT MODES
     * ---------------------------------------------------------
     */

    const PAYMENT_MODES = Object.freeze({
        ONLINE: "online",
        OFFLINE: "offline"
    });

    /*
     * ---------------------------------------------------------
     * STATUS VALUES
     * ---------------------------------------------------------
     */

    const STATUS = Object.freeze({
        READY: "ready",
        CHECKOUT_REQUIRED: "checkout_required",
        OFFLINE_VERIFICATION_REQUIRED:
            "offline_verification_required",
        PAYMENT_VERIFICATION_REQUIRED:
            "payment_verification_required",
        PRICE_UNAVAILABLE:
            "price_unavailable",
        INVALID_REQUEST:
            "invalid_request",
        SERVER_VERIFICATION_REQUIRED:
            "server_verification_required"
    });

    /*
     * ---------------------------------------------------------
     * BASIC HELPERS
     * ---------------------------------------------------------
     */

    function getCurrentYear() {
        return new Date().getUTCFullYear();
    }

    function getCurrency(countryCode) {
        const country =
            String(countryCode || "")
                .trim()
                .toUpperCase();

        return FIJI_CODES.includes(country)
            ? "FJD"
            : "USD";
    }

    function isFiji(countryCode) {
        return getCurrency(countryCode) === "FJD";
    }

    function getPlan(planId) {
        return PLANS[planId] || null;
    }

    function getPlans() {
        return Object.values(PLANS).map(function (plan) {
            return {
                id: plan.id,
                name: plan.name,
                billing: plan.billing,
                description: plan.description
            };
        });
    }

    /*
     * ---------------------------------------------------------
     * GDP ENGINE ACCESS
     * ---------------------------------------------------------
     *
     * The GDP engine is optional during application startup,
     * but international commercial pricing must not be invented
     * if the engine is unavailable.
     */

    function getGdpEngine() {
        if (
            window.PacificEducationAnnualGdpPricingEngine
        ) {
            return (
                window.PacificEducationAnnualGdpPricingEngine
            );
        }

        return null;
    }

    /*
     * ---------------------------------------------------------
     * FIJI PRICE
     * ---------------------------------------------------------
     */

    function getFijiPrice(planId) {
        if (
            !Object.prototype.hasOwnProperty.call(
                FIJI_PRICES,
                planId
            )
        ) {
            return null;
        }

        return FIJI_PRICES[planId];
    }

    /*
     * ---------------------------------------------------------
     * INTERNATIONAL GDP PRICE
     * ---------------------------------------------------------
     *
     * The GDP engine calculates a base annual per-child price.
     *
     * IMPORTANT:
     * Organization/Individual/Parent plan multipliers have NOT
     * been invented here. They remain owner-controlled and must
     * be formally approved before being applied to the GDP base.
     *
     * For now the GDP engine price is returned as the approved
     * annual base price for each international plan.
     */

    function calculateInternationalPrice(options) {
        options = options || {};

        const engine = getGdpEngine();

        if (!engine) {
            return {
                status: STATUS.PRICE_UNAVAILABLE,
                reason:
                    "Annual GDP pricing engine is not available."
            };
        }

        if (
            typeof engine.calculateAnnualPrice !==
            "function"
        ) {
            return {
                status: STATUS.PRICE_UNAVAILABLE,
                reason:
                    "Annual GDP pricing calculation is unavailable."
            };
        }

        const result =
            engine.calculateAnnualPrice({
                gdpRecord:
                    options.gdpRecord || null,

                pricingYear:
                    options.pricingYear ||
                    getCurrentYear(),

                currencyCode:
                    options.currencyCode ||
                    "USD",

                exchangeRate:
                    options.exchangeRate
            });

        if (
            !result ||
            result.status !== "CALCULATED"
        ) {
            return {
                status:
                    result &&
                    result.status
                        ? result.status
                        : STATUS.PRICE_UNAVAILABLE,

                reason:
                    result &&
                    result.reason
                        ? result.reason
                        : "International price is unavailable."
            };
        }

        return {
            status: STATUS.READY,

            pricingYear:
                result.pricingYear,

            formulaVersion:
                result.formulaVersion,

            gdpDataYear:
                result.gdpDataYear,

            gdpSource:
                result.gdpSource,

            priceUsd:
                result.priceUsdPerChildPerYear,

            currency:
                result.currency,

            priceLocal:
                result.priceLocalCurrency,

            exchangeRate:
                result.exchangeRate
        };
    }

    /*
     * ---------------------------------------------------------
     * GET PLAN PRICE
     * ---------------------------------------------------------
     */

    function getPlanPricing(planId, options) {
        options = options || {};

        const plan = getPlan(planId);

        if (!plan) {
            return {
                status: STATUS.INVALID_REQUEST,
                reason:
                    "Invalid Pacific Education plan."
            };
        }

        const countryCode =
            options.countryCode || "";

        /*
         * Fiji always uses owner-controlled FJD pricing.
         */

        if (isFiji(countryCode)) {
            const fijiPrice =
                getFijiPrice(planId);

            return {
                status: STATUS.READY,

                planId: plan.id,

                planName: plan.name,

                countryCode:
                    String(countryCode)
                        .trim()
                        .toUpperCase(),

                currency: "FJD",

                price: fijiPrice,

                billing: plan.billing,

                pricingSource:
                    "OWNER_CONTROLLED_FIJI_PRICING",

                pricingYear:
                    getCurrentYear()
            };
        }

        /*
         * International pricing comes from the GDP engine.
         */

        const international =
            calculateInternationalPrice({
                gdpRecord:
                    options.gdpRecord,

                pricingYear:
                    options.pricingYear,

                currencyCode:
                    options.currencyCode || "USD",

                exchangeRate:
                    options.exchangeRate
            });

        if (
            international.status !== STATUS.READY
        ) {
            return {
                status:
                    international.status,

                planId: plan.id,

                planName: plan.name,

                reason:
                    international.reason ||
                    "International pricing is unavailable."
            };
        }

        return {
            status: STATUS.READY,

            planId: plan.id,

            planName: plan.name,

            countryCode:
                String(countryCode)
                    .trim()
                    .toUpperCase(),

            currency:
                international.currency,

            price:
                international.priceLocal,

            priceUsd:
                international.priceUsd,

            billing:
                plan.billing,

            pricingSource:
                "ANNUAL_GDP_PRICING_ENGINE",

            formulaVersion:
                international.formulaVersion,

            gdpDataYear:
                international.gdpDataYear,

            gdpSource:
                international.gdpSource,

            exchangeRate:
                international.exchangeRate,

            pricingYear:
                international.pricingYear
        };
    }

    /*
     * ---------------------------------------------------------
     * FORMAT PRICE
     * ---------------------------------------------------------
     */

    function formatPlanPrice(planId, options) {
        const pricing =
            getPlanPricing(
                planId,
                options
            );

        if (
            pricing.status !== STATUS.READY
        ) {
            return null;
        }

        return new Intl.NumberFormat(
            pricing.currency === "FJD"
                ? "en-FJ"
                : "en-US",
            {
                style: "currency",
                currency: pricing.currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(pricing.price);
    }

    /*
     * ---------------------------------------------------------
     * GET PLANS FOR COUNTRY
     * ---------------------------------------------------------
     */

    function getPlansForCountry(options) {
        options = options || {};

        return getPlans().map(function (plan) {
            const pricing =
                getPlanPricing(
                    plan.id,
                    options
                );

            return {
                id: plan.id,

                name: plan.name,

                billing: plan.billing,

                description:
                    plan.description,

                status:
                    pricing.status,

                price:
                    pricing.price !== undefined
                        ? pricing.price
                        : null,

                priceUsd:
                    pricing.priceUsd !== undefined
                        ? pricing.priceUsd
                        : null,

                currency:
                    pricing.currency || null,

                formattedPrice:
                    pricing.status === STATUS.READY
                        ? formatPlanPrice(
                            plan.id,
                            options
                        )
                        : null,

                pricingSource:
                    pricing.pricingSource ||
                    null,

                pricingYear:
                    pricing.pricingYear ||
                    null,

                gdpDataYear:
                    pricing.gdpDataYear ||
                    null,

                gdpSource:
                    pricing.gdpSource ||
                    null
            };
        });
    }

    /*
     * ---------------------------------------------------------
     * VALIDATE SUBSCRIPTION REQUEST
     * ---------------------------------------------------------
     */

    function validateSubscriptionRequest(
        request
    ) {
        if (
            !request ||
            typeof request !== "object"
        ) {
            return {
                valid: false,
                error:
                    "Invalid subscription request."
            };
        }

        if (!PLANS[request.planId]) {
            return {
                valid: false,
                error:
                    "Invalid Pacific Education plan."
            };
        }

        if (!request.countryCode) {
            return {
                valid: false,
                error:
                    "Country information is required."
            };
        }

        const paymentMode =
            request.paymentMode ||
            PAYMENT_MODES.ONLINE;

        if (
            paymentMode !==
                PAYMENT_MODES.ONLINE &&
            paymentMode !==
                PAYMENT_MODES.OFFLINE
        ) {
            return {
                valid: false,
                error:
                    "Invalid payment method."
            };
        }

        return {
            valid: true,
            error: null
        };
    }

    /*
     * ---------------------------------------------------------
     * AUDIT
     * ---------------------------------------------------------
     */

    function audit(
        eventName,
        details
    ) {
        try {
            if (
                window.PacificEducationApp &&
                typeof
                    window.PacificEducationApp
                        .audit ===
                    "function"
            ) {
                window.PacificEducationApp.audit(
                    eventName,
                    details || {}
                );
            }
        } catch (error) {
            /*
             * Never expose sensitive information through
             * client-side audit/error handling.
             */
        }
    }

    /*
     * ---------------------------------------------------------
     * REQUEST ONLINE PAYMENT
     * ---------------------------------------------------------
     *
     * This creates a payment request only.
     *
     * It does NOT confirm payment.
     */

    function requestOnlinePayment(
        request,
        pricing
    ) {
        const detail = {
            paymentMode:
                PAYMENT_MODES.ONLINE,

            planId:
                request.planId,

            countryCode:
                request.countryCode,

            currency:
                pricing.currency,

            amount:
                pricing.price,

            billing:
                "annual",

            pricingYear:
                pricing.pricingYear,

            pricingSource:
                pricing.pricingSource,

            clientStatus:
                STATUS.CHECKOUT_REQUIRED
        };

        audit(
            "online_payment_requested",
            {
                planId:
                    request.planId,

                currency:
                    pricing.currency,

                paymentMode:
                    PAYMENT_MODES.ONLINE
            }
        );

        window.dispatchEvent(
            new CustomEvent(
                "pacificEducationOnlinePaymentRequested",
                {
                    detail: detail
                }
            )
        );

        return {
            success: true,

            status:
                STATUS.CHECKOUT_REQUIRED,

            paymentMode:
                PAYMENT_MODES.ONLINE,

            paymentVerificationRequired:
                true,

            detail: detail
        };
    }

    /*
     * ---------------------------------------------------------
     * REQUEST OFFLINE PAYMENT
     * ---------------------------------------------------------
     *
     * Offline payment must be verified before access is
     * activated.
     *
     * This may later support:
     * - bank deposit
     * - approved cash collection
     * - school/agent collection
     * - owner-approved local payment channels
     */

    function requestOfflinePayment(
        request,
        pricing
    ) {
        const detail = {
            paymentMode:
                PAYMENT_MODES.OFFLINE,

            planId:
                request.planId,

            countryCode:
                request.countryCode,

            currency:
                pricing.currency,

            amount:
                pricing.price,

            billing:
                "annual",

            pricingYear:
                pricing.pricingYear,

            pricingSource:
                pricing.pricingSource,

            clientStatus:
                STATUS.OFFLINE_VERIFICATION_REQUIRED,

            paymentVerificationRequired:
                true
        };

        audit(
            "offline_payment_requested",
            {
                planId:
                    request.planId,

                currency:
                    pricing.currency,

                paymentMode:
                    PAYMENT_MODES.OFFLINE
            }
        );

        window.dispatchEvent(
            new CustomEvent(
                "pacificEducationOfflinePaymentRequested",
                {
                    detail: detail
                }
            )
        );

        return {
            success: true,

            status:
                STATUS.OFFLINE_VERIFICATION_REQUIRED,

            paymentMode:
                PAYMENT_MODES.OFFLINE,

            paymentVerificationRequired:
                true,

            detail: detail
        };
    }

    /*
     * ---------------------------------------------------------
     * REQUEST SUBSCRIPTION
     * ---------------------------------------------------------
     */

    function requestSubscription(
        options
    ) {
        options =
            options || {};

        const request = {
            planId:
                options.planId,

            countryCode:
                options.countryCode,

            paymentMode:
                options.paymentMode ||
                PAYMENT_MODES.ONLINE
        };

        const validation =
            validateSubscriptionRequest(
                request
            );

        if (!validation.valid) {
            return Promise.reject(
                new Error(
                    validation.error
                )
            );
        }

        const pricing =
            getPlanPricing(
                request.planId,
                {
                    countryCode:
                        request.countryCode,

                    gdpRecord:
                        options.gdpRecord,

                    pricingYear:
                        options.pricingYear,

                    currencyCode:
                        options.currencyCode,

                    exchangeRate:
                        options.exchangeRate
                }
            );

        if (
            pricing.status !==
            STATUS.READY
        ) {
            return Promise.reject(
                new Error(
                    pricing.reason ||
                    "Approved pricing is not available."
                )
            );
        }

        let result;

        if (
            request.paymentMode ===
            PAYMENT_MODES.OFFLINE
        ) {
            result =
                requestOfflinePayment(
                    request,
                    pricing
                );
        } else {
            result =
                requestOnlinePayment(
                    request,
                    pricing
                );
        }

        return Promise.resolve(
            result
        );
    }

    /*
     * ---------------------------------------------------------
     * PAYMENT VERIFICATION RESULT
     * ---------------------------------------------------------
     *
     * This helper only interprets a server/provider response.
     *
     * It must NEVER be called with an untrusted client-created
     * "paid" value as proof of payment.
     */

    function getPaymentVerificationStatus(
        verification
    ) {
        if (
            !verification ||
            typeof verification !== "object"
        ) {
            return {
                verified: false,

                status:
                    STATUS.SERVER_VERIFICATION_REQUIRED
            };
        }

        if (
            verification.verified !== true
        ) {
            return {
                verified: false,

                status:
                    STATUS.SERVER_VERIFICATION_REQUIRED
            };
        }

        return {
            verified: true,

            status: "payment_verified",

            subscriptionId:
                verification.subscriptionId ||
                null,

            expiresAt:
                verification.expiresAt ||
                null
        };
    }

    /*
     * ---------------------------------------------------------
     * SUBSCRIPTION STATUS
     * ---------------------------------------------------------
     */

    function getSubscriptionStatus(
        subscription
    ) {
        if (!subscription) {
            return {
                active: false,

                status:
                    "not_subscribed"
            };
        }

        if (
            subscription.expiresAt
        ) {
            const expiry =
                new Date(
                    subscription.expiresAt
                );

            const now =
                new Date();

            if (
                !Number.isNaN(
                    expiry.getTime()
                ) &&
                expiry <= now
            ) {
                return {
                    active: false,

                    status:
                        "expired",

                    expiresAt:
                        subscription.expiresAt
                };
            }
        }

        return {
            active:
                Boolean(
                    subscription.active
                ),

            status:
                subscription.active
                    ? "active"
                    : "inactive",

            expiresAt:
                subscription.expiresAt ||
                null
        };
    }

    /*
     * ---------------------------------------------------------
     * PLAN CARD
     * ---------------------------------------------------------
     */

    function createPlanCard(
        planId,
        options
    ) {
        options =
            options || {};

        const plan =
            getPlan(planId);

        if (!plan) {
            return null;
        }

        const pricing =
            getPlanPricing(
                planId,
                options
            );

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "pacific-education-plan-card";

        card.dataset.planId =
            plan.id;

        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            plan.name;

        const price =
            document.createElement(
                "p"
            );

        price.className =
            "plan-price";

        if (
            pricing.status ===
            STATUS.READY
        ) {
            price.textContent =
                formatPlanPrice(
                    plan.id,
                    options
                ) +
                " / year";
        } else {
            price.textContent =
                "Annual price requires verification.";
        }

        const description =
            document.createElement(
                "p"
            );

        description.textContent =
            plan.description;

        const onlineButton =
            document.createElement(
                "button"
            );

        onlineButton.type =
            "button";

        onlineButton.textContent =
            "Pay Online";

        onlineButton.disabled =
            pricing.status !==
            STATUS.READY;

        onlineButton.addEventListener(
            "click",
            function () {
                onlineButton.disabled =
                    true;

                requestSubscription({
                    planId:
                        plan.id,

                    countryCode:
                        options.countryCode,

                    paymentMode:
                        PAYMENT_MODES.ONLINE,

                    gdpRecord:
                        options.gdpRecord,

                    pricingYear:
                        options.pricingYear,

                    currencyCode:
                        options.currencyCode,

                    exchangeRate:
                        options.exchangeRate
                })
                    .then(function (
                        result
                    ) {
                        window.dispatchEvent(
                            new CustomEvent(
                                "pacificEducationCheckoutRequired",
                                {
                                    detail:
                                        result
                                }
                            )
                        );

                        onlineButton.disabled =
                            false;
                    })
                    .catch(function (
                        error
                    ) {
                        console.error(
                            "Pacific Education online payment request failed."
                        );

                        onlineButton.disabled =
                            false;

                        window.dispatchEvent(
                            new CustomEvent(
                                "pacificEducationSubscriptionError",
                                {
                                    detail: {
                                        message:
                                            error.message
                                    }
                                }
                            )
                        );
                    });
            }
        );

        const offlineButton =
            document.createElement(
                "button"
            );

        offlineButton.type =
            "button";

        offlineButton.textContent =
            "Pay Offline";

        offlineButton.disabled =
            pricing.status !==
            STATUS.READY;

        offlineButton.addEventListener(
            "click",
            function () {
                offlineButton.disabled =
                    true;

                requestSubscription({
                    planId:
                        plan.id,

                    countryCode:
                        options.countryCode,

                    paymentMode:
                        PAYMENT_MODES.OFFLINE,

                    gdpRecord:
                        options.gdpRecord,

                    pricingYear:
                        options.pricingYear,

                    currencyCode:
                        options.currencyCode,

                    exchangeRate:
                        options.exchangeRate
                })
                    .then(function (
                        result
                    ) {
                        window.dispatchEvent(
                            new CustomEvent(
                                "pacificEducationOfflinePaymentRequired",
                                {
                                    detail:
                                        result
                                }
                            )
                        );

                        offlineButton.disabled =
                            false;
                    })
                    .catch(function (
                        error
                    ) {
                        console.error(
                            "Pacific Education offline payment request failed."
                        );

                        offlineButton.disabled =
                            false;

                        window.dispatchEvent(
                            new CustomEvent(
                                "pacificEducationSubscriptionError",
                                {
                                    detail: {
                                        message:
                                            error.message
                                    }
                                }
                            )
                        );
                    });
            }
        );

        card.appendChild(
            title
        );

        card.appendChild(
            price
        );

        card.appendChild(
            description
        );

        card.appendChild(
            onlineButton
        );

        card.appendChild(
            offlineButton
        );

        return card;
    }

    /*
     * ---------------------------------------------------------
     * RENDER
     * ---------------------------------------------------------
     */

    function render(
        container,
        options
    ) {
        if (!container) {
            throw new Error(
                "Buy Plans container was not found."
            );
        }

        options =
            options || {};

        container.innerHTML =
            "";

        getPlans().forEach(
            function (plan) {
                const card =
                    createPlanCard(
                        plan.id,
                        options
                    );

                if (card) {
                    container.appendChild(
                        card
                    );
                }
            }
        );

        audit(
            "buy_plans_rendered",
            {
                currency:
                    getCurrency(
                        options.countryCode
                    ),

                paymentModes: [
                    PAYMENT_MODES.ONLINE,
                    PAYMENT_MODES.OFFLINE
                ],

                planCount:
                    getPlans().length
            }
        );

        return container;
    }

    /*
     * ---------------------------------------------------------
     * SECURITY WARNING
     * ---------------------------------------------------------
     */

    function showConfidentialInformationWarning() {
        const warning =
            document.createElement(
                "div"
            );

        warning.className =
            "pacific-education-security-warning";

        warning.setAttribute(
            "role",
            "alert"
        );

        warning.textContent =
            "Security warning: Do not copy or paste Pacific Education " +
            "passwords, authentication credentials, payment secrets, " +
            "bank credentials, card details, or confidential information " +
            "outside the application. Pacific Education will guide you " +
            "toward safe payment and verification options.";

        return warning;
    }

    /*
     * ---------------------------------------------------------
     * PUBLIC API
     * ---------------------------------------------------------
     */

    const PacificEducationBuyPlans =
        Object.freeze({

            version:
                BUY_PLANS_VERSION,

            plans:
                PLANS,

            fijiPrices:
                FIJI_PRICES,

            paymentModes:
                PAYMENT_MODES,

            status:
                STATUS,

            getCurrency:
                getCurrency,

            isFiji:
                isFiji,

            getPlan:
                getPlan,

            getPlans:
                getPlans,

            getFijiPrice:
                getFijiPrice,

            getPlanPricing:
                getPlanPricing,

            getPlansForCountry:
                getPlansForCountry,

            calculateInternationalPrice:
                calculateInternationalPrice,

            formatPlanPrice:
                formatPlanPrice,

            validateSubscriptionRequest:
                validateSubscriptionRequest,

            requestOnlinePayment:
                requestOnlinePayment,

            requestOfflinePayment:
                requestOfflinePayment,

            requestSubscription:
                requestSubscription,

            getPaymentVerificationStatus:
                getPaymentVerificationStatus,

            getSubscriptionStatus:
                getSubscriptionStatus,

            createPlanCard:
                createPlanCard,

            render:
                render,

            showConfidentialInformationWarning:
                showConfidentialInformationWarning
        });

    /*
     * ---------------------------------------------------------
     * GLOBAL EXPORT
     * ---------------------------------------------------------
     */

    window.PacificEducationBuyPlans =
        PacificEducationBuyPlans;

    /*
     * Notify the application that Buy Plans
     * has loaded successfully.
     */

    window.dispatchEvent(
        new CustomEvent(
            "pacificEducationBuyPlansLoaded",
            {
                detail: {
                    version:
                        BUY_PLANS_VERSION
                }
            }
        )
    );

})();
