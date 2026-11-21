# PacEdu Subject-Box Worksheet Staging Register

**Branch:** `pacedu/subject-box-content-staging-20261122`  
**Base:** `main` at `37db17295e5b19ed161e81bc9ac40414fcef785c`  
**Status:** STAGING ONLY — not merged, not deployed, not visible in the live app.

This register is the staging index for subject-specific worksheet files. A subject is not considered complete merely because it exists in the selector/catalog.

## Required subject-box structure

```text
Subject box
└── Class-specific entry
    ├── Copper — five separate daily learner worksheets
    ├── Bronze — five separate daily learner worksheets
    ├── Silver — five separate daily learner worksheets
    ├── Gold — five separate daily learner worksheets
    └── Teacher resources — separate lesson plan, notes and marking guide
```

Each learner worksheet must be independently usable and include learner details, the full passage/instructions, a worked example, six Bloom levels in order, generous answer space and its own marking guide. All four pathways address the same objective with differentiated scaffolding.

## Class 3 — Term 2, Week 7 (overall Week 16)

| Subject box | Staging content file | Status |
|---|---|---|
| Agriculture | `docs/worksheets/class3-agriculture-term2-week7.md` | Conversation draft only; exact text not yet staged |
| Arts | `docs/worksheets/class3-arts-term2-week7.md` | Conversation draft only; exact text not yet staged |
| Mathematics | `docs/worksheets/class3-mathematics-term2-week7.md` | Conversation draft only; exact text not yet staged |
| Social Science | `docs/worksheets/class3-social-science-term2-week7.md` | Conversation draft only; exact text not yet staged |
| Technology | `docs/worksheets/class3-technology-term2-week7.md` | **STAGED** — 20 individual learner papers (5 days × 4 pathways); teacher review pending |
| Home Economics | `docs/worksheets/class3-home-economics-term2-week7.md` | **STAGED** — 20 individual learner papers (5 days × 4 pathways); teacher review pending |

## Publication and safety gates

- Keep every new worksheet file under its own subject path; never mix subjects or ability groups into one learner download.
- Curriculum indicators remain PacEdu-provisional until checked against the applicable current Fiji Ministry syllabus and source edition.
- Teacher review status remains `PENDING_TEACHER_REVIEW`.
- No learner records, Firebase data, live Pages deployment, production activation or Android APK are changed by this staging register.
- Do not merge this branch without explicit owner approval and successful tests for subject selection, class filtering, four separate daily downloads and teacher-only marking guides.
