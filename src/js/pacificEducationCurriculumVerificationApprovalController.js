/*
 * Pacific Education — Curriculum Verification Approval Controller
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Enforces the verification sequence:
 * unverified -> source-reviewed -> curriculum-verified -> owner-approved -> production-approved
 *
 * No stage is treated as proof that official curriculum content is authentic.
 * Production approval remains disabled in this prototype.
 */
(function(window){
    "use strict";

    var VERSION="1.0.0";
    var ORDER=["unverified","source-reviewed","curriculum-verified","owner-approved","production-approved"];

    function workflow(){return window.PacificEducationCurriculumVerificationWorkflowGuard||null;}
    function source(){return window.PacificEducationCurriculumSourceVerification||null;}

    function index(status){return ORDER.indexOf(status);}

    function evaluate(indicatorId){
        var w=workflow();
        if(!w||typeof w.evaluate!=="function"){
            return {indicatorId:String(indicatorId),ready:false,blockers:["Verification workflow unavailable."],prototype:true,productionEligible:false};
        }
        var state=w.evaluate(indicatorId);
        var current=state.currentStatus||"unverified";
        var nextIndex=Math.min(index(current)+1,ORDER.length-1);
        return {
            indicatorId:String(indicatorId),
            currentStatus:current,
            nextStatus:ORDER[nextIndex],
            sequenceValid:index(current)>=0,
            mappingPresent:!!state.mappingPresent,
            evidencePresent:!!state.evidencePresent,
            canAdvance:!!state.canSourceReview||!!state.canCurriculumVerify||!!state.canOwnerApprove||!!state.canProductionApprove,
            productionEligible:false,
            prototype:true,
            blockers:Array.isArray(state.blockers)?state.blockers:[]
        };
    }

    function approve(input){
        input=input||{};
        var indicatorId=input.indicatorId;
        if(!indicatorId) return {success:false,error:"indicatorId is required",prototype:true};

        var state=evaluate(indicatorId);
        if(!state.sequenceValid) return {success:false,error:"Invalid verification status.",state:state};

        if(!state.canAdvance){
            return {success:false,error:"Verification stage is blocked. Complete required source mapping and evidence first.",state:state};
        }

        if(state.nextStatus==="production-approved"){
            return {
                success:false,
                error:"Production approval is disabled in the prototype. Production approval requires authenticated reviewers, verified official sources, secure storage, legal/privacy/child-safeguarding review, security testing and controlled pilot validation.",
                state:state,
                productionEligible:false,
                prototype:true
            };
        }

        var s=source();
        if(!s||typeof s.verify!=="function"){
            return {success:false,error:"Source verification service unavailable.",state:state};
        }

        var result=s.verify(
            indicatorId,
            state.nextStatus,
            input.reviewerReference||"",
            input.notes||""
        );

        return {
            success:true,
            indicatorId:String(indicatorId),
            status:state.nextStatus,
            result:result,
            productionEligible:false,
            prototype:true
        };
    }

    function list(){
        var data=window.PacificEducationCurriculumData;
        if(!data||typeof data.list!=="function") return [];
        return data.list().map(function(item){return evaluate(item.id);});
    }

    function validate(){
        var rows=list();
        var invalid=rows.filter(function(x){return !x.sequenceValid;});
        return {
            valid:invalid.length===0,
            total:rows.length,
            invalid:invalid.length,
            failures:invalid.map(function(x){return {indicatorId:x.indicatorId,status:x.currentStatus};}),
            productionEligible:false,
            prototype:true
        };
    }

    window.PacificEducationCurriculumVerificationApprovalController=Object.freeze({
        name:"PacificEducationCurriculumVerificationApprovalController",
        version:VERSION,
        statuses:ORDER.slice(),
        evaluate:evaluate,
        approve:approve,
        list:list,
        validate:validate
    });
})(window);
