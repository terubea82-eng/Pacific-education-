(function(window){
"use strict";

var VERSION="1.0.0";

function clone(value){return JSON.parse(JSON.stringify(value));}

function getModel(){
  return window.PacificEducationCurriculumAlignmentDataModel || null;
}

function getRuntime(){
  return window.PacificEducationCurriculumAlignmentRuntimeBridge || null;
}

function getMap(){
  return window.PacificEducationCurriculumAssessmentMap || null;
}

function indicatorCheck(indicatorId){
  var runtime=getRuntime(), model=getModel();
  if(!indicatorId) return {valid:false,blocked:true,reason:"INDICATOR_ID_REQUIRED"};
  if(runtime && typeof runtime.getIndicator==="function"){
    var result=runtime.getIndicator(indicatorId);
    if(!result) return {valid:false,blocked:true,reason:"INDICATOR_NOT_FOUND"};
    if(!result.valid) return {valid:false,blocked:true,reason:"INDICATOR_SOURCE_VERIFICATION_REQUIRED",indicator:clone(result)};
    return {valid:true,blocked:false,reason:null,indicator:clone(result)};
  }
  if(model && typeof model.getIndicator==="function"){
    var item=model.getIndicator(indicatorId);
    if(!item) return {valid:false,blocked:true,reason:"INDICATOR_NOT_FOUND"};
    if(typeof model.validateIndicator==="function" && !model.validateIndicator(item).valid)
      return {valid:false,blocked:true,reason:"INDICATOR_VALIDATION_FAILED",indicator:clone(item)};
    return {valid:true,blocked:false,reason:null,indicator:clone(item)};
  }
  return {valid:false,blocked:true,reason:"ALIGNMENT_RUNTIME_UNAVAILABLE"};
}

function createAssessment(input){
  input=input||{};
  var ids=Array.isArray(input.indicatorIds)?input.indicatorIds:[input.indicatorId];
  ids=ids.filter(Boolean);
  if(!ids.length) return {created:false,blocked:true,reason:"INDICATOR_IDS_REQUIRED",indicatorChecks:[]};
  var checks=ids.map(indicatorCheck);
  var blocked=checks.filter(function(x){return !x.valid;});
  if(blocked.length) return {created:false,blocked:true,reason:"ASSESSMENT_INDICATOR_NOT_ELIGIBLE",blockedReasons:blocked.map(function(x){return x.reason;}),indicatorChecks:checks};
  var assessment={
    id:input.id||("ASM-"+Date.now()),
    indicatorIds:ids.slice(),
    title:input.title||"Curriculum Assessment",
    type:input.type||"teacher-assessment",
    status:"scheduled",
    createdAt:new Date().toISOString()
  };
  var map=getMap();
  if(map && typeof map.register==="function"){
    ids.forEach(function(id){map.register({id:assessment.id+"-"+id,indicatorId:id,assessmentId:assessment.id,assessmentType:assessment.type});});
  }
  return {created:true,blocked:false,assessment:assessment,indicatorChecks:checks};
}

function recordTeacherEvidence(input){
  input=input||{};
  var check=indicatorCheck(input.indicatorId);
  if(!check.valid) return {recorded:false,blocked:true,reason:check.reason,indicatorCheck:check};
  var map=getMap();
  if(!map || typeof map.recordEvidence!=="function") return {recorded:false,blocked:true,reason:"ASSESSMENT_MAP_UNAVAILABLE"};
  return {recorded:true,blocked:false,evidence:map.recordEvidence(input)};
}

function coverage(input){
  input=input||{};
  var map=getMap();
  if(!map || typeof map.getCoverageDecision!=="function")
    return {indicatorId:input.indicatorId,covered:false,evidenceCount:0,reason:"ASSESSMENT_MAP_UNAVAILABLE"};
  var decision=map.getCoverageDecision(input);
  return Object.assign({},decision,{reason:decision.covered?null:"INDICATOR_NOT_COVERED"});
}

function scheduleExam(input){
  input=input||{};
  var ids=Array.isArray(input.indicatorIds)?input.indicatorIds:[input.indicatorId];
  ids=ids.filter(Boolean);
  if(!ids.length) return {scheduled:false,blocked:true,reason:"EXAM_INDICATOR_IDS_REQUIRED"};
  var checks=ids.map(indicatorCheck);
  var sourceBlocked=checks.filter(function(x){return !x.valid;});
  if(sourceBlocked.length) return {scheduled:false,blocked:true,reason:"EXAM_INDICATOR_SOURCE_VERIFICATION_REQUIRED",blockedReasons:sourceBlocked.map(function(x){return x.reason;}),indicatorChecks:checks};
  var uncovered=ids.map(function(id){return coverage({indicatorId:id,studentId:input.studentId});}).filter(function(x){return !x.covered;});
  if(uncovered.length) return {scheduled:false,blocked:true,reason:"EXAM_REQUIRES_COVERED_INDICATORS",uncovered:uncovered,indicatorChecks:checks};
  return {scheduled:true,blocked:false,reason:null,exam:{id:input.id||("EX-"+Date.now()),indicatorIds:ids.slice(),date:input.date||null,status:"scheduled"}};
}

function scheduleRevision(input){
  input=input||{};
  var ids=Array.isArray(input.indicatorIds)?input.indicatorIds:[input.indicatorId];
  ids=ids.filter(Boolean);
  if(!ids.length) return {scheduled:false,blocked:true,reason:"REVISION_INDICATOR_IDS_REQUIRED"};
  var checks=ids.map(indicatorCheck);
  var blocked=checks.filter(function(x){return !x.valid;});
  if(blocked.length) return {scheduled:false,blocked:true,reason:"REVISION_INDICATOR_SOURCE_VERIFICATION_REQUIRED",blockedReasons:blocked.map(function(x){return x.reason;}),indicatorChecks:checks};
  var remaining=ids.filter(function(id){return !coverage({indicatorId:id,studentId:input.studentId}).covered;});
  return {scheduled:true,blocked:false,reason:null,revision:{id:input.id||("REV-"+Date.now()),indicatorIds:remaining,date:input.date||null,status:"scheduled"},remainingIndicatorIds:remaining};
}

function status(){
  return {
    version:VERSION,
    ready:Boolean(getRuntime()||getModel()),
    assessmentMapAvailable:Boolean(getMap()),
    productionApproved:false,
    productionEligible:false,
    externalValidationRequired:true,
    rules:{
      assessmentRequiresValidatedIndicators:true,
      teacherEvidenceRequiredForCoverage:true,
      examsRequireCoveredIndicators:true,
      revisionTargetsRemainingIndicators:true
    }
  };
}

window.PacificEducationCurriculumAssessmentBridge=Object.freeze({
  name:"PacificEducationCurriculumAssessmentBridge",
  version:VERSION,
  createAssessment:createAssessment,
  recordTeacherEvidence:recordTeacherEvidence,
  getCoverageDecision:coverage,
  scheduleRevision:scheduleRevision,
  scheduleExam:scheduleExam,
  status:status
});

})(window);
