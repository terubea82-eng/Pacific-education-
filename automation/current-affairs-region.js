'use strict';

// The feed's countryOrRegion field describes the story's location, not merely
// the publisher's headquarters. Only override the publisher-region fallback
// when the title contains an explicit, recognizable place marker. Ambiguous
// headlines keep the source-region fallback and remain pending teacher review.
const FIJI_TITLE = /\b(?:fiji|fijian|suva|nadi|lautoka|labasa|nausori|nasinu|ba|sigatoka|savusavu|levuka|viti\s+levu|vanua\s+levu)\b/i;
const PACIFIC_TITLE = /\b(?:solomon\s+islands|vanuatu|samoa|tonga|tuvalu|kiribati|nauru|marshall\s+islands|federated\s+states\s+of\s+micronesia|micronesia|palau|papua\s+new\s+guinea|tokelau|cook\s+islands|niue|french\s+polynesia|new\s+caledonia|aotearoa|new\s+zealand|western\s+pacific|pacific\s+islands?)\b/i;
const GLOBAL_TITLE = /\b(?:india|indian|andhra\s+pradesh|united\s+states|u\.?s\.?|america|el salvador|salvadoran|haiti|haitian|midterms|israel|gaza|egypt|kenya|armenia|algeria|china|japan|pakistan|indonesia|bangladesh|ukraine|russia|europe|africa|middle\s+east|france|french|germany|german|united\s+kingdom|britain|british|australia|australian|canada|canadian|mexico|brazil|argentina|south\s+korea|north\s+korea|iran|iraq|turkey|syria|lebanon|nepal|sri\s+lanka|myanmar|thailand|vietnam|philippines|singapore|malaysia|kenya|ethiopia|nigeria|south\s+africa|algeria)\b/i;

function inferCurrentAffairsRegion(title, publisherRegion) {
  const headline = String(title || '');
  if (FIJI_TITLE.test(headline)) return 'FIJI';
  // Pacific locations take precedence over mentions of Australia or New Zealand
  // in the same headline (for example, a Pacific leader receiving care abroad).
  if (PACIFIC_TITLE.test(headline)) return 'PACIFIC';
  if (GLOBAL_TITLE.test(headline)) return 'GLOBAL';

  const fallback = String(publisherRegion || 'GLOBAL').toUpperCase();
  return ['FIJI', 'PACIFIC', 'GLOBAL'].includes(fallback) ? fallback : 'GLOBAL';
}

module.exports = { inferCurrentAffairsRegion };
