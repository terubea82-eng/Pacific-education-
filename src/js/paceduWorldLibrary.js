/* PacEdu World Library — searchable links to legal/open catalogue sources.
 * No book files are copied into PacEdu. Availability and licensing are determined by each provider.
 */
(function (window, document) {
  "use strict";
  var PANEL_ID = "paceduWorldLibraryPanel";
  var STYLE_ID = "paceduWorldLibraryStyles";
  var providers = [
    { name: "Open Library", description: "Search book records and editions; some books offer online borrowing.", build: function (q) { return "https://openlibrary.org/search?" + new URLSearchParams({ q: q.query, language: q.language || "" }).toString(); } },
    { name: "Internet Archive", description: "Find digitised books and materials; access depends on rights and availability.", build: function (q) { return "https://archive.org/advancedsearch.php?" + new URLSearchParams({ q: (q.query || "mediatype:texts") + " AND mediatype:texts", "fl[]": ["identifier", "title", "creator"], rows: "20", page: "1", output: "html" }).toString(); } },
    { name: "Project Gutenberg", description: "Browse free public-domain ebooks, especially classic literature.", build: function (q) { return "https://www.gutenberg.org/ebooks/search?" + new URLSearchParams({ query: q.query }).toString(); } },
    { name: "Google Books", description: "Search book previews and publication details; full text may not be free.", build: function (q) { return "https://books.google.com/books?" + new URLSearchParams({ q: q.query }).toString(); } }
  ];
  function make(tag, text, className) {
    var node = document.createElement(tag);
    if (text != null) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = make("style");
    style.id = STYLE_ID;
    style.textContent =
      "#" + PANEL_ID + "{display:none;border:2px solid #175b70;border-radius:14px;padding:16px;margin:12px 0;background:#f5fbfd;color:#17324d;line-height:1.45}" +
      "#" + PANEL_ID + "[data-open=true]{display:block}" +
      "#" + PANEL_ID + " h2{margin:.2em 0 .4em}" +
      "#" + PANEL_ID + " .pacedu-library-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}" +
      "#" + PANEL_ID + " label{display:block;font-weight:700;margin:6px 0}" +
      "#" + PANEL_ID + " input, #" + PANEL_ID + " select{width:100%;min-width:0;box-sizing:border-box;padding:11px;border:1px solid #6f9eaf;border-radius:8px;font:inherit;background:#fff}" +
      "#" + PANEL_ID + " button{min-height:44px;padding:9px 14px;border-radius:8px;font:inherit;font-weight:700;cursor:pointer}" +
      "#" + PANEL_ID + " .pacedu-library-results{display:grid;gap:9px;margin-top:12px}" +
      "#" + PANEL_ID + " .pacedu-library-result{border:1px solid #b7d0d9;border-radius:10px;padding:12px;background:#fff}" +
      "#" + PANEL_ID + " .pacedu-library-result a{font-weight:700}" +
      "#" + PANEL_ID + " .pacedu-library-note{font-size:.92em}" +
      "@media(max-width:480px){#" + PANEL_ID + "{padding:12px}}";
    document.head.appendChild(style);
  }
  function currentContext() {
    var role = document.getElementById("pilotRoleSelector");
    var level = document.getElementById("peStudentDailyClass") || document.getElementById("pilotClassSelector");
    var subject = document.getElementById("peStudentDailySubject");
    return {
      role: role && role.value ? String(role.value).toLowerCase() : "",
      level: level && level.value ? String(level.value) : "",
      subject: subject && subject.value ? String(subject.value) : ""
    };
  }
  function render() {
    if (!document.body || document.getElementById(PANEL_ID)) return;
    var anchors = [
      document.getElementById("dailyLesson"),
      document.getElementById("teacherDashboard"),
      document.getElementById("learningPlatform")
    ].filter(Boolean);
    if (!anchors.length) return;
    addStyles();
    var panel = make("section");
    panel.id = PANEL_ID;
    panel.setAttribute("aria-label", "World Library book search");
    panel.setAttribute("data-open", "false");
    panel.innerHTML =
      '<h2>World Library</h2>' +
      '<p>Find books by title, author, subject or reading level. PacEdu searches trusted book catalogues and open-book collections around the world.</p>' +
      '<form id="paceduWorldLibraryForm">' +
      '<div class="pacedu-library-fields">' +
      '<div><label for="paceduLibraryTitle">Book title or keywords</label><input id="paceduLibraryTitle" name="title" type="search" maxlength="160" placeholder="e.g. ocean animals"></div>' +
      '<div><label for="paceduLibraryAuthor">Author (optional)</label><input id="paceduLibraryAuthor" name="author" maxlength="100" placeholder="Author name"></div>' +
      '<div><label for="paceduLibrarySubject">Subject</label><select id="paceduLibrarySubject" name="subject"><option value="">Any subject</option><option>English</option><option>Mathematics</option><option>Science</option><option>Social Science</option><option>Health</option><option>Technology</option><option>History</option><option>Geography</option><option>Literature</option></select></div>' +
      '<div><label for="paceduLibraryLevel">Class or Form</label><select id="paceduLibraryLevel" name="level"><option value="">Any level</option><option>ECE</option>' +
      Array.from({length: 8}, function (_, i) { return '<option>Class ' + (i + 1) + '</option>'; }).join("") +
      Array.from({length: 5}, function (_, i) { return '<option>Form ' + (i + 3) + '</option>'; }).join("") +
      '</select></div>' +
      '<div><label for="paceduLibraryLanguage">Language (optional)</label><input id="paceduLibraryLanguage" name="language" maxlength="60" placeholder="e.g. English, iTaukei, Hindi"></div>' +
      '<div><label for="paceduLibraryCountry">Country or region (optional)</label><input id="paceduLibraryCountry" name="country" maxlength="80" placeholder="e.g. Fiji or Pacific"></div>' +
      '</div><p><button type="submit">Search World Library</button> <button type="button" id="paceduLibraryClear">Clear search</button> <button type="button" id="paceduLibraryClose">Close library</button></p></form>' +
      '<p class="pacedu-library-note">Results open on the provider’s website. Some books are free to read; others may only offer previews, borrowing, or paid access. Follow the provider’s terms and your teacher’s guidance.</p>' +
      '<div id="paceduWorldLibraryResults" class="pacedu-library-results" aria-live="polite"></div>';
    var first = anchors[0];
    first.appendChild(panel);
    var toggle = make("button", "Open World Library");
    toggle.type = "button";
    toggle.id = "paceduWorldLibraryToggle";
    toggle.setAttribute("aria-controls", PANEL_ID);
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", function () {
      var open = panel.getAttribute("data-open") !== "true";
      panel.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
        var input = document.getElementById("paceduLibraryTitle");
        if (input) input.focus({ preventScroll: true });
      }
    });
    first.insertBefore(toggle, panel);
    if (anchors.length > 1) {
      anchors.slice(1).forEach(function (anchor) {
        if (anchor.querySelector("#paceduWorldLibraryToggle")) return;
        var extra = make("button", "Open World Library");
        extra.type = "button";
        extra.className = "paceduWorldLibraryOpenButton";
        extra.addEventListener("click", function () {
          panel.setAttribute("data-open", "true");
          toggle.setAttribute("aria-expanded", "true");
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        anchor.insertBefore(extra, anchor.firstChild);
      });
    }
    var context = currentContext();
    if (context.level) document.getElementById("paceduLibraryLevel").value = context.level;
    if (context.subject) document.getElementById("paceduLibrarySubject").value = context.subject;
    document.getElementById("paceduWorldLibraryForm").addEventListener("submit", function (event) {
      event.preventDefault();
      var title = document.getElementById("paceduLibraryTitle").value.trim();
      var author = document.getElementById("paceduLibraryAuthor").value.trim();
      var subject = document.getElementById("paceduLibrarySubject").value;
      var level = document.getElementById("paceduLibraryLevel").value;
      var language = document.getElementById("paceduLibraryLanguage").value.trim();
      var country = document.getElementById("paceduLibraryCountry").value.trim();
      var terms = [title, author, subject, level, language, country].filter(Boolean);
      var results = document.getElementById("paceduWorldLibraryResults");
      results.replaceChildren();
      if (!terms.length) {
        results.appendChild(make("p", "Enter a title, author, subject, level, language or country to search."));
        document.getElementById("paceduLibraryTitle").focus();
        return;
      }
      var query = terms.join(" ");
      providers.forEach(function (provider) {
        var card = make("article", null, "pacedu-library-result");
        card.appendChild(make("h3", provider.name));
        card.appendChild(make("p", provider.description));
        var link = make("a", "Search " + provider.name);
        link.href = provider.build({ query: query, language: language });
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.appendChild(link);
        results.appendChild(card);
      });
      results.insertBefore(make("p", "Search terms: " + query), results.firstChild);
    });
    document.getElementById("paceduLibraryClear").addEventListener("click", function () {
      document.getElementById("paceduWorldLibraryForm").reset();
      document.getElementById("paceduWorldLibraryResults").replaceChildren();
      document.getElementById("paceduLibraryTitle").focus();
    });
    document.getElementById("paceduLibraryClose").addEventListener("click", function () {
      panel.setAttribute("data-open", "false");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    });
  }
  function init() { render(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.addEventListener("load", init);
  window.setTimeout(init, 500);
})(window, document);
