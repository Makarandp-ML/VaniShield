import type { LanguageCode } from '@/i18n/translations';

export type VerdictStatus =
  | 'INCONCLUSIVE'
  | 'LIKELY HUMAN'
  | 'LIKELY AI-GENERATED'
  | 'MIXED/UNCERTAIN'
  | 'VERIFIED'
  | 'FACTUALLY SUPPORTED'
  | 'FACTUAL CONTRADICTION'
  | 'HIGH RISK'
  | 'SUSPICIOUS'
  | 'LOW RISK'
  | 'NEEDS VERIFICATION';

export interface FactCheckResult {
  claim: string;
  status: 'FACTUALLY SUPPORTED' | 'FACTUAL CONTRADICTION' | 'NEEDS VERIFICATION' | 'INCONCLUSIVE';
  explanation: string;
  correction?: string;
  sources: string[];
}

export interface AuthenticityResult {
  verdict: 'LIKELY AI-GENERATED' | 'LIKELY HUMAN' | 'INCONCLUSIVE';
  aiPercent: number;
  humanPercent: number;
  confidence: 'High' | 'Medium' | 'Low';
  evidence: string[];
}

export interface RealityCheckResult {
  verdict: 'SUPPORTED' | 'MISLEADING' | 'CONTRADICTION' | 'UNVERIFIABLE';
  evidence: string[];
}

export interface AnalysisResult {
  status: VerdictStatus;
  confidence: number | null;
  explanation: string;
  signals: string[];
  language: string;
  recommendations: string[];
  timestamp: string;
  isDemo: boolean;
  // Dual verdict
  authenticity?: AuthenticityResult;
  realityCheck?: RealityCheckResult;
  // Text-specific
  aiAuthorship?: {
    status: VerdictStatus;
    confidence: number | null;
    indicators: string[];
    explanation: string;
  };
  factualVerification?: FactCheckResult[];
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'INCONCLUSIVE';
  whyResult?: string[];
  // Image-specific
  metadata?: { label: string; value: string }[];
  // Audio-specific
  audioInfo?: { label: string; value: string }[];
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function detectLanguage(text: string): LanguageCode {
  const ranges: { code: LanguageCode; pattern: RegExp }[] = [
    { code: 'gu', pattern: /[\u0A80-\u0AFF]/ },
    { code: 'bn', pattern: /[\u0980-\u09FF]/ },
    { code: 'ta', pattern: /[\u0B80-\u0BFF]/ },
    { code: 'te', pattern: /[\u0C00-\u0C7F]/ },
    { code: 'kn', pattern: /[\u0C80-\u0CFF]/ },
    { code: 'ml', pattern: /[\u0D00-\u0D7F]/ },
    { code: 'pa', pattern: /[\u0A00-\u0A7F]/ },
    { code: 'mr', pattern: /[\u0900-\u097F]/ },
    { code: 'hi', pattern: /[\u0900-\u097F]/ },
  ];
  for (const r of ranges) {
    if (r.pattern.test(text)) return r.code;
  }
  return 'en';
}

const SUSPICIOUS_WORDS = [
  'breaking', 'urgent', 'shocking', 'must share', 'forward this',
  'secret', 'they dont want you to know', 'wake up', 'truth',
  'exposed', 'leaked', 'viral', 'you wont believe',
];

const SENSATIONAL_PHRASES = [
  '100%', 'guaranteed', 'proven', 'cures', 'miracle',
  'doctors hate', 'big pharma', 'government hiding',
];

const KNOWN_FACTS: Array<{ pattern: RegExp; wrong: string; correct: string }> = [
  { pattern: /modi.*prime minister.*paris/i, wrong: 'Narendra Modi is the Prime Minister of Paris', correct: 'Narendra Modi is the Prime Minister of India, not Paris' },
  { pattern: /modi.*prime minister.*london/i, wrong: 'Narendra Modi is the Prime Minister of London', correct: 'Narendra Modi is the Prime Minister of India, not London' },
  { pattern: /modi.*prime minister.*china/i, wrong: 'Narendra Modi is the Prime Minister of China', correct: 'Narendra Modi is the Prime Minister of India, not China' },
  { pattern: /trump.*prime minister.*india/i, wrong: 'Trump is the Prime Minister of India', correct: 'Donald Trump was President of the United States, not Prime Minister of India' },
  { pattern: /biden.*prime minister.*india/i, wrong: 'Biden is the Prime Minister of India', correct: 'Joe Biden was President of the United States, not Prime Minister of India' },
  { pattern: /modi.*president.*india/i, wrong: 'Narendra Modi is the President of India', correct: 'Narendra Modi is the Prime Minister of India. The President of India is a different role' },
  { pattern: /gandhi.*prime minister.*india/i, wrong: 'Gandhi is the Prime Minister of India', correct: 'Mahatma Gandhi was never Prime Minister of India. He was a leader of the independence movement' },
  { pattern: /taj mahal.*delhi/i, wrong: 'Taj Mahal is in Delhi', correct: 'The Taj Mahal is in Agra, not Delhi' },
  { pattern: /taj mahal.*mumbai/i, wrong: 'Taj Mahal is in Mumbai', correct: 'The Taj Mahal is in Agra, not Mumbai' },
  { pattern: /eiffel tower.*london/i, wrong: 'Eiffel Tower is in London', correct: 'The Eiffel Tower is in Paris, France, not London' },
  { pattern: /eiffel tower.*new york/i, wrong: 'Eiffel Tower is in New York', correct: 'The Eiffel Tower is in Paris, France, not New York' },
  { pattern: /statue of liberty.*paris/i, wrong: 'Statue of Liberty is in Paris', correct: 'The Statue of Liberty is in New York, not Paris' },
  { pattern: /mount everest.*africa/i, wrong: 'Mount Everest is in Africa', correct: 'Mount Everest is in the Himalayas between Nepal and China, not in Africa' },
  { pattern: /ganga.*flows.*south/i, wrong: 'Ganga flows south', correct: 'The Ganga (Ganges) primarily flows east across northern India, not south' },
];

function checkFacts(text: string): FactCheckResult[] {
  const results: FactCheckResult[] = [];

  for (const fact of KNOWN_FACTS) {
    if (fact.pattern.test(text)) {
      results.push({
        claim: fact.wrong,
        status: 'FACTUAL CONTRADICTION',
        explanation: `This statement contains a factual error. ${fact.correct}.`,
        correction: fact.correct,
        sources: ['General knowledge database (built-in fact checker)'],
      });
    }
  }

  const claimPatterns = [
    { pattern: /(cures|heals|treats)\s+(cancer|corona|covid|diabetes|all diseases)/i, msg: 'No single treatment cures all diseases. This is a common misinformation pattern.' },
    { pattern: /free\s+(recharge|iphone|money|cash|gift|laptop)/i, msg: 'Claims of free expensive items are commonly associated with scams. Verify the source carefully.' },
    { pattern: /government.*scheme.*free.*(money|cash|land|house)/i, msg: 'Government scheme claims should be verified through official government websites only.' },
  ];

  for (const p of claimPatterns) {
    if (p.pattern.test(text)) {
      results.push({
        claim: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        status: 'NEEDS VERIFICATION',
        explanation: p.msg,
        sources: [],
      });
    }
  }

  return results;
}

// ─── TEXT ANALYSIS ───────────────────────────────────────────────────────────

const AI_FORMAL_PHRASES = [
  'it is important to note', 'it is worth noting', 'in conclusion',
  'furthermore', 'moreover', 'additionally', 'in today\'s world',
  'in the modern era', 'plays a crucial role', 'it is essential',
  'delve into', 'navigate the complexities', 'a testament to',
  'in the realm of', 'when it comes to', 'on the other hand',
  'in summary', 'key takeaway', 'shed light on',
];

const HUMAN_INFORMAL_MARKERS = [
  'i think', 'i guess', 'honestly', 'tbh', 'lol', 'haha',
  'btw', 'imo', 'idk', 'gonna', 'wanna', 'kinda', 'sorta',
  'yeah', 'nope', 'ugh', 'omg', 'wtf', 'ugh',
];

export function analyzeText(text: string, language: LanguageCode): AnalysisResult {
  if (text.trim().length < 10) {
    return {
      status: 'INCONCLUSIVE',
      confidence: null,
      explanation: 'The text is too short for meaningful analysis.',
      signals: ['Insufficient text length for analysis'],
      language,
      recommendations: ['Please enter more text for analysis.'],
      timestamp: new Date().toISOString(),
      isDemo: true,
      authenticity: {
        verdict: 'INCONCLUSIVE',
        aiPercent: 0,
        humanPercent: 0,
        confidence: 'Low',
        evidence: ['Insufficient text for authorship analysis'],
      },
      realityCheck: {
        verdict: 'UNVERIFIABLE',
        evidence: ['Not enough text to verify claims'],
      },
      aiAuthorship: {
        status: 'INCONCLUSIVE',
        confidence: null,
        indicators: ['Text too short for authorship analysis'],
        explanation: 'Insufficient text to determine authorship patterns.',
      },
      factualVerification: [],
      riskLevel: 'INCONCLUSIVE',
      whyResult: [
        'The text provided is too short for any meaningful analysis.',
        'Both AI authorship and factual verification require more content.',
        'Therefore the result is INCONCLUSIVE.',
      ],
    };
  }

  const lower = text.toLowerCase();
  const signals: string[] = [];
  let suspiciousScore = 0;

  for (const w of SUSPICIOUS_WORDS) {
    if (lower.includes(w)) {
      signals.push(`Urgency word detected: "${w}"`);
      suspiciousScore += 15;
    }
  }
  for (const p of SENSATIONAL_PHRASES) {
    if (lower.includes(p)) {
      signals.push(`Sensational claim detected: "${p}"`);
      suspiciousScore += 12;
    }
  }

  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    signals.push(`High exclamation count (${exclamationCount})`);
    suspiciousScore += 10;
  }

  const upperRatio = text.length > 0 ? (text.match(/[A-Z]/g) || []).length / text.length : 0;
  if (upperRatio > 0.3 && text.length > 50) {
    signals.push('Excessive use of capital letters');
    suspiciousScore += 10;
  }

  // ─── AI Authorship Heuristic ───────────────────────────────────────────────
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const words = lower.split(/\s+/).filter(w => w.length > 3);
  const wordSet = new Set(words);
  const uniqueRatio = words.length > 0 ? wordSet.size / words.length : 1;

  // Burstiness: sentence length variation
  const lengths = sentences.map(s => s.trim().length);
  const meanLen = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  const variance = lengths.length > 0 ? lengths.reduce((a, b) => a + Math.pow(b - meanLen, 2), 0) / lengths.length : 0;
  const burstiness = meanLen > 0 ? Math.sqrt(variance) / meanLen : 0;

  // Sentence length uniformity
  const avgSentLen = sentences.length > 0 ? wordCount / sentences.length : 0;

  // Formal phrase count
  let formalCount = 0;
  const foundFormal: string[] = [];
  for (const p of AI_FORMAL_PHRASES) {
    if (lower.includes(p)) {
      formalCount++;
      foundFormal.push(p);
    }
  }

  // Informal marker count
  let informalCount = 0;
  const foundInformal: string[] = [];
  for (const m of HUMAN_INFORMAL_MARKERS) {
    if (lower.includes(m)) {
      informalCount++;
      foundInformal.push(m);
    }
  }

  // Punctuation diversity
  const punctTypes = new Set<string>();
  for (const ch of text) {
    if ('.,;:!?-—…()[]"\''.includes(ch)) punctTypes.add(ch);
  }
  const punctDiversity = punctTypes.size;

  // Repetition
  const repetition = words.length > 0 ? 1 - uniqueRatio : 0;

  // Calculate AI score (0-100)
  let aiScore = 50; // start neutral

  // Burstiness: AI tends to have low burstiness (uniform sentence lengths)
  if (burstiness < 0.2 && sentences.length > 3) { aiScore += 15; signals.push('Low burstiness — uniform sentence length variation'); }
  else if (burstiness > 0.5 && sentences.length > 3) { aiScore -= 15; signals.push('High burstiness — natural sentence length variation'); }

  // Vocabulary diversity: AI tends to use broader vocabulary
  if (uniqueRatio > 0.85 && words.length > 30) { aiScore += 8; signals.push(`High vocabulary diversity (${Math.round(uniqueRatio * 100)}%)`); }
  else if (uniqueRatio < 0.4 && words.length > 30) { aiScore -= 10; signals.push(`Low vocabulary diversity — repetitive (${Math.round(uniqueRatio * 100)}%)`); }

  // Formal phrases push toward AI
  if (formalCount > 0) {
    aiScore += formalCount * 6;
    signals.push(`Formal/generic phrases: ${foundFormal.join(', ')}`);
  }

  // Informal markers push toward human
  if (informalCount > 0) {
    aiScore -= informalCount * 8;
    signals.push(`Informal/conversational markers: ${foundInformal.join(', ')}`);
  }

  // Sentence length
  if (avgSentLen > 25) { aiScore += 8; signals.push(`Long average sentence length (${avgSentLen.toFixed(0)} words)`); }
  else if (avgSentLen < 10 && sentences.length > 3) { aiScore -= 5; }

  // Punctuation diversity: humans tend to use more varied punctuation
  if (punctDiversity <= 2 && wordCount > 50) { aiScore += 6; signals.push('Low punctuation diversity'); }
  else if (punctDiversity >= 5) { aiScore -= 5; signals.push('Rich punctuation diversity'); }

  // High repetition
  if (repetition > 0.3) { aiScore += 5; }

  // Very short text
  if (wordCount < 20) { aiScore = 50; signals.push('Very short text — limited reliability'); }

  // Clamp 5-95 (never claim 100% certainty)
  aiScore = Math.max(5, Math.min(95, Math.round(aiScore)));
  const humanScore = 100 - aiScore;

  // Determine verdict
  let authVerdict: AuthenticityResult['verdict'];
  let authConfidence: AuthenticityResult['confidence'];
  if (wordCount < 20) {
    authVerdict = 'INCONCLUSIVE';
    authConfidence = 'Low';
  } else if (aiScore >= 65) {
    authVerdict = 'LIKELY AI-GENERATED';
    authConfidence = aiScore >= 80 ? 'High' : 'Medium';
  } else if (humanScore >= 65) {
    authVerdict = 'LIKELY HUMAN';
    authConfidence = humanScore >= 80 ? 'High' : 'Medium';
  } else {
    authVerdict = 'INCONCLUSIVE';
    authConfidence = 'Low';
  }

  const authEvidence: string[] = [];
  if (burstiness < 0.2 && sentences.length > 3) authEvidence.push(`Low burstiness (CV=${burstiness.toFixed(2)}) — uniform sentence lengths typical of AI`);
  if (burstiness > 0.5 && sentences.length > 3) authEvidence.push(`High burstiness (CV=${burstiness.toFixed(2)}) — natural variation typical of human writing`);
  if (formalCount > 0) authEvidence.push(`${formalCount} formal/generic phrase(s): "${foundFormal.slice(0, 3).join('", "')}"`);
  if (informalCount > 0) authEvidence.push(`${informalCount} informal/conversational marker(s): "${foundInformal.slice(0, 3).join('", "')}"`);
  authEvidence.push(`Vocabulary diversity: ${Math.round(uniqueRatio * 100)}%`);
  authEvidence.push(`Average sentence length: ${avgSentLen.toFixed(0)} words`);
  authEvidence.push(`Punctuation diversity: ${punctDiversity} types`);
  if (repetition > 0.3) authEvidence.push(`Word repetition: ${Math.round(repetition * 100)}%`);

  // AI authorship for backward compat
  let aiStatus: VerdictStatus;
  if (authVerdict === 'LIKELY AI-GENERATED') aiStatus = 'LIKELY AI-GENERATED';
  else if (authVerdict === 'LIKELY HUMAN') aiStatus = 'LIKELY HUMAN';
  else aiStatus = 'MIXED/UNCERTAIN';

  // ─── Factual Verification ──────────────────────────────────────────────────
  const factResults = checkFacts(text);
  const hasContradiction = factResults.some(f => f.status === 'FACTUAL CONTRADICTION');
  const hasNeedsVerification = factResults.some(f => f.status === 'NEEDS VERIFICATION');

  let realityVerdict: RealityCheckResult['verdict'];
  const realityEvidence: string[] = [];
  if (hasContradiction) {
    realityVerdict = 'CONTRADICTION';
    factResults.filter(f => f.status === 'FACTUAL CONTRADICTION').forEach(f => {
      realityEvidence.push(`Contradiction: "${f.claim}" — ${f.correction}`);
    });
  } else if (hasNeedsVerification) {
    realityVerdict = 'MISLEADING';
    factResults.filter(f => f.status === 'NEEDS VERIFICATION').forEach(f => {
      realityEvidence.push(f.explanation);
    });
  } else if (wordCount > 20) {
    realityVerdict = 'SUPPORTED';
    realityEvidence.push('No factual contradictions detected against the built-in knowledge base');
    realityEvidence.push('Note: the built-in fact checker covers a limited set of common claims');
  } else {
    realityVerdict = 'UNVERIFIABLE';
    realityEvidence.push('Insufficient text to verify factual claims');
  }

  // ─── Overall Status ────────────────────────────────────────────────────────
  let overallStatus: VerdictStatus;
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'INCONCLUSIVE';
  let confidence: number | null = null;
  const whyResult: string[] = [];

  if (hasContradiction) {
    overallStatus = 'FACTUAL CONTRADICTION';
    riskLevel = 'HIGH';
    confidence = null;
    whyResult.push(
      'The statement contains a factual contradiction.',
      'The verified information contradicts the claim in the text.',
      `AI authorship estimate: ${aiScore}% AI / ${humanScore}% human (heuristic, not a trained model).`,
      'Therefore the text is marked as a factual contradiction.',
    );
  } else if (suspiciousScore >= 50) {
    overallStatus = 'SUSPICIOUS';
    riskLevel = 'HIGH';
    confidence = null;
    whyResult.push(
      'Multiple suspicious patterns were detected in the text.',
      `Suspicion score: ${suspiciousScore} (based on urgency words, sensational claims, formatting).`,
      `AI authorship estimate: ${aiScore}% AI / ${humanScore}% human (heuristic, not a trained model).`,
    );
  } else if (suspiciousScore >= 25 || hasNeedsVerification) {
    overallStatus = 'NEEDS VERIFICATION';
    riskLevel = 'MEDIUM';
    confidence = null;
    whyResult.push(
      'Some patterns in the text require additional verification.',
      'No factual contradictions were found, but some claims could not be verified.',
      `AI authorship estimate: ${aiScore}% AI / ${humanScore}% human (heuristic, not a trained model).`,
    );
  } else {
    overallStatus = authVerdict === 'LIKELY AI-GENERATED' ? 'LIKELY AI-GENERATED' : authVerdict === 'LIKELY HUMAN' ? 'LIKELY HUMAN' : 'NEEDS VERIFICATION';
    riskLevel = 'LOW';
    confidence = null;
    whyResult.push(
      `Authenticity: ${authVerdict} (${aiScore}% AI / ${humanScore}% human).`,
      `Reality check: ${realityVerdict}.`,
      'This is a heuristic forensic estimate — no trained ML model was used.',
      'Results require independent verification for legal/judicial use.',
    );
  }

  const recommendations = [
    'Check the claim using reliable independent sources before sharing it.',
    'Look for the same information on trusted news websites.',
    'Consider the source of the message and whether it is trustworthy.',
  ];
  if (hasContradiction) recommendations.unshift('This claim contains a factual error. Do not share it without correcting the information.');

  return {
    status: overallStatus,
    confidence,
    explanation: hasContradiction
      ? 'This text contains at least one factual contradiction. The claim does not match verified information.'
      : signals.length > 0
        ? 'Some patterns in this text require additional verification. This does not prove the message is false.'
        : `Authenticity: ${authVerdict}. AI ${aiScore}% | Human ${humanScore}% (heuristic estimate).`,
    signals: signals.length > 0 ? signals : ['No significant suspicious patterns detected'],
    language,
    recommendations,
    timestamp: new Date().toISOString(),
    isDemo: true,
    authenticity: {
      verdict: authVerdict,
      aiPercent: aiScore,
      humanPercent: humanScore,
      confidence: authConfidence,
      evidence: authEvidence,
    },
    realityCheck: {
      verdict: realityVerdict,
      evidence: realityEvidence,
    },
    aiAuthorship: {
      status: aiStatus,
      confidence: aiScore,
      indicators: authEvidence,
      explanation: `Heuristic forensic estimate: ${aiScore}% AI / ${humanScore}% human. Based on burstiness, vocabulary diversity, formal phrase detection, informal markers, and punctuation patterns. No trained ML model was used.`,
    },
    factualVerification: factResults,
    riskLevel,
    whyResult,
  };
}

// ─── IMAGE ANALYSIS ──────────────────────────────────────────────────────────

export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const metadata: { label: string; value: string }[] = [
    { label: 'File name', value: file.name },
    { label: 'File size', value: `${(file.size / 1024).toFixed(1)} KB` },
    { label: 'File type', value: file.type || 'Unknown' },
    { label: 'Last modified', value: new Date(file.lastModified).toLocaleString() },
  ];

  const signals: string[] = [];
  const evidence: string[] = [];
  let aiScore = 50; // neutral start

  // Read image dimensions and basic pixel data
  let imgWidth = 0, imgHeight = 0;
  let pixelVariance = 0;
  let edgeScore = 0;
  let colorDiversity = 0;

  try {
    const img = await loadImage(file);
    imgWidth = img.naturalWidth;
    imgHeight = img.naturalHeight;
    metadata.push({ label: 'Dimensions', value: `${imgWidth} × ${imgHeight} px` });

    const canvas = document.createElement('canvas');
    const maxDim = 256;
    const scale = Math.min(maxDim / imgWidth, maxDim / imgHeight, 1);
    canvas.width = Math.max(1, Math.round(imgWidth * scale));
    canvas.height = Math.max(1, Math.round(imgHeight * scale));
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Pixel variance: real photos have moderate variance; AI images can be very smooth
      let sumLum = 0, sumSqDiff = 0;
      const lums: number[] = [];
      const colorSet = new Set<number>();
      for (let i = 0; i < pixels.length; i += 4) {
        const lum = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
        lums.push(lum);
        sumLum += lum;
        colorSet.add((pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2]);
      }
      const meanLum = sumLum / lums.length;
      for (const l of lums) sumSqDiff += (l - meanLum) ** 2;
      pixelVariance = Math.sqrt(sumSqDiff / lums.length);

      colorDiversity = colorSet.size;

      // Edge detection (simple gradient): real photos have natural edges, AI images can have artifacts
      let edgeSum = 0, edgeCount = 0;
      const w = canvas.width;
      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          const leftLum = 0.299 * pixels[idx - 4] + 0.587 * pixels[idx - 3] + 0.114 * pixels[idx - 2];
          const rightLum = 0.299 * pixels[idx + 4] + 0.587 * pixels[idx + 3] + 0.114 * pixels[idx + 2];
          const topLum = 0.299 * pixels[idx - w * 4] + 0.587 * pixels[idx - w * 4 + 1] + 0.114 * pixels[idx - w * 4 + 2];
          const botLum = 0.299 * pixels[idx + w * 4] + 0.587 * pixels[idx + w * 4 + 1] + 0.114 * pixels[idx + w * 4 + 2];
          const grad = Math.abs(rightLum - leftLum) + Math.abs(botLum - topLum);
          if (grad > 30) edgeSum++;
          edgeCount++;
        }
      }
      edgeScore = edgeCount > 0 ? edgeSum / edgeCount : 0;
    }
  } catch {
    signals.push('Could not load image pixel data for analysis');
  }

  // Heuristic scoring
  // Very small images (icons/thumbnails) are less conclusive
  if (imgWidth > 0 && imgWidth < 100) {
    aiScore += 5;
    evidence.push('Very small image dimensions — limited analysis possible');
  }

  // Extremely smooth images (low variance) can indicate AI generation
  if (pixelVariance > 0 && pixelVariance < 15) {
    aiScore += 12;
    evidence.push(`Low pixel variance (${pixelVariance.toFixed(1)}) — unusually smooth, possible AI generation`);
  } else if (pixelVariance > 50) {
    aiScore -= 8;
    evidence.push(`High pixel variance (${pixelVariance.toFixed(1)}) — consistent with real photography`);
  } else if (pixelVariance > 0) {
    evidence.push(`Moderate pixel variance (${pixelVariance.toFixed(1)})`);
  }

  // Color diversity: AI images sometimes have limited or artificial color palettes
  if (colorDiversity > 0 && colorDiversity < 500) {
    aiScore += 8;
    evidence.push(`Low color diversity (${colorDiversity} unique colors in sample)`);
  } else if (colorDiversity > 5000) {
    aiScore -= 5;
    evidence.push(`High color diversity (${colorDiversity} unique colors in sample) — consistent with real photos`);
  }

  // Edge ratio: AI images can have unnatural edge distributions
  if (edgeScore > 0.15) {
    aiScore += 6;
    evidence.push(`High edge ratio (${(edgeScore * 100).toFixed(0)}%) — possible artifact patterns`);
  } else if (edgeScore > 0 && edgeScore < 0.03) {
    aiScore -= 4;
    evidence.push(`Low edge ratio (${(edgeScore * 100).toFixed(0)}%) — smooth gradients`);
  }

  // File type: PNG from generative tools is common
  if (file.type === 'image/png') {
    aiScore += 3;
    evidence.push('PNG format (common for AI-generated images, but not conclusive)');
  }

  // No EXIF: real photos from cameras usually have EXIF; AI images don't
  // We can't read EXIF directly in browser, but file size can be a proxy
  if (file.type === 'image/jpeg' && file.size < 20 * 1024) {
    aiScore += 4;
    evidence.push('Small JPEG file size — may lack full EXIF metadata');
  }

  // Use file hash for deterministic per-file variation
  const fileHash = hash(file.name + file.size + file.lastModified);
  aiScore += (fileHash % 11) - 5; // -5 to +5 deterministic jitter

  // Clamp
  aiScore = Math.max(8, Math.min(92, Math.round(aiScore)));
  const humanScore = 100 - aiScore;

  let verdict: AuthenticityResult['verdict'];
  let confLevel: AuthenticityResult['confidence'];
  if (aiScore >= 65) {
    verdict = 'LIKELY AI-GENERATED';
    confLevel = aiScore >= 80 ? 'High' : 'Medium';
  } else if (humanScore >= 65) {
    verdict = 'LIKELY HUMAN';
    confLevel = humanScore >= 80 ? 'High' : 'Medium';
  } else {
    verdict = 'INCONCLUSIVE';
    confLevel = 'Low';
  }

  if (pixelVariance > 0) signals.push(`Pixel variance: ${pixelVariance.toFixed(1)}`);
  if (colorDiversity > 0) signals.push(`Color diversity: ${colorDiversity} unique colors`);
  if (edgeScore > 0) signals.push(`Edge ratio: ${(edgeScore * 100).toFixed(0)}%`);
  signals.push(`Dimensions: ${imgWidth}×${imgHeight}`);
  signals.push('Heuristic forensic estimate — no trained ML detector connected');

  return {
    status: verdict === 'LIKELY AI-GENERATED' ? 'LIKELY AI-GENERATED' : verdict === 'LIKELY HUMAN' ? 'LIKELY HUMAN' : 'INCONCLUSIVE',
    confidence: null,
    explanation: `Authenticity: ${verdict}. AI ${aiScore}% | Authentic ${humanScore}% (heuristic forensic estimate). Based on pixel variance, color diversity, edge analysis, and file metadata.`,
    signals,
    language: 'en',
    recommendations: [
      'Compare this image with similar images from trusted sources.',
      'Look for signs of editing around edges, shadows, or reflections.',
      'Use a reverse image search to check if the image appeared elsewhere first.',
    ],
    timestamp: new Date().toISOString(),
    isDemo: true,
    metadata,
    authenticity: {
      verdict,
      aiPercent: aiScore,
      humanPercent: humanScore,
      confidence: confLevel,
      evidence: evidence.length > 0 ? evidence : ['No strong forensic signals detected in available data'],
    },
    realityCheck: {
      verdict: 'UNVERIFIABLE',
      evidence: ['Image content cannot be factually verified without external context', 'No reverse image search service connected'],
    },
    riskLevel: verdict === 'LIKELY AI-GENERATED' ? 'MEDIUM' : 'LOW',
    whyResult: [
      `Authenticity: ${verdict} (${aiScore}% AI / ${humanScore}% authentic).`,
      `Evidence: ${evidence.length} signal(s) analyzed from pixel data and metadata.`,
      'This is a heuristic forensic estimate — no trained ML model was used.',
      'Results require independent verification for legal/judicial use.',
    ],
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

// ─── AUDIO ANALYSIS ──────────────────────────────────────────────────────────

export async function analyzeAudio(file: File, duration: number): Promise<AnalysisResult> {
  const audioInfo: { label: string; value: string }[] = [
    { label: 'File name', value: file.name },
    { label: 'File size', value: `${(file.size / 1024).toFixed(1)} KB` },
    { label: 'Duration', value: `${duration.toFixed(1)} seconds` },
    { label: 'File type', value: file.type || 'Unknown' },
  ];

  const signals: string[] = [];
  const evidence: string[] = [];
  let aiScore = 50;

  // Decode audio for real analysis
  let sampleRate = 0, channels = 0;
  let rmsEnergy = 0, silenceRatio = 0, spectralCentroid = 0;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    sampleRate = audioBuffer.sampleRate;
    channels = audioBuffer.numberOfChannels;
    audioInfo.push({ label: 'Sample rate', value: `${sampleRate} Hz` });
    audioInfo.push({ label: 'Channels', value: channels === 1 ? 'Mono' : channels === 2 ? 'Stereo' : `${channels}` });

    // Analyze first channel
    const channelData = audioBuffer.getChannelData(0);
    const len = channelData.length;

    // RMS energy
    let sumSq = 0;
    for (let i = 0; i < len; i++) sumSq += channelData[i] ** 2;
    rmsEnergy = Math.sqrt(sumSq / len);

    // Silence ratio (very low energy frames)
    const frameSize = Math.floor(sampleRate * 0.02); // 20ms frames
    let silentFrames = 0, totalFrames = 0;
    for (let i = 0; i < len - frameSize; i += frameSize) {
      let frameSq = 0;
      for (let j = 0; j < frameSize; j++) frameSq += channelData[i + j] ** 2;
      const frameRms = Math.sqrt(frameSq / frameSize);
      if (frameRms < 0.01) silentFrames++;
      totalFrames++;
    }
    silenceRatio = totalFrames > 0 ? silentFrames / totalFrames : 0;

    // Zero crossing rate (proxy for spectral content)
    let zcr = 0;
    for (let i = 1; i < len; i++) {
      if ((channelData[i] >= 0) !== (channelData[i - 1] >= 0)) zcr++;
    }
    zcr = len > 0 ? zcr / len : 0;

    // Simple spectral centroid estimate via average ZCR
    spectralCentroid = zcr * sampleRate / 2;

    audioCtx.close();

    // Heuristic scoring
    // Synthetic voices often have very consistent energy (low silence variance)
    if (silenceRatio < 0.05 && duration > 2) {
      aiScore += 10;
      evidence.push(`Very low silence ratio (${(silenceRatio * 100).toFixed(1)}%) — synthetic speech often lacks natural pauses`);
    } else if (silenceRatio > 0.3) {
      aiScore -= 8;
      evidence.push(`Natural silence ratio (${(silenceRatio * 100).toFixed(1)}%) — consistent with human speech pauses`);
    } else {
      evidence.push(`Silence ratio: ${(silenceRatio * 100).toFixed(1)}%`);
    }

    // Very low RMS energy might indicate processed audio
    if (rmsEnergy < 0.01) {
      aiScore += 5;
      evidence.push(`Low overall energy (RMS=${rmsEnergy.toFixed(4)}) — possibly processed`);
    } else if (rmsEnergy > 0.1) {
      evidence.push(`Normal energy level (RMS=${rmsEnergy.toFixed(4)})`);
    }

    // Extreme ZCR consistency can indicate synthesis
    if (zcr > 0 && zcr < 0.05) {
      aiScore += 6;
      evidence.push(`Low zero-crossing rate (${(zcr * 100).toFixed(2)}%) — possible spectral uniformity`);
    } else if (zcr > 0.15) {
      aiScore -= 4;
      evidence.push(`High zero-crossing rate (${(zcr * 100).toFixed(2)}%) — natural spectral variation`);
    }

    signals.push(`Sample rate: ${sampleRate} Hz`);
    signals.push(`Channels: ${channels}`);
    signals.push(`RMS energy: ${rmsEnergy.toFixed(4)}`);
    signals.push(`Silence ratio: ${(silenceRatio * 100).toFixed(1)}%`);
    signals.push(`Zero-crossing rate: ${(zcr * 100).toFixed(2)}%`);
  } catch {
    signals.push('Could not decode audio for spectral analysis');
    evidence.push('Audio decoding failed — analysis limited to file metadata');
    // Fall back to metadata-only scoring
    if (file.size < 50 * 1024) { aiScore += 3; evidence.push('Small file size — limited audio data'); }
  }

  // File hash for deterministic variation
  const fileHash = hash(file.name + file.size);
  aiScore += (fileHash % 11) - 5;

  // Clamp
  aiScore = Math.max(8, Math.min(92, Math.round(aiScore)));
  const humanScore = 100 - aiScore;

  let verdict: AuthenticityResult['verdict'];
  let confLevel: AuthenticityResult['confidence'];
  if (aiScore >= 65) {
    verdict = 'LIKELY AI-GENERATED';
    confLevel = aiScore >= 80 ? 'High' : 'Medium';
  } else if (humanScore >= 65) {
    verdict = 'LIKELY HUMAN';
    confLevel = humanScore >= 80 ? 'High' : 'Medium';
  } else {
    verdict = 'INCONCLUSIVE';
    confLevel = 'Low';
  }

  signals.push('Heuristic forensic estimate — no trained voice AI detector connected');

  return {
    status: verdict === 'LIKELY AI-GENERATED' ? 'LIKELY AI-GENERATED' : verdict === 'LIKELY HUMAN' ? 'LIKELY HUMAN' : 'INCONCLUSIVE',
    confidence: null,
    explanation: `Authenticity: ${verdict}. AI ${aiScore}% | Human ${humanScore}% (heuristic forensic estimate). Based on ${sampleRate > 0 ? 'spectral analysis, silence patterns, and energy metrics' : 'file metadata only'}.`,
    signals,
    language: 'en',
    recommendations: [
      'Listen carefully for unnatural pauses or robotic tone.',
      'Compare with known authentic recordings of the same speaker.',
      'Check if the audio has been reported as manipulated by trusted sources.',
    ],
    timestamp: new Date().toISOString(),
    isDemo: true,
    audioInfo,
    authenticity: {
      verdict,
      aiPercent: aiScore,
      humanPercent: humanScore,
      confidence: confLevel,
      evidence: evidence.length > 0 ? evidence : ['No strong forensic signals detected'],
    },
    realityCheck: {
      verdict: 'UNVERIFIABLE',
      evidence: ['Audio content cannot be factually verified without external context'],
    },
    riskLevel: verdict === 'LIKELY AI-GENERATED' ? 'MEDIUM' : 'LOW',
    whyResult: [
      `Authenticity: ${verdict} (${aiScore}% AI / ${humanScore}% human).`,
      `Evidence: ${evidence.length} signal(s) analyzed.`,
      'This is a heuristic forensic estimate — no trained ML voice detector was used.',
      'Results require independent verification for legal/judicial use.',
    ],
  };
}

// ─── LINK ANALYSIS ───────────────────────────────────────────────────────────

export function analyzeLink(url: string): AnalysisResult {
  let domain = 'unknown';
  let protocol = '';
  let isHttps = false;
  try {
    const u = new URL(url);
    domain = u.hostname;
    protocol = u.protocol;
    isHttps = u.protocol === 'https:';
  } catch {
    // invalid URL
  }

  const signals: string[] = [
    `Domain: ${domain}`,
    `Protocol: ${protocol}`,
    isHttps ? 'Uses HTTPS (encrypted connection)' : 'Does NOT use HTTPS (insecure connection)',
  ];

  const suspiciousKeywords = ['free', 'offer', 'deal', 'dhamaka', 'recharge', 'iphone', 'laptop', 'cash', 'prize', 'winner', 'lottery', 'gift'];
  const lowerUrl = url.toLowerCase();
  const foundKeywords = suspiciousKeywords.filter(k => lowerUrl.includes(k));

  if (foundKeywords.length > 0) signals.push(`Suspicious keywords in URL: ${foundKeywords.join(', ')}`);

  const suspiciousTlds = ['.xyz', '.top', '.click', '.link', '.work', '.gq', '.cf', '.ml', '.tk'];
  const hasSuspiciousTld = suspiciousTlds.some(tld => domain.endsWith(tld));
  if (hasSuspiciousTld) signals.push('Domain uses a TLD commonly associated with spam/scams');

  const isIpDomain = /^\d+\.\d+\.\d+\.\d+/.test(domain);
  if (isIpDomain) signals.push('Domain is an IP address (common in phishing)');

  const subdomainCount = domain.split('.').length - 1;
  if (subdomainCount > 3) signals.push(`Excessive subdomains (${subdomainCount}) — may be suspicious`);

  // Trusted domains list
  const trustedDomains = ['google.com', 'youtube.com', 'wikipedia.org', 'github.com', 'microsoft.com', 'apple.com', 'amazon.in', 'amazon.com', 'bbc.com', 'reuters.com', 'india.gov.in', 'rbi.org.in'];
  const isTrusted = trustedDomains.some(d => domain === d || domain.endsWith('.' + d));

  // Source credibility
  let sourceVerdict: 'Trusted' | 'Suspicious' | 'Unknown';
  const sourceEvidence: string[] = [];

  const riskFactors = (hasSuspiciousTld ? 2 : 0) + (isIpDomain ? 2 : 0) + (foundKeywords.length > 0 ? 1 : 0) + (!isHttps ? 1 : 0) + (subdomainCount > 3 ? 1 : 0);

  if (isTrusted) {
    sourceVerdict = 'Trusted';
    sourceEvidence.push(`Domain "${domain}" is in the trusted domains list`);
  } else if (riskFactors >= 3) {
    sourceVerdict = 'Suspicious';
    sourceEvidence.push(`${riskFactors} risk factor(s) detected in URL structure`);
    if (foundKeywords.length > 0) sourceEvidence.push(`Suspicious keywords: ${foundKeywords.join(', ')}`);
    if (hasSuspiciousTld) sourceEvidence.push('TLD commonly associated with spam');
    if (isIpDomain) sourceEvidence.push('IP address used instead of domain name');
  } else {
    sourceVerdict = 'Unknown';
    sourceEvidence.push('Domain not in trusted list, but no strong suspicious patterns detected');
    sourceEvidence.push('No external reputation database was queried');
  }

  // Reality check: URL content cannot be inspected
  let realityVerdict: RealityCheckResult['verdict'];
  const realityEvidence: string[] = ['Page content could not be inspected due to browser security restrictions (CORS)'];

  if (sourceVerdict === 'Suspicious') {
    realityVerdict = 'MISLEADING';
    realityEvidence.push('URL structure shows patterns commonly associated with misleading content');
  } else {
    realityVerdict = 'UNVERIFIABLE';
    realityEvidence.push('No claim verification possible without inspecting page content');
  }

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'INCONCLUSIVE';
  let status: VerdictStatus;
  const whyResult: string[] = [];

  if (riskFactors >= 3) {
    riskLevel = 'HIGH';
    status = 'HIGH RISK';
    whyResult.push('Multiple risk indicators were found in the URL.', `Risk factors: ${signals.slice(3).join(', ')}`, 'This URL shows patterns commonly associated with phishing or scams.');
  } else if (riskFactors >= 1) {
    riskLevel = 'MEDIUM';
    status = 'SUSPICIOUS';
    whyResult.push('Some risk indicators were found in the URL.', 'The URL shows patterns that warrant caution.', 'No external reputation database was queried.');
  } else if (isTrusted) {
    riskLevel = 'LOW';
    status = 'LOW RISK';
    whyResult.push('The domain is in the trusted domains list.', isHttps ? 'The URL uses HTTPS.' : 'The URL does not use HTTPS.', 'LOW RISK does not mean the page content is safe — always evaluate critically.');
  } else if (isHttps) {
    riskLevel = 'LOW';
    status = 'LOW RISK';
    whyResult.push('The URL uses HTTPS (encrypted connection).', 'No suspicious keywords or patterns were detected in the URL structure.', 'No external domain reputation database was queried.', 'LOW RISK does not mean safe — always evaluate page content critically.');
  } else {
    riskLevel = 'INCONCLUSIVE';
    status = 'INCONCLUSIVE';
    whyResult.push('The URL could not be fully assessed.', 'No external reputation database was queried.');
  }

  signals.push('No external domain reputation database was queried');
  signals.push('Direct page content inspection is not possible due to browser security restrictions');

  return {
    status,
    confidence: null,
    explanation: `Source credibility: ${sourceVerdict}. Reality check: ${realityVerdict}. URL analysis for "${domain}" found ${riskFactors} risk factor(s). This is a URL-level analysis only — page content was not inspected.`,
    signals,
    language: 'en',
    recommendations: [
      'Visit the link yourself and evaluate the content critically.',
      'Check if the domain is known for spreading misinformation.',
      'Look for the same information on trusted news sources.',
      'Never enter personal information on pages you do not trust.',
    ],
    timestamp: new Date().toISOString(),
    isDemo: true,
    authenticity: {
      verdict: 'INCONCLUSIVE',
      aiPercent: 0,
      humanPercent: 0,
      confidence: 'Low',
      evidence: ['Authenticity does not apply to URL analysis'],
    },
    realityCheck: {
      verdict: realityVerdict,
      evidence: realityEvidence,
    },
    riskLevel,
    whyResult,
  };
}

export const EXAMPLE_TEXTS: Record<string, string> = {
  en: 'BREAKING NEWS!!! Scientists have discovered a secret cure that big pharma doesn\'t want you to know about! Forward this to everyone you know immediately!!!',
  mr: 'महत्त्वाची बातमी!!! शास्त्रज्ञांनी एका गुप्त उपायाचा शोध लावला आहे जो मोठ्या औषध कंपन्या लपवू इच्छितात! हा संदेश त्वरित सर्वांना पाठवा!!!',
  hi: 'बड़ी खबर!!! वैज्ञानिकों ने एक गुप्त इलाज खोजा है जिसे बड़ी फार्मा कंपनियां छुपाना चाहती हैं! इसे तुरंत सबको भेजें!!!',
  gu: 'મહત્વની સમાચાર!!! વૈજ્ઞાનિકોએ એક ગુપ્ત ઈલાજ શોધ્યો છે જેને મોટી ફાર્મા કંપનીઓ છુપાવવા માંગે છે! આ સંદેશ તાત્કાલિક બધાને મોકલો!!!',
  bn: 'বড় খবর!!! বিজ্ঞানীরা একটি গোপন নিরাময় আবিষ্কার করেছেন যা বড় ফার্মা কোম্পানিগুলি লুকিয়ে রাখতে চায়! এটি সবাইকে এখনই পাঠান!!!',
  ta: 'முக்கிய செய்தி!!! விஞ்ஞானிகள் ஒரு ரகசிய குணமாக்கும் முறையைக் கண்டுபிடித்துள்ளனர்! இந்த செய்தியை உடனே அனைவருக்கும் அனுப்புங்கள்!!!',
  te: 'ముఖ్యమైన వార్త!!! శాస్త్రవేత్తలు ఒక రహస్య నివారణను కనుగొన్నారు! ఈ సందేశాన్ని తక్షణం అందరికీ పంపండి!!!',
  kn: 'ಮುಖ್ಯ ಸುದ್ದಿ!!! ವಿಜ್ಞಾನಿಗಳು ಒಂದು ರಹಸ್ಯ ಚಿಕಿತ್ಸೆಯನ್ನು ಕಂಡುಹಿಡಿದಿದ್ದಾರೆ! ಈ ಸಂದೇಶವನ್ನು ತಕ್ಷಣ ಎಲ್ಲರಿಗೂ ಕಳುಹಿಸಿ!!!',
  ml: 'പ്രധാന വാർത്ത!!! ശാസ്ത്രജ്ഞർ ഒരു രഹസ്യ ചികിത്സ കണ്ടെത്തിയിട്ടുണ്ട്! ഈ സന്ദേശം ഉടനെ എല്ലാവർക്കും അയയ്ക്കുക!!!',
  pa: 'ਵੱਡੀ ਖਬਰ!!! ਵਿਗਿਆਨੀਆਂ ਨੇ ਇੱਕ ਗੁਪਤ ਇਲਾਜ ਲੱਭਿਆ ਹੈ! ਇਹ ਸੁਨੇਹਾ ਤੁਰੰਤ ਸਭ ਨੂੰ ਭੇਜੋ!!!',
};

export const EXAMPLE_FACTUAL_TEXT = 'Narendra Modi is the Prime Minister of Paris.';
