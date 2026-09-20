/*
 * Pacific Education — Curriculum Evidence Registry
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Stores references to evidence supporting curriculum-source mappings.
 * It does not store official documents themselves and does not certify content.
 */
(function(window){
    "use strict";

    var VERSION="1.0.0";
    var KEY="pacificEducationCurriculumEvidenceRegistry";
    var MAX=5000;

    function copy(v){return JSON.parse(JSON.stringify(v));}
    function read(){
        try{
            var raw=window.localStorage.getItem(KEY);
            var value=raw?JSON.parse(raw):[];
            return Array.isArray(value)?value:[];
        }catch(e){return [];}
    }
    function write(items){
        try{window.localStorage.setItem(KEY,JSON.stringify(items.slice(-MAX)));}catch(e){}
    }

    function register(input){
        input=input||{};
        if(!input.indicatorId) throw new Error("indicatorId required");
        if(!input.evidenceReference) throw new Error("evidenceReference required");

        var item={
            id:input.id||("CURR-EVID-"+Date.now()+"-"+Math.random().toString(36).slice(2,8)),
            indicatorId:String(input.indicatorId),
            evidenceReference:String(input.evidenceReference),
            evidenceType:input.evidenceType||"source-reference",
            sourceTitle:input.sourceTitle||"",
            sourceVersion:input.sourceVersion||"",
            page:input.page||"",
            section:input.section||"",
            excerptReference:input.excerptReference||"",
            documentLocation:input.documentLocation||"",
            notes:input.notes||"",
            status:input.status||"unverified",
            addedBy:input.addedBy||"owner-review-required",
            addedAt:input.addedAt||new Date().toISOString(),
            prototype:true,
            productionEligible:false
        };

        var items=read();
        var index=items.findIndex(function(x){return x.id===item.id;});
        if(index>=0) items[index]=item; else items.push(item);
        write(items);

        document.dispatchEvent(new CustomEvent("pacificEducationCurriculumEvidenceChanged",{detail:copy(item)}));
        return copy(item);
    }

    function get(id){
        var item=read().find(function(x){return x.id===String(id);});
        return item?copy(item):null;
    }

    function list(filters){
        filters=filters||{};
        return read().filter(function(x){
            return (!filters.indicatorId||x.indicatorId===String(filters.indicatorId)) &&
                   (!filters.status||x.status===filters.status) &&
                   (!filters.evidenceType||x.evidenceType===filters.evidenceType);
        }).map(copy);
    }

    function getForIndicator(indicatorId){return list({indicatorId:indicatorId});}

    function validate(){
        var errors=[];
        read().forEach(function(x){
            if(!x.id) errors.push("Evidence record missing id");
            if(!x.indicatorId) errors.push((x.id||"record")+": missing indicatorId");
            if(!x.evidenceReference) errors.push((x.id||"record")+": missing evidenceReference");
        });
        return {valid:errors.length===0,errors:errors,count:read().length,prototype:true,productionEligible:false};
    }

    function remove(id){
        var items=read().filter(function(x){return x.id!==String(id);});
        write(items);
        document.dispatchEvent(new CustomEvent("pacificEducationCurriculumEvidenceChanged"));
        return true;
    }

    function exportEvidence(){return copy(read());}
    function reset(){try{window.localStorage.removeItem(KEY);}catch(e){}}

    window.PacificEducationCurriculumEvidenceRegistry=Object.freeze({
        name:"PacificEducationCurriculumEvidenceRegistry",
        version:VERSION,
        register:register,
        get:get,
        list:list,
        getForIndicator:getForIndicator,
        validate:validate,
        remove:remove,
        exportEvidence:exportEvidence,
        reset:reset
    });
})(window);
