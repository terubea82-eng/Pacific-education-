/*
 * Pacific Education — Curriculum Source Mapping Workspace
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Stores owner-entered mappings between curriculum records and authoritative
 * source references. It does not invent, rewrite, or certify official content.
 */
(function(window){
    "use strict";

    var VERSION="1.0.0";
    var KEY="pacificEducationCurriculumSourceMappings";
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

    function mapSource(input){
        input=input||{};
        if(!input.indicatorId) throw new Error("indicatorId required");
        if(!input.sourceReference) throw new Error("sourceReference required");

        var items=read();
        var existing=items.findIndex(function(x){return x.indicatorId===String(input.indicatorId);});
        var item={
            indicatorId:String(input.indicatorId),
            sourceReference:String(input.sourceReference),
            sourceTitle:input.sourceTitle||"",
            sourcePage:input.sourcePage||"",
            sourceSection:input.sourceSection||"",
            sourceVersion:input.sourceVersion||"",
            evidenceReference:input.evidenceReference||"",
            mappingNotes:input.mappingNotes||"",
            sourceStatus:input.sourceStatus||"unverified",
            mappedBy:input.mappedBy||"owner-review-required",
            mappedAt:input.mappedAt||new Date().toISOString(),
            prototype:true,
            productionEligible:false
        };

        if(existing>=0) items[existing]=item;
        else items.push(item);
        write(items);

        document.dispatchEvent(new CustomEvent("pacificEducationCurriculumSourceMappingChanged",{detail:copy(item)}));
        return copy(item);
    }

    function get(indicatorId){
        var item=read().find(function(x){return x.indicatorId===String(indicatorId);});
        return item?copy(item):null;
    }

    function list(){return read().map(copy);}

    function remove(indicatorId){
        var items=read().filter(function(x){return x.indicatorId!==String(indicatorId);});
        write(items);
        document.dispatchEvent(new CustomEvent("pacificEducationCurriculumSourceMappingChanged"));
        return true;
    }

    function validate(){
        var errors=[];
        read().forEach(function(item){
            if(!item.indicatorId) errors.push("Missing indicatorId");
            if(!item.sourceReference) errors.push(item.indicatorId+": missing sourceReference");
            if(item.sourceStatus==="production-approved") {
                errors.push(item.indicatorId+": source mapping cannot independently grant production approval");
            }
        });
        return {valid:errors.length===0,errors:errors,count:read().length,prototype:true,productionEligible:false};
    }

    function exportMappings(){return copy(read());}
    function reset(){try{window.localStorage.removeItem(KEY);}catch(e){}}

    window.PacificEducationCurriculumSourceMappingWorkspace=Object.freeze({
        name:"PacificEducationCurriculumSourceMappingWorkspace",
        version:VERSION,
        mapSource:mapSource,
        get:get,
        list:list,
        remove:remove,
        validate:validate,
        exportMappings:exportMappings,
        reset:reset
    });
})(window);
