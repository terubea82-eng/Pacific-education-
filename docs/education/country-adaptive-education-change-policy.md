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


## Global problem-solving and practical citizenship learning (mandatory)

PacEdu learning should help students investigate problems affecting their own community, country, region and other nations. The aim is informed, peaceful, evidence-based problem-solving—not memorising headlines, blaming groups, or assuming one solution works everywhere. Use the UN Sustainable Development Goals as one broad discovery framework, alongside each country's own priorities and curriculum.

### Required issue coverage

The issue discovery system should cover all relevant areas, not just the examples below:
- Food security, crop and vegetable prices, farming, fisheries, nutrition and food waste.
- Poverty, inequality, household costs, housing, homelessness and access to essential services.
- Education access, literacy, numeracy, school attendance, inclusion, disability access and teacher support.
- Physical and mental well-being, disease prevention, sanitation, clean water and safe health information.
- Employment, wages, working conditions, vocational skills, entrepreneurship and changing labour-market needs.
- Transport, roads, public infrastructure, connectivity, energy reliability and affordable energy.
- Climate change, cyclones, floods, drought, disaster preparedness, coastal change and community resilience.
- Waste, pollution, biodiversity, forests, soil, oceans, freshwater and responsible resource use.
- Digital access, online scams, misinformation, privacy, cybersecurity, AI literacy and responsible technology.
- Personal and community safety, child protection, violence prevention, accessibility and emergency readiness.
- Public services, consumer protection, fair access, public spending, accountability, laws and rights.
- Culture, language, heritage, social inclusion, peaceful cooperation and international development.
- Any new or emerging issue supported by credible evidence, including issues identified by students and communities.

This list is a discovery taxonomy, not a claim that every issue exists in every country or that every report is reliable. Relevance, urgency, affected groups and local evidence must be assessed.

### Required student investigation cycle

Every suitable issue-based learning sequence should guide students through:
1. **Identify:** State the problem clearly and identify who is affected, where, when and how seriously.
2. **Gather evidence:** Use observations, safe interviews with consent, class surveys that protect privacy, official statistics, credible research and reliable local reporting. Record source, date, units and sample limitations.
3. **Check reliability:** Separate verified facts from claims, opinions, estimates, predictions and proposals. Compare more than one credible source where possible.
4. **Investigate causes:** Build a cause map and distinguish root causes, contributing factors and symptoms. Do not treat correlation as proof of cause or assume a person or group is to blame without evidence.
5. **Hear different perspectives:** Consider residents, students, workers, businesses, farmers, public agencies and affected or disadvantaged groups respectfully.
6. **Develop options:** Produce more than one feasible response, including prevention and short- and long-term actions.
7. **Compare trade-offs:** Estimate cost, labour, materials, time, environmental impact, fairness, risks, maintenance and who pays or benefits. Identify unintended consequences.
8. **Choose and plan:** Justify a proposal with evidence, responsibilities, resources, partners, timeline, permissions and safeguarding measures.
9. **Take safe action:** Complete an age-appropriate practical activity, prototype, garden, audit, awareness resource, design, service project or proposal. Obtain adult supervision and permission where needed.
10. **Measure results:** Define indicators before action; compare baseline and follow-up; report what changed, what did not, costs, limitations and next steps.
11. **Share responsibly:** Present findings to the class or appropriate community partners, protect private information, cite sources and invite constructive feedback.
12. **Review and improve:** Revise the solution when evidence shows it is ineffective, unsafe, unaffordable or unfair.

### Age and ability adaptation

- ECE and early primary: noticing and describing problems, picture sorting, counting, simple planting, observation, sharing and supervised care.
- Upper primary: surveys with teacher support, measurements, charts, simple budgets, interviews with permission and small group solutions.
- Secondary: source evaluation, statistics, causal reasoning, cost-benefit comparisons, scientific investigations, prototypes, business/community plans and evidence-based presentations.
- Senior secondary: more advanced data analysis, systems thinking, policy options, financial modelling, research methods, feasibility and evaluation—within curriculum and safeguarding requirements.

Provide the same core issue at four ability bands: Supported Start, Developing, Working at Class Goal and Extension. Differentiate reading load, scaffolding, data complexity and independence without lowering dignity or excluding students from meaningful participation.

### Practical action and safety rules

Students may conduct school/community gardens, food-waste audits, water-use observations, accessibility checks, recycling projects, local-price comparisons, safe public-information campaigns, energy-saving measurements and supervised prototypes. They may write evidence-based recommendations to relevant authorities.

Students must not be instructed to trespass, handle hazardous waste or chemicals, confront suspected offenders, investigate private individuals, publish personal data, provide medical/legal diagnoses, conduct unsafe fieldwork, or undertake political campaigning on behalf of the school. Activities involving money, vulnerable people, public facilities or sensitive topics require appropriate adult oversight, permissions and safeguarding.

### Local and international comparison

For a local issue, begin with the selected country and community. For a cross-country comparison, use comparable definitions, time periods, units and population groups; explain when the data are not comparable. Students should ask what can be learned from another country and what must be adapted to local climate, laws, culture, resources and needs. Never copy a proposed solution without checking feasibility and unintended effects.

### Evidence-to-action record

Each issue or student project should record:
- issue ID, country/community, topic and date identified;
- problem statement and affected population;
- source links, publication dates, evidence type, data units and reliability limitations;
- confirmed facts, uncertainties and alternative explanations;
- possible causes and evidence supporting each cause;
- options considered and their costs, risks, benefits, fairness and environmental effects;
- selected action and reason for selection;
- curriculum version, class, subject, learning objectives and verified achievement indicator or `outcome-mapping-pending`;
- ability band, materials, adult-supervision needs, permissions and safety checks;
- baseline, success indicators, follow-up results, student reflection and review status;
- teacher/editor review, last-updated date and version history.

PacEdu may automatically discover and classify candidate issues and draft age-appropriate learning activities. It must not claim a national problem has been solved, that an intervention caused a change, or that a proposal is official policy without suitable evidence and verification. National-level impact claims require stronger evidence than a single classroom project.


## Mandatory curriculum-outcome alignment for every learning item

**No PacEdu worksheet, daily activity, project, practical task, revision question, mock examination or examination item may be labelled curriculum-aligned unless it is linked to a verified learning outcome, achievement indicator, concept or skill in the applicable country, curriculum version, class/year/form and subject.**

Each learning item must store:
- country and jurisdiction, school year/class/form, subject and applicable curriculum framework/version;
- official syllabus or curriculum source URL and source document/version/date;
- exact outcome/achievement-indicator identifier and exact wording when available, with page/section reference where possible;
- the concept/skill being taught and the intended student learning objective;
- the activity steps and explanation of how they teach or practise that outcome;
- assessment question or performance task, answer guidance/rubric and explicit success criteria;
- accommodations and versions for Supported Start, Developing, Working at Class Goal and Extension, all targeting the same core outcome unless the curriculum explicitly specifies progression;
- evidence to collect, review status, reviewer, last-verified date and change history.

### Alignment validation and fail-safe behaviour

1. Verify the curriculum and syllabus for the selected country, school level, subject and applicable effective date using an authoritative source.
2. Match the activity to the exact outcome/indicator. A broad topic match alone is not sufficient.
3. Confirm the activity actually teaches the outcome and the assessment measures it. For example, an activity that asks students only to memorise a definition must not claim to assess analysis, investigation or problem-solving.
4. Confirm age/grade suitability, prerequisite knowledge, progression, accessibility, safety and local relevance.
5. When the official outcome cannot be verified, label the item outcome-mapping-pending and do not label it officially curriculum-aligned or use it to claim mastery of that outcome. It may be offered only as a clearly labelled supplemental/current-affairs exploration with teacher review, without displacing required curriculum learning.
6. Do not invent indicator numbers, quote unofficial wording as official, or reuse one country's indicator as if it belonged to another country's curriculum.
7. Where an activity legitimately integrates several subjects, record the primary outcome and each additional verified outcome separately. Do not add subject tags without an educationally meaningful link.
8. Recheck mappings when a syllabus changes. Preserve historical activity and assessment records against the curriculum version that applied when assigned; migrate future activities only after mapping and required review.
9. Require tests to detect missing mappings, invalid curriculum versions, mismatched class/subject, missing assessment criteria and unverified official claims. Block release of a formal curriculum-aligned pack when required mappings are missing.

### Distinguish curriculum learning from real-world enrichment

A real-world issue such as high vegetable prices can be used across subjects, but each activity must have its own outcome link. A Mathematics activity might assess calculations or data interpretation; an English task might assess reading, speaking or persuasive writing; a Science investigation might assess plant needs or experimental observation; Social Studies might assess community needs or resource use. These are examples of possible connections, not claims about exact Fiji indicators. Verify the applicable syllabus before assigning official outcome codes.

The national-problem-solving programme must therefore enrich and contextualise the curriculum—not replace it with unrelated activities. If a real-world problem does not directly fit an available outcome, label it as an enrichment activity or wait for educator mapping; do not force a false curriculum match.

### Publication gate

The release gate for any formal daily plan, worksheet pack or assessment is: **verified curriculum source + exact outcome/indicator + meaningful activity alignment + matching assessment criteria + class/subject validation + safety/accessibility review**. If any required check fails, keep the item in draft/review status and show the reason. This is a product requirement; it must not be described as enforced by the live app until implemented and tested.
