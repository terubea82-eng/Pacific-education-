/* PacEdu — country/school teacher class-list entry.
 * Pilot-safe: stores only demo class metadata and synthetic learner references in
 * the existing local roster. Never collect or persist FEMIS/national IDs here.
 * Official student-ID verification and cross-device sync require secured backend rules.
 */
(function (window, document) {
  "use strict";
  var PANEL_ID = "paceduTeacherClassRegistrationPanel";
  var LINK_ID = "paceduTeacherClassRegistrationLink";
  var LEVELS = ["ECE","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Form 3","Form 4","Form 5","Form 6","Form 7"];
  var COUNTRIES = [
    ["FJ","Fiji"],["PG","Papua New Guinea"],["SB","Solomon Islands"],["VU","Vanuatu"],
    ["WS","Samoa"],["TO","Tonga"],["KI","Kiribati"],["TV","Tuvalu"],["NR","Nauru"],
    ["FM","Federated States of Micronesia"],["MH","Marshall Islands"],["PW","Palau"],
    ["NC","New Caledonia"],["PF","French Polynesia"],["GU","Guam"],["AS","American Samoa"],["CK","Cook Islands"],["NU","Niue"],["TK","Tokelau"],["AU","Australia"],["NZ","New Zealand"],["OTHER","Other country"]
  ];
  function el(tag, text) { var n = document.createElement(tag); if (text != null) n.textContent = text; return n; }
  function style(n, css) { n.style.cssText = css; return n; }
  function field(labelText, id, placeholder, value) {
    var wrap = style(el("label"), "display:block;margin:10px 0;font-weight:600;");
    wrap.appendChild(el("span", labelText));
    var input = el("input"); input.id = id; input.type = "text"; input.maxLength = 100;
    input.placeholder = placeholder || ""; input.value = value || "";
    input.autocomplete = "off";
    style(input, "display:block;width:100%;min-height:44px;padding:10px;margin-top:4px;font:inherit;border:1px solid #8baab7;border-radius:7px;");
    wrap.appendChild(input); return {wrap:wrap,input:input};
  }
  function button(label) { return style(el("button", label), "min-height:44px;padding:10px 14px;margin:5px 5px 5px 0;border:1px solid #517b8b;border-radius:8px;font-weight:700;"); }
  function roster() { return window.PacificEducationTeacherClassRosterContext || null; }
  function currentSchool() {
    var s = window.PacificEducationSchoolIdentity;
    try { return s && typeof s.getProfile === "function" ? s.getProfile() : {
      country: localStorage.getItem("pacificEducationSchoolCountry") || localStorage.getItem("pacificEducationRegistrationCountry") || "Fiji",
      schoolName: localStorage.getItem("pacificEducationSchoolName") || "",
      registrationNumber: localStorage.getItem("pacificEducationSchoolRegistrationNumber") || ""
    }; } catch (_) { return {country:"Fiji",schoolName:"",registrationNumber:""}; }
  }
  function renderRoster(host, status) {
    host.textContent = "";
    var r = roster();
    if (!r || typeof r.getClasses !== "function") {
      host.appendChild(el("p", "The class-roster service is not available in this session. No class or learner was saved."));
      return;
    }
    var classes = r.getClasses() || {}, ids = Object.keys(classes);
    if (!ids.length) { host.appendChild(el("p", "No classes registered on this device yet. Create a demo class above to preview the workflow.")); return; }
    ids.forEach(function (id) {
      var c = classes[id] || {};
      var card = style(el("section"), "margin:10px 0;padding:12px;border:1px solid #c7d7df;border-radius:8px;");
      card.appendChild(el("h4", (c.level || c.className || "Class") + " — " + id));
      card.appendChild(el("p", "Country: " + (c.country || "Not recorded") + " · School: " + (c.schoolName || "Not recorded") + " · Teacher: " + (c.teacherRef || "Not assigned")));
      var refs = Array.isArray(c.studentRefs) ? c.studentRefs : [];
      card.appendChild(el("p", "Learner references: " + (refs.length ? refs.join(", ") : "None yet")));
      var add = button("Select this class");
      add.addEventListener("click", function () {
        r.setClassId(id);
        try { localStorage.setItem("pacificEducationClassId", id); } catch (_) {}
        status.textContent = "Selected " + id + ". Use the existing student-registration route for learner registration. This roster only stores demo references.";
      });
      card.appendChild(add);
      host.appendChild(card);
    });
  }
  function init() {
    var teacher = document.getElementById("teacherDashboard");
    if (!teacher || document.getElementById(PANEL_ID)) return;
    var link = button("Teacher Class List & Student Registration");
    link.id = LINK_ID;
    link.setAttribute("aria-expanded", "false");
    link.setAttribute("aria-controls", PANEL_ID);
    link.style.display = "block";
    link.style.width = "100%";
    var panel = style(el("section"), "margin:12px 0;padding:14px;border:2px solid #7bb9e8;border-radius:12px;");
    panel.id = PANEL_ID;
    panel.hidden = true;
    panel.setAttribute("aria-label", "Country and school teacher class list");
    panel.appendChild(el("h3", "Teacher Class List & Student Registration"));
    panel.appendChild(el("p", "Choose the country and school, create the class, then link registered learners to it. This pilot roster is stored only in this browser/device and is for DEMO REFERENCES ONLY; it does not verify official school or student IDs and does not sync across devices."));
    var caution = style(el("p", "Privacy protection: do not enter real student names, FEMIS numbers, national IDs, birth dates or contact details into this demo roster. Fiji learners require their FEMIS ID in the approved registration process; other countries must follow their own authorised school-ID rules. Official-ID verification is not connected here."), "padding:10px;border-left:4px solid #a66b00;background:#fff8e6;");
    caution.setAttribute("role", "note"); panel.appendChild(caution);
    var school = currentSchool();
    var countryLabel = style(el("label", "Country"), "display:block;margin:10px 0;font-weight:600;");
    var country = el("select"); country.id = "paceduClassCountry";
    style(country, "display:block;width:100%;min-height:44px;padding:10px;margin-top:4px;font:inherit;");
    COUNTRIES.forEach(function (item) { var op = el("option", item[1]); op.value = item[1]; country.appendChild(op); });
    country.value = school.country || "Fiji";
    if (!Array.from(country.options).some(function (o) { return o.value === country.value; })) country.value = "Fiji";
    countryLabel.appendChild(country); panel.appendChild(countryLabel);
    var schoolName = field("School name", "paceduClassSchoolName", "Enter school name (demo only)", school.schoolName);
    var schoolNumber = field("School registration reference", "paceduClassSchoolNumber", "Optional demo reference; not verified", "");
    panel.appendChild(schoolName.wrap); panel.appendChild(schoolNumber.wrap);
    var levelWrap = style(el("label", "Class / level"), "display:block;margin:10px 0;font-weight:600;");
    var level = el("select"); level.id = "paceduClassLevel";
    style(level, "display:block;width:100%;min-height:44px;padding:10px;margin-top:4px;font:inherit;");
    LEVELS.forEach(function (v) { var op = el("option", v); op.value = v; level.appendChild(op); });
    levelWrap.appendChild(level); panel.appendChild(levelWrap);
    var classRef = field("Class reference", "paceduClassReference", "e.g. DEMO-FJ-Y1-A", "");
    var teacherRef = field("Teacher reference (optional)", "paceduTeacherReference", "e.g. DEMO-TEACHER-01", "");
    panel.appendChild(classRef.wrap); panel.appendChild(teacherRef.wrap);
    var status = el("p", "Ready. No records have been changed."); status.id = "paceduClassRegistrationStatus";
    status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
    var create = button("Create / update demo class");
    create.addEventListener("click", function () {
      var r = roster();
      if (!r || typeof r.createClass !== "function") { status.textContent = "Class-roster service unavailable. Nothing saved."; return; }
      var id = classRef.input.value.trim();
      if (!id || !schoolName.input.value.trim()) { status.textContent = "Enter a class reference and school name. Nothing saved."; return; }
      var result = r.createClass(id, level.value, teacherRef.input.value.trim(), "");
      if (!result || !result.success) { status.textContent = result && result.error || "Could not create class."; return; }
      var info = result.class || {};
      info.country = country.value; info.schoolName = schoolName.input.value.trim();
      info.schoolRegistrationReference = schoolNumber.input.value.trim();
      info.className = level.value; info.level = level.value;
      try {
        var all = r.getClasses() || {}; all[id] = info;
        localStorage.setItem("pacificEducationPrototypeClassRosters", JSON.stringify(all));
        localStorage.setItem("pacificEducationSchoolCountry", country.value);
        localStorage.setItem("pacificEducationSchoolName", schoolName.input.value.trim());
        localStorage.setItem("pacificEducationSchoolRegistrationNumber", schoolNumber.input.value.trim());
      } catch (_) { status.textContent = "Browser storage unavailable. Nothing was confirmed saved."; return; }
      status.textContent = "Demo class " + id + " saved on this device only. School registration has not been verified.";
      renderRoster(rosterHost, status);
    });
    panel.appendChild(create);
    panel.appendChild(el("h4", "Link a learner reference"));
    panel.appendChild(el("p", "Use a synthetic demo reference only, not the student's official ID."));
    var studentRef = field("Demo learner reference", "paceduDemoLearnerReference", "e.g. DEMO-LEARNER-001", "");
    panel.appendChild(studentRef.wrap);
    var addStudent = button("Add demo learner to selected class");
    addStudent.addEventListener("click", function () {
      var r = roster(), id = classRef.input.value.trim() || (r && r.getClassId && r.getClassId());
      var ref = studentRef.input.value.trim();
      if (!r || typeof r.addStudent !== "function") { status.textContent = "Class-roster service unavailable. Nothing saved."; return; }
      if (!id || !ref) { status.textContent = "Enter/select a class reference and a demo learner reference."; return; }
      var result = r.addStudent(id, ref);
      if (!result || !result.success) { status.textContent = result && result.error || "Could not add learner reference."; return; }
      status.textContent = "Demo learner reference linked to " + id + " on this device. Official student registration and verification remain separate.";
      renderRoster(rosterHost, status);
    });
    panel.appendChild(addStudent);
    var registrationLink = el("a", "Open student registration");
    registrationLink.href = "#pacificEducationIdentityRegistration";
    registrationLink.style.cssText = "display:inline-block;margin:8px 0;font-weight:700;";
    panel.appendChild(registrationLink);
    panel.appendChild(el("h4", "Classes and learner references"));
    var rosterHost = el("div"); rosterHost.id = "paceduTeacherClassRosterList";
    panel.appendChild(rosterHost);
    panel.appendChild(status);
    link.addEventListener("click", function () {
      var opening = panel.hidden;
      panel.hidden = !opening;
      link.setAttribute("aria-expanded", opening ? "true" : "false");
      if (opening) { renderRoster(rosterHost, status); panel.scrollIntoView({behavior:"smooth",block:"start"}); }
    });
    teacher.insertBefore(link, teacher.firstChild);
    teacher.insertBefore(panel, link.nextSibling);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.addEventListener("load", init);
})(window, document);
