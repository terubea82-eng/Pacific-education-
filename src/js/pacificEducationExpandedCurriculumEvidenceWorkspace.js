/*
 * Pacific Education — Expanded Curriculum Evidence Entry Workspace
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Allows an authorized reviewer to enter authoritative Fiji curriculum
 * source evidence against a Class 7–13 (Form 1–7) pilot activity. This workspace never
 * invents evidence and never grants curriculum or production approval.
 */
(function(window){
    "use strict";

    var VERSION = "1.0.0";
    var DRAFT_KEY = "pacificEducationExpandedCurriculumEvidenceDrafts";

    function copy(value){ return JSON.parse(JSON.stringify(value)); }

    function readDrafts(){
        try{
            var raw = window.localStorage.getItem(DRAFT_KEY);
            var value = raw ? JSON.parse(raw) : {};
            return value && typeof value === "object" ? value : {};
        }catch(e){ return {}; }
    }

    function writeDrafts(value){
        try{ window.localStorage.setItem(DRAFT_KEY, JSON.stringify(value)); }catch(e){}
    }

    function catalog(){
        return window.PacificEducationExpandedSubjectCatalog || null;
    }

    function queue(){
        return window.PacificEducationExpandedCurriculumMappingQueue || null;
    }

    function guard(){
        return window.PacificEducationCurriculumVerificationWorkflowGuard || null;
    }

    function mapping(){
        return window.PacificEducationCurriculumSourceMappingWorkspace || null;
    }

    function evidence(){
        return window.PacificEducationCurriculumEvidenceRegistry || null;
    }

    function sourceVerifier(){
        return window.PacificEducationCurriculumSourceVerification || null;
    }

    function getActivities(){
        var c = catalog();
        if(!c || typeof c.list !== "function") return [];
        return c.list({}) || [];
    }

    function getActivity(id){
        var list = getActivities();
        for(var i=0;i<list.length;i++){
            if(String(list[i].activityId) === String(id)) return list[i];
        }
        return null;
    }

    function getQueueItem(id){
        var q = queue();
        if(!q || typeof q.list !== "function") return null;
        var rows = q.list({activityId:String(id)});
        return rows && rows.length ? rows[0] : null;
    }

    function getDraft(id){
        var drafts = readDrafts();
        return drafts[String(id)] ? copy(drafts[String(id)]) : null;
    }

    function saveDraft(input){
        input = input || {};
        if(!input.activityId) throw new Error("activityId required");

        var activity = getActivity(input.activityId);
        if(!activity) throw new Error("Expanded pilot activity not found");

        var draft = {
            activityId: String(input.activityId),
            sourceTitle: String(input.sourceTitle || "").trim(),
            sourceReference: String(input.sourceReference || "").trim(),
            achievementIndicatorId: String(input.achievementIndicatorId || "").trim(),
            evidenceReference: String(input.evidenceReference || "").trim(),
            evidenceSummary: String(input.evidenceSummary || "").trim(),
            reviewerReference: String(input.reviewerReference || "").trim(),
            notes: String(input.notes || "").trim(),
            savedAt: new Date().toISOString(),
            prototype: true,
            verificationStatus: "unverified",
            productionEligible: false
        };

        var drafts = readDrafts();
        drafts[draft.activityId] = draft;
        writeDrafts(drafts);

        document.dispatchEvent(new CustomEvent("pacificEducationExpandedCurriculumEvidenceDraftChanged",{detail:copy(draft)}));
        return copy(draft);
    }

    function validateInput(input){
        var errors = [];
        if(!input.sourceTitle) errors.push("Authoritative source title is required.");
        if(!input.sourceReference) errors.push("Authoritative source reference is required.");
        if(!input.achievementIndicatorId) errors.push("Achievement indicator ID/reference is required.");
        if(!input.evidenceReference) errors.push("Evidence reference/location is required.");
        if(!input.evidenceSummary) errors.push("Evidence summary or excerpt reference is required.");
        if(!input.reviewerReference) errors.push("Reviewer reference is required.");
        return errors;
    }

    function commitEvidence(input){
        input = input || {};
        var errors = validateInput(input);
        if(errors.length) return {success:false,errors:errors,prototype:true,productionEligible:false};

        var activity = getActivity(input.activityId);
        if(!activity) return {success:false,errors:["Activity not found."],prototype:true,productionEligible:false};

        var indicatorId = String(input.achievementIndicatorId);
        var m = mapping();
        var e = evidence();

        if(!m || typeof m.mapSource !== "function" || !e || typeof e.register !== "function"){
            return {success:false,errors:["Curriculum evidence registry services are unavailable."],prototype:true,productionEligible:false};
        }

        var mapped = m.mapSource({
            indicatorId: indicatorId,
            sourceReference: input.sourceReference,
            sourceTitle: input.sourceTitle,
            sourcePage: input.sourcePage || "",
            sourceSection: input.sourceSection || "",
            sourceVersion: input.sourceVersion || "",
            evidenceReference: input.evidenceReference,
            mappingNotes: input.notes || "",
            sourceStatus: "unverified",
            mappedBy: input.reviewerReference
        });

        var ev = e.register({
            indicatorId: indicatorId,
            evidenceReference: input.evidenceReference,
            evidenceType: "authoritative-curriculum-evidence",
            sourceTitle: input.sourceTitle,
            sourceVersion: input.sourceVersion || "",
            page: input.sourcePage || "",
            section: input.sourceSection || "",
            excerptReference: input.evidenceSummary,
            documentLocation: input.sourceReference,
            notes: input.notes || "",
            status: "unverified",
            addedBy: input.reviewerReference
        });

        var sv = sourceVerifier();
        if(sv && typeof sv.register === "function"){
            sv.register({
                id: indicatorId,
                level: activity.level,
                subjectId: activity.subjectId,
                term: "expanded-pilot",
                indicatorText: input.evidenceSummary,
                source: {
                    title: input.sourceTitle,
                    reference: input.sourceReference
                },
                verificationStatus: "unverified",
                verification: {
                    reviewer: input.reviewerReference,
                    notes: input.notes || "",
                    evidenceReference: input.evidenceReference
                }
            });
        }

        var draft = saveDraft(input);
        return {
            success:true,
            activityId:String(input.activityId),
            indicatorId:indicatorId,
            mapping:mapped,
            evidence:ev,
            draft:draft,
            verificationStatus:"unverified",
            productionEligible:false,
            message:"Evidence recorded for review. No curriculum or production approval was granted."
        };
    }

    function evaluate(activityId){
        var q = getQueueItem(activityId);
        var draft = getDraft(activityId);
        var blockers = [];
        var workflow = null;
        var indicatorId = draft && draft.achievementIndicatorId ? draft.achievementIndicatorId : null;

        if(indicatorId && guard() && typeof guard().evaluate === "function"){
            workflow = guard().evaluate(indicatorId);
            blockers = workflow.blockers || [];
        }else{
            blockers.push("Enter and save an achievement indicator reference before workflow evaluation.");
        }

        return {
            activityId:String(activityId),
            queue:q,
            draft:draft,
            workflow:workflow,
            blockers:blockers,
            prototype:true,
            productionEligible:false
        };
    }

    function render(containerId){
        var host = document.getElementById(containerId);
        if(!host) return;

        var activities = getActivities();
        if(!activities.length){
            host.innerHTML = "<p>Expanded pilot activity catalog is unavailable.</p>";
            return;
        }

        var forms = [];
        var subjects = [];
        activities.forEach(function(a){
            if(forms.indexOf(a.level)<0) forms.push(a.level);
            if(subjects.indexOf(a.subjectId)<0) subjects.push(a.subjectId);
        });

        host.innerHTML =
            '<h2>Curriculum Evidence Entry — Class 7–13 (Form 1–7)</h2>' +
            '<p><strong>PILOT PROTOTYPE — OFFICIAL CURRICULUM VERIFICATION REQUIRED.</strong> Enter only evidence taken from an authoritative Fiji curriculum source. This workspace does not invent, certify, approve, or publish curriculum alignment.</p>' +
            '<label>Activity <select id="pecewActivity"></select></label>' +
            '<div id="pecewActivityInfo" style="margin:10px 0;"></div>' +
            '<fieldset><legend>Authoritative evidence</legend>' +
            '<label>Source title<br><input id="pecewSourceTitle" type="text" style="width:100%;"></label><br>' +
            '<label>Source reference / URL / document ID<br><input id="pecewSourceReference" type="text" style="width:100%;"></label><br>' +
            '<label>Achievement indicator ID/reference<br><input id="pecewIndicator" type="text" style="width:100%;"></label><br>' +
            '<label>Evidence location / page / section<br><input id="pecewEvidenceReference" type="text" style="width:100%;"></label><br>' +
            '<label>Evidence summary or short excerpt reference<br><textarea id="pecewEvidenceSummary" rows="4" style="width:100%;"></textarea></label><br>' +
            '<label>Reviewer reference<br><input id="pecewReviewer" type="text" style="width:100%;"></label><br>' +
            '<label>Notes<br><textarea id="pecewNotes" rows="3" style="width:100%;"></textarea></label>' +
            '</fieldset>' +
            '<button type="button" id="pecewSave">Save evidence for review</button> ' +
            '<button type="button" id="pecewClear">Clear</button>' +
            '<div id="pecewStatus" role="status" style="margin-top:10px;"></div>' +
            '<div id="pecewWorkflow" style="margin-top:10px;"></div>';

        var select = document.getElementById("pecewActivity");
        activities.forEach(function(a){
            var option = document.createElement("option");
            option.value = a.activityId;
            option.textContent = a.activityId + " — " + a.level + " — " + a.subjectId + " — " + a.topic;
            select.appendChild(option);
        });

        function refresh(){
            var activity = getActivity(select.value);
            var draft = getDraft(select.value);
            var info = document.getElementById("pecewActivityInfo");
            var status = document.getElementById("pecewStatus");
            var wf = document.getElementById("pecewWorkflow");

            if(activity){
                info.innerHTML = "<strong>"+activity.title+"</strong><br>"+activity.instruction+
                    "<br><em>Teacher testing task:</em> "+activity.teacherTask;
            }

            document.getElementById("pecewSourceTitle").value = draft ? draft.sourceTitle : "";
            document.getElementById("pecewSourceReference").value = draft ? draft.sourceReference : "";
            document.getElementById("pecewIndicator").value = draft ? draft.achievementIndicatorId : "";
            document.getElementById("pecewEvidenceReference").value = draft ? draft.evidenceReference : "";
            document.getElementById("pecewEvidenceSummary").value = draft ? draft.evidenceSummary : "";
            document.getElementById("pecewReviewer").value = draft ? draft.reviewerReference : "";
            document.getElementById("pecewNotes").value = draft ? draft.notes : "";

            var state = evaluate(select.value);
            if(state.workflow){
                wf.innerHTML = "<strong>Workflow status:</strong> "+state.workflow.currentStatus+
                    "<br><strong>Source mapped:</strong> "+(state.workflow.sourceMapped?"Yes":"No")+
                    "<br><strong>Evidence present:</strong> "+(state.workflow.evidencePresent?"Yes":"No")+
                    "<br><strong>Blockers:</strong> "+(state.blockers.length ? state.blockers.join(" ") : "None");
            }else{
                wf.innerHTML = "<strong>Workflow blockers:</strong> "+state.blockers.join(" ");
            }
            status.textContent = "";
        }

        document.getElementById("pecewSave").addEventListener("click",function(){
            var input = {
                activityId:select.value,
                sourceTitle:document.getElementById("pecewSourceTitle").value,
                sourceReference:document.getElementById("pecewSourceReference").value,
                achievementIndicatorId:document.getElementById("pecewIndicator").value,
                evidenceReference:document.getElementById("pecewEvidenceReference").value,
                evidenceSummary:document.getElementById("pecewEvidenceSummary").value,
                reviewerReference:document.getElementById("pecewReviewer").value,
                notes:document.getElementById("pecewNotes").value
            };
            var result;
            try{ result=commitEvidence(input); }
            catch(e){ result={success:false,errors:[e.message||String(e)],prototype:true}; }
            status.textContent = result.success ? result.message : result.errors.join(" ");
            refresh();
        });

        document.getElementById("pecewClear").addEventListener("click",function(){
            var drafts = readDrafts();
            delete drafts[String(select.value)];
            writeDrafts(drafts);
            refresh();
        });

        select.addEventListener("change",refresh);
        refresh();
    }

    window.PacificEducationExpandedCurriculumEvidenceWorkspace = Object.freeze({
        name:"PacificEducationExpandedCurriculumEvidenceWorkspace",
        version:VERSION,
        getActivity:getActivity,
        getDraft:getDraft,
        saveDraft:saveDraft,
        validateInput:validateInput,
        commitEvidence:commitEvidence,
        evaluate:evaluate,
        render:render,
        productionEligible:false,
        prototype:true
    });

    document.addEventListener("DOMContentLoaded",function(){
        render("pacificEducationExpandedCurriculumEvidenceWorkspace");
    });
})(window);
