# Pacedu Locked Pilot Conversation Record

Purpose: This file is an in-app record of the protected Pacedu pilot agreement. It preserves the implementation requirements agreed for the controlled pilot; it is not a transcript of the private ChatGPT conversation.

## Protected baseline
- Product: Pacific Education (Pacedu)
- Pilot: controlled pilot; not production
- Protected voice foundation: #856-derived voice controller
- Prior verified baseline build: Android Pilot Build run 37725161916
- Prior verified APK SHA-256: fe8b18e04c529b437b337c092613f17bb49d0625d41379e1604b792a106cb902
- Baseline reference commit before this record: a34660d9510f8c23214d13af1cc9216e3ef4bed2

## Mandatory protected requirements
1. Preserve the #856 voice system; do not replace it with a no-sound voice implementation.
2. Use one authoritative mandatory automatic Welcome experience; prevent duplicate automatic Welcome messages.
3. AI Playback is a two-person conversation with distinct voices about Pacific Education's importance and purpose.
4. The Welcome introduces Tion Terubea as Owner of Pacific Education and states 21 years of practical classroom teaching experience in Fiji, a small island nation in the South Pacific.
5. The introduction explains that Pacedu was created from real classroom experience to reduce unnecessary teacher workload, understand learners, identify strengths and areas needing development, and support evidence of progress.
6. Pacedu is Pacific-focused, with potential global support after appropriate development and verification.
7. Learning continuity must support disruption from natural disasters, pandemics, emergencies, conflict, displacement, isolation, and limited connectivity; offline-first remains important.
8. Pacedu aims to support learners experiencing disability or poverty.
9. The mandatory Welcome ends with: "Press Next to begin registration."
10. Preserve page-by-page navigation, user-facing active boxes, accessibility controls, role workspaces, learning activities, assessment, progress, and pilot governance controls.
11. Buy Plans/payment functionality remains inactive during the controlled pilot except for the front-page notice.
12. Android backup remains disabled for the controlled pilot unless deliberately changed and re-verified.

## Protection rule
Future changes must preserve this record and the protected voice/navigation requirements unless the Owner explicitly changes them. Any change affecting these requirements must be verified before a new pilot APK is accepted.

## Important distinction
This record does not contain the private chat transcript. It is the application-facing implementation record of the locked agreement.
