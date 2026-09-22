/*
 * Pacific Education — Curriculum Alignment Completeness Engine
 * Version 1.1.0
 * PROTOTYPE ONLY.
 *
 * Measures data completeness across the same levels exposed by
 * the Pacific Education level selector. It does not determine
 * whether curriculum content is officially correct.
 */
(function(window){
    "use strict";
    var VERSION="1.1.0";
    var LEVELS=["Kindergarten","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Form 1","Form 2","Form 3","Form 4","Form 5","Form 6","Form 7"];
    var TERMS=["Term 1","Term 2","Term 3"];

    function rows(){var w=window.PacificEducationCurriculumAlignmentImportWorkspace;return w&&w.list?w.list():[];}

    function build(){
        var data={};
        LEVELS.forEach(function(level){
            data[level]={};
            TERMS.forEach(function(term){data[level][term]={total:0,traceable:0,verified:0,missingSource:0,missingEvidence:0};});
        });
        var trace=window.PacificEducationCurriculumEvidenceTraceability;
        rows().forEach(function(item){
            if(!data[item.level]||!data[item.level][item.term])return;
            var cell=data[item.level][item.term]; cell.total++;
            var t=trace&&trace.trace?trace.trace(item.indicatorId):null;
            if(t&&t.traceable)cell.traceable++;
            if(item.status==="curriculum-verified"||item.status==="owner-approved")cell.verified++;
            if(!t||!t.sourceMapped)cell.missingSource++;
            if(!t||!t.evidencePresent)cell.missingEvidence++;
        });
        return data;
    }

    function summary(){
        var d=build(), total=0,traceable=0,verified=0;
        LEVELS.forEach(function(l){TERMS.forEach(function(t){total+=d[l][t].total;traceable+=d[l][t].traceable;verified+=d[l][t].verified;});});
        return {total:total,traceable:traceable,verified:verified,untraceable:total-traceable,prototype:true,productionEligible:false};
    }

    function getLevel(level){return build()[level]||null;}

    window.PacificEducationCurriculumAlignmentCompletenessEngine=Object.freeze({
        name:"PacificEducationCurriculumAlignmentCompletenessEngine",
        version:VERSION,
        levels:LEVELS.slice(),
        terms:TERMS.slice(),
        build:build,
        summary:summary,
        getLevel:getLevel,
        prototype:true,
        productionEligible:false
    });
})(window);
