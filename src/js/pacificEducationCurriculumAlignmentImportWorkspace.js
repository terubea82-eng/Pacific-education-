/*
 * Pacific Education — Curriculum Alignment Import Workspace
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Stores owner-entered curriculum alignment records before verification.
 * Does not invent, rewrite, or certify official curriculum content.
 */
(function(window){
    "use strict";

    var VERSION="1.0.0";
    var KEY="pacificEducationCurriculumAlignmentImports";
    var MAX=5000;

    function read(){try{var x=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(x)?x:[];}catch(e){return [];}}
    function write(list){localStorage.setItem(KEY,JSON.stringify(list.slice(-MAX)));}

    function normalize(input){
        input=input||{};
        return {
            id:String(input.id||""),
            indicatorId:String(input.indicatorId||""),
            level:String(input.level||""),
            subjectId:String(input.subjectId||""),
            term:String(input.term||""),
            indicatorText:String(input.indicatorText||""),
            documentId:String(input.documentId||""),
            sourceReference:String(input.sourceReference||""),
            sourceTitle:String(input.sourceTitle||""),
            sourcePage:String(input.sourcePage||""),
            sourceSection:String(input.sourceSection||""),
            sourceVersion:String(input.sourceVersion||""),
            evidenceReference:String(input.evidenceReference||""),
            mappingNotes:String(input.mappingNotes||""),
            status:"imported-unverified",
            productionEligible:false,
            importedAt:input.importedAt||new Date().toISOString()
        };
    }

    function validate(item){
        var errors=[];
        ["id","indicatorId","level","subjectId","term","indicatorText"].forEach(function(k){if(!item[k])errors.push(k+" is required");});
        if(item.sourceReference&&!item.documentId)errors.push("documentId is required when sourceReference is supplied");
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
