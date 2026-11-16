/* PacEdu indicator master + teaching allocation resolver.
 * Empty by default: no Fiji syllabus indicators or weekly allocations are invented.
 * Populate only from the reviewed PacEdu Indicators Master File and verified sources.
 */
(function(global){
"use strict";
function list(value){return Array.isArray(value)?value:[];}
function resolve(options){
 options=options||{};
 var level=String(options.level||""),subject=String(options.subject||""),term=String(options.term||""),week=Number(options.week),day=Number(options.day);
 var allocations=list(global.PacEduTeachingAllocationRecords);
 var allocation=allocations.filter(function(item){
  return item&&item.level===level&&item.subject===subject&&item.term===term&&Number(item.week)===week&&Number(item.day)===day;
 })[0]||null;
 if(!allocation){
  return {status:"PENDING_SUBJECT_SPECIFIC_INDICATOR",allocationId:"",learnerGoal:"",evidenceOfLearning:"",indicators:[],teacherReviewStatus:"PENDING_TEACHER_REVIEW"};
 }
 var master=list(global.PacEduIndicatorMasterRecords);
 var ids=list(allocation.indicatorIds);
 var indicators=ids.map(function(id){
  return master.filter(function(item){return item&&item.indicatorId===id;})[0]||null;
 }).filter(Boolean);
 var complete=ids.length>0&&indicators.length===ids.length&&indicators.every(function(item){
  return item.verificationStatus==="SOURCE_VERIFIED"&&(item.authorityType==="OFFICIAL_SOURCE_WORDING"&&String(item.officialWording||"").trim()||item.authorityType==="PACEDU_ADAPTED_SOURCE_ALIGNED"&&String(item.paceduAdaptedWording||"").trim())&&
   String(item.sourceTitle||"").trim()&&String(item.sourceEdition||"").trim()&&String(item.sourcePage||"").trim();
 });
 var allocationVerified=allocation.verificationStatus==="ALLOCATION_VERIFIED";
 var status=complete&&allocationVerified?"ALLOCATION_VERIFIED":"PENDING_SUBJECT_SPECIFIC_INDICATOR";
 var teacherReviewStatus=allocation.teacherReviewStatus==="APPROVED_FOR_USE"&&status==="ALLOCATION_VERIFIED"
  ?"APPROVED_FOR_USE":"PENDING_TEACHER_REVIEW";
 return {
  status:status,
  allocationId:String(allocation.allocationId||""),
  learnerGoal:String(allocation.learnerGoal||""),
  evidenceOfLearning:String(allocation.evidenceOfLearning||""),
  indicators:complete&&allocationVerified?indicators.map(function(item){return {
   indicatorId:String(item.indicatorId),
   authorityType:String(item.authorityType),
   wording:String(item.authorityType==="OFFICIAL_SOURCE_WORDING"?item.officialWording:item.paceduAdaptedWording),
   sourceTitle:String(item.sourceTitle),
   sourceEdition:String(item.sourceEdition),
   sourcePage:String(item.sourcePage)
  };}):[],
  teacherReviewStatus:teacherReviewStatus
 };
}
global.PacEduIndicatorAllocationRegistry=Object.freeze({resolve:resolve});
})(window);
