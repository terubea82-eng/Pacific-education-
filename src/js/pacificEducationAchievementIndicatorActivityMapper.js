/* =========================================================
 * PACIFIC EDUCATION — ACHIEVEMENT INDICATOR ACTIVITY MAPPER
 * Version: 1.0.0
 *
 * Purpose:
 * Every VERIFIED Ministry achievement indicator must have
 * traceable learning activities. No activity is considered
 * curriculum-aligned merely because it has a similar concept.
 * ========================================================= */
(function(window){
    "use strict";

    var VERSION="1.0.0";
    var ACTIVITY_TYPES=Object.freeze([
        "teach",
        "guided-practice",
        "independent-practice",
        "application",
        "check-assessment",
        "remedial-extension"
    ]);

    function copy(v){return JSON.parse(JSON.stringify(v));}

    function registry(){
        return window.PacificEducationCurriculumAlignmentRegistry;
    }

    function evidenceRegistry(){
        return window.PacificEducationCurriculumEvidenceRegistry;
    }

    function verifiedIndicators(filters){
        var r=registry();
        if(!r||typeof r.list!=="function")return [];
        return r.list(filters||{}).filter(function(x){
            return x.status==="VALIDATED" ||
                   x.validationStatus==="VALIDATED" ||
                   x.indicatorStatus==="VALIDATED" ||
                   x.status==="SOURCE_VERIFIED" ||
                   x.validationStatus==="SOURCE_VERIFIED";
        });
    }

    function indicatorAction(text){var t=String(text||"").toLowerCase();if(/collect|gather|identify/.test(t))return "collect or identify evidence";if(/sort|classif|compare|contrast/.test(t))return "sort, classify, compare or contrast evidence";if(/describe|discuss|explain/.test(t))return "describe, discuss or explain using evidence";if(/demonstrate|practise|practice/.test(t))return "demonstrate the required skill with observable evidence";if(/draw|budget|calculate|measure/.test(t))return "produce the required calculation, record, drawing or model";if(/report|compile|create|develop/.test(t))return "produce and communicate a supported response";return "demonstrate understanding through evidence and explanation";}

    function makeActivities(indicator){
        var id=String(indicator.id||indicator.indicatorId||indicator.rowId||"indicator");
        var text=String(indicator.indicatorText||indicator.achievementIndicator||"");
        if(!text)return [];
        return ACTIVITY_TYPES.map(function(type,index){
            var labels={
                "teach":"Teach and model the achievement indicator",
                "guided-practice":"Guided practice with prompts and feedback",
                "independent-practice":"Independent practice demonstrating the indicator",
                "application":"Application: transfer the indicator to a familiar context",
                "check-assessment":"Check assessment: collect evidence of the indicator",
                "remedial-extension":"Remedial / extension: reteach gaps or extend mastery"
            };
            return {
                activityId:id+"-ACT-"+String(index+1).padStart(2,"0"),
                indicatorId:id,
                activityType:type,
                title:labels[type],
                taskFocus:labels[type],
                achievementIndicator:text,
                strand:indicator.strand||"",
                subStrand:indicator.subStrand||"",
                concept:indicator.subStrand||"",
                activitySequence:index+1,
                sourceDocument:indicator.sourceDocument||indicator.evidenceReference||"",
                sourceLocation:indicator.sourceLocation||indicator.page||"",
                level:indicator.level||"",
                subjectId:indicator.subjectId||indicator.subject||"",
                term:indicator.term||"",
                status:"mapped-from-verified-indicator",
                prototype:true,
                productionEligible:false
            };
        });
    }

    function mapIndicator(indicator){
        if(!indicator)return {success:false,activities:[],reason:"indicator-required"};
        if(!(indicator.status==="VALIDATED" ||
             indicator.validationStatus==="VALIDATED" ||
             indicator.indicatorStatus==="VALIDATED" ||
             indicator.status==="SOURCE_VERIFIED" ||
             indicator.validationStatus==="SOURCE_VERIFIED")){
            return {success:false,activities:[],reason:"indicator-not-verified"};
        }
        return {success:true,indicatorId:indicator.id||indicator.indicatorId||indicator.rowId,
                activities:makeActivities(indicator)};
    }

    function mapAll(filters){
        var indicators=verifiedIndicators(filters);
        var activities=[];
        indicators.forEach(function(indicator){
            activities=activities.concat(makeActivities(indicator));
        });
        return {
            success:true,
            prototype:true,
            verifiedIndicatorCount:indicators.length,
            mappedActivityCount:activities.length,
            activityTypes:ACTIVITY_TYPES.slice(),
            activities:activities
        };
    }

    function coverage(filters){
        var indicators=verifiedIndicators(filters);
        return indicators.map(function(indicator){
            var mapped=makeActivities(indicator);
            return {
                indicatorId:indicator.id||indicator.indicatorId||indicator.rowId,
                level:indicator.level||"",
                subjectId:indicator.subjectId||indicator.subject||"",
                term:indicator.term||"",
                achievementIndicator:indicator.indicatorText||indicator.achievementIndicator,
                activityCount:mapped.length,
                fullyMapped:mapped.length===ACTIVITY_TYPES.length
            };
        });
    }

    window.PacificEducationAchievementIndicatorActivityMapper=Object.freeze({
        name:"PacificEducationAchievementIndicatorActivityMapper",
        version:VERSION,
        activityTypes:ACTIVITY_TYPES,
        verifiedIndicators:verifiedIndicators,
        mapIndicator:mapIndicator,
        mapAll:mapAll,
        coverage:coverage
    });
})(window);
