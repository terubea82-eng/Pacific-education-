/*
 * Pacific Education — Curriculum Alignment Import Workspace
 * Version 1.1.0
 * PROTOTYPE ONLY.
 *
 * Stores source-traceable curriculum candidates before educator verification.
 * It does not invent, rewrite, or certify official curriculum content.
 */
(function(window){
    "use strict";

    var VERSION="1.1.0";
    var KEY="pacificEducationCurriculumAlignmentImports";
    var MAX=5000;
    var LEVELS=["ECE","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Form 3","Form 4","Form 5","Form 6","Form 7"];
    var TERMS=["Term 1","Term 2","Term 3","Term 4"];

    function read(){try{var x=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(x)?x:[];}catch(e){return [];}}
    function isPlaceholder(value){return /\\b(?:pending|placeholder|to be confirmed|to be checked|todo|tbd|example\\.com)\\b/i.test(String(value||""));}
    function write(list){localStorage.setItem(KEY,JSON.stringify(list.slice(-MAX)));}

    function normalize(input){
        input=input||{};
        return {
            id:String(input.id||""),
            indicatorId:String(input.indicatorId||""),
            level:String(input.level||""),
            subjectId:String(input.subjectId||""),
            term:String(input.term||""),
            week:input.week===undefined||input.week===null||input.week===""?null:Number(input.week),
            day:input.day===undefined||input.day===null||input.day===""?null:Number(input.day),
            indicatorText:String(input.indicatorText||""),
            documentId:String(input.documentId||""),
            sourceReference:String(input.sourceReference||""),
            sourceTitle:String(input.sourceTitle||""),
            sourceAuthority:String(input.sourceAuthority||""),
            sourcePage:String(input.sourcePage||""),
            sourceSection:String(input.sourceSection||""),
            sourceVersion:String(input.sourceVersion||""),
            scheduleEvidenceReference:String(input.scheduleEvidenceReference||""),
            evidenceReference:String(input.evidenceReference||""),
            mappingNotes:String(input.mappingNotes||""),
            status:"imported-unverified",
            productionEligible:false,
            importedAt:input.importedAt||new Date().toISOString()
        };
    }

    function validate(item){
        var errors=[];
        ["id","indicatorId","level","subjectId","term","indicatorText","documentId","sourceReference","sourceTitle","sourceAuthority","sourceVersion","scheduleEvidenceReference"].forEach(function(k){
            if(!String(item[k]||"").trim())errors.push(k+" is required");
            else if(["documentId","sourceReference","sourceTitle","sourceAuthority","sourceVersion","scheduleEvidenceReference"].indexOf(k)!==-1&&isPlaceholder(item[k]))errors.push(k+" cannot be placeholder text");
        });
        if(LEVELS.indexOf(item.level)===-1)errors.push("level is not a supported Fiji ECE/Class 1–8/Form 3–7 level");
        if(TERMS.indexOf(item.term)===-1)errors.push("term must be Term 1, Term 2, Term 3, or Term 4");
        if(!item.sourcePage&&!item.sourceSection)errors.push("sourcePage or sourceSection is required");
        if((item.sourcePage&&isPlaceholder(item.sourcePage))||(item.sourceSection&&isPlaceholder(item.sourceSection)))errors.push("sourcePage/sourceSection cannot be placeholder text");
        if(item.sourceReference&&!/^https?:\\/\\//i.test(String(item.sourceReference).trim()))errors.push("sourceReference must be an HTTP(S) URL or stable document URL");
        if(item.week!==null&&(!Number.isInteger(item.week)||item.week<1||item.week>13))errors.push("week must be an integer from 1 to 13");
        if(item.day!==null&&(!Number.isInteger(item.day)||item.day<1||item.day>5))errors.push("day must be an integer from 1 to 5");
        return {valid:errors.length===0,errors:errors};
    }

    function add(input){
        var item=normalize(input), check=validate(item);
        if(!check.valid)return {success:false,errors:check.errors,item:item};
        var list=read();
        if(list.some(function(x){return x.id===item.id;}))return {success:false,error:"Import ID already exists.",item:item};
        list.push(item);write(list);
        document.dispatchEvent(new CustomEvent("pacificEducationCurriculumAlignmentImported",{detail:item}));
        return {success:true,item:item};
    }

    function get(id){return read().find(function(x){return x.id===String(id);})||null;}
    function list(){return read();}
    function remove(id){var before=read(),after=before.filter(function(x){return x.id!==String(id);});write(after);return {success:after.length!==before.length};}
    function clear(){localStorage.removeItem(KEY);}
    function exportData(){return JSON.stringify(read(),null,2);}

    window.PacificEducationCurriculumAlignmentImportWorkspace=Object.freeze({
        name:"PacificEducationCurriculumAlignmentImportWorkspace",
        version:VERSION,
        supportedLevels:LEVELS.slice(),
        add:add,
        get:get,
        list:list,
        remove:remove,
        clear:clear,
        validate:validate,
        exportData:exportData,
        prototype:true,
        productionEligible:false
    });
})(window);
