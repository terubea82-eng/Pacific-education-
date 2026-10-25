/* PacEdu Education Resources — curated official-source directory.
 * External links only. Does not scrape, copy, or claim real-time completeness.
 */
(function (window, document) {
  "use strict";
  var ROOT = "paceduEducationResources";
  var STYLE = "paceduEducationResourcesStyles";
  var resources = [
    {country:"Fiji",category:"Scholarships",title:"Fiji government scholarships and study loans",provider:"Tertiary Scholarships and Loans Service (TSLS)",url:"https://tsls.com.fj/",detail:"Official Fiji scholarship schemes, eligibility guidance and notices."},
    {country:"Fiji",category:"Scholarships",title:"TSLS online application portal",provider:"Tertiary Scholarships and Loans Service (TSLS)",url:"https://apply.tsls.com.fj/",detail:"Apply or check the current process through the official portal. Check the latest opening dates first."},
    {country:"Fiji",category:"Curriculum & school information",title:"Fiji Ministry of Education",provider:"Government of Fiji",url:"https://www.education.gov.fj/",detail:"Official ministry notices, policies and education information."},
    {country:"Global",category:"Scholarships",title:"Commonwealth scholarships and fellowships",provider:"Commonwealth Scholarship Commission",url:"https://cscuk.fcdo.gov.uk/scholarships-filter-search/",detail:"Search programmes by country and check the official application route."},
    {country:"Global",category:"Scholarships",title:"Chevening awards",provider:"UK Government / Chevening",url:"https://www.chevening.org/apply/",detail:"Choose your citizenship country to see awards and current application status."},
    {country:"Global",category:"Scholarships",title:"Erasmus Mundus Joint Masters",provider:"European Union — Erasmus+",url:"https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters",detail:"Official programme information and links to participating course providers; eligibility and deadlines vary by course."},
    {country:"Global",category:"Scholarships",title:"DAAD scholarship database",provider:"German Academic Exchange Service (DAAD)",url:"https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/",detail:"Search scholarships for international students and researchers."},
    {country:"Global",category:"Scholarships",title:"Australia Awards scholarships",provider:"Australian Government — DFAT",url:"https://www.dfat.gov.au/people-to-people/australia-awards/how-to-apply-for-an-australia-awards-scholarship",detail:"Select your participating country to check eligibility, application method and dates."},
    {country:"Global",category:"Scholarships",title:"Manaaki New Zealand Scholarships",provider:"Education New Zealand / New Zealand Government",url:"https://www.nzscholarships.govt.nz/",detail:"Check eligible countries, study levels and current scholarship opportunities."},
    {country:"Global",category:"Scholarships",title:"International scholarships in Canada",provider:"Government of Canada — EduCanada",url:"https://www.educanada.ca/scholarships-bourses/index.aspx?lang=eng",detail:"Government information for international students and Canadian applicants."},
    {country:"Global",category:"Free learning",title:"UNESCO Open Learning",provider:"UNESCO",url:"https://openlearning.unesco.org/",detail:"Browse online courses across education, science, culture and other fields."},
    {country:"Global",category:"Free learning",title:"UNICEF Agora learning",provider:"UNICEF",url:"https://agora.unicef.org/",detail:"Learning courses and resources; account and audience requirements may vary."},
    {country:"Global",category:"Free learning",title:"OpenLearn free courses",provider:"The Open University",url:"https://www.open.edu/openlearn/free-courses",detail:"Free courses across a range of subjects. Check each course for badge or certificate details."},
    {country:"Global",category:"Books & study materials",title:"OpenStax textbooks",provider:"Rice University / OpenStax",url:"https://openstax.org/",detail:"Free online textbooks and learning resources; subject and course coverage varies."},
    {country:"Global",category:"Open education",title:"UNESCO open educational resources",provider:"UNESCO",url:"https://www.unesco.org/en/open-educational-resources",detail:"Learn about openly licensed learning materials and how reuse permissions work."}
  ];
  function el(tag, text, cls) {
    var n = document.createElement(tag);
    if (text != null) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  }
  function init() {
    var app = document.getElementById("app");
    if (!app || document.getElementById(ROOT)) return;
    var style = el("style");
    style.id = STYLE;
    style.textContent =
      "#" + ROOT + "{margin:14px 0;color:#193548;line-height:1.5}" +
      "#" + ROOT + " .per-panel{display:none;border:1px solid #b7cbd6;border-radius:12px;padding:14px;background:#f8fbfd}" +
      "#" + ROOT + " .per-panel[data-open=true]{display:block}" +
      "#" + ROOT + " .per-controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}" +
      "#" + ROOT + " .per-card{background:white;border:1px solid #cbd8df;border-radius:10px;padding:12px;margin:9px 0}" +
      "#" + ROOT + " input,#" + ROOT + " select{box-sizing:border-box;width:100%;font:inherit;padding:10px;border:1px solid #7895a5;border-radius:8px;background:white}" +
      "#" + ROOT + " button{font:inherit;min-height:44px;padding:9px 12px;border:1px solid #56798b;border-radius:8px;background:white;font-weight:700;margin:5px 5px 5px 0}" +
      "#" + ROOT + " a{overflow-wrap:anywhere}" +
      "#" + ROOT + " .per-note{background:#eef5f8;padding:10px;border-left:4px solid #56798b}" +
      "@media(max-width:420px){#" + ROOT + " .per-panel{padding:10px}}";
    document.head.appendChild(style);
    var root = el("section");
    root.id = ROOT;
    root.setAttribute("aria-label", "Education resources and scholarships");
    var toggle = el("button", "Education Resources & Scholarships");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", ROOT + "Panel");
    var panel = el("div");
    panel.id = ROOT + "Panel";
    panel.className = "per-panel";
    panel.setAttribute("data-open", "false");
    panel.appendChild(el("h2", "Find trusted education opportunities"));
    panel.appendChild(el("p", "Browse official scholarship portals, free courses, curriculum information and study materials. Choose your country and the type of resource you need."));
    var note = el("p", null, "per-note");
    note.appendChild(el("strong", "Use official links. "));
    note.appendChild(document.createTextNode("Deadlines, eligibility and fees can change. Check the provider's current notice before applying. A link is not a guarantee of funding or admission. Never pay an unknown person to secure a scholarship."));
    panel.appendChild(note);
    var controls = el("div", null, "per-controls");
    var countryLabel = el("label", "Country or reach");
    countryLabel.appendChild(document.createElement("br"));
    var country = el("select");
    country.id = "perCountry";
    [["Fiji","Fiji"],["Global","Global / any country"]].forEach(function (item) {
      var option = el("option", item[1]); option.value = item[0]; country.appendChild(option);
    });
    countryLabel.appendChild(country);
    var categoryLabel = el("label", "Resource type");
    categoryLabel.appendChild(document.createElement("br"));
    var category = el("select");
    category.id = "perCategory";
    ["All types","Scholarships","Free learning","Curriculum & school information","Books & study materials","Open education"].forEach(function (item) {
      var option = el("option", item); option.value = item; category.appendChild(option);
    });
    categoryLabel.appendChild(category);
    var searchLabel = el("label", "Search by topic or provider");
    searchLabel.appendChild(document.createElement("br"));
    var search = el("input");
    search.id = "perSearch"; search.type = "search"; search.maxLength = 100;
    search.placeholder = "e.g. science, scholarship, UNESCO";
    searchLabel.appendChild(search);
    controls.appendChild(countryLabel); controls.appendChild(categoryLabel); controls.appendChild(searchLabel);
    panel.appendChild(controls);
    var results = el("div");
    results.id = "perResults";
    results.setAttribute("aria-live", "polite");
    panel.appendChild(results);
    root.appendChild(toggle); root.appendChild(panel);
    var nav = document.getElementById("userFirstNavigation");
    if (nav && nav.parentNode) nav.parentNode.insertBefore(root, nav.nextSibling);
    else app.insertBefore(root, app.firstChild);
    toggle.addEventListener("click", function () {
      var open = panel.getAttribute("data-open") !== "true";
      panel.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) panel.scrollIntoView({behavior:"auto",block:"start"});
    });
    function renderResults() {
      results.textContent = "";
      var q = search.value.trim().toLowerCase();
      var list = resources.filter(function (r) {
        var region = country.value === "Global" || r.country === "Global" || r.country === country.value;
        var type = category.value === "All types" || category.value === r.category;
        var text = (r.title + " " + r.provider + " " + r.detail + " " + r.category).toLowerCase();
        return region && type && (!q || text.indexOf(q) !== -1);
      });
      var count = el("p", list.length + (list.length === 1 ? " resource" : " resources") + " found.");
      results.appendChild(count);
      if (!list.length) {
        results.appendChild(el("p", "No matching links in this starter directory. Try another topic or choose Global / any country."));
        return;
      }
      list.forEach(function (r) {
        var card = el("article", null, "per-card");
        card.appendChild(el("h3", r.title));
        card.appendChild(el("p", r.provider + " · " + r.category));
        card.appendChild(el("p", r.detail));
        var a = el("a", "Open official resource");
        a.href = r.url; a.target = "_blank"; a.rel = "noopener noreferrer";
        card.appendChild(a);
        results.appendChild(card);
      });
    }
    country.addEventListener("change", renderResults);
    category.addEventListener("change", renderResults);
    search.addEventListener("input", renderResults);
    renderResults();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
