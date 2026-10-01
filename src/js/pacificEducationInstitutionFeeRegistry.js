/* Pacific Education — Institution University / College Fee Registry
 * Prototype architecture only.
 * Institution controls fee definitions; PacEdu does not invent or replace them.
 * Live bank/card/mobile-money/remittance integrations are deferred to approved
 * provider/server adapters and must not be simulated by the browser.
 */
(function (global) {
  "use strict";

  const VERSION = "1.0.0";
  const STORAGE_KEY = "pacificEducationInstitutionFeeRegistryV1";
  const PAYMENT_STATUS = Object.freeze({
    UNPAID: "UNPAID",
    PENDING_VERIFICATION: "PENDING_VERIFICATION",
    VERIFIED: "VERIFIED",
    PARTIALLY_PAID: "PARTIALLY_PAID",
    OVERDUE: "OVERDUE",
    REFUNDED: "REFUNDED",
    CANCELLED: "CANCELLED"
  });
  const ACCESS_STATUS = Object.freeze({
    REGISTRATION_ONLY: "REGISTRATION_ONLY",
    FULL_ACCESS: "FULL_ACCESS",
    FINANCIAL_HOLD: "FINANCIAL_HOLD"
  });
  const PAYER_TYPES = Object.freeze([
    "STUDENT",
    "PARENT_GUARDIAN",
    "SCHOOL",
    "NGO",
    "GOVERNMENT",
    "ORGANISATION",
    "DONOR_PROGRAMME",
    "SPONSOR"
  ]);

  function now() { return new Date().toISOString(); }

  function read() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (_) {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return items;
  }

  function clean(value) {
    return String(value == null ? "" : value).trim();
  }

  function createFee(input, authorized) {
    input = input || {};
    if (authorized !== true) {
      return { success: false, status: "AUTHORIZATION_REQUIRED" };
    }
    if (!clean(input.institutionId) || !clean(input.feeId) || !clean(input.label) || !clean(input.amount)) {
      return { success: false, status: "INSTITUTION_FEE_FIELDS_REQUIRED" };
    }
    const item = {
      institutionId: clean(input.institutionId),
      feeId: clean(input.feeId),
      programmeId: clean(input.programmeId),
      courseId: clean(input.courseId),
      level: clean(input.level),
      feeType: clean(input.feeType || "TUITION"),
      label: clean(input.label),
      amount: Number(input.amount),
      currency: clean(input.currency || "FJD"),
      frequency: clean(input.frequency || "PER_TERM"),
      academicPeriod: clean(input.academicPeriod),
      dueDate: clean(input.dueDate),
      sourceAuthority: clean(input.sourceAuthority),
      sourceReference: clean(input.sourceReference),
      effectiveFrom: clean(input.effectiveFrom),
      effectiveTo: clean(input.effectiveTo),
      status: "ACTIVE",
      createdAt: now(),
      updatedAt: now()
    };
    const items = read();
    const duplicate = items.find(function (x) {
      return x.institutionId === item.institutionId && x.feeId === item.feeId;
    });
    if (duplicate) return { success: false, status: "DUPLICATE_FEE_ID" };
    items.push(item);
    write(items);
    return { success: true, fee: item };
  }

  function listFees(institutionId) {
    return read().filter(function (x) {
      return !institutionId || x.institutionId === institutionId;
    });
  }

  function createStudentFeeAccount(input, authorized) {
    input = input || {};
    if (authorized !== true) return { success: false, status: "AUTHORIZATION_REQUIRED" };
    if (!clean(input.institutionId) || !clean(input.studentId) || !clean(input.feeId)) {
      return { success: false, status: "STUDENT_FEE_FIELDS_REQUIRED" };
    }
    return {
      success: true,
      account: {
        accountId: "PE-FEE-" + Date.now().toString(36).toUpperCase(),
        institutionId: clean(input.institutionId),
        studentId: clean(input.studentId),
        feeId: clean(input.feeId),
        invoiceReference: clean(input.invoiceReference),
        amountDue: Number(input.amountDue || 0),
        amountPaid: Number(input.amountPaid || 0),
        currency: clean(input.currency || "FJD"),
        paymentStatus: PAYMENT_STATUS.UNPAID,
        payerType: null,
        providerReference: null,
        verifiedAt: null,
        accessStatus: ACCESS_STATUS.REGISTRATION_ONLY,
        financialDetailsVisibility: "AUTHORIZED_FINANCE_ROLES_ONLY",
        createdAt: now()
      }
    };
  }

  function recordPendingPayment(input, authorized) {
    input = input || {};
    if (authorized !== true) return { success: false, status: "AUTHORIZATION_REQUIRED" };
    if (!clean(input.accountId) || !clean(input.payerType) || PAYER_TYPES.indexOf(clean(input.payerType).toUpperCase()) === -1) {
      return { success: false, status: "PAYER_TYPE_REQUIRED" };
    }
    return {
      success: true,
      payment: {
        accountId: clean(input.accountId),
        payerType: clean(input.payerType).toUpperCase(),
        amount: Number(input.amount || 0),
        currency: clean(input.currency || "FJD"),
        provider: clean(input.provider || "APPROVED_PROVIDER_TO_BE_CONFIGURED"),
        providerReference: null,
        paymentStatus: PAYMENT_STATUS.PENDING_VERIFICATION,
        recordedAt: now()
      }
    };
  }

  function applyVerifiedPayment(account, verifiedPayment, authorized) {
    if (authorized !== true) return { success: false, status: "AUTHORIZATION_REQUIRED" };
    if (!account || !verifiedPayment || !verifiedPayment.verifiedAt || !verifiedPayment.providerReference) {
      return { success: false, status: "VERIFIED_PROVIDER_RESULT_REQUIRED" };
    }
    const paid = Number(account.amountPaid || 0) + Number(verifiedPayment.amount || 0);
    const due = Number(account.amountDue || 0);
    account.amountPaid = paid;
    account.providerReference = clean(verifiedPayment.providerReference);
    account.verifiedAt = verifiedPayment.verifiedAt;
    account.paymentStatus = paid >= due ? PAYMENT_STATUS.VERIFIED : PAYMENT_STATUS.PARTIALLY_PAID;
    account.accessStatus = paid >= due ? ACCESS_STATUS.FULL_ACCESS : ACCESS_STATUS.REGISTRATION_ONLY;
    return { success: true, account: account };
  }

  function applyInstitutionFinancialHold(account, reason, authorized) {
    if (authorized !== true) return { success: false, status: "AUTHORIZATION_REQUIRED" };
    account = account || {};
    account.accessStatus = ACCESS_STATUS.FINANCIAL_HOLD;
    account.holdReason = clean(reason || "Institution financial hold");
    account.holdRecordedAt = now();
    return { success: true, account: account };
  }

  function publicStudentView(account) {
    account = account || {};
    return {
      institutionId: account.institutionId || null,
      studentId: account.studentId || null,
      accessStatus: account.accessStatus || ACCESS_STATUS.REGISTRATION_ONLY,
      paymentStatus: account.paymentStatus === PAYMENT_STATUS.VERIFIED ? "VERIFIED" : "NOT_VERIFIED",
      payerDetailsVisible: false,
      providerReferenceVisible: false,
      donorFinancialDetailsVisible: false
    };
  }

  function render(targetId, account) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const view = publicStudentView(account);
    target.innerHTML =
      "<h2>University / College Fees</h2>" +
      "<p><strong>Institution-controlled:</strong> Fees, programmes, courses, due dates and fee rules are entered by the authorised institution.</p>" +
      "<p><strong>Student registration:</strong> A student can have a PacEdu ID before payment is verified.</p>" +
      "<p><strong>Current access:</strong> " + view.accessStatus.replace(/_/g, " ") + "</p>" +
      "<p><strong>Payment:</strong> " + view.paymentStatus + "</p>" +
      "<p>Parent/guardian, school, NGO, government, organisation, donor programme or another approved sponsor may pay when authorised by the institution.</p>" +
      "<p><small>PacEdu does not display payer or donor financial details to the student. Live payment collection and verification remain deferred to approved provider/server integrations.</small></p>";
  }

  global.PacificEducationInstitutionFeeRegistry = Object.freeze({
    version: VERSION,
    storageKey: STORAGE_KEY,
    paymentStatus: PAYMENT_STATUS,
    accessStatus: ACCESS_STATUS,
    payerTypes: PAYER_TYPES,
    createFee: createFee,
    listFees: listFees,
    createStudentFeeAccount: createStudentFeeAccount,
    recordPendingPayment: recordPendingPayment,
    applyVerifiedPayment: applyVerifiedPayment,
    applyInstitutionFinancialHold: applyInstitutionFinancialHold,
    publicStudentView: publicStudentView,
    render: render,
    liveFinancialIntegrationDeferred: true
  });

  global.dispatchEvent(new CustomEvent("pacificEducationInstitutionFeeRegistryLoaded", {
    detail: { version: VERSION, liveFinancialIntegrationDeferred: true }
  }));
})(window);
