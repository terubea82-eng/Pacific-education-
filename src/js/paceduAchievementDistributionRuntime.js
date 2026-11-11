/* PacEdu achievement distribution runtime bridge.
 * Loads explicitly imported distribution rows into exact daily activity slots.
 * No indicators are invented. A browser-imported file is reference data only:
 * it cannot grant formal assessment approval or replace server-side authority.
 */
(function (global) {
  "use strict";

  var rows = [];
  var VERSION = "1.0.0";
  var HEADERS = [
    "country","framework_version","class_level","subject_id","term","week","day",
    "term_day","annual_day","indicator_id","indicator_text","strand","sub_strand",
    "learning_objective","source_document_title","issuing_authority","source_version",
    "source_page_or_section","source_url","source_status","educator_review_status",
    "activity_ids","assessment_evidence","accessibility_notes","approved_by","approved_at","review_notes"
  ];

  function splitCsvLine(line) {
    var out = [], value = "", quoted = false;
    for (var i = 0; i < line.length; i += 1) {
      var ch = line.charAt(i);
      if (ch === '"') {
        if (quoted && line.charAt(i + 1) === '"') { value += '"'; i += 1; }
        else quoted = !quoted;
      } else if (ch === "," && !quoted) {
        out.push(value); value = "";
      } else value += ch;
    }
    if (quoted) throw new Error("Distribution CSV contains an unclosed quoted field.");
    out.push(value);
    return out;
  }

  function parseCsv(text) {
    var lines = String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/).filter(function (line) { return line.trim() !== ""; });
    if (!lines.length) throw new Error("The indicator distribution file is empty.");
    var headers = splitCsvLine(lines[0]).map(function (x) { return x.trim(); });
    if (HEADERS.some(function (name, index) { return headers[index] !== name; }) || headers.length !== HEADERS.length) {
      throw new Error("The distribution file does not match the approved Fiji indicator CSV template.");
    }
    return lines.slice(1).map(function (line, index) {
      var values = splitCsvLine(line);
      if (values.length !== headers.length) throw new Error("CSV row " + (index + 2) + " has an unexpected number of columns.");
      var record = {};
      headers.forEach(function (name, i) { record[name] = String(values[i] || "").trim(); });
      return record;
    });
  }

  function key(level, subject, term, week, day) {
    return [level, subject, term, Number(week), Number(day)].join("|").toLowerCase();
  }

  function importDistributionCsv(text) {
    var parsed = parseCsv(text);
    var accepted = [], pending = 0, skipped = 0, errors = [], seen = Object.create(null);
    parsed.forEach(function (r, index) {
      var rowNumber = index + 2;
      if (!r.indicator_id && !r.indicator_text && !r.class_level && !r.subject_id) {
        skipped += 1;
        return;
      }
      var validLevel = r.class_level === "ECE" || /^Class [1-8]$/.test(r.class_level) || /^Form [3-7]$/.test(r.class_level);
      if (r.country !== "Fiji" || !r.framework_version || !validLevel || !r.subject_id ||
          !/^Term [123]$/.test(r.term) || !/^\d+$/.test(r.week) ||
          !/^\d+$/.test(r.day) || Number(r.day) < 1 || Number(r.day) > 5 ||
          !r.indicator_id || !r.indicator_text) {
        errors.push("Row " + rowNumber + ": class, subject, term, week, day, indicator ID and exact indicator text are required.");
        return;
      }
      var maxWeek = r.term === "Term 3" ? 5 : 9;
      if (Number(r.week) < 1 || Number(r.week) > maxWeek) {
        errors.push("Row " + rowNumber + ": week is outside the " + r.term + " distribution.");
        return;
      }
      var slot = key(r.class_level, r.subject_id, r.term, r.week, r.day);
      if (seen[slot]) {
        errors.push("Row " + rowNumber + ": duplicate class/subject/term/week/day assignment; resolve it before import.");
        return;
      }
      seen[slot] = true;
      var verified = r.source_status === "SOURCE_VERIFIED" &&
        r.educator_review_status === "VALIDATED" &&
        !!r.source_document_title && !!r.issuing_authority &&
        !!r.source_version && !!r.source_page_or_section &&
        (r.source_url.indexOf("https://") === 0 || r.source_url.indexOf("http://") === 0) &&
        !!r.approved_by && !!r.approved_at && !isNaN(Date.parse(r.approved_at));
      accepted.push({
        jurisdiction: "Fiji",
        curriculumVersion: r.framework_version,
        level: r.class_level,
        subjectId: r.subject_id,
        term: r.term,
        week: Number(r.week),
        day: Number(r.day),
        indicatorId: r.indicator_id,
        indicatorText: r.indicator_text,
        strand: r.strand,
        subStrand: r.sub_strand,
        learningObjective: r.learning_objective,
        sourceDocumentTitle: r.source_document_title,
        issuingAuthority: r.issuing_authority,
        sourceVersion: r.source_version,
        sourceLocation: r.source_page_or_section,
        sourceUrl: r.source_url,
        sourceStatus: r.source_status || "PENDING_SOURCE_VERIFICATION",
        reviewStatus: r.educator_review_status || "PENDING",
        activityIds: r.activity_ids ? r.activity_ids.split(";").map(function (x) { return x.trim(); }).filter(Boolean) : [],
        assessmentEvidence: r.assessment_evidence ? r.assessment_evidence.split(";").map(function (x) { return x.trim(); }).filter(Boolean) : [],
        accessibilityNotes: r.accessibility_notes,
        approvedBy: r.approved_by,
        approvedAt: r.approved_at,
        reviewNotes: r.review_notes,
        mappingStatus: verified ? "VALIDATED" : "PENDING_TEACHER_REVIEW",
        sourceVerified: verified,
        formalAssessmentEligible: false,
        rowNumber: rowNumber
      });
      if (!verified) pending += 1;
    });
    rows = errors.length ? [] : accepted;
    return { success: errors.length === 0, imported: errors.length ? 0 : accepted.length, pendingReview: errors.length ? 0 : pending, skippedBlankSlots: skipped, errors: errors, prototype: true };
  }

  function getDailyAssignment(filters) {
    filters = filters || {};
    var matches = rows.filter(function (r) {
      return r.level === String(filters.level || "") &&
        r.subjectId === String(filters.subjectId || "") &&
        r.term === String(filters.term || "") &&
        r.week === Number(filters.week) &&
        r.day === Number(filters.day);
    });
    if (matches.length > 1) return { status: "DUPLICATE_ASSIGNMENT", assignment: null };
    if (!matches.length) return { status: "NO_APPROVED_INDICATOR_SLOT", assignment: null };
    return { status: matches[0].mappingStatus, assignment: JSON.parse(JSON.stringify(matches[0])) };
  }

  function linkDailyActivity(activity, filters) {
    var linked = Object.assign({}, activity || {});
    var result = getDailyAssignment(filters || {});
    var assignment = result.assignment;
    linked.indicatorIds = assignment ? [assignment.indicatorId] : [];
    linked.indicatorMappingStatus = result.status;
    linked.indicatorAssignment = assignment;
    linked.assessmentMapping = {
      indicatorIds: linked.indicatorIds.slice(),
      evidenceTypes: assignment ? assignment.assessmentEvidence.slice() : [],
      mappingStatus: result.status,
      formalAssessmentEligible: false,
      serverAuthorizationRequired: true,
      note: "Imported distribution data is a prototype reference. Formal assessment use requires trusted server-side curriculum and teacher authorization."
    };
    return linked;
  }

  function buildAssessmentEvidence(activity, responseRecords) {
    var mapping = activity && activity.assessmentMapping || {};
    return {
      activityId: activity && activity.activityId || null,
      questionSequenceId: activity && activity.questionSequenceId || null,
      indicatorIds: Array.isArray(mapping.indicatorIds) ? mapping.indicatorIds.slice() : [],
      responses: Array.isArray(responseRecords) ? responseRecords.slice() : [],
      mappingStatus: mapping.mappingStatus || "NO_APPROVED_INDICATOR_SLOT",
      formalAssessmentEligible: false,
      requiresTeacherReview: true,
      serverAuthorizationRequired: true,
      prototype: true
    };
  }

  function coverageSummary(filters) {
    filters = filters || {};
    var matching = rows.filter(function (r) {
      return (!filters.level || r.level === filters.level) &&
        (!filters.subjectId || r.subjectId === filters.subjectId) &&
        (!filters.term || r.term === filters.term);
    });
    return {
      assignedSlots: matching.length,
      validatedSlots: matching.filter(function (r) { return r.mappingStatus === "VALIDATED"; }).length,
      pendingReviewSlots: matching.filter(function (r) { return r.mappingStatus !== "VALIDATED"; }).length,
      formalAssessmentEligibleSlots: 0,
      prototype: true
    };
  }

  function reset() { rows = []; }

  global.PacEduAchievementDistributionRuntime = Object.freeze({
    name: "PacEduAchievementDistributionRuntime",
    version: VERSION,
    importDistributionCsv: importDistributionCsv,
    getDailyAssignment: getDailyAssignment,
    linkDailyActivity: linkDailyActivity,
    buildAssessmentEvidence: buildAssessmentEvidence,
    coverageSummary: coverageSummary,
    reset: reset
  });
})(window);
