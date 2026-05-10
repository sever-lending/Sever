const BAD_WORDS = [
  "fuck", "f\\*ck", "fuk", "fucc", "fvck",
  "shit", "sh1t", "sh!t", "sht",
  "ass", "a\\$\\$", "a55",
  "bitch", "b1tch", "b!tch",
  "cunt", "c\\*nt",
  "dick", "d1ck",
  "cock", "c0ck",
  "pussy", "p\\*ssy",
  "nigger", "n\\*gger", "n1gger",
  "nigga", "n\\*gga",
  "faggot", "f\\*ggot", "fag",
  "retard", "ret\\*rd",
  "whore", "wh\\*re",
  "slut", "sl\\*t",
  "bastard",
  "asshole", "a\\*\\*hole",
  "piss",
  "twat",
  "wank", "wanker",
  "spic", "sp\\*c",
  "kike",
  "chink",
  "wetback",
];

const PATTERNS = BAD_WORDS.map(w => new RegExp(`(^|[\\s\\W])${w}([\\s\\W]|$)`, "i"));

export function isInappropriate(text: string): boolean {
  const t = text.toLowerCase().replace(/[*@!0]/g, c => ({
    "*": "", "@": "a", "!": "i", "0": "o"
  }[c] ?? c));
  return PATTERNS.some(p => p.test(t));
}

export function assertClean(text: string, fieldName = "Message"): string | null {
  if (isInappropriate(text)) {
    return `${fieldName} contains inappropriate language and cannot be submitted.`;
  }
  return null;
}
