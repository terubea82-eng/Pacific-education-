/*
 * Pacific Education — Curriculum Verification Workflow Guard
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Prevents the prototype verification workflow from advancing an indicator
 * unless source mapping and supporting evidence are present. This does not
 * certify official Fiji curriculum content.
 */
(function(window){
    "use strict";

    var VERSION="1.0.0";
    var STATES=["unverified","source-reviewed","curriculum-verified","owner-approved","production-approved"];

    function sourceMapping(){return window.PacificEducationCurriculumSourceMappingWorkspace||null;}
    function evidence(){return window.PacificEducationCurriculumEvidenceRegistry||null;}
    function verifier(){return window.PacificEducationCurriculumSourceVerification||null;}
    function audit(){return window.PacificEducationCurriculumVerificationAuditTrail||null;}

    function evaluate(indicatorId){
        var mapping=sourceMapping()&&sourceMapping().get(indicatorId);
        var evidenceRecords=evidence()&&evidence().getForIndicator(indicatorId)||[];
        var current=verifier()&&verifier().get(indicatorId);
        var hasMapping=!!(mapping&&mapping.sourceReference);
        var hasEvidence=evidenceRecords.length>0;
        var result={
            indicatorId:String(indicatorId),
            currentStatus:current?current.verificationStatus:"unverified",
            sourceMapped:hasMapping,
            evidencePresent:hasEvidence,
            evidenceCount:evidenceRecords.length,
            canSourceReview:hasMapping&&hasEvidence,
            canCurriculumVerify:hasMapping&&hasEvidence,
            canOwnerApprove:hasMapping&&hasEvidence,
            canProductionApprove:hasMapping&&hasEvidence,
            blockers:[],
            prototype:true,
            productionEligible:false
        };
        if(!hasMapping) result.blockers.push("Authoritative source mapping is missing.");
        if(!hasEvidence) result.blockers.push("Supporting evidence reference is missing.");
        return result;
    }

    function requestStatusChange(input){
        input=input||{};
        if(!input.indicatorId) throw new Error("indicatorId required");
        if(STATES.indexOf(input.toStatus)<0) throw new Error("Invalid verification status");

        var v=verifier();
        if(!v) return {success:false,error:"Source verification module unavailable",prototype:true};

        var check=evaluate(input.indicatorId);
        if(input.toStatus!=="unverified" && check.blockers.length){
            return {success:false,blocked:true,reason:"Required source evidence is incomplete.",check:check,prototype:true,productionEligible:false};
        }

        var current=v.get(input.indicatorId);
        var fromStatus=current?current.verificationStatus:"unverified";
        var updated=v.verify(input.indicatorId,input.toStatus,input.reviewer,input.notes);

        var a=audit();
        if(a&&typeof a.record==="function"){
            a.record({
                indicatorId:input.indicatorId,
                fromStatus:fromStatus,
                toStatus:input.toStatus,
                action:"guarded-verification-status-change",
                sourceReference:check.sourceMapped?sourceMapping().get(input.indicatorId).sourceReference:null,
                evidenceReference:check.evidencePresent?(evidence().getForIndicator(input.indicatorId)[0].evidenceReference):null,
                reviewerReference:input.reviewer||null,
                notes:input.notes||""
            });
        }

        document.dispatchEvent(new CustomEvent("pacificEducationCurriculumVerificationChanged",{detail:updated}));
        return {success:true,blocked:false,record:updated,check:check,prototype:true,productionEligible:false};
    }

    function validate(indicatorId){
        var check=evaluate(indicatorId);
        return {
            valid:check.blockers.length===0,
            indicatorId:check.indicatorId,
            blockers:check.blockers,
            prototype:true,
            productionEligible:false
        };
    }

    window.PacificEducationCurriculumVerificationWorkflowGuard=Object.freeze({
        name:"PacificEducationCurriculumVerificationWorkflowGuard",
        version:VERSION,
        states:STATES.slice(),
        evaluate:evaluate,
        requestStatusChange:requestStatusChange,
        validate:validate
    });
})(window);
