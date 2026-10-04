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

export interface AnalysisResult {
  status: VerdictStatus;
  confidence: number | null;
  explanation: string;
  signals: string[];
  language: string;
  recommendations: string[];
  timestamp: string;
  isDemo: boolean;
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

// Simple factual knowledge for demonstration
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

  // Check for unverifiable claims
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

  if (text.includes('http') || text.includes('www.')) {
    signals.push('Contains external links');
    suspiciousScore += 5;
  }

  // AI authorship indicators (heuristic, not a trained detector)
  const aiIndicators: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const avgLen = sentences.length > 0 ? text.length / sentences.length : 0;
  if (avgLen > 120) aiIndicators.push('Long, uniform sentence structure (may suggest AI-generated text)');
  if (avgLen > 0 && avgLen < 15) aiIndicators.push('Very short, choppy sentences (may suggest unusual writing)');

  // Repetition check
  const words = lower.split(/\s+/).filter(w => w.length > 3);
  const wordSet = new Set(words);
  const repetition = words.length > 0 ? 1 - wordSet.size / words.length : 0;
  if (repetition > 0.3) aiIndicators.push(`High word repetition (${Math.round(repetition * 100)}%)`);

  // Burstiness: variation in sentence lengths
  const lengths = sentences.map(s => s.trim().length);
  const meanLen = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  const variance = lengths.length > 0 ? lengths.reduce((a, b) => a + Math.pow(b - meanLen, 2), 0) / lengths.length : 0;
  const burstiness = meanLen > 0 ? Math.sqrt(variance) / meanLen : 0;
  if (burstiness < 0.2 && sentences.length > 3) aiIndicators.push('Low burstiness (uniform sentence variation may indicate AI-generated text)');
  if (burstiness > 0.6) aiIndicators.push('High burstiness (natural variation in sentence length, typical of human writing)');

  // No trained AI detector — so authorship is INCONCLUSIVE unless very strong signals
  let aiStatus: VerdictStatus = 'INCONCLUSIVE';
  let aiConfidence: number | null = null;
  if (aiIndicators.length >= 3) {
    aiStatus = 'MIXED/UNCERTAIN';
    aiConfidence = null;
  }
  // We do NOT claim LIKELY AI or LIKELY HUMAN without a trained model

  // Factual verification
  const factResults = checkFacts(text);

  // Determine overall status and risk
  let overallStatus: VerdictStatus;
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'INCONCLUSIVE';
  let confidence: number | null = null;
  const whyResult: string[] = [];

  const hasContradiction = factResults.some(f => f.status === 'FACTUAL CONTRADICTION');
  const hasNeedsVerification = factResults.some(f => f.status === 'NEEDS VERIFICATION');

  if (hasContradiction) {
    overallStatus = 'FACTUAL CONTRADICTION';
    riskLevel = 'HIGH';
    confidence = null;
    whyResult.push(
      'The statement contains a factual contradiction.',
      'The verified information contradicts the claim in the text.',
      'Therefore the text is marked as a factual contradiction.',
    );
  } else if (suspiciousScore >= 50) {
    overallStatus = 'SUSPICIOUS';
    riskLevel = 'HIGH';
    confidence = null;
    whyResult.push(
      'Multiple suspicious patterns were detected in the text.',
      `Suspicion score: ${suspiciousScore} (based on urgency words, sensational claims, formatting).`,
      'However, no trained AI detector was used — this is heuristic analysis only.',
    );
  } else if (suspiciousScore >= 25 || hasNeedsVerification) {
    overallStatus = 'NEEDS VERIFICATION';
    riskLevel = 'MEDIUM';
    confidence = null;
    whyResult.push(
      'Some patterns in the text require additional verification.',
      'No factual contradictions were found, but some claims could not be verified.',
    );
  } else {
    overallStatus = 'NEEDS VERIFICATION';
    riskLevel = 'LOW';
    confidence = null;
    whyResult.push(
      'No strong suspicious patterns were detected in the text.',
      'However, absence of suspicious patterns does not guarantee accuracy.',
      'No trained AI detector was used for authorship analysis.',
      'Therefore the result is NEEDS VERIFICATION rather than declaring the text safe.',
    );
  }

  const recommendations = [
    'Check the claim using reliable independent sources before sharing it.',
    'Look for the same information on trusted news websites.',
    'Consider the source of the message and whether it is trustworthy.',
  ];

  if (hasContradiction) {
    recommendations.unshift('This claim contains a factual error. Do not share it without correcting the information.');
  }

  return {
    status: overallStatus,
    confidence,
    explanation: hasContradiction
      ? 'This text contains at least one factual contradiction. The claim does not match verified information.'
      : signals.length > 0
        ? 'Some patterns in this text require additional verification. This does not prove the message is false.'
        : 'No strong suspicious patterns were detected. However, this does not guarantee the content is accurate.',
    signals: signals.length > 0 ? signals : ['No significant suspicious patterns detected'],
    language,
    recommendations,
    timestamp: new Date().toISOString(),
    isDemo: true,
    aiAuthorship: {
      status: aiStatus,
      confidence: aiConfidence,
      indicators: aiIndicators.length > 0 ? aiIndicators : ['No strong authorship indicators detected'],
      explanation: 'No trained AI authorship detector is connected. The indicators above are heuristic linguistic observations, not definitive AI detection.',
    },
    factualVerification: factResults,
    riskLevel,
    whyResult,
  };
}

export function analyzeImage(file: File): AnalysisResult {
  // No trained image detector — return INCONCLUSIVE
  const metadata: { label: string; value: string }[] = [
    { label: 'File name', value: file.name },
    { label: 'File size', value: `${(file.size / 1024).toFixed(1)} KB` },
    { label: 'File type', value: file.type || 'Unknown' },
    { label: 'Last modified', value: new Date(file.lastModified).toLocaleString() },
  ];

  // Analyze basic image dimensions via File metadata
  return {
    status: 'INCONCLUSIVE',
    confidence: null,
    explanation: 'No trained image manipulation or AI-generation detector is currently connected. The system can display file metadata and characteristics, but cannot determine with confidence whether this image is authentic, manipulated, or AI-generated.',
    signals: [
      `File: ${file.name}`,
      `Size: ${(file.size / 1024).toFixed(1)} KB`,
      `Type: ${file.type || 'Unknown'}`,
      'No trained synthetic image detector connected',
      'No EXIF metadata extraction available in browser environment',
    ],
    language: 'en',
    recommendations: [
      'Compare this image with similar images from trusted sources.',
      'Look for signs of editing around edges, shadows, or reflections.',
      'Use a reverse image search to check if the image appeared elsewhere first.',
    ],
    timestamp: new Date().toISOString(),
    isDemo: true,
    metadata,
    whyResult: [
      'No trained detector is connected for this media type.',
      'File metadata (name, size, type) was available and displayed.',
      'No EXIF data could be extracted in the browser environment.',
      'No strong synthetic artifacts could be verified.',
      'Therefore the result is INCONCLUSIVE rather than declaring the image authentic.',
    ],
  };
}

export function analyzeAudio(file: File, duration: number): AnalysisResult {
  const audioInfo: { label: string; value: string }[] = [
    { label: 'File name', value: file.name },
    { label: 'File size', value: `${(file.size / 1024).toFixed(1)} KB` },
    { label: 'Duration', value: `${duration.toFixed(1)} seconds` },
    { label: 'File type', value: file.type || 'Unknown' },
  ];

  return {
    status: 'INCONCLUSIVE',
    confidence: null,
    explanation: 'No trained deepfake audio detector is currently connected. The system can display file information, but cannot determine with confidence whether this audio is authentic, synthetic, or manipulated.',
    signals: [
      `File: ${file.name}`,
      `Duration: ${duration.toFixed(1)} seconds`,
      `Size: ${(file.size / 1024).toFixed(1)} KB`,
      `Type: ${file.type || 'Unknown'}`,
      'No trained synthetic audio detector connected',
    ],
    language: 'en',
    recommendations: [
      'Listen carefully for unnatural pauses or robotic tone.',
      'Compare with known authentic recordings of the same speaker.',
      'Check if the audio has been reported as manipulated by trusted sources.',
    ],
    timestamp: new Date().toISOString(),
    isDemo: true,
    audioInfo,
    whyResult: [
      'No trained detector is connected for this media type.',
      'File information (name, size, duration, type) was available and displayed.',
      'No spectral analysis or synthetic speech detection was performed.',
      'No trained deepfake audio classifier is available.',
      'Therefore the result is INCONCLUSIVE rather than declaring the audio authentic.',
    ],
  };
}

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

  // Suspicious URL patterns
  const suspiciousKeywords = ['free', 'offer', 'deal', 'dhamaka', 'recharge', 'iphone', 'laptop', 'cash', 'prize', 'winner', 'lottery', 'gift'];
  const lowerUrl = url.toLowerCase();
  const foundKeywords = suspiciousKeywords.filter(k => lowerUrl.includes(k));

  if (foundKeywords.length > 0) {
    signals.push(`Suspicious keywords in URL: ${foundKeywords.join(', ')}`);
  }

  // Check for suspicious TLDs
  const suspiciousTlds = ['.xyz', '.top', '.click', '.link', '.work', '.gq', '.cf', '.ml', '.tk'];
  const hasSuspiciousTld = suspiciousTlds.some(tld => domain.endsWith(tld));
  if (hasSuspiciousTld) {
    signals.push('Domain uses a TLD commonly associated with spam/scams');
  }

  // Check for IP address as domain
  const isIpDomain = /^\d+\.\d+\.\d+\.\d+/.test(domain);
  if (isIpDomain) {
    signals.push('Domain is an IP address (common in phishing)');
  }

  // Check for many subdomains
  const subdomainCount = domain.split('.').length - 1;
  if (subdomainCount > 3) {
    signals.push(`Excessive subdomains (${subdomainCount}) — may be suspicious`);
  }

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'INCONCLUSIVE';
  let status: VerdictStatus;
  const whyResult: string[] = [];

  const riskFactors = (hasSuspiciousTld ? 2 : 0) + (isIpDomain ? 2 : 0) + (foundKeywords.length > 0 ? 1 : 0) + (!isHttps ? 1 : 0) + (subdomainCount > 3 ? 1 : 0);

  if (riskFactors >= 3) {
    riskLevel = 'HIGH';
    status = 'HIGH RISK';
    whyResult.push(
      'Multiple risk indicators were found in the URL.',
      `Risk factors: ${signals.slice(3).join(', ')}`,
      'This URL shows patterns commonly associated with phishing or scams.',
    );
  } else if (riskFactors >= 1) {
    riskLevel = 'MEDIUM';
    status = 'SUSPICIOUS';
    whyResult.push(
      'Some risk indicators were found in the URL.',
      'The URL shows patterns that warrant caution.',
      'No external reputation database was queried.',
    );
  } else if (isHttps) {
    riskLevel = 'LOW';
    status = 'LOW RISK';
    whyResult.push(
      'The URL uses HTTPS (encrypted connection).',
      'No suspicious keywords or patterns were detected in the URL structure.',
      'No external domain reputation database was queried.',
      'LOW RISK does not mean safe — always evaluate page content critically.',
    );
  } else {
    riskLevel = 'INCONCLUSIVE';
    status = 'INCONCLUSIVE';
    whyResult.push(
      'The URL could not be fully assessed.',
      'No external reputation database was queried.',
    );
  }

  signals.push('No external domain reputation database was queried');
  signals.push('Direct page content inspection is not possible due to browser security restrictions');

  return {
    status,
    confidence: null,
    explanation: `URL analysis for "${domain}" found ${riskFactors} risk factor(s). ${!isHttps ? 'The connection is not encrypted. ' : ''}This is a URL-level analysis only — page content was not inspected.`,
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
