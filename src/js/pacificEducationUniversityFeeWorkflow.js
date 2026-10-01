/* Pacific Education — University Fee-to-Access Workflow
 * Prototype workflow boundary:
 * University → Programme → Course → Fee → Student → Payer/Sponsor
 * → Verified Payment → Access
 *
 * Institutions control academic and fee records. Live payment verification
 * remains server/provider-controlled and is never simulated by this browser.
 */
(function (global) {
  "use strict";

  const VERSION = "1.0.0";
  const STORAGE_KEY = "pacificEducationUniversityFeeWorkflowV1";
  const STAGES = Object.freeze([
    "UNIVERSITY",
    "PROGRAMME",
    "COURSE",
    "FEE",
    "STUDENT",
    "PAYER_SPONSOR",
    "PAYMENT_VERIFICATION",
    "ACCESS"
  ]);

  function clean(v) { return String(v == null ? "" : v).trim(); }
  function now() { return new Date().toISOString(); }

  function read() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch (_) { return []; }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return items;
  }

  function id(prefix) {
    return prefix + "-" + Date.now().toString(36).toUpperCase();
  }

  function createWorkflow(input, authorized) {
    input = input || {};
    if (authorized !== true) return { success:false, status:"AUTHORIZATION_REQUIRED" };

    const required = ["institutionId","institutionName","programmeId","programmeName",
      "courseId","courseName","feeId","studentId"];
    for (let i=0;i<required.length;i++) {
      if (!clean(input[required[i]])) {
        return { success:false, status:"MISSING_" + required[i].toUpperCase() };
      }
    }

    const workflow = {
      workflowId: id("PE-UNI-FEE"),
      stage: "PAYER_SPONSOR",
      status: "AWAITING_PAYER_OR_SPONSOR",
      institution: {
        institutionId: clean(input.institutionId),
        name: clean(input.institutionName),
        authority: clean(input.institutionAuthority)
      },
      programme: {
        programmeId: clean(input.programmeId),
        name: clean(input.programmeName)
      },
      course: {
        courseId: clean(input.courseId),
        name: clean(input.courseName),
        code: clean(input.courseCode)
      },
      fee: {
        feeId: clean(input.feeId),
        label: clean(input.feeLabel || "Institution fee"),
        amountDue: Number(input.amountDue || 0),
        currency: clean(input.currency || "FJD"),
        academicPeriod: clean(input.academicPeriod),
        dueDate: clean(input.dueDate),
        sourceReference: clean(input.sourceReference)
      },
      student: {
        studentId: clean(input.studentId),
        paceduId: clean(input.paceduId),
        nameVisibility: "AUTHORIZED_INSTITUTION_ROLES_ONLY"
      },
      payerSponsor: null,
      payment: {
        status: "NOT_STARTED",
        provider: "APPROVED_PROVIDER_TO_BE_CONFIGURED",
        providerReference: null,
        verifiedAt: null,
        amountVerified: 0
      },
      access: {
        status: "REGISTRATION_ONLY",
        activatedAt: null,
        planId: null
      },
      createdAt: now(),
      updatedAt: now(),
      audit: [{stage:"UNIVERSITY", status:"CREATED", at:now()}]
    };

    const items = read();
    items.push(workflow);
    save(items);
    return {success:true, workflow:workflow};
  }

  function getWorkflow(workflowId) {
    return read().find(function (x) { return x.workflowId === workflowId; }) || null;
  }

  function setPayerSponsor(workflowId, input, authorized) {
    if (authorized !== true) return {success:false,status:"AUTHORIZATION_REQUIRED"};
    const workflow = getWorkflow(workflowId);
    if (!workflow) return {success:false,status:"WORKFLOW_NOT_FOUND"};
    input = input || {};
    const payerType = clean(input.payerType).toUpperCase();
    const allowed = ["STUDENT","PARENT_GUARDIAN","SCHOOL","NGO","GOVERNMENT","ORGANISATION","DONOR_PROGRAMME","SPONSOR"];
    if (allowed.indexOf(payerType) === -1) return {success:false,status:"VALID_PAYER_OR_SPONSOR_REQUIRED"};

    workflow.payerSponsor = {
      type:payerType,
      reference:clean(input.reference),
      nameVisibility:"FINANCE_AUTHORIZED_ROLES_ONLY",
      recordedAt:now()
    };
    workflow.stage = "PAYMENT_VERIFICATION";
    workflow.status = "PAYMENT_PENDING_VERIFICATION";
    workflow.audit.push({stage:"PAYER_SPONSOR",status:"RECORDED",at:now()});
    workflow.updatedAt = now();
    save(read().map(function(x){return x.workflowId===workflowId?workflow:x;}));
    return {success:true,workflow:workflow};
  }

  function recordPaymentPending(workflowId, input, authorized) {
    if (authorized !== true) return {success:false,status:"AUTHORIZATION_REQUIRED"};
    const workflow = getWorkflow(workflowId);
    if (!workflow) return {success:false,status:"WORKFLOW_NOT_FOUND"};
    input = input || {};
    const amount = Number(input.amount || 0);
    if (!(amount > 0)) return {success:false,status:"PAYMENT_AMOUNT_REQUIRED"};
    workflow.payment = {
      status:"PENDING_VERIFICATION",
      provider:clean(input.provider || "APPROVED_PROVIDER_TO_BE_CONFIGURED"),
      providerReference:null,
      verifiedAt:null,
      amountSubmitted:amount,
      amountVerified:0
    };
    workflow.stage = "PAYMENT_VERIFICATION";
    workflow.status = "PAYMENT_PENDING_VERIFICATION";
    workflow.audit.push({stage:"PAYMENT_VERIFICATION",status:"PENDING",at:now()});
    workflow.updatedAt = now();
    save(read().map(function(x){return x.workflowId===workflowId?workflow:x;}));
    return {success:true,workflow:workflow};
  }

  function verifyPayment(workflowId, verification, authorized) {
    if (authorized !== true) return {success:false,status:"AUTHORIZATION_REQUIRED"};
    const workflow = getWorkflow(workflowId);
    if (!workflow) return {success:false,status:"WORKFLOW_NOT_FOUND"};
    verification = verification || {};
    if (!verification.verifiedAt || !clean(verification.providerReference)) {
      return {success:false,status:"APPROVED_PROVIDER_VERIFICATION_REQUIRED"};
    }
    const verifiedAmount = Number(verification.amountVerified || 0);
    if (!(verifiedAmount > 0)) return {success:false,status:"VERIFIED_AMOUNT_REQUIRED"};

    workflow.payment.status = verifiedAmount >= Number(workflow.fee.amountDue)
      ? "VERIFIED" : "PARTIALLY_VERIFIED";
    workflow.payment.provider = clean(verification.provider || workflow.payment.provider);
    workflow.payment.providerReference = clean(verification.providerReference);
    workflow.payment.verifiedAt = verification.verifiedAt;
    workflow.payment.amountVerified = verifiedAmount;

    if (verifiedAmount >= Number(workflow.fee.amountDue)) {
      workflow.stage = "ACCESS";
      workflow.status = "ACCESS_READY";
      workflow.access.status = "FULL_ACCESS";
      workflow.access.activatedAt = now();
      workflow.access.planId = clean(verification.planId);
      workflow.audit.push({stage:"PAYMENT_VERIFICATION",status:"VERIFIED",at:now()});
      workflow.audit.push({stage:"ACCESS",status:"FULL_ACCESS_ACTIVATED",at:workflow.access.activatedAt});
    } else {
      workflow.status = "PARTIAL_PAYMENT";
      workflow.access.status = "REGISTRATION_ONLY";
      workflow.audit.push({stage:"PAYMENT_VERIFICATION",status:"PARTIALLY_VERIFIED",at:now()});
    }
    workflow.updatedAt = now();
    save(read().map(function(x){return x.workflowId===workflowId?workflow:x;}));
    return {success:true,workflow:workflow};
  }

  function applyHold(workflowId, reason, authorized) {
    if (authorized !== true) return {success:false,status:"AUTHORIZATION_REQUIRED"};
    const workflow = getWorkflow(workflowId);
    if (!workflow) return {success:false,status:"WORKFLOW_NOT_FOUND"};
    workflow.status = "FINANCIAL_HOLD";
    workflow.access.status = "FINANCIAL_HOLD";
    workflow.access.activatedAt = null;
    workflow.audit.push({stage:"ACCESS",status:"FINANCIAL_HOLD",reason:clean(reason),at:now()});
    workflow.updatedAt = now();
    save(read().map(function(x){return x.workflowId===workflowId?workflow:x;}));
    return {success:true,workflow:workflow};
  }

  function publicStudentView(workflowId) {
    const w = getWorkflow(workflowId);
    if (!w) return null;
    return {
      workflowId:w.workflowId,
      university:w.institution.name,
      programme:w.programme.name,
      course:w.course.name,
      studentId:w.student.paceduId || w.student.studentId,
      feeStatus:w.payment.status === "VERIFIED" ? "VERIFIED" : "NOT_VERIFIED",
      access:w.access.status,
      payerSponsorDetailsVisible:false,
      providerReferenceVisible:false,
      financialAmountVisible:false
    };
  }

  function getStageStatus(workflow) {
    if (!workflow) return STAGES.map(function(stage){return {stage:stage,status:"NOT_STARTED"};});
    return [
      {stage:"UNIVERSITY",status:"COMPLETE"},
      {stage:"PROGRAMME",status:"COMPLETE"},
      {stage:"COURSE",status:"COMPLETE"},
      {stage:"FEE",status:"COMPLETE"},
      {stage:"STUDENT",status:"COMPLETE"},
      {stage:"PAYER_SPONSOR",status:workflow.payerSponsor?"COMPLETE":"PENDING"},
      {stage:"PAYMENT_VERIFICATION",status:workflow.payment.status==="VERIFIED"?"COMPLETE":"PENDING"},
      {stage:"ACCESS",status:workflow.access.status==="FULL_ACCESS"?"COMPLETE":"PENDING"}
    ];
  }

  function render(targetId, workflowId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const w = workflowId ? getWorkflow(workflowId) : null;
    const stages = getStageStatus(w);
    target.innerHTML =
      "<h2>University Fee → Access Workflow</h2>" +
      "<p><strong>Flow:</strong> University → Programme → Course → Fee → Student → Payer/Sponsor → Verified Payment → Access</p>" +
      "<ol>" + stages.map(function(s){
        return "<li><strong>" + s.stage.replace(/_/g," ") + ":</strong> " + s.status + "</li>";
      }).join("") + "</ol>" +
      "<p><strong>Current status:</strong> " + (w ? w.status.replace(/_/g," ") : "No workflow selected") + "</p>" +
      "<p><small>Institution controls academic/fee information. A browser cannot verify payment. Only an approved server/payment provider can produce the verification required for access activation.</small></p>";
  }

  global.PacificEducationUniversityFeeWorkflow = Object.freeze({
    version:VERSION,
    storageKey:STORAGE_KEY,
    stages:STAGES,
    createWorkflow:createWorkflow,
    getWorkflow:getWorkflow,
    setPayerSponsor:setPayerSponsor,
    recordPaymentPending:recordPaymentPending,
    verifyPayment:verifyPayment,
    applyHold:applyHold,
    publicStudentView:publicStudentView,
    getStageStatus:getStageStatus,
    render:render
  });

  global.dispatchEvent(new CustomEvent("pacificEducationUniversityFeeWorkflowLoaded", {
    detail:{version:VERSION}
  }));
})(window);
