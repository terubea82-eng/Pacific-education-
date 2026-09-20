/*
 * Pacific Education — Curriculum Evidence Traceability
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Connects indicator -> source mapping -> evidence -> document reference.
 * It validates traceability but does not certify official curriculum content.
 */
(function(window){
    "use strict";

    var VERSION="1.0.0";

    function mapping(){return window.PacificEducationCurriculumSourceMappingWorkspace||null;}
    function evidence(){return window.PacificEducationCurriculumEvidenceRegistry||null;}
    function documents(){return window.PacificEducationCurriculumDocumentReferenceRegistry||null;}
    function data(){return window.PacificEducationCurriculumData||null;}

    function trace(indicatorId){
        var m=mapping(), e=evidence(), d=documents();
        var source=m&&typeof m.get==="function"?m.get(indicatorId):null;
        var evidenceRecords=e&&typeof e.getForIndicator==="function"?e.getForIndicator(indicatorId):[];

        var documentRecords=[];
        evidenceRecords.forEach(function(item){
            if(!item.documentLocation) return;
            var doc=d&&typeof d.get==="function"?d.get(item.documentLocation):null;
            if(doc) documentRecords.push(doc);
        });

        if(source && source.documentId && d&&typeof d.get==="function"){
            var mappedDoc=d.get(source.documentId);
            if(mappedDoc && !documentRecords.some(function(x){return x.documentId===mappedDoc.documentId;})){
                documentRecords.push(mappedDoc);
            }
        }

        var hasSource=!!(source&&source.sourceReference);
        var hasEvidence=evidenceRecords.length>0;
        var hasDocument=documentRecords.length>0;

        return {
            indicatorId:String(indicatorId),
            indicator:data&&typeof data.get==="function"?data.get(indicatorId):null,
            sourceMapping:source,
            evidence:evidenceRecords,
            documents:documentRecords,
            traceable:hasSource&&hasEvidence&&hasDocument,
            sourceMapped:hasSource,
            evidencePresent:hasEvidence,
            documentReferenced:hasDocument,
            blockers:[
                !hasSource?"Source mapping missing.":null,
                !hasEvidence?"Supporting evidence reference missing.":null,
                !hasDocument?"Curriculum document reference missing.":null
            ].filter(Boolean),
            prototype:true,
            productionEligible:false
        };
    }

    function list(){
        var d=data();
        if(!d||typeof d.list!=="function") return [];
        return d.list().map(function(item){return trace(item.id);});
    }

    function validate(){
        var results=list();
        var failures=results.filter(function(x){return !x.traceable;});
        return {
            valid:failures.length===0,
            total:results.length,
            traceable:results.length-failures.length,
            untraceable:failures.length,
            failures:failures.map(function(x){return {indicatorId:x.indicatorId,blockers:x.blockers};}),
            prototype:true,
            productionEligible:false
        };
    }

    window.PacificEducationCurriculumEvidenceTraceability=Object.freeze({
        name:"PacificEducationCurriculumEvidenceTraceability",
        version:VERSION,
        trace:trace,
        list:list,
        validate:validate
    });
})(window);
