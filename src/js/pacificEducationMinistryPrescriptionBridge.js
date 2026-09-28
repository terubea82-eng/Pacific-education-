(function(window){"use strict";
var source=window.PacificEducationMinistryPrescriptionIndicators;
var registry=window.PacificEducationCurriculumAlignmentRegistry;
if(source&&registry&&typeof source.getAll==="function"&&typeof registry.registerIndicator==="function"){
 source.getAll().forEach(function(x){registry.registerIndicator(x);});
}
})(window);