/*
 * Pacific Education — Production Gate Audit Export
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window){
"use strict";
function exportJSON(){
var a=window.PacificEducationProductionGateAudit;
var data=a?a.list():[];
return JSON.stringify({name:"Pacific Education Production Gate Audit",version:"1.0.0",prototype:true,productionEligible:false,records:data},null,2);
}
window.PacificEducationProductionGateAuditExport=Object.freeze({version:"1.0.0",exportJSON:exportJSON,prototype:true,productionEligible:false});
})(window);
