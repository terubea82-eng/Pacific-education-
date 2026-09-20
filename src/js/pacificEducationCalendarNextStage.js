(function(){
"use strict";

var VERSION="1.1.0";

function bridge(){
  return window.PacificEducationCurriculumAssessmentBridge || null;
}

function scheduleRevision(input){
  var b=bridge();
  if(!b||typeof b.scheduleRevision!=="function")
    return {scheduled:false,blocked:true,reason:"ASSESSMENT_COVERAGE_BRIDGE_UNAVAILABLE"};
  return b.scheduleRevision(input||{});
}

function scheduleExam(input){
  var b=bridge();
  if(!b||typeof b.scheduleExam!=="function")
    return {scheduled:false,blocked:true,reason:"ASSESSMENT_COVERAGE_BRIDGE_UNAVAILABLE"};
  return b.scheduleExam(input||{});
}

window.PacificEducationCalendarNextStage=Object.freeze({
  version:VERSION,
  rules:Object.freeze({
    teacherDayOneManual:true,
    revisionAndExamDatesRedistributeRemainingActivities:true,
    examsOnlyOnCoveredIndicators:true,
    weekendsAndHolidaysSupported:true,
    assessmentCoverageRequired:true,
    sourceVerificationRequired:true
  }),
  scheduleRevision:scheduleRevision,
  scheduleExam:scheduleExam,
  status:function(){
    var b=bridge();
    return {
      ready:Boolean(b),
      assessmentCoverageBridgeAvailable:Boolean(b),
      productionApproved:false,
      externalValidationRequired:true
    };
  }
});
})();
