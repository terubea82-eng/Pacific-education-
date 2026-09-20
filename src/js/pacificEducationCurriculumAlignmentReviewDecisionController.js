/*
 * Pacific Education — Curriculum Alignment Review Decision Controller
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Records reviewer decisions separately from verification status.
 * It cannot certify curriculum or authorize production.
 */
(function(window){
    "use strict";
    var VERSION="1.0.0";
    var DECISIONS=["accept-for-next-review","return-for-correction","hold-pending-source","hold-pending-evidence","hold-pending-document"];

    function queue(){return window.PacificEducationCurriculumAlignmentReviewQueue;}
    function read(){
        try{
            var x=JSON.parse(window.localStorage.getItem("pacificEducationCurriculumReviewDecisions")||"[]");
            return Array.isArray(x)?x:[];
        }catch(e){return [];}
    }
    function save(x){try{window.localStorage.setItem("pacificEducationCurriculumReviewDecisions",JSON.stringify(x.slice(-2000)));}catch(e){}}
    function record(indicatorId,decision,notes){
        if(!queue())return {ok:false,error:"review-queue-unavailable"};
        if(DECISIONS.indexOf(decision)===-1)return {ok:false,error:"invalid-decision"};
        var item=queue().list().find(function(x){return x.indicatorId===indicatorId;});
        if(!item)return {ok:false,error:"indicator-not-found"};
        var r={id:"decision-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),indicatorId:indicatorId,decision:decision,notes:notes||"",currentStatus:item.status,createdAt:new Date().toISOString(),prototype:true,productionEligible:false};
        var all=read();all.push(r);save(all);
        document.dispatchEvent(new CustomEvent("pacificEducationCurriculumReviewDecisionRecorded",{detail:r}));
        return {ok:true,record:r};
    }
    function list(indicatorId){var x=read();return indicatorId?x.filter(function(r){return r.indicatorId===indicatorId;}):x;}
    function latest(indicatorId){var x=list(indicatorId);return x.length?x[x.length-1]:null;}
    function validate(){return {valid:!!queue(),errors:queue()?[]:["review-queue-unavailable"],prototype:true,productionEligible:false};}
    window.PacificEducationCurriculumAlignmentReviewDecisionController=Object.freeze({
        name:"PacificEducationCurriculumAlignmentReviewDecisionController",version:VERSION,decisions:DECISIONS.slice(),
        record:record,list:list,latest:latest,validate:validate,prototype:true,productionEligible:false
    });
})(window);
