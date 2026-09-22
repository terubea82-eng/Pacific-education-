/*
 * Pacific Education
 * Expanded Subject Curriculum Mapping Queue
 * Version 1.0.0
 *
 * Creates a transparent verification queue for every Form 1-7
 * expanded pilot activity. It does NOT claim official alignment.
 */
(function(window){
    "use strict";
    var VERSION="1.0.0";
    var records=[];
    var states=["unverified","source-reviewed","curriculum-verified","owner-approved","production-approved"];

    function build(){
        var c=window.PacificEducationExpandedSubjectCatalog;
        if(!c)return false;
        records=c.exportData().map(function(a){
            return {
                activityId:a.id,
                level:a.level,
                subjectId:a.subjectId,
                topic:a.topic,
                verificationStatus:"unverified",
                officialSourceRequired:true,
                sourceReference:null,
                achievementIndicatorId:null,
                reviewer:null,
                notes:"",
                productionEligible:false
            };
        });
        return true;
    }
    function list(filters){
        filters=filters||{};
        return records.filter(function(r){
            return (!filters.level||r.level===filters.level)&&
                (!filters.subjectId||r.subjectId===filters.subjectId)&&
                (!filters.verificationStatus||r.verificationStatus===filters.verificationStatus);
        }).map(function(r){return JSON.parse(JSON.stringify(r));});
    }
    function summary(){
        var out={total:records.length,unverified:0,sourceReviewed:0,curriculumVerified:0,ownerApproved:0,productionApproved:0};
        records.forEach(function(r){
            var k=r.verificationStatus==="source-reviewed"?"sourceReviewed":
                r.verificationStatus==="curriculum-verified"?"curriculumVerified":
                r.verificationStatus==="owner-approved"?"ownerApproved":
                r.verificationStatus==="production-approved"?"productionApproved":"unverified";
            out[k]++;
        });
        return out;
    }
    function update(activityId, data){
        var r=records.find(function(x){return x.activityId===activityId;});
        if(!r)return null;
        data=data||{};
        if(data.verificationStatus && states.indexOf(data.verificationStatus)===-1)throw new Error("Invalid verification status");
        if(data.verificationStatus)r.verificationStatus=data.verificationStatus;
        if(Object.prototype.hasOwnProperty.call(data,"sourceReference"))r.sourceReference=data.sourceReference;
        if(Object.prototype.hasOwnProperty.call(data,"achievementIndicatorId"))r.achievementIndicatorId=data.achievementIndicatorId;
        if(Object.prototype.hasOwnProperty.call(data,"reviewer"))r.reviewer=data.reviewer;
        if(Object.prototype.hasOwnProperty.call(data,"notes"))r.notes=data.notes;
        r.productionEligible=r.verificationStatus==="production-approved";
        return JSON.parse(JSON.stringify(r));
    }
    build();
    window.PacificEducationExpandedCurriculumMappingQueue=Object.freeze({
        name:"PacificEducationExpandedCurriculumMappingQueue",
        version:VERSION,
        verificationStates:states.slice(),
        rebuild:build,
        list:list,
        update:update,
        summary:summary
    });
})(window);
