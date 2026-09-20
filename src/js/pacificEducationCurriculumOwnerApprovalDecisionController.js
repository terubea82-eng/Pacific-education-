/*
 * Pacific Education — Curriculum Owner Approval Decision Controller
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Records the owner's decision on an approval request.
 * This prototype does not change curriculum verification status,
 * grant production access, or act as legal approval.
 */
(function(window){
    "use strict";
    var VERSION="1.0.0";
    var KEY="pacificEducationCurriculumOwnerApprovalDecisions";
    var DECISIONS=["approve-owner-review","return-for-correction","hold-pending-verification","decline-owner-approval"];

    function read(){
        try{var x=JSON.parse(window.localStorage.getItem(KEY)||"[]");return Array.isArray(x)?x:[];}
        catch(e){return [];}
    }
    function save(x){try{window.localStorage.setItem(KEY,JSON.stringify(x.slice(-2000)));}catch(e){}}

    function requests(){return window.PacificEducationCurriculumOwnerApprovalRequest;}
    function record(requestId,decision,notes){
        var r=requests();
        if(!r)return {ok:false,error:"owner-approval-request-module-unavailable"};
        if(DECISIONS.indexOf(decision)===-1)return {ok:false,error:"invalid-owner-decision"};
        var request=r.list().find(function(x){return x.id===requestId;});
        if(!request)return {ok:false,error:"approval-request-not-found"};
        var d={
            id:"owner-decision-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),
            requestId:requestId,
            indicatorId:request.indicatorId,
            decision:decision,
            notes:notes||"",
            requestStatus:request.status,
            decidedAt:new Date().toISOString(),
            prototype:true,
            productionEligible:false
        };
        var all=read();all.push(d);save(all);
        document.dispatchEvent(new CustomEvent("pacificEducationCurriculumOwnerApprovalDecisionRecorded",{detail:d}));
        return {ok:true,record:d};
    }
    function list(requestId){
        var x=read();
        return requestId?x.filter(function(d){return d.requestId===requestId;}):x;
    }
    function latest(requestId){
        var x=list(requestId);
        return x.length?x[x.length-1]:null;
    }
    function validate(){
        return {valid:!!requests(),errors:requests()?[]:["owner-approval-request-module-unavailable"],prototype:true,productionEligible:false};
    }

    window.PacificEducationCurriculumOwnerApprovalDecisionController=Object.freeze({
        name:"PacificEducationCurriculumOwnerApprovalDecisionController",
        version:VERSION,
        decisions:DECISIONS.slice(),
        record:record,
        list:list,
        latest:latest,
        validate:validate,
        prototype:true,
        productionEligible:false
    });
})(window);
