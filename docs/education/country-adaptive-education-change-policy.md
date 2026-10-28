# Country-adaptive education change policy

**Status:** Policy and configuration scaffold. This does not claim that a live crawler, automatic lesson publication, or all-country coverage is already active.

## Mandatory product rule

PacEdu must adapt educational content to each learner's selected country and school context. It must monitor official education/curriculum sources and reliable national sources for changes that affect what learners need to know, including curriculum frameworks, syllabuses, achievement indicators, assessment rules, government policy and laws, public-health and safety notices, national development programmes, current affairs, and important regional/international developments.

Relevant cross-country topics may include climate resilience, digital and AI literacy, public health, financial literacy, employment skills, sustainability and civic participation. Adapt these to the selected country's needs, language, local resources and learner age.

## Research-to-learning intake (mandatory)

PacEdu must review published findings and actionable recommendations from credible research and legal/public-interest bodies, not only curriculum announcements. Relevant examples include UNICEF, UNESCO, WHO, World Bank, UNDP, FAO, ILO, regional Pacific bodies, national statistics offices, universities and peer-reviewed research groups. Use local research and official country sources first where available; use international findings when they are relevant to the selected country's needs.

For each finding, create an evidence record containing:
- the original report/article URL, title, publisher, authors where available, publication date and country/population studied;
- the finding and evidence type (measured result, association, research interpretation, recommendation, policy proposal or law);
- the problem being addressed, likely causes, limits/uncertainty and who is affected;
- recommendations made by the source, separately from PacEdu's own educational suggestions;
- possible practical solutions, implementation constraints, cost/resource considerations and intended public benefit;
- relevant country, age range, classes and subjects;
- mapped curriculum framework/version and exact achievement indicator, or `outcome-mapping-pending`;
- four ability-group versions, answer/marking guidance and safeguarding notes;
- review status, reviewer, last-checked date and change history.

### Evidence-to-learning rules

1. Explain the finding in student-friendly language and distinguish facts from opinions.
2. Teach the chain: **problem → evidence → possible causes → options → costs/risks → proposed solution → expected benefit → how to measure results**.
3. Do not assume that a correlation proves a cause. Identify uncertainty, missing evidence and alternative explanations.
4. Do not present a research body's recommendation as a legal requirement unless the relevant authority has adopted it.
5. Use the country's official curriculum and exact indicator when verified. If a finding is educationally important but not directly mapped, label it as a cross-curricular/current-affairs extension and request educator mapping instead of inventing an indicator.
6. Adapt recommendations to local law, culture, language, available services and resources. Never tell children to undertake unsafe activities, diagnose people, confront alleged offenders or disclose private family information.
7. Track outcomes where possible (for example reading progress, water-saving measurements or waste reduction) without claiming the activity alone caused wider national change.

## Source priority

1. Official Ministry of Education/curriculum authority, official gazette, government departments and examination authorities.
2. Official statistics, health, environment, disaster-management, labour, agriculture and other public agencies.
3. Recognised intergovernmental or educational organisations such as UNESCO, UNICEF, WHO and regional education bodies.
4. Established local news organisations for timely context. News reports are leads, not proof that a law or curriculum rule changed.
5. Other sources only after credibility review.

Record source URL, publisher, country, topic, publication/effective date, retrieval date and factual summary. Link to originals and respect copyright.

## Fiji working profile

Use the existing Fiji National Curriculum Framework (2013) as the working framework until an authorised replacement is officially adopted and takes effect. Use it with applicable current subject syllabuses, Ministry guidance and school-approved requirements. Do not infer exact subject indicators from the framework alone.

Starter source register:
- Fiji Ministry of Education: https://www.education.gov.fj/
- Fiji Government: https://www.fiji.gov.fj/
- Parliament of Fiji: https://www.parliament.gov.fj/
- Fiji Ministry of Health: https://www.health.gov.fj/
- Fiji Ministry responsible for Environment and Climate: https://mecc.gov.fj/
- Fiji Bureau of Statistics: https://www.statsfiji.gov.fj/
- Fiji Meteorological Service: https://www.met.gov.fj/
- Fiji National Disaster Management Office: https://www.ndmo.gov.fj/
- FinED Fiji: https://www.nfitfiji.com/

These are starter URLs, not proof that every site exposes an RSS feed or machine-readable change log. Validate the endpoints before claiming monitoring is active.

## Processing and automatic learning inclusion

For each discovered item, PacEdu should:
1. Fetch from an allowlisted HTTPS source and record retrieval time.
2. Detect duplicates and page revisions; retain publication/effective dates.
3. Classify country, topic, urgency, age suitability, affected classes/subjects and relevant curriculum outcomes.
4. Separate confirmed official requirements from proposals, consultations, commentary and news reporting.
5. Generate original age-appropriate activities and four ability versions: Supported Start, Developing, Working at Class Goal and Extension.
6. Attach source facts, learning objectives, teacher notes, answer guidance, assessment criteria and safety/privacy guidance.
7. Check factual grounding, reading level, accessibility, safeguarding, privacy, copyright, bias and country relevance.
8. Route the activity into the country-specific library with status and an audit trail.

## Publication rules

- Official mandatory change: verify the authoritative instrument, jurisdiction and effective date. A qualified curriculum/editorial review is required before changing a student's required syllabus path. After approval, publish to affected country/classes/subjects and retain the old version.
- Current-affairs learning: may be automatically added as a clearly labelled, source-linked awareness activity after safety, relevance and duplication checks. Do not misrepresent it as an official syllabus requirement.
- Unverified report, proposal or consultation: label Developing / verify. Do not silently replace curriculum or present proposals as settled fact.
- Urgent safety/public-health notice: show a source-linked notice promptly; distinguish official advice from generated teaching material and never replace emergency guidance with AI interpretation.

Automatic means discovering, classifying, drafting, linking and routing content without requiring users to search manually. It does not mean silently changing formal assessment rules, inventing an official indicator, or publishing unsafe or unverified advice.

## Curriculum version migration

Each country needs a versioned profile with framework name/version, status, adoption authority, publication date, effective date, transition period, source URL and review history. When a new framework takes effect:
- compare old and new outcomes/indicators;
- map unchanged, revised, retired and new outcomes;
- update affected activities, term plans, revision/exam packs, rubrics and teacher guidance;
- retain historical work linked to the curriculum version that applied when assigned;
- test affected workflows and obtain required educator review before changing formal learning paths.

Use the official instrument to determine effective dates; do not rely on news alone when the instrument is available.

## Starter global research-source register

The source registry should grow by country and topic. Initial international discovery sources include:
- UNICEF Pacific research and reports: https://www.unicef.org/pacificislands/research-and-reports
- UNICEF Pacific education evidence: https://www.unicef.org/pacificislands/what-we-do/education
- WHO country research and technical guidance: https://www.who.int/
- UNESCO education and research: https://www.unesco.org/
- World Bank country research: https://www.worldbank.org/
- FAO food, agriculture and nutrition research: https://www.fao.org/
- International Labour Organization: https://www.ilo.org/
- UNDP country research: https://www.undp.org/
- World Bank data: https://data.worldbank.org/
- UNESCO Institute for Statistics: https://uis.unesco.org/

These global sources supplement, never replace, the selected country's official sources. Confirm each specific report's relevance, publication date, methods and conclusions before converting it into a learning activity.

## Transparency

Every activity should retain country, curriculum version, topic/source, source date, retrieval date, affected outcome or outcome-mapping-pending status, ability band, review status and last-updated date. Teachers must be able to report errors. Keep a change log and rollback path.

## Implementation boundary

This policy and starter source register are documentation/configuration scaffolding. A live scheduled crawler, durable change detection, automatic content generation/publication and all-country coverage require separate implementation, tests, source-by-source validation and deployment. Do not describe these as active until those checks pass.
