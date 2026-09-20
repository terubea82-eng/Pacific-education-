/*
 * Pacific Education — Curriculum Alignment Review Action Controller
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Creates review actions from the central queue. It does not approve
 * curriculum, change official source status, or authorize production.
 */
(function(window){
    "use strict";
    var VERSION="1.0.0";
    var ACTIONS=["review-source","add-source-mapping","add-evidence","add-document-reference","resolve-blockers","request-verification"];

    function queue(){return window.PacificEducationCurriculumAlignmentReviewQueue;}
    function create(indicatorId,action,notes){
        var q=queue();
        if(!q)return {ok:false,error:"review-queue-unavailable"};
        if(ACTIONS.indexOf(action)===-1)return {ok:false,error:"invalid-review-action"};
        var item=q.list().find(function(x){return x.indicatorId===indicatorId;});
        if(!item)return {ok:false,error:"indicator-not-found"};
        var record={
            id:"review-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),
            indicatorId:indicatorId,
            action:action,
            status:"open",
            notes:notes||"",
            createdAt:new Date().toISOString(),
            prototype:true,
            productionEligible:false
        };
        var key="pacificEducationCurriculumReviewActions";
        var list=[];
        try{list=JSON.parse(window.localStorage.getItem(key)||"[]");if(!Array.isArray(list))list=[];}catch(e){list=[];}
        list.push(record);
        if(list.length>2000)list=list.slice(-2000);
        try{window.localStorage.setItem(key,JSON.stringify(list));}catch(e){}
        document.dispatchEvent(new CustomEvent("pacificEducationCurriculumReviewActionCreated",{detail:record}));
        return {ok:true,record:record};
    }
    function list(indicatorId){
        var list=[];
        try{list=JSON.parse(window.localStorage.getItem("pacificEducationCurriculumReviewActions")||"[]");}catch(e){}
        if(!Array.isArray(list))list=[];
        return indicatorId?list.filter(function(x){return x.indicatorId===indicatorId;}):list;
    }
    function close(id){
        var list=list();
        var found=null;
        list=list.map(function(x){if(x.id===id){found=Object.assign({},x,{status:"closed",closedAt:new Date().toISOString()});return found;}return x;});
        try{window.localStorage.setItem("pacificEducationCurriculumReviewActions",JSON.stringify(list));}catch(e){}
        return found?{ok:true,record:found}:{ok:false,error:"action-not-found"};
    }
    function validate(){
        return {valid:!!queue(),errors:queue()?[]:["review-queue-unavailable"],prototype:true,productionEligible:false};
    }
    window.PacificEducationCurriculumAlignmentReviewActionController=Object.freeze({
        name:"PacificEducationCurriculumAlignmentReviewActionController",
        version:VERSION,
        actions:ACTIONS.slice(),
        create:create,
        list:list,
        close:close,
        validate:validate,
        prototype:true,
        productionEligible:false
    });
})(window);
