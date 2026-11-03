const KNOWN_TRIGGERS = [
  {
    pattern: /\bdust\b|\bdust mite/i,
    type: "environmental_trigger",
    label: "Dust",
    associatedAgents: ["dust-mite proteins (Der p 1 / Der f 1)"],
    note: "Dust is an environmental trigger, not proof of a medicine or chemical allergy.",
  },
  {
    pattern: /\bpenicillin\b|\bamoxicillin\b/i,
    type: "medicine_family",
    label: "Penicillin-family medicine",
    associatedAgents: ["penicillin-family beta-lactam compounds"],
    note: "The exact medicine and reaction should be confirmed by a qualified clinician.",
  },
  {
    pattern: /\bsulfa\b|\bsulfonamide/i,
    type: "medicine_family",
    label: "Sulfonamide medicine",
    associatedAgents: ["sulfonamide-containing compounds"],
    note: "Not all sulfur-containing products are equivalent; pharmacist review is required.",
  },
  {
    pattern: /\blatex\b/i,
    type: "material",
    label: "Latex",
    associatedAgents: ["natural rubber latex proteins"],
    note: "This records a reported trigger and does not diagnose the allergy.",
  },
];

export function analyzeAllergyText(value) {
  const text = String(value || "").trim();
  const matches = KNOWN_TRIGGERS.filter((entry) => entry.pattern.test(text));
  return {
    sourceText: text,
    matchedTriggers: matches.map(({ pattern, ...entry }) => entry),
    associatedAgents: [...new Set(matches.flatMap((entry) => entry.associatedAgents))],
    reviewRequired: text.length > 0,
    disclaimer: "This is a safety-screening aid, not a diagnosis. Confirm allergies and chemical identity with a qualified pharmacist or clinician.",
  };
}
