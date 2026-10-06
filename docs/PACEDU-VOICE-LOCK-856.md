# Pacific Education — Protected Voice Lock (Build #856)

Status: **LOCKED / PROTECTED**

This file defines the controlled-pilot voice boundary for Pacific Education.

## Protected baseline

The following #856 voice components must not be replaced, deleted, or rewritten as part of ordinary pilot feature work:

- `src/js/pacificEducationSpeechVoice.js`
- `src/js/pacificEducationMandatoryVoiceNavigation.js`

The #856 voice baseline is the authoritative voice controller for the pilot. Future work must be additive around it.

## Required behavior

The protected voice baseline must continue to support:

- mandatory welcome voice through the pilot flow;
- manual Hear Welcome and Stop Speech controls;
- guided Next voice instructions;
- accessible speech controls and voice alternatives;
- preservation of the two-person AI Playback welcome experience;
- cross-device/native voice compatibility where already provided by the protected implementation.

## Change rule

Do not replace the #856 voice controller with a new speech engine, simplified one-person TTS implementation, or later no-voice implementation.

Future repairs may add compatibility, accessibility, navigation, testing, or integration layers **around** the protected files, but the protected files themselves require an explicit owner-controlled voice release decision.

## Pilot safety

A voice-related feature is not considered complete merely because a page loads. The protected voice baseline must remain present and callable, and the pilot must continue to preserve the #856 voice path.

This lock is intentionally separate from normal feature work so future Pacedu adjustments can continue without accidentally removing the working #856 voice system.
