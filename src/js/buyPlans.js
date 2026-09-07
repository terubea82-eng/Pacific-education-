buyPlans.js
/* =========================================================
   PACIFIC EDUCATION — BUY PLANS
   Annual Subscription Plans
   Fiji: FJD
   International: USD

   SECURITY:
   - Never store passwords, payment secrets, API keys,
     card details, or payment-provider secrets here.
   - Payment processing must be handled server-side.
   - Pricing is owner-controlled.
   - Subscription requests are sent through a secure
     integration point.
========================================================= */

(function () {
    "use strict";

    const BUY_PLANS_VERSION = "1.0.0";

    /*
     * Annual plans.
     *
     * Fiji users:
     *   Student       FJ$1/year
     *   Individual    FJ$10/year
     *   Parent        FJ$10/year
     *   Organization  FJ$100/year
     *
     * International users:
     *   Student       US$1/year
     *   Individual    US$10/year
     *   Parent        US$10/year
     *   Organization  US$100/year
     *
     * Organization pricing can later be made capacity-based
     * while remaining owner-controlled.
     */

    const PLANS = Object.freeze({
        student: Object.freeze({
            id: "student",
            name: "Student",
            price: 1,
            billing: "annual",
            description: "Affordable annual access for students."
        }),

        individual: Object.freeze({
            id: "individual",
            name: "Individual",
            price: 10,
            billing: "annual",
            description: "Annual Pacific Education access for individual learners."
        }),

        parent: Object.freeze({
            id: "parent",
            name: "Parent",
            price: 10,
            billing: "annual",
            description: "Annual access for parents supporting home learning."
        }),

        organization: Object.freeze({
            id: "organization",
            name: "Organization",
            price: 100,
            billing: "annual",
            description: "Annual organization access for schools and education organizations."
        })
    });

    /*
     * Fiji country identifiers.
     */
    const FIJI_CODES = Object.freeze([
        "FJ",
        "FIJI",
        "FIJI ISLANDS"
    ]);

    /**
     * Determine currency.
     *
     * Fiji = FJD
     * Other countries = USD
     */
    function getCurrency(countryCode) {
        const country = String(countryCode || "")
            .trim()
            .toUpperCase();

        return FIJI_CODES.includes(country) ? "FJD" : "USD";
    }

    /**
     * Format a plan price.
     */
    function formatPrice(planId, countryCode) {
        const plan = PLANS[planId];

        if (!plan) {
            throw new Error("Invalid Pacific Education plan.");
        }

        const currency = getCurrency(countryCode);

        return new Intl.NumberFormat(
            currency === "FJD" ? "en-FJ" : "en-US",
            {
                style: "currency",
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(plan.price);
    }

    /**
     * Get a single plan.
     */
    function getPlan(planId) {
        return PLANS[planId] || null;
    }

    /**
     * Get all available plans.
     */
    function getPlans() {
        return Object.values(PLANS).map(function (plan) {
            return {
                id: plan.id,
                name: plan.name,
                price: plan.price,
                billing: plan.billing,
                description: plan.description
            };
        });
    }

    /**
     * Get plans with localized currency.
     */
    function getPlansForCountry(countryCode) {
        const currency = getCurrency(countryCode);

        return getPlans().map(function (plan) {
            return {
                id: plan.id,
                name: plan.name,
                price: plan.price,
                currency: currency,
                formattedPrice: formatPrice(plan.id, countryCode),
                billing: plan.billing,
                description: plan.description
            };
        });
    }

    /**
     * Validate a subscription request.
     *
     * This does NOT process payment.
     */
    function validateSubscriptionRequest(request) {
        if (!request || typeof request !== "object") {
            return {
                valid: false,
                error: "Invalid subscription request."
            };
        }

        if (!PLANS[request.planId]) {
            return {
                valid: false,
                error: "Invalid Pacific Education plan."
            };
        }

        if (!request.countryCode) {
            return {
                valid: false,
                error: "Country information is required."
            };
        }

        return {
            valid: true,
            error: null
        };
    }

    /**
     * Send an audit event when the application audit system
     * is available.
     */
    function audit(eventName, details) {
        try {
            if (
                window.PacificEducationApp &&
                typeof window.PacificEducationApp.audit === "function"
            ) {
                window.PacificEducationApp.audit(
                    eventName,
                    details || {}
                );
            }
        } catch (error) {
            /*
             * Never expose sensitive information through
             * client-side error handling.
             */
        }
    }

    /**
     * Request a subscription.
     *
     * IMPORTANT:
     * This function intentionally does NOT contain payment
     * credentials or payment-provider secrets.
     *
     * A secure backend/payment provider should receive the
     * request and create the actual checkout session.
     */
    function requestSubscription(options) {
        options = options || {};

        const request = {
            planId: options.planId,
            countryCode: options.countryCode
        };

        const validation = validateSubscriptionRequest(request);

        if (!validation.valid) {
            return Promise.reject(
                new Error(validation.error)
            );
        }

        const plan = getPlan(request.planId);
        const currency = getCurrency(request.countryCode);

        audit("subscription_requested", {
            planId: plan.id,
            billing: plan.billing,
            currency: currency
        });

        /*
         * Dispatch an application event.
         *
         * A secure payment integration can listen for this
         * event and communicate with the backend.
         */
        window.dispatchEvent(
            new CustomEvent(
                "pacificEducationSubscriptionRequested",
                {
                    detail: {
                        planId: plan.id,
                        countryCode: request.countryCode,
                        currency: currency,
                        billing: plan.billing
                    }
                }
            )
        );

        /*
         * Return a safe result to the application.
         */
        return Promise.resolve({
            success: true,
            status: "checkout_required",
            planId: plan.id,
            planName: plan.name,
            currency: currency,
            price: plan.price,
            billing: plan.billing
        });
    }

    /**
     * Subscription status helper.
     *
     * Actual subscription status should ultimately be
     * confirmed by the secure backend/payment provider.
     */
    function getSubscriptionStatus(subscription) {
        if (!subscription) {
            return {
                active: false,
                status: "not_subscribed"
            };
        }

        if (subscription.expiresAt) {
            const expiry = new Date(subscription.expiresAt);
            const now = new Date();

            if (
                !Number.isNaN(expiry.getTime()) &&
                expiry <= now
            ) {
                return {
                    active: false,
                    status: "expired",
                    expiresAt: subscription.expiresAt
                };
            }
        }

        return {
            active: Boolean(subscription.active),
            status: subscription.active
                ? "active"
                : "inactive",
            expiresAt: subscription.expiresAt || null
        };
    }

    /**
     * Render a safe plan card.
     *
     * The payment button only starts the subscription request.
     * It does not process or expose payment information.
     */
    function createPlanCard(planId, countryCode) {
        const plan = getPlan(planId);

        if (!plan) {
            return null;
        }

        const currency = getCurrency(countryCode);

        const card = document.createElement("div");
        card.className = "pacific-education-plan-card";
        card.dataset.planId = plan.id;

        const title = document.createElement("h3");
        title.textContent = plan.name;

        const price = document.createElement("p");
        price.className = "plan-price";
        price.textContent =
            formatPrice(plan.id, countryCode) +
            " / year";

        const description = document.createElement("p");
        description.textContent = plan.description;

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Buy " + plan.name + " Plan";

        button.addEventListener("click", function () {
            button.disabled = true;

            requestSubscription({
                planId: plan.id,
                countryCode: countryCode
            })
                .then(function (result) {
                    window.dispatchEvent(
                        new CustomEvent(
                            "pacificEducationCheckoutRequired",
                            {
                                detail: result
                            }
                        )
                    );

                    button.disabled = false;
                })
                .catch(function (error) {
                    console.error(
                        "Pacific Education subscription request failed."
                    );

                    button.disabled = false;

                    window.dispatchEvent(
                        new CustomEvent(
                            "pacificEducationSubscriptionError",
                            {
                                detail: {
                                    message: error.message
                                }
                            }
                        )
                    );
                });
        });

        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(description);
        card.appendChild(button);

        return card;
    }

    /**
     * Render all plans into a container.
     *
     * Example:
     *
     * PacificEducationBuyPlans.render(
     *     document.getElementById("buyPlans"),
     *     "FJ"
     * );
     */
    function render(container, countryCode) {
        if (!container) {
            throw new Error(
                "Buy Plans container was not found."
            );
        }

        container.innerHTML = "";

        const plans = getPlans();

        plans.forEach(function (plan) {
            const card = createPlanCard(
                plan.id,
                countryCode
            );

            if (card) {
                container.appendChild(card);
            }
        });

        audit("buy_plans_rendered", {
            currency: getCurrency(countryCode),
            planCount: plans.length
        });

        return container;
    }

    /**
     * Security warning for confidential information.
     *
     * Pacific Education must not allow users to copy or
     * paste passwords, authentication credentials, payment
     * secrets, confidential records, or other protected
     * information outside the application.
     */
    function showConfidentialInformationWarning() {
        const warning = document.createElement("div");

        warning.className =
            "pacific-education-security-warning";

        warning.setAttribute("role", "alert");

        warning.textContent =
            "Security warning: Do not copy or paste Pacific Education " +
            "passwords, authentication credentials, payment secrets, " +
            "or confidential information outside the application. " +
            "Pacific Education will guide you toward safe options.";

        return warning;
    }

    /**
     * Public API.
     */
    const PacificEducationBuyPlans = Object.freeze({
        version: BUY_PLANS_VERSION,
        plans: PLANS,
        getCurrency: getCurrency,
        getPlan: getPlan,
        getPlans: getPlans,
        getPlansForCountry: getPlansForCountry,
        formatPrice: formatPrice,
        validateSubscriptionRequest:
            validateSubscriptionRequest,
        requestSubscription: requestSubscription,
        getSubscriptionStatus:
            getSubscriptionStatus,
        createPlanCard: createPlanCard,
        render: render,
        showConfidentialInformationWarning:
            showConfidentialInformationWarning
    });

    /*
     * Expose the Buy Plans API.
     */
    window.PacificEducationBuyPlans =
        PacificEducationBuyPlans;

    /*
     * Notify the rest of the application that Buy Plans
     * has loaded successfully.
     */
    window.dispatchEvent(
        new CustomEvent(
            "pacificEducationBuyPlansLoaded",
            {
                detail: {
                    version: BUY_PLANS_VERSION
                }
            }
        )
    );

})();
