/*
 * Pacific Education — Curriculum Alignment Auto-Link Bridge
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Connects an imported indicator to its document, source mapping and evidence.
 * It never marks a source as verified or production-approved.
 */
(function(window){
    "use strict";

    var VERSION="1.0.0";

    function ws(){return window.PacificEducationCurriculumAlignmentImportWorkspace||null;}
    function docs(){return window.PacificEducationCurriculumDocumentReferenceRegistry||null;}
    function maps(){return window.PacificEducationCurriculumSourceMappingWorkspace||null;}
    function ev(){return window.PacificEducationCurriculumEvidenceRegistry||null;}

    function link(input){
        input=input||{};
        var indicatorId=String(input.indicatorId||"");
        if(!indicatorId)return {success:false,error:"indicatorId is required",prototype:true};

        var imported=ws()&&ws().get?ws().get(indicatorId):null;
        var documentId=String(input.documentId||(imported&&imported.documentId)||"");
        var sourceReference=String(input.sourceReference||(imported&&imported.sourceReference)||"");
        var sourceTitle=String(input.sourceTitle||(imported&&imported.sourceTitle)||"");
        var evidenceReference=String(input.evidenceReference||(imported&&imported.evidenceReference)||"");

        if(!documentId||!sourceReference||!evidenceReference){
            return {
                success:false,
                error:"documentId, sourceReference and evidenceReference are required before automatic linking.",
                indicatorId:indicatorId,
                prototype:true,
                productionEligible:false
            };
        }

        var results={success:true,indicatorId:indicatorId,created:[],warnings:[],prototype:true,productionEligible:false};

        var d=docs();
        if(d&&typeof d.register==="function"){
            var docResult=d.register({
                documentId:documentId,
                title:sourceTitle||"Owner-entered curriculum source",
                reference:sourceReference,
                documentType:input.documentType||"curriculum",
                issuingAuthority:input.issuingAuthority||"Unverified",
                version:input.sourceVersion||"",
                publicationDate:input.publicationDate||"",
                accessedDate:input.accessedDate||new Date().toISOString().slice(0,10),
                notes:"Auto-linked from curriculum alignment workspace. Source remains unverified.",
                sourceStatus:"unverified"
            });
            results.created.push({type:"document",result:docResult});
        }else results.warnings.push("Document reference registry unavailable.");

        var m=maps();
        if(m&&typeof m.mapSource==="function"){
            results.created.push({type:"mapping",result:m.mapSource({
                indicatorId:indicatorId,
                sourceReference:sourceReference,
                sourceTitle:sourceTitle,
                sourcePage:input.sourcePage||"",
                sourceSection:input.sourceSection||"",
                sourceVersion:input.sourceVersion||"",
                evidenceReference:evidenceReference,
                mappingNotes:input.mappingNotes||"Auto-linked; source verification still required.",
                sourceStatus:"unverified",
                mappedBy:input.mappedBy||"owner-workspace"
            })});
        }else results.warnings.push("Source mapping workspace unavailable.");

        var e=ev();
        if(e&&typeof e.register==="function"){
            results.created.push({type:"evidence",result:e.register({
                indicatorId:indicatorId,
                evidenceReference:evidenceReference,
                evidenceType:input.evidenceType||"curriculum-document-reference",
                sourceTitle:sourceTitle,
                sourceVersion:input.sourceVersion||"",
                page:input.sourcePage||"",
                section:input.sourceSection||"",
                excerptReference:input.excerptReference||"",
                documentLocation:documentId,
                notes:input.evidenceNotes||"Auto-linked from alignment workspace; evidence is not independently verified.",
                status:"unverified",
                addedBy:input.mappedBy||"owner-workspace"
            })});
        }else results.warnings.push("Evidence registry unavailable.");

        document.dispatchEvent(new CustomEvent("pacificEducationCurriculumAlignmentAutoLinked",{detail:results}));
        return results;
    }

    window.PacificEducationCurriculumAlignmentAutoLinkBridge=Object.freeze({
        name:"PacificEducationCurriculumAlignmentAutoLinkBridge",
        version:VERSION,
        link:link,
        prototype:true,
        productionEligible:false
    });
})(window);
