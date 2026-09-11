(function () {
    "use strict";

    /*
     * =========================================================
     * PACIFIC EDUCATION
     * NATIONAL CALENDAR + SCHOOL-YEAR ALIGNMENT ENGINE
     * Version 2.0.0
     * =========================================================
     *
     * PURPOSE
     * ---------------------------------------------------------
     * This engine separates:
     *
     * 1. Official national education/calendar authority
     * 2. School-specific dates
     * 3. Teacher subject information
     * 4. Curriculum alignment
     * 5. Daily learning preparation
     * 6. Revision and examination planning
     * 7. Secure unknown-source intake
     *
     * IMPORTANT:
     * - A localStorage record is NEVER treated as proof of
     *   Ministry authority.
     * - Public information is not automatically assumed to be
     *   legally reusable.
     * - Unknown information must be verified before becoming
     *   authoritative curriculum data.
     * - Teacher changes affect the teacher/school schedule and
     *   must not silently rewrite the national curriculum.
     * - The national curriculum remains the authoritative source
     *   for listed subjects.
     */

    const STORAGE_KEY =
        "pacificEducationNationalCalendarV2";

    const VERSION_KEY =
        "pacificEducationNationalCalendarVersionV2";

    const AUDIT_KEY =
        "pacificEducationNationalCalendarAuditV2";

    const SOURCE_KEY =
        "pacificEducationNationalCalendarSourcesV2";

    const EVENT_NAME =
        "pacificEducationNationalCalendarUpdated";

    const ENGINE_VERSION = "2.0.0";

    const MAX_YEAR = 2100;
    const MIN_YEAR = 2000;

    const STATUS = Object.freeze({
        UNKNOWN: "unknown",
        DRAFT: "draft",
        VERIFIED: "verified",
        PUBLISHED: "published",
        QUARANTINED: "quarantined"
    });

    const SOURCE_STATUS = Object.freeze({
        UNKNOWN: "unknown",
        PENDING: "pending_verification",
        VERIFIED: "verified",
        REJECTED: "rejected",
        QUARANTINED: "quarantined"
    });

    const DEFAULT_TYPES = Object.freeze([
        "public_holiday",
        "school_holiday",
        "weekend",
        "term_break",
        "revision",
        "assessment",
        "examination",
        "special_school_day",
        "education_event"
    ]);

    function now() {
        return new Date().toISOString();
    }

    function createId(prefix) {
        return (
            String(prefix) +
            "_" +
            Date.now() +
            "_" +
            Math.random().toString(36).slice(2, 10)
        );
    }

    function clone(value) {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch (error) {
            return null;
        }
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getElement(id) {
        return document.getElementById(id);
    }

    function getValue(id) {
        const element = getElement(id);
        return element
            ? String(element.value || "").trim()
            : "";
    }

    function safeNumber(value, fallback) {
        const number = Number(value);
        return Number.isFinite(number)
            ? number
            : fallback;
    }

    function validYear(year) {
        return (
            Number.isInteger(year) &&
            year >= MIN_YEAR &&
            year <= MAX_YEAR
        );
    }

    function validDate(value) {
        if (!value) return false;

        const date = new Date(value);

        return !Number.isNaN(date.getTime());
    }

    function dateKey(date) {
        return date.toISOString().slice(0, 10);
    }

    function parseDate(value) {
        const date = new Date(value + "T00:00:00");
        return Number.isNaN(date.getTime())
            ? null
            : date;
    }

    function dateBeforeOrEqual(first, second) {
        const a = parseDate(first);
        const b = parseDate(second);

        return !!a && !!b && a.getTime() <= b.getTime();
    }

    function dateBefore(first, second) {
        const a = parseDate(first);
        const b = parseDate(second);

        return !!a && !!b && a.getTime() < b.getTime();
    }

    function getStoredCalendar() {
        try {
            const raw =
                localStorage.getItem(STORAGE_KEY);

            if (!raw) return null;

            return JSON.parse(raw);
        } catch (error) {
            console.error(
                "Pacific Education calendar read error:",
                error
            );

            return null;
        }
    }

    function getStoredAudit() {
        try {
            const raw =
                localStorage.getItem(AUDIT_KEY);

            if (!raw) return [];

            const data = JSON.parse(raw);

            return Array.isArray(data)
                ? data
                : [];
        } catch (error) {
            return [];
        }
    }

    function saveAudit(entry) {
        const audit = getStoredAudit();

        audit.push({
            id: createId("calendar-audit"),
            timestamp: now(),
            engineVersion: ENGINE_VERSION,
            ...entry
        });

        try {
            localStorage.setItem(
                AUDIT_KEY,
                JSON.stringify(audit)
            );
        } catch (error) {
            console.error(
                "Calendar audit storage error:",
                error
            );
        }
    }

    function saveSourceRecord(source) {
        try {
            const raw =
                localStorage.getItem(SOURCE_KEY);

            const records =
                raw
                    ? JSON.parse(raw)
                    : [];

            const list =
                Array.isArray(records)
                    ? records
                    : [];

            list.push(source);

            localStorage.setItem(
                SOURCE_KEY,
                JSON.stringify(list)
            );
        } catch (error) {
            console.error(
                "Calendar source storage error:",
                error
            );
        }
    }

    function dispatchCalendarEvent(calendar) {
        try {
            window.dispatchEvent(
                new CustomEvent(
                    EVENT_NAME,
                    {
                        detail: clone(calendar)
                    }
                )
            );
        } catch (error) {
            console.warn(
                "Calendar event could not be dispatched.",
                error
            );
        }
    }

    function getCore() {
        return window.PacificEducationCore || null;
    }

    function coreAuthorized() {
        const core = getCore();

        if (
            !core ||
            !core.identity ||
            typeof core.identity.isAuthorized !==
                "function"
        ) {
            return false;
        }

        try {
            return (
                core.identity.isAuthorized() === true
            );
        } catch (error) {
            return false;
        }
    }

    function requireAuthorization(action) {
        if (coreAuthorized()) {
            return true;
        }

        showMessage(
            "Pacific Education authorization is required before " +
            action +
            ".",
            "error"
        );

        return false;
    }

    function persistCalendar(calendar) {
        if (!calendar) return false;

        /*
         * localStorage is only prototype persistence.
         * It is NOT treated as proof of national authority.
         */

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(calendar)
            );

            localStorage.setItem(
                VERSION_KEY,
                String(calendar.version)
            );

            dispatchCalendarEvent(calendar);

            return true;
        } catch (error) {
            console.error(
                "Calendar persistence error:",
                error
            );

            return false;
        }
    }

    function getNextVersion(existing) {
        const current =
            existing
                ? safeNumber(existing.version, 0)
                : safeNumber(
                    localStorage.getItem(VERSION_KEY),
                    0
                );

        return current + 1;
    }

    /*
     * ---------------------------------------------------------
     * AUTHORITY MODEL
     * ---------------------------------------------------------
     */

    function createAuthorityRecord(input) {
        const data = input || {};

        return {
            authorityId:
                String(data.authorityId || "").trim(),

            authorityName:
                String(data.authorityName || "").trim(),

            country:
                String(data.country || "").trim(),

            jurisdiction:
                String(data.jurisdiction || "").trim(),

            sourceUrl:
                String(data.sourceUrl || "").trim(),

            publicationDate:
                String(data.publicationDate || "").trim(),

            effectiveDate:
                String(data.effectiveDate || "").trim(),

            verificationStatus:
                data.verificationStatus ||
                SOURCE_STATUS.UNKNOWN,

            verifiedBy:
                String(data.verifiedBy || "").trim(),

            verifiedAt:
                data.verifiedAt || null,

            sourceHash:
                String(data.sourceHash || "").trim(),

            notes:
                String(data.notes || "").trim()
        };
    }

    function authorityIsVerified(authority) {
        return !!(
            authority &&
            authority.authorityName &&
            authority.country &&
            authority.jurisdiction &&
            authority.sourceUrl &&
            authority.verificationStatus ===
                SOURCE_STATUS.VERIFIED
        );
    }

    /*
     * A public URL is NOT automatically authoritative.
     * The secure production backend must perform actual
     * authority/legal/source verification.
     */

    function registerUnknownSource(input) {
        const data = input || {};

        const record = {
            id: createId("unknown-source"),

            sourceUrl:
                String(data.sourceUrl || "").trim(),

            country:
                String(data.country || "").trim(),

            jurisdiction:
                String(data.jurisdiction || "").trim(),

            sourceType:
                String(data.sourceType || "unknown")
                    .trim(),

            receivedAt: now(),

            status: SOURCE_STATUS.PENDING,

            quarantineRequired: true,

            securityChecks: {
                fileSafety: "pending",
                malware: "pending",
                virus: "pending",
                documentIntegrity: "pending",
                authority: "pending",
                legalStatus: "pending"
            },

            integrationAllowed: false,

            productionVerificationRequired: true
        };

        saveSourceRecord(record);

        saveAudit({
            action: "unknown_source_quarantined",
            sourceId: record.id,
            status: record.status
        });

        return clone(record);
    }

    function verifySource(input) {
        const data = input || {};

        /*
         * Prototype safety rule:
         * verification must come from an authorised
         * production verification service.
         *
         * This browser module must never pretend that
         * an AI/browser check legally verifies a source.
         */

        if (!data.authorityVerified) {
            return {
                verified: false,
                status: SOURCE_STATUS.QUARANTINED,
                integrationAllowed: false,
                reason:
                    "Authoritative source verification is required."
            };
        }

        if (!data.securityPassed) {
            return {
                verified: false,
                status: SOURCE_STATUS.QUARANTINED,
                integrationAllowed: false,
                reason:
                    "Security verification is required before integration."
            };
        }

        return {
            verified: true,
            status: SOURCE_STATUS.VERIFIED,
            integrationAllowed: true,
            reason: "Source passed supplied verification."
        };
    }

    /*
     * ---------------------------------------------------------
     * CURRICULUM AUTHORITY
     * ---------------------------------------------------------
     */

    function createCurriculumRecord(input) {
        const data = input || {};

        return {
            id: createId("curriculum"),

            country:
                String(data.country || "").trim(),

            jurisdiction:
                String(data.jurisdiction || "").trim(),

            subject:
                String(data.subject || "").trim(),

            classLevel:
                String(data.classLevel || "").trim(),

            version:
                String(data.version || "").trim(),

            publicationDate:
                String(data.publicationDate || "").trim(),

            effectiveDate:
                String(data.effectiveDate || "").trim(),

            sourceUrl:
                String(data.sourceUrl || "").trim(),

            authorityVerified:
                data.authorityVerified === true,

            concepts:
                Array.isArray(data.concepts)
                    ? clone(data.concepts)
                    : [],

            achievementIndicators:
                Array.isArray(
                    data.achievementIndicators
                )
                    ? clone(
                        data.achievementIndicators
                    )
                    : [],

            assessmentRequirements:
                Array.isArray(
                    data.assessmentRequirements
                )
                    ? clone(
                        data.assessmentRequirements
                    )
                    : [],

            revisionRequirements:
                Array.isArray(
                    data.revisionRequirements
                )
                    ? clone(
                        data.revisionRequirements
                    )
                    : []
        };
    }

    function curriculumIsAuthoritative(record) {
        return !!(
            record &&
            record.country &&
            record.jurisdiction &&
            record.subject &&
            record.classLevel &&
            record.sourceUrl &&
            record.authorityVerified === true
        );
    }

    /*
     * ---------------------------------------------------------
     * SUBJECT MODEL
     * ---------------------------------------------------------
     */

    function createSubject(input) {
        const data = input || {};

        const name =
            String(data.name || "").trim();

        return {
            id:
                String(data.id || "") ||
                createId("subject"),

            name: name,

            type:
                data.type === "other"
                    ? "other"
                    : "listed",

            nationalStandardRequired:
                data.type === "other"
                    ? false
                    : true,

            nationalCurriculumVerified:
                data.nationalCurriculumVerified ===
                true,

            classLevel:
                String(data.classLevel || "").trim(),

            teacherId:
                String(data.teacherId || "").trim(),

            revisionDates:
                Array.isArray(data.revisionDates)
                    ? clone(data.revisionDates)
                    : [],

            examinationDates:
                Array.isArray(
                    data.examinationDates
                )
                    ? clone(
                        data.examinationDates
                    )
                    : []
        };
    }

    function validateSubject(subject) {
        if (!subject.name) {
            throw new Error(
                "Every teacher subject must have a subject name."
            );
        }

        if (
            subject.type === "listed" &&
            !subject.nationalCurriculumVerified
        ) {
            throw new Error(
                "A listed national subject requires a verified national standard curriculum."
            );
        }

        return true;
    }

    /*
     * ---------------------------------------------------------
     * TEACHER REQUIREMENTS
     * ---------------------------------------------------------
     */

    function createTeacherRecord(input) {
        const data = input || {};

        const subjects =
            Array.isArray(data.subjects)
                ? data.subjects.map(createSubject)
                : [];

        return {
            id:
                String(data.id || "").trim(),

            name:
                String(data.name || "").trim(),

            schoolId:
                String(data.schoolId || "").trim(),

            country:
                String(data.country || "").trim(),

            jurisdiction:
                String(data.jurisdiction || "").trim(),

            schoolStartDate:
                String(data.schoolStartDate || "").trim(),

            schoolEndDate:
                String(data.schoolEndDate || "").trim(),

            subjects: subjects,

            mandatoryAnnualPlanning: {
                revisionDatesRequired: true,
                examinationDatesRequired: true,
                otherSubjectSpaceRequired: true,
                schoolStartDateRequired: true
            }
        };
    }

    function validateTeacherRecord(teacher) {
        if (!teacher.name) {
            throw new Error(
                "Teacher name is required."
            );
        }

        if (!teacher.schoolStartDate) {
            throw new Error(
                "Every teacher must enter the school starting/resumption date."
            );
        }

        if (
            !Array.isArray(teacher.subjects) ||
            teacher.subjects.length === 0
        ) {
            throw new Error(
                "Every teacher must enter at least one subject."
            );
        }

        teacher.subjects.forEach(validateSubject);

        teacher.subjects.forEach(function (subject) {
            if (
                !Array.isArray(
                    subject.revisionDates
                )
            ) {
                throw new Error(
                    "Revision dates are required for every subject."
                );
            }

            if (
                !Array.isArray(
                    subject.examinationDates
                )
            ) {
                throw new Error(
                    "Examination dates are required for every subject."
                );
            }
        });

        return true;
    }

    /*
     * ---------------------------------------------------------
     * SCHOOL YEAR / CALENDAR
     * ---------------------------------------------------------
     */

    function collectTermsFromForm() {
        const totalTerms =
            safeNumber(
                getValue("totalTerms"),
                3
            );

        const terms = [];

        for (
            let number = 1;
            number <= totalTerms;
            number++
        ) {
            const start =
                getValue(
                    `term${number}Start`
                );

            const end =
                getValue(
                    `term${number}End`
                );

            if (!validDate(start) ||
                !validDate(end)) {
                throw new Error(
                    `Term ${number} requires valid start and end dates.`
                );
            }

            if (!dateBeforeOrEqual(start, end)) {
                throw new Error(
                    `Term ${number} start date must be before or equal to its end date.`
                );
            }

            terms.push({
                id:
                    `term-${number}`,

                number:
                    number,

                startDate:
                    start,

                endDate:
                    end
            });
        }

        for (
            let i = 1;
            i < terms.length;
            i++
        ) {
            if (
                !dateBefore(
                    terms[i - 1].endDate,
                    terms[i].startDate
                )
            ) {
                throw new Error(
                    `Term ${terms[i].number} overlaps or touches the previous term.`
                );
            }
        }

        return terms;
    }

    function collectSpecialDatesFromForm() {
        const rows =
            document.querySelectorAll(
                ".calendar-special-date"
            );

        const dates = [];

        rows.forEach(function (row) {
            const date =
                row.querySelector(
                    ".special-date"
                )?.value || "";

            const name =
                row.querySelector(
                    ".special-name"
                )?.value.trim() || "";

            const type =
                row.querySelector(
                    ".special-type"
                )?.value || "event";

            if (!date && !name) {
                return;
            }

            if (!validDate(date) || !name) {
                throw new Error(
                    "Every holiday/special date requires a valid date and name."
                );
            }

            dates.push({
                id:
                    row.dataset.id ||
                    createId("special"),

                date: date,

                name: name,

                type: type
            });
        });

        return dates;
    }

    function createCalendarFromForm(status) {
        const existing =
            getStoredCalendar();

        const year =
            safeNumber(
                getValue("calendarYear"),
                0
            );

        if (!validYear(year)) {
            throw new Error(
                "A valid school year is required."
            );
        }

        const country =
            getValue("calendarCountry");

        if (!country) {
            throw new Error(
                "Country is required."
            );
        }

        const jurisdiction =
            getValue(
                "calendarJurisdiction"
            );

        if (!jurisdiction) {
            throw new Error(
                "Education jurisdiction is required."
            );
        }

        const announcementDate =
            getValue(
                "ministryAnnouncementDate"
            );

        if (!validDate(announcementDate)) {
            throw new Error(
                "Official Ministry announcement date is required."
            );
        }

        const terms =
            collectTermsFromForm();

        const specialDates =
            collectSpecialDatesFromForm();

        const calendar = {
            schemaVersion: "2.0",

            engineVersion:
                ENGINE_VERSION,

            id:
                existing?.id ||
                createId(
                    "national-calendar"
                ),

            version:
                getNextVersion(
                    existing
                ),

            status:
                status || STATUS.DRAFT,

            country:
                country,

            jurisdiction:
                jurisdiction,

            schoolYear:
                year,

            ministryAnnouncementDate:
                announcementDate,

            officialAuthority: {
                authorityName:
                    getValue(
                        "authorityName"
                    ),

                sourceUrl:
                    getValue(
                        "authoritySourceUrl"
                    ),

                sourceId:
                    getValue(
                        "authoritySourceId"
                    ),

                verificationStatus:
                    SOURCE_STATUS.UNKNOWN,

                verifiedAt:
                    null
            },

            nationalCalendar: {
                terms:
                    terms,

                officialStartDate:
                    terms.length
                        ? terms[0].startDate
                        : null,

                officialEndDate:
                    terms.length
                        ? terms[
                            terms.length - 1
                        ].endDate
                        : null
            },

            schoolSpecificDates: [],

            publicHolidays:
                specialDates.filter(
                    item =>
                        item.type ===
                        "public_holiday"
                ),

            schoolHolidays:
                specialDates.filter(
                    item =>
                        item.type ===
                        "school_holiday"
                ),

            specialDates:
                specialDates,

            mandatoryPlanning: {
                revisionRequired: true,
                examinationPlanningRequired: true,
                otherSubjectSpaceRequired: true,
                weekendPlanningRequired: true,
                publicHolidayPlanningRequired: true,
                annualDailyActivityPreparationRequired:
                    true
            },

            curriculumAlignment: {
                status: "pending",
                nationalStandardRequired:
                    true,

                subjects: [],

                achievementIndicatorCoverage:
                    "pending",

                lastAlignmentCheck:
                    null
            },

            annualLearningProgramme: {
                status: "pending",
                preparedForYear:
                    year,

                dailyActivities:
                    [],

                weekendActivities:
                    [],

                publicHolidayActivities:
                    [],

                revisionWindows:
                    [],

                examinationWindows:
                    []
            },

            teacherRequirements: {
                everyTeacherMustEnterStartDate:
                    true,

                everyTeacherMustEnterSubjects:
                    true,

                otherSubjectFieldAlwaysAvailable:
                    true,

                revisionDatesRequired:
                    true,

                examinationDatesRequired:
                    true
            },

            teacherLessonChanges: {
                enabled: true,

                achievementIndicatorCheckRequired:
                    true,

                failedAlignmentMustAdviseTeacher:
                    true,

                originalAnnualActivityMustRemain:
                    true
            },

            secureSourceIntake: {
                enabled: true,

                singleControlledEntry:
                    true,

                unknownSourcesQuarantined:
                    true,

                authorityVerificationRequired:
                    true,

                malwareScanRequired:
                    true,

                virusScanRequired:
                    true,

                documentIntegrityCheckRequired:
                    true,

                legalReviewRequiredWhenApplicable:
                    true,

                reintegrationRequiresFreshVerification:
                    true
            },

            source: {
                type:
                    "official-calendar",

                verified:
                    false,

                verificationRequired:
                    true
            },

            audit: {
                createdAt:
                    existing?.audit?.createdAt ||
                    now(),

                updatedAt:
                    now(),

                publishedAt:
                    status === STATUS.PUBLISHED
                        ? now()
                        : existing?.audit
                            ?.publishedAt ||
                          null
            }
        };

        return calendar;
    }

    function validateCalendar(calendar) {
        if (!calendar) {
            throw new Error(
                "Calendar data is missing."
            );
        }

        if (!calendar.country) {
            throw new Error(
                "Country is required."
            );
        }

        if (!calendar.jurisdiction) {
            throw new Error(
                "Education jurisdiction is required."
            );
        }

        if (!validYear(calendar.schoolYear)) {
            throw new Error(
                "School year is invalid."
            );
        }

        if (
            !Array.isArray(
                calendar.nationalCalendar.terms
            ) ||
            calendar.nationalCalendar.terms.length ===
                0
        ) {
            throw new Error(
                "At least one official school term is required."
            );
        }

        calendar.nationalCalendar.terms.forEach(
            function (term, index) {
                if (
                    !validDate(
                        term.startDate
                    ) ||
                    !validDate(
                        term.endDate
                    )
                ) {
                    throw new Error(
                        `Term ${index + 1} has an invalid date.`
                    );
                }

                if (
                    !dateBeforeOrEqual(
                        term.startDate,
                        term.endDate
                    )
                ) {
                    throw new Error(
                        `Term ${index + 1} has an invalid date range.`
                    );
                }

                if (
                    index > 0 &&
                    !dateBefore(
                        calendar
                            .nationalCalendar
                            .terms[index - 1]
                            .endDate,
                        term.startDate
                    )
                ) {
                    throw new Error(
                        `Term ${term.number} overlaps the previous term.`
                    );
                }
            }
        );

        return true;
    }

    /*
     * ---------------------------------------------------------
     * TEACHING-DAY ENGINE
     * ---------------------------------------------------------
     */

    function isWeekend(date) {
        const day =
            date.getDay();

        return (
            day === 0 ||
            day === 6
        );
    }

    function mapSpecialDates(calendar) {
        const map = {};

        (
            calendar.specialDates || []
        ).forEach(function (item) {
            map[item.date] = item;
        });

        return map;
    }

    function generateYearDates(
        startDate,
        endDate
    ) {
        const start =
            parseDate(startDate);

        const end =
            parseDate(endDate);

        if (!start || !end) {
            return [];
        }

        const dates = [];

        const cursor =
            new Date(start.getTime());

        while (
            cursor.getTime() <=
            end.getTime()
        ) {
            dates.push(
                dateKey(cursor)
            );

            cursor.setDate(
                cursor.getDate() + 1
            );
        }

        return dates;
    }

    function prepareCalendarDayMap(
        calendar
    ) {
        const terms =
            calendar.nationalCalendar
                .terms;

        const first =
            terms[0].startDate;

        const last =
            terms[
                terms.length - 1
            ].endDate;

        const dates =
            generateYearDates(
                first,
                last
            );

        const special =
            mapSpecialDates(
                calendar
            );

        return dates.map(
            function (date) {
                const parsed =
                    parseDate(date);

                const holiday =
                    special[date] || null;

                return {
                    date: date,

                    weekend:
                        isWeekend(
                            parsed
                        ),

                    publicHoliday:
                        !!holiday &&
                        holiday.type ===
                            "public_holiday",

                    schoolHoliday:
                        !!holiday &&
                        holiday.type ===
                            "school_holiday",

                    specialEvent:
                        holiday,

                    teachingDay:
                        !isWeekend(
                            parsed
                        ) &&
                        !(
                            holiday &&
                            (
                                holiday.type ===
                                    "public_holiday" ||
                                holiday.type ===
                                    "school_holiday"
                            )
                        )
                };
            }
        );
    }

    function prepareAnnualProgramme(
        calendar
    ) {
        const days =
            prepareCalendarDayMap(
                calendar
            );

        calendar.annualLearningProgramme =
            calendar.annualLearningProgramme ||
            {};

        calendar.annualLearningProgramme
            .dailyActivities =
            days
                .filter(
                    day =>
                        day.teachingDay
                )
                .map(
                    function (day) {
                        return {
                            date:
                                day.date,

                            activityStatus:
                                "pending_curriculum_alignment",

                            curriculumAuthorityRequired:
                                true,

                            achievementIndicatorRequired:
                                true,

                            realWorldApplicationRequired:
                                true
                        };
                    }
                );

        calendar.annualLearningProgramme
            .weekendActivities =
            days
                .filter(
                    day =>
                        day.weekend
                )
                .map(
                    function (day) {
                        return {
                            date:
                                day.date,

                            activityStatus:
                                "pending",

                            countsAsOfficialTeachingDay:
                                false,

                            realWorldApplication:
                                true
                        };
                    }
                );

        calendar.annualLearningProgramme
            .publicHolidayActivities =
            days
                .filter(
                    day =>
                        day.publicHoliday
                )
                .map(
                    function (day) {
                        return {
                            date:
                                day.date,

                            activityStatus:
                                "pending",

                            countsAsOfficialTeachingDay:
                                false,

                            realWorldApplication:
                                true
                        };
                    }
                );

        return calendar;
    }

    /*
     * ---------------------------------------------------------
     * TEACHER LESSON CHANGE CHECK
     * ---------------------------------------------------------
     */

    function checkRequestedLessonAlignment(
        request
    ) {
        const data =
            request || {};

        const indicators =
            Array.isArray(
                data.requiredAchievementIndicators
            )
                ? data.requiredAchievementIndicators
                : [];

        const evidence =
            Array.isArray(
                data.activityEvidence
            )
                ? data.activityEvidence
                : [];

        if (
            indicators.length === 0
        ) {
            return {
                aligned: false,

                status:
                    "unknown",

                message:
                    "Pacific Education cannot verify the requested lesson because the required achievement indicators are unknown."
            };
        }

        if (
            evidence.length === 0
        ) {
            return {
                aligned: false,

                status:
                    "insufficient_evidence",

                message:
                    "Pacific Education cannot yet confirm that the requested lesson will achieve today's required indicators. Please provide or select an activity with clear indicator coverage."
            };
        }

        const matched =
            indicators.filter(
                function (indicator) {
                    return evidence.some(
                        function (item) {
                            return (
                                item.indicatorId ===
                                indicator.id
                            );
                        }
                    );
                }
            );

        const complete =
            matched.length ===
            indicators.length;

        if (!complete) {
            return {
                aligned: false,

                status:
                    "not_aligned",

                message:
                    "The requested lesson does not fully achieve today's required achievement indicators. Pacific Education recommends keeping the standard activity or selecting an alternative that covers the missing indicators.",

                missingIndicators:
                    indicators
                        .filter(
                            indicator =>
                                !matched.includes(
                                    indicator
                                )
                        )
            };
        }

        return {
            aligned: true,

            status:
                "aligned",

            message:
                "The requested lesson covers the required daily achievement indicators."
        };
    }

    /*
     * ---------------------------------------------------------
     * REVISION / EXAMINATION
     * ---------------------------------------------------------
     */

    function addRevisionWindow(
        calendar,
        subject,
        startDate,
        endDate
    ) {
        if (
            !subject ||
            !startDate ||
            !endDate
        ) {
            throw new Error(
                "Revision requires a subject and valid dates."
            );
        }

        if (
            !dateBeforeOrEqual(
                startDate,
                endDate
            )
        ) {
            throw new Error(
                "Revision start date must be before or equal to the end date."
            );
        }

        calendar.annualLearningProgramme
            .revisionWindows.push({
                id:
                    createId("revision"),

                subjectId:
                    subject.id,

                subject:
                    subject.name,

                startDate:
                    startDate,

                endDate:
                    endDate,

                mandatory:
                    true
            });

        return true;
    }

    function addExaminationWindow(
        calendar,
        subject,
        date
    ) {
        if (
            !subject ||
            !date
        ) {
            throw new Error(
                "Examination requires a subject and valid date."
            );
        }

        if (!validDate(date)) {
            throw new Error(
                "Examination date is invalid."
            );
        }

        calendar.annualLearningProgramme
            .examinationWindows.push({
                id:
                    createId("exam"),

                subjectId:
                    subject.id,

                subject:
                    subject.name,

                date:
                    date,

                mandatory:
                    true
            });

        return true;
    }

    /*
     * ---------------------------------------------------------
     * SCHOOL / TEACHER REALIGNMENT
     * ---------------------------------------------------------
     */

    function realignSchoolCalendar(
        calendar,
        schoolData
    ) {
        const data =
            schoolData || {};

        const start =
            String(
                data.startDate || ""
            ).trim();

        const end =
            String(
                data.endDate || ""
            ).trim();

        if (!validDate(start)) {
            throw new Error(
                "The school-specific start date is required."
            );
        }

        if (
            end &&
            !validDate(end)
        ) {
            throw new Error(
                "The school-specific end date is invalid."
            );
        }

        if (
            end &&
            !dateBeforeOrEqual(
                start,
                end
            )
        ) {
            throw new Error(
                "The school-specific start date must be before the end date."
            );
        }

        const record = {
            id:
                createId("school-calendar"),

            schoolId:
                String(
                    data.schoolId || ""
                ).trim(),

            schoolName:
                String(
                    data.schoolName || ""
                ).trim(),

            startDate:
                start,

            endDate:
                end || null,

            enteredBy:
                String(
                    data.teacherId || ""
                ).trim(),

            enteredAt:
                now(),

            nationalCalendarVersion:
                calendar.version,

            doesNotReplaceNationalAuthority:
                true
        };

        calendar.schoolSpecificDates.push(
            record
        );

        saveAudit({
            action:
                "school_calendar_realigned",

            schoolId:
                record.schoolId,

            nationalCalendarVersion:
                calendar.version
        });

        return record;
    }

    /*
     * ---------------------------------------------------------
     * UI
     * ---------------------------------------------------------
     */

    function showMessage(
        message,
        type
    ) {
        const container =
            getElement(
                "calendarMessage"
            );

        if (!container) return;

        container.textContent =
            message;

        container.dataset.type =
            type || "info";
    }

    function renderTermEditor() {
        const container =
            getElement(
                "termEditor"
            );

        if (!container) return;

        const total =
            safeNumber(
                getValue("totalTerms"),
                3
            );

        let html =
            "<h3>📚 Official Term Dates</h3>";

        for (
            let number = 1;
            number <= total;
            number++
        ) {
            html += `
                <fieldset class="calendar-term">
                    <legend>Term ${number}</legend>

                    <label>
                        Term ${number} Start
                        <input
                            type="date"
                            id="term${number}Start"
                        >
                    </label>

                    <label>
                        Term ${number} End
                        <input
                            type="date"
                            id="term${number}End"
                        >
                    </label>
                </fieldset>
            `;
        }

        container.innerHTML =
            html;
    }

    function renderSpecialDates() {
        const container =
            getElement(
                "specialDates"
            );

        if (!container) return;

        container.innerHTML = `
            <h3>🗓 Public Holidays & Special Dates</h3>

            <div id="specialDateRows"></div>

            <button
                type="button"
                id="addSpecialDate"
            >
                ➕ Add Holiday / Special Date
            </button>
        `;

        getElement(
            "addSpecialDate"
        )?.addEventListener(
            "click",
            addSpecialDateRow
        );
    }

    function addSpecialDateRow() {
        const container =
            getElement(
                "specialDateRows"
            );

        if (!container) return;

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "calendar-special-date";

        row.dataset.id =
            createId("special");

        row.innerHTML = `
            <label>
                Date
                <input
                    type="date"
                    class="special-date"
                >
            </label>

            <label>
                Name
                <input
                    type="text"
                    class="special-name"
                    placeholder="Example: National Holiday"
                >
            </label>

            <label>
                Type
                <select class="special-type">
                    <option value="public_holiday">
                        Public Holiday
                    </option>

                    <option value="school_holiday">
                        School Holiday
                    </option>

                    <option value="special_school_day">
                        Special School Day
                    </option>

                    <option value="education_event">
                        Education Event
                    </option>
                </select>
            </label>

            <button
                type="button"
                class="remove-special-date"
            >
                Remove
            </button>
        `;

        row.querySelector(
            ".remove-special-date"
        )?.addEventListener(
            "click",
            function () {
                row.remove();
            }
        );

        container.appendChild(
            row
        );
    }

    function previewCalendar(
        calendar
    ) {
        const container =
            getElement(
                "calendarPreview"
            );

        if (!container) return;

        const terms =
            calendar
                .nationalCalendar
                .terms
                .map(
                    function (term) {
                        return `
                            <li>
                                Term ${escapeHtml(
                                    term.number
                                )}:
                                ${escapeHtml(
                                    term.startDate
                                )}
                                →
                                ${escapeHtml(
                                    term.endDate
                                )}
                            </li>
                        `;
                    }
                )
                .join("");

        const dates =
            calendar.specialDates.length
                ? calendar.specialDates
                    .map(
                        function (item) {
                            return `
                                <li>
                                    ${escapeHtml(
                                        item.date
                                    )}
                                    —
                                    ${escapeHtml(
                                        item.name
                                    )}
                                    (${escapeHtml(
                                        item.type
                                    )})
                                </li>
                            `;
                        }
                    )
                    .join("")
                : "<li>No special dates entered.</li>";

        container.innerHTML = `
            <section class="calendar-preview">
                <h3>👁 National Calendar Preview</h3>

                <p>
                    <strong>Country:</strong>
                    ${escapeHtml(
                        calendar.country
                    )}
                </p>

                <p>
                    <strong>Jurisdiction:</strong>
                    ${escapeHtml(
                        calendar.jurisdiction
                    )}
                </p>

                <p>
                    <strong>School Year:</strong>
                    ${escapeHtml(
                        calendar.schoolYear
                    )}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${escapeHtml(
                        calendar.status
                    )}
                </p>

                <p>
                    <strong>Version:</strong>
                    ${escapeHtml(
                        calendar.version
                    )}
                </p>

                <h4>Official Terms</h4>

                <ul>
                    ${terms}
                </ul>

                <h4>Public Holidays & Special Dates</h4>

                <ul>
                    ${dates}
                </ul>

                <p>
                    <strong>Curriculum alignment:</strong>
                    ${escapeHtml(
                        calendar
                            .curriculumAlignment
                            .status
                    )}
                </p>

                <p>
                    <strong>Annual programme:</strong>
                    ${escapeHtml(
                        calendar
                            .annualLearningProgramme
                            .status
                    )}
                </p>
            </section>
        `;
    }

    function saveDraft() {
        if (
            !requireAuthorization(
                "saving a national calendar draft"
            )
        ) {
            return;
        }

        try {
            const calendar =
                createCalendarFromForm(
                    STATUS.DRAFT
                );

            prepareAnnualProgramme(
                calendar
            );

            calendar.annualLearningProgramme
                .status =
                "prepared_pending_curriculum_alignment";

            persistCalendar(
                calendar
            );

            saveAudit({
                action:
                    "calendar_draft_saved",

                calendarId:
                    calendar.id,

                version:
                    calendar.version
            });

            previewCalendar(
                calendar
            );

            showMessage(
                "National calendar draft saved. Curriculum alignment and authority verification are still required before publication.",
                "success"
            );
        } catch (error) {
            showMessage(
                error.message,
                "error"
            );
        }
    }

    function publishCalendar() {
        if (
            !requireAuthorization(
                "publishing a national calendar"
            )
        ) {
            return;
        }

        try {
            const calendar =
                createCalendarFromForm(
                    STATUS.PUBLISHED
                );

            /*
             * SECURITY:
             * Browser-side Publish NEVER proves Ministry
             * authority. Production publishing must receive
             * verified authority from the secure backend.
             */

            if (
                !calendar
                    .officialAuthority
                    .sourceUrl
            ) {
                throw new Error(
                    "An official authority source is required before publication."
                );
            }

            if (
                calendar
                    .officialAuthority
                    .verificationStatus !==
                SOURCE_STATUS.VERIFIED
            ) {
                calendar.status =
                    STATUS.VERIFIED;

                calendar.source.verified =
                    false;

                prepareAnnualProgramme(
                    calendar
                );

                persistCalendar(
                    calendar
                );

                saveAudit({
                    action:
                        "calendar_held_for_authority_verification",

                    calendarId:
                        calendar.id,

                    version:
                        calendar.version
                });

                previewCalendar(
                    calendar
                );

                showMessage(
                    "Calendar prepared but NOT published: official national authority verification is still required.",
                    "warning"
                );

                return;
            }

            calendar.source.verified =
                true;

            prepareAnnualProgramme(
                calendar
            );

            calendar.annualLearningProgramme
                .status =
                "prepared_pending_curriculum_alignment";

            persistCalendar(
                calendar
            );

            saveAudit({
                action:
                    "calendar_published",

                calendarId:
                    calendar.id,

                version:
                    calendar.version
            });

            previewCalendar(
                calendar
            );

            showMessage(
                "Verified national calendar published successfully.",
                "success"
            );
        } catch (error) {
            showMessage(
                error.message,
                "error"
            );
        }
    }

    function clearCalendar() {
        if (
            !requireAuthorization(
                "clearing calendar data"
            )
        ) {
            return;
        }

        /*
         * Never silently delete the audit trail.
         * Only the current prototype calendar is removed.
         */

        localStorage.removeItem(
            STORAGE_KEY
        );

        localStorage.removeItem(
            VERSION_KEY
        );

        saveAudit({
            action:
                "current_calendar_cleared"
        });

        window.location.reload();
    }

    function loadCalendar() {
        const calendar =
            getStoredCalendar();

        if (!calendar) {
            return;
        }

        const country =
            getElement(
                "calendarCountry"
            );

        const jurisdiction =
            getElement(
                "calendarJurisdiction"
            );

        const year =
            getElement(
                "calendarYear"
            );

        const announcement =
            getElement(
                "ministryAnnouncementDate"
            );

        const terms =
            getElement(
                "totalTerms"
            );

        const authorityName =
            getElement(
                "authorityName"
            );

        const authorityUrl =
            getElement(
                "authoritySourceUrl"
            );

        const authorityId =
            getElement(
                "authoritySourceId"
            );

        if (country) {
            country.value =
                calendar.country || "";
        }

        if (jurisdiction) {
            jurisdiction.value =
                calendar.jurisdiction || "";
        }

        if (year) {
            year.value =
                calendar.schoolYear || "";
        }

        if (announcement) {
            announcement.value =
                calendar.ministryAnnouncementDate ||
                "";
        }

        if (terms) {
            terms.value =
                calendar
                    .nationalCalendar
                    ?.terms
                    ?.length || 3;
        }

        if (authorityName) {
            authorityName.value =
                calendar
                    .officialAuthority
                    ?.authorityName ||
                "";
        }

        if (authorityUrl) {
            authorityUrl.value =
                calendar
                    .officialAuthority
                    ?.sourceUrl ||
                "";
        }

        if (authorityId) {
            authorityId.value =
                calendar
                    .officialAuthority
                    ?.sourceId ||
                "";
        }

        renderTermEditor();

        (
            calendar
                .nationalCalendar
                ?.terms || []
        ).forEach(
            function (term) {
                const start =
                    getElement(
                        `term${term.number}Start`
                    );

                const end =
                    getElement(
                        `term${term.number}End`
                    );

                if (start) {
                    start.value =
                        term.startDate;
                }

                if (end) {
                    end.value =
                        term.endDate;
                }
            }
        );

        renderSpecialDates();

        (
            calendar.specialDates || []
        ).forEach(
            function (item) {
                addSpecialDateRow();

                const rows =
                    document.querySelectorAll(
                        ".calendar-special-date"
                    );

                const row =
                    rows[
                        rows.length - 1
                    ];

                if (!row) return;

                const date =
                    row.querySelector(
                        ".special-date"
                    );

                const name =
                    row.querySelector(
                        ".special-name"
                    );

                const type =
                    row.querySelector(
                        ".special-type"
                    );

                if (date) {
                    date.value =
                        item.date;
                }

                if (name) {
                    name.value =
                        item.name;
                }

                if (type) {
                    type.value =
                        item.type;
                }
            }
        );

        previewCalendar(
            calendar
        );
    }

    /*
     * ---------------------------------------------------------
     * PUBLIC API
     * ---------------------------------------------------------
     */

    window.PacificEducationNationalCalendarSetup = {

        version:
            ENGINE_VERSION,

        STATUS:
            STATUS,

        SOURCE_STATUS:
            SOURCE_STATUS,

        start:
            function (container) {
                if (!container) {
                    return;
                }

                container.innerHTML = `
                    <section
                        class="activity"
                        id="nationalCalendarEngine"
                    >

                        <h2>
                            🌏 National School-Year Alignment
                        </h2>

                        <p>
                            Pacific Education uses verified
                            national education calendars and
                            authorised curriculum information
                            to prepare the annual learning
                            structure.
                        </p>

                        <div
                            id="calendarMessage"
                            role="status"
                            aria-live="polite"
                        ></div>

                        <h3>
                            🏛 Official Education Authority
                        </h3>

                        <label>
                            Country
                            <input
                                id="calendarCountry"
                                type="text"
                                placeholder="Example: Fiji"
                            >
                        </label>

                        <label>
                            Education Jurisdiction
                            <input
                                id="calendarJurisdiction"
                                type="text"
                                placeholder="Example: Ministry of Education"
                            >
                        </label>

                        <label>
                            Authority Name
                            <input
                                id="authorityName"
                                type="text"
                                placeholder="Official Ministry / Authority"
                            >
                        </label>

                        <label>
                            Official Source URL
                            <input
                                id="authoritySourceUrl"
                                type="url"
                                placeholder="Official public source"
                            >
                        </label>

                        <label>
                            External Authority / Document ID
                            <input
                                id="authoritySourceId"
                                type="text"
                                placeholder="Optional official reference"
                            >
                        </label>

                        <label>
                            School Year
                            <input
                                id="calendarYear"
                                type="number"
                                min="${MIN_YEAR}"
                                max="${MAX_YEAR}"
                                placeholder="Example: 2027"
                            >
                        </label>

                        <label>
                            Official Ministry Announcement Date
                            <input
                                id="ministryAnnouncementDate"
                                type="date"
                            >
                        </label>

                        <h3>
                            📚 Official National Terms
                        </h3>

                        <label>
                            Number of Terms
                            <select id="totalTerms">
                                <option value="3">
                                    3 Terms
                                </option>

                                <option value="4">
                                    4 Terms
                                </option>
                            </select>
                        </label>

                        <div
                            id="termEditor"
                        ></div>

                        <div
                            id="specialDates"
                        ></div>

                        <h3>
                            👩‍🏫 Mandatory Teacher Planning
                        </h3>

                        <p>
                            Every teacher must enter their
                            school starting/resumption date,
                            every subject taught, revision
                            dates and examination dates.
                            An Other Subject field must remain
                            available when a subject is not
                            listed.
                        </p>

                        <h3>
                            📅 Annual Learning Preparation
                        </h3>

                        <p>
                            Pacific Education prepares the
                            annual daily-learning structure
                            from the verified national
                            curriculum and calendar, including
                            appropriate weekend, public-holiday,
                            revision and examination planning.
                        </p>

                        <h3>
                            🔐 Unknown Source Protection
                        </h3>

                        <p>
                            Unknown curriculum or legal sources
                            remain quarantined until authority,
                            document integrity and security
                            verification are completed.
                        </p>

                        <div
                            id="calendarPreview"
                            aria-live="polite"
                        ></div>

                        <div
                            class="calendar-actions"
                        >

                            <button
                                type="button"
                                id="saveCalendarDraft"
                            >
                                💾 Save Draft
                            </button>

                            <button
                                type="button"
                                id="previewCalendar"
                            >
                                👁 Preview
                            </button>

                            <button
                                type="button"
                                id="publishCalendar"
                            >
                                🔐 Verify / Publish
                            </button>

                            <button
                                type="button"
                                id="clearCalendar"
                            >
                                🗑 Clear Current Calendar
                            </button>

                        </div>

                    </section>
                `;

                renderTermEditor();

                renderSpecialDates();

                getElement(
                    "totalTerms"
                )?.addEventListener(
                    "change",
                    renderTermEditor
                );

                getElement(
                    "saveCalendarDraft"
                )?.addEventListener(
                    "click",
                    saveDraft
                );

                getElement(
                    "previewCalendar"
                )?.addEventListener(
                    "click",
                    function () {
                        try {
                            const calendar =
                                createCalendarFromForm(
                                    STATUS.DRAFT
                                );

                            prepareAnnualProgramme(
                                calendar
                            );

                            previewCalendar(
                                calendar
                            );

                            showMessage(
                                "Calendar preview prepared. It has not been published.",
                                "info"
                            );
                        } catch (error) {
                            showMessage(
                                error.message,
                                "error"
                            );
                        }
                    }
                );

                getElement(
                    "publishCalendar"
                )?.addEventListener(
                    "click",
                    publishCalendar
                );

                getElement(
                    "clearCalendar"
                )?.addEventListener(
                    "click",
                    clearCalendar
                );

                loadCalendar();
            },

        getCalendar:
            function () {
                return clone(
                    getStoredCalendar()
                );
            },

        getStatus:
            function () {
                const calendar =
                    getStoredCalendar();

                return {
                    engineVersion:
                        ENGINE_VERSION,

                    calendarExists:
                        !!calendar,

                    calendarStatus:
                        calendar?.status ||
                        STATUS.UNKNOWN,

                    calendarVersion:
                        calendar?.version ||
                        null,

                    country:
                        calendar?.country ||
                        null,

                    jurisdiction:
                        calendar?.jurisdiction ||
                        null,

                    schoolYear:
                        calendar?.schoolYear ||
                        null,

                    authorityVerified:
                        calendar
                            ?.officialAuthority
                            ?.verificationStatus ===
                        SOURCE_STATUS.VERIFIED,

                    curriculumAlignment:
                        calendar
                            ?.curriculumAlignment
                            ?.status ||
                        "unknown",

                    annualProgramme:
                        calendar
                            ?.annualLearningProgramme
                            ?.status ||
                        "unknown",

                    mandatoryRequirements: {
                        teacherStartDate:
                            true,

                        teacherSubjects:
                            true,

                        otherSubjectSpace:
                            true,

                        revisionDates:
                            true,

                        examinationDates:
                            true,

                        weekendPreparation:
                            true,

                        publicHolidayPreparation:
                            true,

                        achievementIndicatorCheck:
                            true,

                        unknownSourceQuarantine:
                            true
                    }
                };
            },

        checkLessonChange:
            function (request) {
                return checkRequestedLessonAlignment(
                    request
                );
            },

        registerUnknownSource:
            function (input) {
                return registerUnknownSource(
                    input
                );
            },

        verifySource:
            function (input) {
                return verifySource(
                    input
                );
            },

        createCurriculumRecord:
            function (input) {
                return createCurriculumRecord(
                    input
                );
            },

        curriculumIsAuthoritative:
            function (record) {
                return curriculumIsAuthoritative(
                    record
                );
            },

        createTeacherRecord:
            function (input) {
                return createTeacherRecord(
                    input
                );
            },

        validateTeacherRecord:
            function (teacher) {
                return validateTeacherRecord(
                    teacher
                );
            },

        realignSchoolCalendar:
            function (
                schoolData
            ) {
                const calendar =
                    getStoredCalendar();

                if (!calendar) {
                    throw new Error(
                        "No national calendar is available."
                    );
                }

                if (
                    !requireAuthorization(
                        "realigning a school calendar"
                    )
                ) {
                    return null;
                }

                const result =
                    realignSchoolCalendar(
                        calendar,
                        schoolData
                    );

                calendar.audit.updatedAt =
                    now();

                persistCalendar(
                    calendar
                );

                return clone(
                    result
                );
            },

        prepareAnnualProgramme:
            function () {
                const calendar =
                    getStoredCalendar();

                if (!calendar) {
                    throw new Error(
                        "No national calendar is available."
                    );
                }

                const prepared =
                    prepareAnnualProgramme(
                        calendar
                    );

                prepared.audit.updatedAt =
                    now();

                persistCalendar(
                    prepared
                );

                return clone(
                    prepared
                );
            },

        addRevisionWindow:
            function (
                subject,
                startDate,
                endDate
            ) {
                const calendar =
                    getStoredCalendar();

                if (!calendar) {
                    throw new Error(
                        "No national calendar is available."
                    );
                }

                if (
                    !requireAuthorization(
                        "adding revision planning"
                    )
                ) {
                    return false;
                }

                const result =
                    addRevisionWindow(
                        calendar,
                        subject,
                        startDate,
                        endDate
                    );

                persistCalendar(
                    calendar
                );

                return result;
            },

        addExaminationWindow:
            function (
                subject,
                date
            ) {
                const calendar =
                    getStoredCalendar();

                if (!calendar) {
                    throw new Error(
                        "No national calendar is available."
                    );
                }

                if (
                    !requireAuthorization(
                        "adding examination planning"
                    )
                ) {
                    return false;
                }

                const result =
                    addExaminationWindow(
                        calendar,
                        subject,
                        date
                    );

                persistCalendar(
                    calendar
                );

                return result;
            },

        clearCurrentCalendar:
            function () {
                clearCalendar();
            }
    };

})();
