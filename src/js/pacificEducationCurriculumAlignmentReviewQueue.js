/*
 * Pacific Education — Curriculum Alignment Review Queue
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Provides a single owner/reviewer queue for imported alignment records.
 * It does not certify official curriculum content and does not grant
 * production authorization.
 */
(function(window){
    "use strict";

    var VERSION="1.0.0";
    var STATES=["imported-unverified","source-reviewed","curriculum-verified","owner-approved","production-approved"];

    function imports(){
        var w=window.PacificEducationCurriculumAlignmentImportWorkspace;
        return w&&w.list?w.list():[];
    }

    function evaluate(record){
        var id=record&&record.indicatorId;
        var workflow=window.PacificEducationCurriculumMasterAlignmentWorkflowController;
        var trace=window.PacificEducationCurriculumEvidenceTraceability;
        var result=workflow&&workflow.evaluate?workflow.evaluate(id):null;
        var t=trace&&trace.trace?trace.trace(id):null;
        var blockers=[];
        if(!record) blockers.push("record-missing");
        if(record&&!record.indicatorText) blockers.push("indicator-text-missing");
        if(!t||!t.sourceMapped) blockers.push("source-mapping-required");
        if(!t||!t.evidencePresent) blockers.push("evidence-reference-required");
        if(!t||!t.documentReferenced) blockers.push("document-reference-required");
        if(result&&result.blockers) blockers=blockers.concat(result.blockers);
        blockers=[...new Set(blockers)];
        return {
            indicatorId:id||null,
            level:record&&record.level||null,
            subjectId:record&&record.subjectId||null,
            term:record&&record.term||null,
            status:record&&record.status||"unknown",
            nextAction:result&&result.nextAction||"review-record",
            ready:blockers.length===0,
            blockers:blockers,
            traceable:!!(t&&t.traceable),
            productionEligible:false,
            prototype:true
        };
    }

    function list(){
        return imports().map(evaluate);
    }

    function pending(){
        return list().filter(function(x){
            return x.status!=="production-approved" || !x.ready;
        });
    }

    function byStatus(status){
        return list().filter(function(x){return x.status===status;});
    }

    function summary(){
        var q=list(), out={total:q.length,pending:0,ready:0,blocked:0};
        STATES.forEach(function(s){out[s]=q.filter(function(x){return x.status===s;}).length;});
        q.forEach(function(x){if(x.ready)out.ready++;else out.blocked++;});
        out.pending=q.filter(function(x){return x.status!=="production-approved";}).length;
        out.productionEligible=false;
        out.prototype=true;
        return out;
    }

    function validate(){
        var errors=[];
        if(!window.PacificEducationCurriculumAlignmentImportWorkspace)errors.push("Import workspace unavailable");
        if(!window.PacificEducationCurriculumMasterAlignmentWorkflowController)errors.push("Master workflow controller unavailable");
        if(!window.PacificEducationCurriculumEvidenceTraceability)errors.push("Evidence traceability unavailable");
        return {valid:errors.length===0,errors:errors,productionEligible:false,prototype:true};
    }

    window.PacificEducationCurriculumAlignmentReviewQueue=Object.freeze({
        name:"PacificEducationCurriculumAlignmentReviewQueue",
        version:VERSION,
        states:STATES.slice(),
        evaluate:evaluate,
        list:list,
        pending:pending,
        byStatus:byStatus,
        summary:summary,
        validate:validate,
        prototype:true,
        productionEligible:false
    });
})(window);
