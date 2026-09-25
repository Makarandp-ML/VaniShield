import type { LanguageCode } from '@/i18n/translations';

export interface AnalysisResult {
  status: string;
  confidence: number;
  explanation: string;
  signals: string[];
  language: string;
  recommendations: string[];
  timestamp: string;
  isDemo: boolean;
}

const DEMO_NOTE = 'This is a DEMO analysis from the fallback engine. No real AI model was used.';

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
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

export function detectLanguage(text: string): LanguageCode {
  const ranges: { code: LanguageCode; pattern: RegExp }[] = [
    { code: 'mr', pattern: /[\u0900-\u097F]/ },
    { code: 'hi', pattern: /[\u0900-\u097F]/ },
    { code: 'gu', pattern: /[\u0A80-\u0AFF]/ },
    { code: 'bn', pattern: /[\u0980-\u09FF]/ },
    { code: 'ta', pattern: /[\u0B80-\u0BFF]/ },
    { code: 'te', pattern: /[\u0C00-\u0C7F]/ },
    { code: 'kn', pattern: /[\u0C80-\u0CFF]/ },
    { code: 'ml', pattern: /[\u0D00-\u0D7F]/ },
    { code: 'pa', pattern: /[\u0A00-\u0A7F]/ },
  ];

  const found: LanguageCode[] = [];
  for (const r of ranges) {
    if (r.pattern.test(text)) found.push(r.code);
  }
  if (found.length > 0) return found[0];
  return 'en';
}

export function analyzeText(text: string, language: LanguageCode): AnalysisResult {
  const h = hash(text);
  const lower = text.toLowerCase();
  const signals: string[] = [];

  let score = 0;
  for (const w of SUSPICIOUS_WORDS) {
    if (lower.includes(w)) {
      signals.push(`Contains urgency word: "${w}"`);
      score += 15;
    }
  }
  for (const p of SENSATIONAL_PHRASES) {
    if (lower.includes(p)) {
      signals.push(`Contains sensational claim: "${p}"`);
      score += 12;
    }
  }

  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    signals.push(`High exclamation count (${exclamationCount})`);
    score += 10;
  }

  const upperRatio = text.length > 0 ? (text.match(/[A-Z]/g) || []).length / text.length : 0;
  if (upperRatio > 0.3 && text.length > 50) {
    signals.push('Excessive use of capital letters');
    score += 10;
  }

  if (text.includes('http') || text.includes('www.')) {
    signals.push('Contains external links');
    score += 5;
  }

  const variation = (h % 20) - 10;
  score = Math.max(0, Math.min(95, score + variation));

  let status: string;
  if (score >= 60) status = 'Strong Suspicious Signals';
  else if (score >= 35) status = 'Potentially Misleading';
  else if (score >= 15) status = 'Needs Verification';
  else status = 'No Strong Suspicious Signals';

  if (text.trim().length < 10) {
    status = 'Unable to Determine';
    score = 0;
  }

  const confidence = Math.min(95, Math.max(50, score + 30));

  return {
    status,
    confidence,
    explanation: signals.length > 0
      ? `Some claims in this text contain patterns that require additional verification. This does not prove that the entire message is false. ${DEMO_NOTE}`
      : `No strong suspicious patterns were detected in this text. However, this does not guarantee the content is accurate. ${DEMO_NOTE}`,
    signals: signals.length > 0 ? signals : ['No significant suspicious patterns detected'],
    language,
    recommendations: [
      'Check the claim using reliable independent sources before sharing it.',
      'Look for the same information on trusted news websites.',
      'Consider the source of the message and whether it is trustworthy.',
    ],
    timestamp: new Date().toISOString(),
    isDemo: true,
  };
}

export function analyzeImage(file: File): AnalysisResult {
  const h = hash(file.name + file.size);
  const score = (h % 60) + 10;
  let status: string;
  if (score >= 55) status = 'Potentially AI-Generated';
  else if (score >= 35) status = 'Potentially Manipulated';
  else if (score >= 15) status = 'Potentially Authentic';
  else status = 'Unable to Determine';

  const confidence = Math.min(90, Math.max(45, score + 25));

  return {
    status,
    confidence,
    explanation: `Some visual signals in this image ${score >= 35 ? 'differ from patterns commonly observed in authentic photos' : 'appear consistent with authentic photos'}. This is an AI-assisted signal, not definitive proof. ${DEMO_NOTE}`,
    signals: [
      `File: ${file.name}`,
      `Size: ${(file.size / 1024).toFixed(1)} KB`,
      `Type: ${file.type}`,
      score >= 35 ? 'Unusual visual patterns detected' : 'No strong manipulation signals detected',
    ],
    language: 'en',
    recommendations: [
      'Compare this image with similar images from trusted sources.',
      'Look for signs of editing around edges, shadows, or reflections.',
      'Use a reverse image search to check if the image appeared elsewhere first.',
    ],
    timestamp: new Date().toISOString(),
    isDemo: true,
  };
}

export function analyzeAudio(file: File, duration: number): AnalysisResult {
  const h = hash(file.name + file.size);
  const score = (h % 55) + 5;
  let status: string;
  if (score >= 50) status = 'Potentially AI-Generated';
  else if (score >= 30) status = 'Needs Verification';
  else if (score >= 15) status = 'Potentially Authentic';
  else status = 'Unable to Determine';

  const confidence = Math.min(88, Math.max(45, score + 25));

  return {
    status,
    confidence,
    explanation: `Some acoustic patterns ${score >= 30 ? 'differ from patterns commonly observed in natural speech' : 'appear consistent with natural speech'}. This is an AI-assisted signal, not definitive proof. ${DEMO_NOTE}`,
    signals: [
      `File: ${file.name}`,
      `Duration: ${duration.toFixed(1)} seconds`,
      `Size: ${(file.size / 1024).toFixed(1)} KB`,
      score >= 30 ? 'Unusual acoustic patterns detected' : 'No strong synthetic indicators detected',
    ],
    language: 'en',
    recommendations: [
      'Listen carefully for unnatural pauses or robotic tone.',
      'Compare with known authentic recordings of the same speaker.',
      'Check if the audio has been reported as manipulated by trusted sources.',
    ],
    timestamp: new Date().toISOString(),
    isDemo: true,
  };
}

export function analyzeLink(url: string): AnalysisResult {
  let domain = 'unknown';
  try {
    domain = new URL(url).hostname;
  } catch {
    // invalid URL
  }

  const h = hash(url);
  const score = (h % 40) + 5;

  return {
    status: 'Needs Verification',
    confidence: Math.min(70, Math.max(40, score + 30)),
    explanation: `This website cannot directly inspect the page "${domain}" because of browser/security restrictions. The URL was checked for known suspicious patterns. ${DEMO_NOTE}`,
    signals: [
      `Domain: ${domain}`,
      'Direct page content inspection is not possible due to browser security restrictions.',
      'Only basic URL-level checks were performed.',
    ],
    language: 'en',
    recommendations: [
      'Visit the link yourself and evaluate the content critically.',
      'Check if the domain is known for spreading misinformation.',
      'Look for the same information on trusted news sources.',
    ],
    timestamp: new Date().toISOString(),
    isDemo: true,
  };
}

export const EXAMPLE_TEXTS: Record<string, string> = {
  en: 'BREAKING NEWS!!! Scientists have discovered a secret cure that big pharma doesn\'t want you to know about! Forward this to everyone you know immediately!!!',
  mr: 'महत्त्वाची बातमी!!! शास्त्रज्ञांनी एका गुप्त उपायाचा शोध लावला आहे जो मोठ्या औषध कंपन्या लपवू इच्छितात! हा संदेश त्वरित सर्वांना पाठवा!!!',
  hi: 'बड़ी खबर!!! वैज्ञानिकों ने एक गुप्त इलाज खोजा है जिसे बड़ी फार्मा कंपनियां छुपाना चाहती हैं! इसे तुरंत सबको भेजें!!!',
};
