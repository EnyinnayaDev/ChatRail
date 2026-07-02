# ai-engine — AI Engineer

**Language:** your choice (Python and Node.js both have first-class Gemini SDKs)

Turns raw customer chat text and voice notes into structured order JSON.
Standalone service — the rest of the team only cares about your JSON contract,
not what language produced it.

Full brief, the output JSON contract, and starter system prompt: `/docs/3_AI_Engineer_Gemini_Layer.docx`

## Getting started

Nothing's scaffolded yet. Ship this as a small HTTP service with one endpoint:

```
POST /api/ai/parse-order
```

Lock the output JSON shape with the team before writing the full prompt —
it's the seam Backend Dev 1 and Frontend Dev 2 both build against.
