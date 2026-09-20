/*
 * Pacific Education — Curriculum Owner Review Gate
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Consolidates review readiness before an owner approval request.
 * It does not grant production access or certify official curriculum.
 */
(function(window){
    "use strict";
    var VERSION="1.0.0";
    function evaluate(indicatorId){
        var q=window.PacificEducationCurriculumAlignmentReviewQueue;
        var trace=window.PacificEducationCurriculumEvidenceTraceability;
        var item=q&&q.list?q.list().find(function(x){return x.indicatorId===indicatorId;}):null;
        var t=trace&&trace.trace?trace.trace(indicatorId):null;
        var blockers=[];
        if(!item)blockers.push("indicator-not-found");
        if(!t||!t.sourceMapped)blockers.push("source-mapping-required");
        if(!t||!t.evidencePresent)blockers.push("evidence-required");
        if(!t||!t.documentReferenced)blockers.push("document-reference-required");
        if(item&&item.status==="imported-unverified")blockers.push("source-review-required");
        if(item&&item.status==="source-reviewed")blockers.push("curriculum-verification-required");
        if(item&&item.status==="curriculum-verified")blockers.push("owner-approval-required");
        return {
            indicatorId:indicatorId||null,
            currentStatus:item?item.status:null,
            readyForOwnerReview:blockers.length===0,
            blockers:[...new Set(blockers)],
            productionEligible:false,
            prototype:true
        };
    }
    function list(){
        var q=window.PacificEducationCurriculumAlignmentReviewQueue;
        return q&&q.list?q.list().map(function(x){return evaluate(x.indicatorId);}):[];
    }
    function summary(){
        var rows=list();
        return {total:rows.length,ready:rows.filter(function(x){return x.readyForOwnerReview;}).length,blocked:rows.filter(function(x){return !x.readyForOwnerReview;}).length,productionEligible:false,prototype:true};
    }
    function validate(){
        var errors=[];
        if(!window.PacificEducationCurriculumAlignmentReviewQueue)errors.push("review-queue-unavailable");
        if(!window.PacificEducationCurriculumEvidenceTraceability)errors.push("traceability-unavailable");
        return {valid:errors.length===0,errors:errors,productionEligible:false,prototype:true};
    }
    window.PacificEducationCurriculumOwnerReviewGate=Object.freeze({
        name:"PacificEducationCurriculumOwnerReviewGate",version:VERSION,
        evaluate:evaluate,list:list,summary:summary,validate:validate,
        prototype:true,productionEligible:false
    });
})(window);
