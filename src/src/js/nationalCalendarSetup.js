(function () {
    "use strict";

    window.PacificEducationNationalCalendarSetup = {

        start: function (container) {
            if (!container) return;

            container.innerHTML = `
                <section class="activity">
                    <h2>🌏 School Calendar Setup</h2>

                    <p><strong>Step 1:</strong> Enter official Ministry school dates.</p>

                    <label>
                        Country
                        <input id="calendarCountry" placeholder="Example: Fiji">
                    </label>

                    <label>
                        School Year
                        <input id="calendarYear" type="number" placeholder="Example: 2027">
                    </label>

                    <label>
                        Ministry Announcement Date
                        <input id="ministryAnnouncementDate" type="date">
                    </label>

                    <h3>📚 Number of Terms</h3>

                    <select id="totalTerms">
                        <option value="3">3 Terms</option>
                        <option value="4">4 Terms</option>
                    </select>

                    <button type="button" id="startTerms">
                        ▶ Start Term 1
                    </button>

                    <div id="termStep"></div>
                </section>
            `;

            document.getElementById("startTerms").onclick =
                function () {
                    alert("Term 1 setup will start here.");
                };
        }
    };

})();


                    <button type="button" id="startTerms">
                        ▶ Start Term 1
                    </button>

                    <div id="termStep"></div>
                </section>
            `;

            document.getElementById("startTerms").onclick =
                function () {
                    alert("Term 1 setup will start here.");
                };
        }
    };

})();
