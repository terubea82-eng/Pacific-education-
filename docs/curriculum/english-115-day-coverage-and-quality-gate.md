# PacEdu English — 115-Day Worksheet Coverage and Quality Gate

**Branch:** `pacedu/english-ece-form7-staging-20261119`  
**Pull request:** #377 (draft only)  
**Last audit:** 22 November 2026  
**Scope:** ECE, Classes 1–8, Forms 1–7; 115 teaching days; Copper, Bronze, Silver and Gold.

## Subject-box pathway navigation

The English Subject Box now has four separate pathway links for each of the 16 levels. Each link opens that level's printable viewer with the selected pathway preselected. The teacher chooses a learning day and can print/save the selected learner worksheet. The viewers were updated to parse both `# Day` and `## Day` headings.

This is a navigation/print workflow improvement. It does not, by itself, certify the educational completeness or quality of every worksheet.

## Coverage count

- 16 levels.
- 115 planned learning days per level.
- 4 pathway worksheet versions per day.
- Target: 460 pathway worksheet versions per level and 7,360 across the programme.

The existing worksheet source files for ECE, Classes 1–8 and Forms 4–6 were inspected and contain 460 day/pathway headings each. Form 1, Form 2, Form 3 and Form 7 source files are committed on this branch; large-file retrieval limits prevented full text extraction in this audit, so their detailed content counts require a repository-side check.

## Quality gate findings

### ECE
- 460 play-based response/observation worksheet versions are present.
- The ECE material appropriately allows speech, home language, sign, gesture, pointing, object choice, AAC, movement, drawing, mark-making and adult scribing.
- Still requires Fiji ECE educator review and exact authorised source/outcome mapping.

### Class 1 and Class 2
- 460 pathway worksheet versions per level are present.
- Some activities still refer to teacher-selected targets or generic theme examples rather than embedding every exact stimulus/reading text in the learner page.
- Improve standalone task specificity and provide matching teacher-only marking guides before calling these final learner downloads.

### Classes 3–8
- 460 pathway headings per level are present.
- The inspected printable worksheet bodies have empty fields for learning intention, working indicator, task and worked example. The matching daily activity plans contain usable teacher-led activities, worked examples, pathway scaffolds, evidence, marking guidance and next steps.
- These worksheet bodies are **NOT READY**. Rebuild each learner worksheet from its matching daily activity and add the full learner stimulus/text, task steps, answer space and accessible response methods.

### Forms 4–6
- 460 pathway headings per level are present.
- The inspected printable worksheet bodies also have empty learning-intention, indicator, task and worked-example fields.
- These worksheet bodies are **NOT READY**. Rebuild from the level-specific daily activity plans, using the correct senior-secondary demand and the school's authorised syllabus.

### Forms 1, 2, 3 and 7
- Separate 115-day printable source/viewer entries are staged.
- Detailed per-day content still requires complete repository-side verification and educator review. Form 1 = Year 7 and Form 2 = Year 8 in the owner's level mapping. Do not use the 2014 Years 9–10 syllabus for those levels.
- Do not mark these packs final until every day's four worksheets and marking guidance have been inspected.

## Release blockers

1. Regenerate incomplete worksheet bodies from their matching daily activity plans; do not leave blank template fields.
2. Ensure every learner worksheet contains the full stimulus/instructions, worked example, pathway-specific tasks, and response space. Where a reading passage is needed, include it on each pathway worksheet so learners do not need another group's page or a shared sheet.
3. Add or verify a separate teacher marking guide for each level/week/pathway, with accepted synonyms and equivalent correct responses.
4. Fiji-qualified educators must review content and suitability; official curriculum source title, edition, exact outcome/indicator and page must be verified separately.
5. Test each of the 64 pathway links (16 levels × 4 pathways), 115-day selector, mobile layout and Android Chrome print preview.
6. Obtain fresh CI results and keep the PR in draft until checks pass.

## Safety / deployment boundary

No merge, production Pages deployment, Firebase mutation, learner-progress mutation, APK replacement or change to protected voice/navigation is authorised by this staging work. PR #341 remains untouched and unmerged.
