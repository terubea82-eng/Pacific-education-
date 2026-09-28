(function(window){"use strict";
var records=[], assessments=[], VERSION="1.0.0";
var levels=["Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12","Class 13"];
var terms=["Term 1","Term 2","Term 3","UNASSIGNED"];
function copy(v){return JSON.parse(JSON.stringify(v));}
function registerIndicator(r){if(!r||!r.id)throw new Error("Indicator id required");var i=records.findIndex(function(x){return x.id===r.id});if(i>=0)records[i]=copy(r);else records.push(copy(r));return copy(r);}
function getIndicator(id){var r=records.find(function(x){return x.id===id});return r?copy(r):null;}
function list(f){f=f||{};return records.filter(function(r){return (!f.level||r.level===f.level)&&(!f.subjectId||r.subjectId===f.subjectId)&&(!f.term||r.term===f.term)&&(!f.status||r.status===f.status)}).map(copy);}
function registerAssessment(a){if(!a||!a.id)throw new Error("Assessment id required");var i=assessments.findIndex(function(x){return x.id===a.id});if(i>=0)assessments[i]=copy(a);else assessments.push(copy(a));return copy(a);}
function getAssessment(id){var r=assessments.find(function(x){return x.id===id});return r?copy(r):null;}
function buildDailyPlan(f){f=f||{};var items=list(f).filter(function(r){return r.status!=="retired"});if(f.maximumIndicators)items=items.slice(0,f.maximumIndicators);return {dayNumber:Number(f.dayNumber||1),level:f.level||null,subjectId:f.subjectId||null,term:f.term||null,indicators:items,prototype:true};}
function coverageSummary(f){var a=list(f),out={total:a.length,covered:0,remaining:0};a.forEach(function(r){if(r.coverageStatus==="covered")out.covered++;else out.remaining++});return out;}
function validate(){var errors=[];records.forEach(function(r){["id","level","subjectId","term","indicatorText"].forEach(function(k){if(!r[k])errors.push(r.id+": missing "+k)});if(levels.indexOf(r.level)<0)errors.push(r.id+": invalid level");if(terms.indexOf(r.term)<0)errors.push(r.id+": invalid term")});return {valid:errors.length===0,errors:errors,indicatorCount:records.length,assessmentCount:assessments.length};}
function reset(){records=[];assessments=[];}
window.PacificEducationCurriculumAlignmentRegistry=Object.freeze({name:"PacificEducationCurriculumAlignmentRegistry",version:VERSION,levels:levels,terms:terms,registerIndicator:registerIndicator,getIndicator:getIndicator,list:list,registerAssessment:registerAssessment,getAssessment:getAssessment,buildDailyPlan:buildDailyPlan,coverageSummary:coverageSummary,validate:validate,reset:reset});
})(window);