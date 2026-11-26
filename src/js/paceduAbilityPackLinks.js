/* Links the authored differentiated worksheet drafts into the existing teacher download panel.
 * Draft files stay clearly labelled and never masquerade as verified official syllabus content.
 */
(function (global, document) {
  "use strict";
  var BRANCH = "main";
  var ROOT = "https://github.com/terubea82-eng/Pacific-education-/blob/" + BRANCH + "/docs/worksheets/";
  var FILES = {
    "Class 1|English": "class1-english-ability-pack.md",
    "Class 1|Mathematics": "class1-mathematics-ability-pack.md",
    "Class 1|Science": "class1-science-ability-pack.md",
    "Class 2|English": "class2-english-ability-pack.md",
    "Class 2|Mathematics": "class2-mathematics-ability-pack.md",
    "Class 2|Science": "class2-science-ability-pack.md",
    "Class 3|English": "class3-english-ability-pack.md",
    "Class 3|Mathematics": "class3-mathematics-ability-pack.md",
    "Class 4|English": "class4-english-ability-pack.md",
    "Class 4|Mathematics": "class4-mathematics-ability-pack.md",
    "Form 3|Science": "form3-basic-science-ability-pack.md"
  };
  var GOLD_DAY1_URL = "https://github.com/terubea82-eng/Pacific-education-/blob/main/docs/worksheets/english-gold/class-1/day-001.md";
  function getUrl(level, subject) {
    var file = FILES[String(level || "") + "|" + String(subject || "")];
    return file ? ROOT + file : "";
  }
  function getGoldUrl(level, subject) {
    return String(level || "") === "Class 1" && String(subject || "") === "English" ? GOLD_DAY1_URL : "";
  }
  function renderControls(container, selectors) {
    if (!container || !document || !document.createElement) return false;
    selectors = selectors || {};
    var box = document.createElement("div");
    box.setAttribute("aria-label", "Differentiated worksheet draft");
    box.style.cssText = "margin-top:12px;padding:12px;border:1px solid #c8d7e2;border-radius:8px;";
    var heading = document.createElement("h5");
    heading.textContent = "Differentiated worksheet draft";
    box.appendChild(heading);
    var note = document.createElement("p");
    note.textContent = "Where a matching draft exists, open the four-level worksheet pack for this class and subject. These drafts need teacher review and are not confirmed official syllabus mappings.";
    box.appendChild(note);
    var link = document.createElement("a");
    link.textContent = "Open matching worksheet draft";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.cssText = "display:inline-block;padding:10px;border:1px solid #527184;border-radius:6px;font-weight:700;";
    var goldLink = document.createElement("a");
    goldLink.textContent = "Open Class 1 English Gold — Day 1";
    goldLink.target = "_blank";
    goldLink.rel = "noopener noreferrer";
    goldLink.style.cssText = "display:inline-block;margin-top:8px;padding:10px;border:1px solid #527184;border-radius:6px;font-weight:700;";
    var status = document.createElement("p");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    function refresh() {
      var level = selectors.level && selectors.level.value;
      var subject = selectors.subject && selectors.subject.value;
      var url = getUrl(level, subject);
      var goldUrl = getGoldUrl(level, subject);
      if (goldUrl) { goldLink.href = goldUrl; goldLink.hidden = false; }
      else { goldLink.removeAttribute("href"); goldLink.hidden = true; }
      if (url) {
        link.href = url;
        link.hidden = false;
        status.textContent = "A matching draft is available. On GitHub, use the file view or Raw option to read or save it.";
      } else {
        link.removeAttribute("href");
        link.hidden = true;
        status.textContent = "No matching draft pack is linked yet for this class and subject. The existing PacEdu daily activity builder remains available.";
      }
    }
    if (selectors.level && selectors.level.addEventListener) selectors.level.addEventListener("change", refresh);
    if (selectors.subject && selectors.subject.addEventListener) selectors.subject.addEventListener("change", refresh);
    box.appendChild(link);
    box.appendChild(goldLink);
    box.appendChild(status);
    container.appendChild(box);
    refresh();
    return true;
  }
  global.PacEduAbilityPackLinks = Object.freeze({ getUrl: getUrl, getGoldUrl: getGoldUrl, renderControls: renderControls });
})(window, document);
