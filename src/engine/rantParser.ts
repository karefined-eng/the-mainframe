import type { DomainKey } from "../App";

export interface ParsedItem {
  domain: DomainKey;
  title: string;
  notes?: string;
  tags?: string[];
  action_trigger?: string;
  is_software_build?: boolean;
  confidence: number;
}

export interface ParsedRantResult {
  rawTranscript: string;
  items: ParsedItem[];
  recommendedDomains?: string[];
}

export interface ParseOptions {
  activeDomains?: DomainKey[];
}

const DOMAIN_PATTERNS: {
  domain: DomainKey;
  keywords: RegExp[];
  actionTriggerRegex?: RegExp;
}[] = [
  {
    domain: "experiences",
    keywords: [
      /\b(parachute|skydive|jump off|jump out of|hike|hiking|mountain|waterfall|bucket list|travel to|adventure|visit|climb|safari|bungee)\b/i,
    ],
  },
  {
    domain: "build_ideas",
    keywords: [
      /\b(build an app|build a tool|build software|prototype|image viewer|cli tool|tauri|react|rust|backend|frontend|api endpoint|develop|code an app|feature for an app)\b/i,
    ],
  },
  {
    domain: "certifications",
    keywords: [
      /\b(certification|coursera|course|degree|exam|certificate|license|curriculum|accreditation)\b/i,
    ],
  },
  {
    domain: "acquisitions",
    keywords: [
      /\b(buy|purchase|order|monitor|keyboard|laptop|hardware|gear|cost under|\$\d+|shopping)\b/i,
    ],
  },
  {
    domain: "ventures",
    keywords: [
      /\b(business|venture|revenue|startup|monetize|client|mrr|pricing|company|commercial)\b/i,
    ],
  },
  {
    domain: "writing",
    keywords: [
      /\b(essay|research paper|write an article|blog post|thesis|write about|deep dive on|publish)\b/i,
    ],
  },
  {
    domain: "skills",
    keywords: [
      /\b(master|practice|learn rust|level up|skill|technique|fluency|proficiency)\b/i,
    ],
  },
  {
    domain: "goals",
    keywords: [
      /\b(goal|milestone|target|save \$|run a marathon|finish by|deadline)\b/i,
    ],
  },
  {
    domain: "journal",
    keywords: [
      /\b(today was|felt like|exhausting|exhausted|brain was fried|feeling|reflection|introspective|tired|grateful|dear diary|my thoughts today)\b/i,
    ],
  },
];

const ACTION_TRIGGER_REGEX = /\b((?:every|when|whenever|at \d+|on monday|on tuesday|on wednesday|on thursday|on friday|on saturday|on sunday|while drinking|in my home office|after [a-z]+)[\w\s,]+)/i;

export function parseRantTranscript(transcript: string, _options?: ParseOptions): ParsedRantResult {
  const trimmed = transcript.trim();
  if (!trimmed) {
    return { rawTranscript: transcript, items: [] };
  }

  // Split transcript into sentence chunks or multi-clause segments
  const segments = trimmed
    .split(/(?:\r?\n)+|(?<=[.!?])\s+(?=[A-Z0-9])|;\s+/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const items: ParsedItem[] = [];

  for (const segment of segments) {
    let matchedDomain: DomainKey = "journal"; // fallback default
    let highestScore = 0;

    for (const rule of DOMAIN_PATTERNS) {
      for (const pattern of rule.keywords) {
        if (pattern.test(segment)) {
          highestScore += 2;
          matchedDomain = rule.domain;
          break;
        }
      }
    }

    // Software build flag detection
    const isSoftware =
      matchedDomain === "build_ideas" ||
      /\b(app|software|build|tauri|react|cli|code|repo|tool)\b/i.test(segment);

    // Clean title from segment
    let title = segment.replace(/^(I want to|I plan to|I had this crazy idea to|Also, for work, I want to|And I really need to|Oh, and|Finally,)\s+/i, "");
    title = title.charAt(0).toUpperCase() + title.slice(1);
    if (title.length > 60) {
      // Find a clean break
      const breakIdx = title.indexOf(",", 25);
      if (breakIdx > 0 && breakIdx < 60) {
        title = title.substring(0, breakIdx);
      } else {
        const words = title.split(" ");
        title = words.slice(0, 8).join(" ");
      }
    }
    title = title.replace(/[.!?]+$/, "");

    // Extract action trigger
    let actionTrigger: string | undefined;
    const triggerMatch = segment.match(ACTION_TRIGGER_REGEX);
    if (triggerMatch) {
      actionTrigger = triggerMatch[0].trim();
    }

    items.push({
      domain: matchedDomain,
      title: title || segment.slice(0, 50),
      notes: segment,
      action_trigger: actionTrigger,
      is_software_build: isSoftware,
      confidence: highestScore > 0 ? 0.9 : 0.6,
      tags: [matchedDomain.replace("_", "-")],
    });
  }

  return {
    rawTranscript: transcript,
    items,
  };
}
