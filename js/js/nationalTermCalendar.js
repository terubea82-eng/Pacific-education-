(function () {
    "use strict";

    /*
     * PACIFIC EDUCATION
     * National Calendar Setup Engine
     *
     * Architecture:
     * Manual Ministry Entry -> Validation -> Draft -> Preview -> Publish
     *                         -> Versioned Calendar Data
     *
     * Designed for future:
     * - Ministry of Education feeds
     * - FEMIS integration
     * - Official API integration
     * - Multi-country Pacific calendars
     */

    const STORAGE_KEY = "pacificEducationNationalCalendar";
    const VERSION_KEY = "pacificEducationNationalCalendarVersion";

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : "";
    }

    function createId(prefix) {
        return (
            prefix +
            "_" +
            Date.now() +
            "_" +
            Math.random().toString(36).slice(2, 8)
        );
    }

    function getStoredCalendar() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error("Calendar storage error:", error);
            return null;
        }
    }

    function saveStoredCalendar(calendar) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(calendar)
        );

        localStorage.setItem(
            VERSION_KEY,
            String(calendar.version)
        );

        window.dispatchEvent(
            new CustomEvent(
                "pacificEducationCalendarUpdated",
                {
                    detail: calendar
                }
            )
        );
    }

    function validateDateRange(start, end) {
        if (!start || !end) return false;
        return new Date(start) <= new Date(end);
    }

    function renderTermEditor() {
        const totalTerms = Number(getValue("totalTerms")) || 3;
        const container = document.getElementById("termEditor");

        if (!container) return;

        let html = `
            <h3>📚 Term Dates</h3>
            <p>
                Enter the official start and end dates for every term.
            </p>
        `;

        for (let i = 1; i <= totalTerms; i++) {
            html += `
                <fieldset class="calendar-term">
                    <legend>Term ${i}</legend>

                    <label>
                        Term ${i} Start
                        <input
                            type="date"
                            id="term${i}Start"
                        >
                    </label>

                    <label>
                        Term ${i} End
                        <input
                            type="date"
                            id="term${i}End"
                        >
                    </label>
                </fieldset>
            `;
        }

        container.innerHTML = html;

        renderSpecialDates();
    }

    function renderSpecialDates() {
        const container =
            document.getElementById("specialDates");

        if (!container) return;

        container.innerHTML = `
            <h3>🗓 Holidays & Special Dates</h3>

            <div id="specialDateRows"></div>

            <button
                type="button"
                id="addSpecialDate"
            >
                ➕ Add Holiday / Special Date
            </button>
        `;

        document.getElementById("addSpecialDate")
            .addEventListener("click", addSpecialDateRow);
    }

    function addSpecialDateRow() {
        const container =
            document.getElementById("specialDateRows");

        if (!container) return;

        const id = createId("special");

        const row = document.createElement("div");

        row.className = "calendar-special-date";

        row.dataset.id = id;

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
                    <option value="school_holiday">
                        School Holiday
                    </option>
                    <option value="public_holiday">
                        Public Holiday
                    </option>
                    <option value="special_school_day">
                        Special School Day
                    </option>
                    <option value="event">
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

        row.querySelector(".remove-special-date")
            .addEventListener("click", function () {
                row.remove();
            });

        container.appendChild(row);
    }

    function collectTerms() {
        const totalTerms =
            Number(getValue("totalTerms")) || 3;

        const terms = [];

        for (let i = 1; i <= totalTerms; i++) {
            const start =
                getValue(`term${i}Start`);

            const end =
                getValue(`term${i}End`);

            if (!validateDateRange(start, end)) {
                throw new Error(
                    `Term ${i}: start date must be before or equal to end date.`
                );
            }

            terms.push({
                id: `term-${i}`,
                number: i,
                startDate: start,
                endDate: end
            });
        }

        return terms;
    }

    function collectSpecialDates() {
        const rows =
            document.querySelectorAll(
                ".calendar-special-date"
            );

        const dates = [];

        rows.forEach(function (row) {
            const date =
                row.querySelector(".special-date")?.value;

            const name =
                row.querySelector(".special-name")?.value.trim();

            const type =
                row.querySelector(".special-type")?.value;

            if (!date && !name) return;

            if (!date || !name) {
                throw new Error(
                    "Every holiday or special date needs both a date and a name."
                );
            }

            dates.push({
                id: row.dataset.id || createId("special"),
                date: date,
                name: name,
                type: type
            });
        });

        return dates;
    }

    function validateCalendar(calendar) {
        if (!calendar.country) {
            throw new Error("Country is required.");
        }

        if (!calendar.schoolYear) {
            throw new Error("School year is required.");
        }

        if (!calendar.ministryAnnouncementDate) {
            throw new Error(
                "Ministry announcement date is required."
            );
        }

        if (
            !Array.isArray(calendar.terms) ||
            calendar.terms.length === 0
        ) {
            throw new Error("At least one term is required.");
        }

        for (let i = 0; i < calendar.terms.length; i++) {
            const current = calendar.terms[i];

            if (
                i > 0 &&
                new Date(current.startDate) <=
                new Date(calendar.terms[i - 1].endDate)
            ) {
                throw new Error(
                    `Term ${current.number} overlaps the previous term.`
                );
            }
        }

        return true;
    }

    function buildCalendar(status) {
        const existing =
            getStoredCalendar();

        const calendar = {
            schemaVersion: "1.0",
            id:
                existing?.id ||
                createId("national-calendar"),

            version:
                existing
                    ? Number(existing.version || 0) + 1
                    : 1,

            status: status || "draft",

            country:
                getValue("calendarCountry"),

            schoolYear:
                Number(getValue("calendarYear")),

            ministryAnnouncementDate:
                getValue("ministryAnnouncementDate"),

            totalTerms:
                Number(getValue("totalTerms")),

            terms:
                collectTerms(),

            specialDates:
                collectSpecialDates(),

            source: {
                type: "manual_ministry_entry",
                verified: false
            },

            integration: {
                ministryApiReady: true,
                femisReady: true,
                externalSourceId: null
            },

            audit: {
                createdAt:
                    existing?.audit?.createdAt ||
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString(),

                publishedAt:
                    status === "published"
                        ? new Date().toISOString()
                        : existing?.audit?.publishedAt || null
            }
        };

        validateCalendar(calendar);

        return calendar;
    }

    function previewCalendar(calendar) {
        const container =
            document.getElementById("calendarPreview");

        if (!container) return;

        let termsHtml = calendar.terms
            .map(function (term) {
                return `
                    <li>
                        <strong>
                            Term ${escapeHtml(term.number)}
                        </strong>:
                        ${escapeHtml(term.startDate)}
                        →
                        ${escapeHtml(term.endDate)}
                    </li>
                `;
            })
            .join("");

        let datesHtml =
            calendar.specialDates.length
                ? calendar.specialDates
                    .map(function (item) {
                        return `
                            <li>
                                ${escapeHtml(item.date)}
                                —
                                ${escapeHtml(item.name)}
                                (${escapeHtml(item.type)})
                            </li>
                        `;
                    })
                    .join("")
                : "<li>No special dates entered.</li>";

        container.innerHTML = `
            <section class="calendar-preview">
                <h3>👁 Calendar Preview</h3>

                <p>
                    <strong>Country:</strong>
                    ${escapeHtml(calendar.country)}
                </p>

                <p>
                    <strong>School Year:</strong>
                    ${escapeHtml(calendar.schoolYear)}
                </p>

                <p>
                    <strong>Ministry Announcement:</strong>
                    ${escapeHtml(
                        calendar.ministryAnnouncementDate
                    )}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${escapeHtml(calendar.status)}
                </p>

                <h4>Terms</h4>
                <ul>
                    ${termsHtml}
                </ul>

                <h4>Holidays & Special Dates</h4>
                <ul>
                    ${datesHtml}
                </ul>

                <p>
                    <strong>Calendar Version:</strong>
                    ${escapeHtml(calendar.version)}
                </p>
            </section>
        `;
    }

    function showMessage(message, type) {
        const container =
            document.getElementById("calendarMessage");

        if (!container) return;

        container.textContent = message;
        container.dataset.type = type || "info";
    }

    function saveDraft() {
        try {
            const calendar =
                buildCalendar("draft");

            saveStoredCalendar(calendar);

            previewCalendar(calendar);

            showMessage(
                "Calendar draft saved successfully.",
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
        try {
            const calendar =
                buildCalendar("published");

            calendar.source.verified = true;

            saveStoredCalendar(calendar);

            previewCalendar(calendar);

            showMessage(
                "Calendar published successfully.",
                "success"
            );
        } catch (error) {
            showMessage(
                error.message,
                "error"
            );
        }
    }

    function loadCalendar() {
        const calendar =
            getStoredCalendar();

        if (!calendar) return;

        document.getElementById("calendarCountry").value =
            calendar.country || "";

        document.getElementById("calendarYear").value =
            calendar.schoolYear || "";

        document.getElementById(
            "ministryAnnouncementDate"
        ).value =
            calendar.ministryAnnouncementDate || "";

        document.getElementById("totalTerms").value =
            calendar.totalTerms || 3;

        renderTermEditor();

        calendar.terms.forEach(function (term) {
            const start =
                document.getElementById(
                    `term${term.number}Start`
                );

            const end =
                document.getElementById(
                    `term${term.number}End`
                );

            if (start) start.value = term.startDate;
            if (end) end.value = term.endDate;
        });

        calendar.specialDates.forEach(function (item) {
            addSpecialDateRow();

            const rows =
                document.querySelectorAll(
                    ".calendar-special-date"
                );

            const row =
                rows[rows.length - 1];

            row.querySelector(".special-date").value =
                item.date;

            row.querySelector(".special-name").value =
                item.name;

            row.querySelector(".special-type").value =
                item.type;
        });

        previewCalendar(calendar);
    }

    function clearCalendar() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(VERSION_KEY);

        window.location.reload();
    }

    window.PacificEducationNationalCalendarSetup = {

        start: function (container) {
            if (!container) return;

            container.innerHTML = `
                <section
                    class="activity"
                    id="nationalCalendarEngine"
                >

                    <h2>
                        🌏 National School Calendar Setup
                    </h2>

                    <p>
                        Enter official Ministry school
                        calendar information manually.
                    </p>

                    <div
                        id="calendarMessage"
                        role="status"
                        aria-live="polite"
                    ></div>

                    <h3>🏛 Ministry Information</h3>

                    <label>
                        Country
                        <input
                            id="calendarCountry"
                            type="text"
                            placeholder="Example: Fiji"
                        >
                    </label>

                    <label>
                        School Year
                        <input
                            id="calendarYear"
                            type="number"
                            min="2000"
                            max="2100"
                            placeholder="Example: 2027"
                        >
                    </label>

                    <label>
                        Ministry Announcement Date
                        <input
                            id="ministryAnnouncementDate"
                            type="date"
                        >
                    </label>

                    <h3>📚 Terms</h3>

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

                    <div id="termEditor"></div>

                    <div id="specialDates"></div>

                    <div
                        id="calendarPreview"
                        aria-live="polite"
                    ></div>

                    <div class="calendar-actions">

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
                            ✅ Publish Calendar
                        </button>

                        <button
                            type="button"
                            id="clearCalendar"
                        >
                            🗑 Clear Saved Calendar
                        </button>

                    </div>

                </section>
            `;

            renderTermEditor();

            document
                .getElementById("totalTerms")
                .addEventListener(
                    "change",
                    renderTermEditor
                );

            document
                .getElementById("saveCalendarDraft")
                .addEventListener(
                    "click",
                    saveDraft
                );

            document
                .getElementById("previewCalendar")
                .addEventListener(
                    "click",
                    function () {
                        try {
                            const calendar =
                                buildCalendar("draft");

                            previewCalendar(calendar);

                            showMessage(
                                "Calendar validation successful.",
                                "success"
                            );
                        } catch (error) {
                            showMessage(
                                error.message,
                                "error"
                            );
                        }
                    }
                );

            document
                .getElementById("publishCalendar")
                .addEventListener(
                    "click",
                    publishCalendar
                );

            document
                .getElementById("clearCalendar")
                .addEventListener(
                    "click",
                    clearCalendar
                );

            loadCalendar();
        },

        load: getStoredCalendar,

        save: saveStoredCalendar,

        validate: validateCalendar
    };

})();
