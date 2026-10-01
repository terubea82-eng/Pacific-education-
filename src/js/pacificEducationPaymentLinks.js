/* Pacific Education — Always-available payment link registry
 * Prototype-safe: payment links remain visible at all times, while real provider
 * destinations are configured later by an authorized administrator.
 */
(function (global) {
  "use strict";

  const VERSION = "1.0.0";
  const STORAGE_KEY = "pacificEducationPaymentLinksV1";

  const DEFAULT_LINKS = Object.freeze([
    { id:"CARD", name:"Debit / Credit Card", region:"International + Fiji", url:"", status:"NOT_CONFIGURED" },
    { id:"BANK_FIJI", name:"Fiji Bank Transfer", region:"Fiji", url:"", status:"NOT_CONFIGURED" },
    { id:"MPAISA", name:"M-PAiSA", region:"Fiji", url:"", status:"NOT_CONFIGURED" },
    { id:"MYCASH", name:"MyCash", region:"Fiji", url:"", status:"NOT_CONFIGURED" },
    { id:"BANK_INTERNATIONAL", name:"International Bank Transfer", region:"International", url:"", status:"NOT_CONFIGURED" },
    { id:"WESTERN_UNION", name:"Western Union", region:"International", url:"", status:"NOT_CONFIGURED" },
    { id:"MONEYGRAM", name:"MoneyGram", region:"International", url:"", status:"NOT_CONFIGURED" },
    { id:"SPONSOR", name:"Donor / Sponsor Payment", region:"All supported regions", url:"", status:"NOT_CONFIGURED" }
  ]);

  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return Array.isArray(saved) && saved.length ? saved : DEFAULT_LINKS.map(function(x){return Object.assign({},x);});
    } catch (_) {
      return DEFAULT_LINKS.map(function(x){return Object.assign({},x);});
    }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return items;
  }

  function isSafeUrl(url) {
    const value = String(url || "").trim();
    if (!value) return false;
    try {
      const parsed = new URL(value, window.location.href);
      return parsed.protocol === "https:";
    } catch (_) {
      return false;
    }
  }

  function configureLink(linkId, url, authorized) {
    if (authorized !== true) return {success:false,status:"AUTHORIZATION_REQUIRED"};
    if (!isSafeUrl(url)) return {success:false,status:"HTTPS_PAYMENT_LINK_REQUIRED"};
    const items = read();
    const index = items.findIndex(function(x){return x.id === linkId;});
    if (index < 0) return {success:false,status:"PAYMENT_LINK_NOT_FOUND"};
    items[index].url = String(url).trim();
    items[index].status = "CONFIGURED";
    items[index].updatedAt = new Date().toISOString();
    save(items);
    renderAll();
    return {success:true,link:items[index]};
  }

  function listLinks() {
    return read().map(function(x){return Object.assign({},x);});
  }

  function render(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const links = read();
    target.innerHTML =
      "<h2>Payment Links</h2>" +
      "<p><strong>Always available:</strong> payment options remain visible even when a provider link has not yet been configured.</p>" +
      "<p><small>Only authorized provider links should be added. Payment is not confirmed by this browser.</small></p>" +
      "<div style='display:flex;flex-wrap:wrap;gap:8px'>" +
      links.map(function(link) {
        if (link.status === "CONFIGURED" && isSafeUrl(link.url)) {
          return "<a href='" + link.url.replace(/'/g,"&#39;") + "' target='_blank' rel='noopener noreferrer' style='display:inline-block;padding:10px 14px;border:1px solid currentColor;border-radius:6px'>" +
            "Pay: " + link.name + "</a>";
        }
        return "<span style='display:inline-block;padding:10px 14px;border:1px dashed currentColor;border-radius:6px'>" +
          link.name + " — link to be configured</span>";
      }).join("") +
      "</div>";
  }

  function renderAll() {
    render("pacificEducationPaymentLinksUI");
    render("pacificEducationPaymentLinksUIAlways");
  }

  global.PacificEducationPaymentLinks = Object.freeze({
    version:VERSION,
    storageKey:STORAGE_KEY,
    defaultLinks:DEFAULT_LINKS,
    listLinks:listLinks,
    configureLink:configureLink,
    render:render,
    renderAll:renderAll
  });

  global.addEventListener("pacificEducationPaymentLinksLoaded", renderAll);
  global.dispatchEvent(new CustomEvent("pacificEducationPaymentLinksLoaded", {
    detail:{version:VERSION,alwaysAvailable:true,prototypeOnly:true}
  }));
})(window);
