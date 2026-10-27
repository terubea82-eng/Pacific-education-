/*
 * Pacific Education — Curriculum Bulk Import Validation Engine
 * Version 1.1.0
 * PROTOTYPE ONLY. Validation never certifies official curriculum content.
 *
 * Source and schedule provenance must be explicit before a mapping can enter
 * the review queue. Official alignment still requires educator verification.
 */
(function(window){
    "use strict";

    var VERSION="1.1.0";
    var REQUIRED=["id","indicatorId","level","subjectId","term","indicatorText"];
    var LEVELS=["ECE","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Form 3","Form 4","Form 5","Form 6","Form 7"];
    var TERMS=["Term 1","Term 2","Term 3","Term 4"];

    function workspace(){return window.PacificEducationCurriculumAlignmentImportWorkspace||null;}

    function validateRecord(item,seen){
        var errors=[];
        REQUIRED.forEach(function(k){if(!item||!String(item[k]||"").trim())errors.push(k+" is required");});
        if(!item)return {valid:false,errors:errors};
        if(LEVELS.indexOf(String(item.level||""))===-1)errors.push("level is not a supported Fiji ECE/Class 1–8/Form 3–7 level");
        if(TERMS.indexOf(String(item.term||""))===-1)errors.push("term must be Term 1, Term 2, Term 3, or Term 4");
        if(item.week!==undefined&&item.week!==null&&item.week!==""){
            if(!Number.isInteger(Number(item.week))||Number(item.week)<1||Number(item.week)>13)errors.push("week must be an integer from 1 to 13");
            if(!String(item.scheduleEvidenceReference||"").trim())errors.push("scheduleEvidenceReference is required for a week claim");
        }
        if(item.day!==undefined&&item.day!==null&&item.day!==""){
            if(!Number.isInteger(Number(item.day))||Number(item.day)<1||Number(item.day)>5)errors.push("day must be an integer from 1 to 5");
            if(!String(item.scheduleEvidenceReference||"").trim())errors.push("scheduleEvidenceReference is required for a day claim");
        }
        ["documentId","sourceReference","sourceTitle","sourceVersion","sourceAuthority"].forEach(function(k){
            if(!String(item[k]||"").trim())errors.push(k+" is required for source traceability");
        });
        if(!String(item.sourcePage||"").trim()&&!String(item.sourceSection||"").trim())errors.push("sourcePage or sourceSection is required");
        if(!String(item.scheduleEvidenceReference||"").trim())errors.push("scheduleEvidenceReference is required to support term/week placement");
        if(item.id&&seen[item.id])errors.push("duplicate id: "+item.id);
        if(/verified|officially[-_ ]aligned|ministry[-_ ]approved/i.test(String(item.validationStatus||item.status||""))){
            errors.push("import cannot self-certify curriculum alignment; educator review is required");
        }
        return {valid:errors.length===0,errors:errors};
    }

    function validate(records){
        records=Array.isArray(records)?records:[];
        var seen={}, results=[], duplicateIds={};
        records.forEach(function(item){
            var result=validateRecord(item,seen);
            if(item&&item.id){
                if(seen[item.id])duplicateIds[item.id]=true;
                seen[item.id]=true;
            }
            results.push({id:item&&item.id?item.id:"",indicatorId:item&&item.indicatorId?item.indicatorId:"",valid:result.valid,errors:result.errors});
        });
        var validCount=results.filter(function(x){return x.valid;}).length;
        return {
            valid:validCount===records.length,
            total:records.length,
            validRecords:validCount,
            invalidRecords:records.length-validCount,
            duplicateIds:Object.keys(duplicateIds),
            results:results,
            prototype:true,
            productionEligible:false
        };
    }

    function validateWorkspace(){
        var w=workspace();
        return validate(w&&typeof w.list==="function"?w.list():[]);
    }

    function importBatch(records){
        var w=workspace();
        if(!w||typeof w.add!=="function")return {success:false,error:"Import workspace unavailable.",prototype:true};
        var check=validate(records);
        if(!check.valid)return {success:false,error:"Batch validation failed.",validation:check,imported:[],prototype:true};
        var imported=[];
        records.forEach(function(item){
            var result=w.add(item);
            if(result.success)imported.push(result.item);
        });
        return {success:imported.length===records.length,validation:check,imported:imported,productionEligible:false,prototype:true};
    }

    window.PacificEducationCurriculumBulkImportValidationEngine=Object.freeze({
        name:"PacificEducationCurriculumBulkImportValidationEngine",
        version:VERSION,
        supportedLevels:LEVELS.slice(),
        validate:validate,
        validateWorkspace:validateWorkspace,
        importBatch:importBatch,
        prototype:true,
        productionEligible:false
    });
})(window);
