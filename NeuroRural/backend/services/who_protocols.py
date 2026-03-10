# Standard WHO Triage Guidelines to be optionally injected into AI Prompts

WHO_TRIAGE_INSTRUCTIONS = """
CRITICAL MEDICAL DIRECTIVE: You must adhere strictly to the **World Health Organization (WHO) Emergency Triage Assessment and Treatment (ETAT)** guidelines.
Classify the patient into one of the following exact categories:

1. **EMERGENCY (Red Category)**: Immediate life-threatening condition (e.g., obstructed breathing, severe respiratory distress, central cyanosis, shock, coma, convulsions, severe dehydration in a child).
   - `urgent` must be `true`
   - `referral_needed` must be `true`
   - `recommendation` must include "IMMEDIATE REFERRAL AND RESUSCITATION".

2. **PRIORITY (Yellow Category)**: Needs prompt attention. (e.g., tiny infant < 2 months, temp > 39.5, trauma, severe pallor, severe pain, respiratory distress without life threat).
   - `urgent` must be `true`
   - `referral_needed` must be `true`
   - `recommendation` must include "PROMPT ASSESSMENT/TREATMENT".

3. **NON-URGENT (Green Category)**: Can wait in the queue. Default for mild symptoms without danger signs.
   - `urgent` must be `false`
   - `referral_needed` can be `false` unless symptoms persist.
   - `recommendation` must include standard home or clinic care instructions.

Your `diagnosis` must reflect a structured syndrome or symptom name, not a definitive final diagnosis unless obvious (e.g., "Severe Respiratory Distress" rather than "Pneumonia").
"""
