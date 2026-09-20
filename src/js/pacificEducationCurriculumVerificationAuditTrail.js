/*
 * Pacific Education — Curriculum Verification Audit Trail
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Records verification-stage transitions for curriculum source records.
 * This is a local prototype audit trail, not a production legal/security log.
 */
(function(window) {
    "use strict";

    var VERSION="1.0.0";
    var STORAGE_KEY="pacificEducationCurriculumVerificationAudit";
    var MAX_RECORDS=2000;
    var STATES=["unverified","source-reviewed","curriculum-verified","owner-approved","production-approved"];

    function copy(v){return JSON.parse(JSON.stringify(v));}

    function read(){
        try{
            var raw=window.localStorage.getItem(STORAGE_KEY);
            var data=raw?JSON.parse(raw):[];
            return Array.isArray(data)?data:[];
        }catch(e){return [];}
    }

    function write(records){
        try{
            window.localStorage.setItem(STORAGE_KEY,JSON.stringify(records.slice(-MAX_RECORDS)));
        }catch(e){}
    }

    function record(input){
        input=input||{};
        if(!input.indicatorId) throw new Error("indicatorId required");
        var from=input.fromStatus||"unverified";
        var to=input.toStatus||"unverified";
        if(STATES.indexOf(from)<0) throw new Error("Invalid fromStatus");
        if(STATES.indexOf(to)<0) throw new Error("Invalid toStatus");

        var item={
            id:"CV-AUDIT-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),
            indicatorId:String(input.indicatorId),
            fromStatus:from,
            toStatus:to,
            action:input.action||"verification-status-change",
            sourceReference:input.sourceReference||null,
            evidenceReference:input.evidenceReference||null,
            reviewerReference:input.reviewerReference||null,
            notes:input.notes||"",
            date:input.date||new Date().toISOString(),
            prototype:true,
            productionEligible:false
        };
        var records=read();
        records.push(item);
        write(records);
        return copy(item);
    }

    function list(filters){
        filters=filters||{};
        return read().filter(function(item){
            return (!filters.indicatorId||item.indicatorId===filters.indicatorId) &&
                   (!filters.toStatus||item.toStatus===filters.toStatus) &&
                   (!filters.fromStatus||item.fromStatus===filters.fromStatus);
        }).map(copy);
    }

    function getForIndicator(indicatorId){return list({indicatorId:indicatorId});}

    function validate(){
        var errors=[];
        read().forEach(function(item){
            if(!item.indicatorId) errors.push("Audit record missing indicatorId");
            if(STATES.indexOf(item.fromStatus)<0) errors.push(item.id+": invalid fromStatus");
            if(STATES.indexOf(item.toStatus)<0) errors.push(item.id+": invalid toStatus");
        });
        return {valid:errors.length===0,errors:errors,count:read().length,prototype:true};
    }

    function reset(){try{window.localStorage.removeItem(STORAGE_KEY);}catch(e){}}

    window.PacificEducationCurriculumVerificationAuditTrail=Object.freeze({
        name:"PacificEducationCurriculumVerificationAuditTrail",
        version:VERSION,
        states:STATES,
        record:record,
        list:list,
        getForIndicator:getForIndicator,
        validate:validate,
        reset:reset
    });
})(window);
