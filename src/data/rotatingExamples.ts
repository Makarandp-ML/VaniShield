export interface TextExample {
  input: string;
  origin: string;
  infoCheck: string;
  why: string;
  category: string;
}

export interface ImageExample {
  description: string;
  origin: string;
  infoCheck: string;
  why: string;
  category: string;
}

export interface AudioExample {
  description: string;
  origin: string;
  infoCheck: string;
  why: string;
  category: string;
}

export interface MicExample {
  statement: string;
  origin: string;
  infoCheck: string;
  why: string;
}

export interface CameraExample {
  instruction: string;
  origin: string;
  infoCheck: string;
  why: string;
}

export interface LinkExample {
  url: string;
  origin: string;
  infoCheck: string;
  why: string;
  category: string;
}

const TEXT_EXAMPLE_SETS: TextExample[][] = [
  [
    { input: 'The Great Wall of China is visible from the Moon with the naked eye.', origin: 'Likely Human-Written', infoCheck: 'False / Contradicted', why: 'This is a well-debunked myth. The Great Wall is not visible from the Moon with the naked eye — it is too narrow and follows natural ridgelines that blend in.', category: 'Misinformation' },
    { input: 'Water boils at 100 degrees Celsius at standard atmospheric pressure (sea level).', origin: 'Likely Human-Written', infoCheck: 'True / Supported', why: 'This is a well-established scientific fact confirmed by physics.', category: 'Science' },
    { input: 'In conclusion, the aforementioned analysis demonstrates a comprehensive understanding of the subject matter, highlighting key insights and facilitating informed decision-making for all stakeholders involved.', origin: 'Likely AI-Written', infoCheck: 'No Factual Claim Detected', why: 'Generic, highly formal, predictable sentence structure with no specific facts — typical of AI-generated filler text.', category: 'Technology' },
    { input: 'The Indian Space Research Organisation successfully launched Chandrayaan-3, which landed on the Moon in August 2023.', origin: 'Likely Human-Written', infoCheck: 'True / Supported', why: 'Chandrayaan-3 successfully landed on the Moon on August 23, 2023 — a confirmed historical event.', category: 'Current Affairs' },
    { input: 'Drinking lemon water every morning cures all types of cancer within 30 days.', origin: 'Likely Human-Written', infoCheck: 'False / Contradicted', why: 'There is no scientific evidence that lemon water cures cancer. This is a dangerous health misinformation claim.', category: 'Health Misinformation' },
  ],
  [
    { input: 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and glucose.', origin: 'Likely Human-Written', infoCheck: 'True / Supported', why: 'This is a fundamental, well-established biological fact.', category: 'Education' },
    { input: 'It is important to note that this topic encompasses a multifaceted landscape of considerations that warrant further exploration and analysis.', origin: 'Likely AI-Written', infoCheck: 'No Factual Claim Detected', why: 'Vague, non-committal, and overly formal — characteristic AI-generated hedging with no factual content.', category: 'Technology' },
    { input: 'The Reserve Bank of India was established in 1869.', origin: 'Likely Human-Written', infoCheck: 'False / Contradicted', why: 'The RBI was established on April 1, 1935, not 1869.', category: 'Current Affairs' },
    { input: 'Hey everyone! Just wanted to share that I finally finished my first marathon yesterday. It was tough but totally worth it!', origin: 'Likely Human-Written', infoCheck: 'No Factual Claim Detected', why: 'Conversational, informal, first-person tone with emotional language — typical human social media writing. No verifiable factual claim.', category: 'Social Media' },
    { input: 'Breaking: Scientists have confirmed that eating chocolate every day increases your IQ by 50 points.', origin: 'Likely Human-Written', infoCheck: 'False / Contradicted', why: 'No scientific study supports this claim. This is fabricated health misinformation.', category: 'Fake News' },
  ],
  [
    { input: 'The currency of Japan is the Japanese Yen.', origin: 'Likely Human-Written', infoCheck: 'True / Supported', why: 'A basic, well-established geographical fact.', category: 'Education' },
    { input: 'Furthermore, it is worth considering the various implications of this approach, which may ultimately lead to more robust and scalable solutions in the long run.', origin: 'Likely AI-Written', infoCheck: 'No Factual Claim Detected', why: 'Generic transitional filler with no specifics — common AI pattern.', category: 'Technology' },
    { input: 'You have won a lottery of 25 lakh rupees! Click this link to claim your prize now. Offer valid for 24 hours only.', origin: 'Likely Human-Written', infoCheck: 'Misleading / Partly True', why: 'This is a classic scam message pattern. The claim of winning a lottery the user never entered is false and designed to deceive.', category: 'Scam' },
    { input: 'The Parliament of India has two houses: the Lok Sabha and the Rajya Sabha.', origin: 'Likely Human-Written', infoCheck: 'True / Supported', why: 'This is a basic constitutional fact about India.', category: 'Education' },
    { input: 'The Earth is flat and NASA has been hiding this truth for decades.', origin: 'Likely Human-Written', infoCheck: 'False / Contradicted', why: 'The Earth is an oblate spheroid — confirmed by centuries of scientific evidence, satellite imagery, and space exploration.', category: 'Misinformation' },
  ],
];

const IMAGE_EXAMPLE_SETS: ImageExample[][] = [
  [
    { description: 'A photograph of a natural landscape (mountains, trees, sky) taken with a real camera', origin: 'Likely Authentic', infoCheck: 'No Factual Claim Detected', why: 'A natural landscape photo without text or claims — no factual content to verify.', category: 'Authentic Photo' },
    { description: 'An AI-generated portrait of a person who does not exist (created by a GAN or diffusion model)', origin: 'Likely AI-Generated', infoCheck: 'No Factual Claim Detected', why: 'Synthetic images of non-existent people are AI-generated by definition. No factual claim present.', category: 'AI Image' },
    { description: 'A screenshot of a news headline image claiming "Scientists discover cure for all viruses"', origin: 'Inconclusive', infoCheck: 'False / Contradicted', why: 'No cure for all viruses has been discovered. Without a trained image detector, origin is inconclusive, but the claim is false.', category: 'Misinformation' },
  ],
  [
    { description: 'A real photo of a city street with people walking', origin: 'Likely Authentic', infoCheck: 'No Factual Claim Detected', why: 'A candid street photograph with no factual claims to verify.', category: 'Authentic Photo' },
    { description: 'A manipulated image showing a politician in a place they never visited', origin: 'Inconclusive', infoCheck: 'False / Contradicted', why: 'Without a trained detector, image origin is inconclusive. However, the implied claim of the politician being there is false.', category: 'Manipulated Image' },
    { description: 'An AI-generated image of a futuristic city with flying cars', origin: 'Likely AI-Generated', infoCheck: 'No Factual Claim Detected', why: 'A clearly synthetic/fictional scene with no factual claims.', category: 'AI Image' },
  ],
];

const AUDIO_EXAMPLE_SETS: AudioExample[][] = [
  [
    { description: 'A recording of a person saying "The capital of France is Paris."', origin: 'Inconclusive', infoCheck: 'True / Supported', why: 'Without a trained anti-spoof detector, voice origin cannot be determined. The factual claim that Paris is the capital of France is true.', category: 'True Claim' },
    { description: 'A recording of a synthetic AI voice saying "I am a real human speaking to you right now."', origin: 'Inconclusive', infoCheck: 'False / Contradicted', why: 'If the voice is synthetic, the claim of being human is false. However, without a trained detector, origin is inconclusive.', category: 'False Claim' },
    { description: 'A recording of someone singing a song', origin: 'Inconclusive', infoCheck: 'No Factual Claim Detected', why: 'Without a trained detector, origin cannot be determined. Music typically contains no factual claims to verify.', category: 'No Claim' },
  ],
  [
    { description: 'A recording of a person saying "The Sun rises in the east."', origin: 'Inconclusive', infoCheck: 'True / Supported', why: 'Without a trained detector, origin is inconclusive. The factual claim is true.', category: 'True Claim' },
    { description: 'A recording claiming "A new law bans all internet usage after 10 PM nationwide."', origin: 'Inconclusive', infoCheck: 'False / Contradicted', why: 'No such law exists. Without a trained detector, origin is inconclusive, but the claim is false.', category: 'False Claim' },
    { description: 'A recording of ambient nature sounds (birds, wind)', origin: 'Inconclusive', infoCheck: 'No Factual Claim Detected', why: 'Without a trained detector, origin is inconclusive. No factual claims present.', category: 'No Claim' },
  ],
];

const MIC_EXAMPLE_SETS: MicExample[][] = [
  [
    { statement: 'The capital of Australia is Sydney.', origin: 'Inconclusive', infoCheck: 'False / Contradicted', why: 'The capital of Australia is Canberra, not Sydney. Voice origin is inconclusive without a trained detector.' },
    { statement: 'There are 7 continents on Earth.', origin: 'Inconclusive', infoCheck: 'True / Supported', why: 'A well-established geographical fact. Voice origin is inconclusive without a trained detector.' },
    { statement: 'I had pasta for lunch today.', origin: 'Inconclusive', infoCheck: 'Unverifiable', why: 'A personal claim that cannot be independently verified. Voice origin is inconclusive.' },
  ],
  [
    { statement: 'The Pacific Ocean is the largest ocean on Earth.', origin: 'Inconclusive', infoCheck: 'True / Supported', why: 'A well-established geographical fact. Voice origin is inconclusive.' },
    { statement: 'The Great Pyramid of Giza was built in 1990.', origin: 'Inconclusive', infoCheck: 'False / Contradicted', why: 'The Great Pyramid was built around 2560 BCE, not 1990. Voice origin is inconclusive.' },
    { statement: 'My favorite color is blue.', origin: 'Inconclusive', infoCheck: 'No Factual Claim Detected', why: 'A personal preference, not a factual claim. Voice origin is inconclusive.' },
  ],
];

const CAMERA_EXAMPLE_SETS: CameraExample[][] = [
  [
    { instruction: 'Capture a photo of an everyday object on your desk', origin: 'Inconclusive', infoCheck: 'No Factual Claim Detected', why: 'A real-time camera capture. Without a trained detector, origin is inconclusive. No factual claims in the image.' },
    { instruction: 'Capture a photo of a book cover or magazine page', origin: 'Inconclusive', infoCheck: 'Unverifiable', why: 'If the page contains factual claims, they would need separate verification. Image origin is inconclusive without a trained detector.' },
    { instruction: 'Capture a photo of something outdoors in natural light', origin: 'Inconclusive', infoCheck: 'No Factual Claim Detected', why: 'A real-time capture of an outdoor scene. Origin is inconclusive without a trained detector.' },
  ],
  [
    { instruction: 'Capture a photo of a handwritten note or sign', origin: 'Inconclusive', infoCheck: 'Unverifiable', why: 'Any text in the image would need separate fact-checking. Origin is inconclusive without a trained detector.' },
    { instruction: 'Capture a selfie or portrait photo', origin: 'Inconclusive', infoCheck: 'No Factual Claim Detected', why: 'A live camera capture of a person. Origin is inconclusive — camera presence does not prove authenticity.' },
    { instruction: 'Capture a photo of a product label or packaging', origin: 'Inconclusive', infoCheck: 'Unverifiable', why: 'Any claims on the label would need separate verification. Origin is inconclusive without a trained detector.' },
  ],
];

const LINK_EXAMPLE_SETS: LinkExample[][] = [
  [
    { url: 'https://www.nasa.gov', origin: 'Inconclusive', infoCheck: 'No Factual Claim Detected', why: 'A legitimate government space agency website. HTTPS alone does not prove trustworthiness, but NASA is a well-known official source. Content must be analyzed separately.', category: 'Legitimate' },
    { url: 'https://www.who.int', origin: 'Inconclusive', infoCheck: 'No Factual Claim Detected', why: 'The World Health Organization is an established health authority. HTTPS alone does not prove trustworthiness. Content must be analyzed separately.', category: 'Legitimate' },
    { url: 'https://tinyurl.com/free-iphone-giveaway', origin: 'Inconclusive', infoCheck: 'Misleading / Partly True', why: 'Shortened URLs with "free giveaway" promises are common scam patterns. The URL structure alone is suspicious but not definitive.', category: 'Suspicious' },
    { url: 'https://bit.ly/claim-your-prize-now', origin: 'Inconclusive', infoCheck: 'Misleading / Partly True', why: 'Shortened URL with prize-claim language — a typical scam pattern. URL analysis alone cannot determine content origin.', category: 'Scam' },
    { url: 'https://en.wikipedia.org/wiki/India', origin: 'Inconclusive', infoCheck: 'No Factual Claim Detected', why: 'Wikipedia is a well-known reference source. HTTPS alone does not prove trustworthiness. Specific content on the page must be verified separately.', category: 'Legitimate' },
  ],
  [
    { url: 'https://www.india.gov.in', origin: 'Inconclusive', infoCheck: 'No Factual Claim Detected', why: 'The official Indian government portal. HTTPS alone does not prove trustworthiness, but this is a known official source.', category: 'Legitimate' },
    { url: 'https://tinyurl.com/you-won-lottery-2024', origin: 'Inconclusive', infoCheck: 'Misleading / Partly True', why: 'A shortened URL with lottery/win language — classic scam pattern. Content origin cannot be determined from URL alone.', category: 'Scam' },
    { url: 'https://www.bbc.com/news', origin: 'Inconclusive', infoCheck: 'No Factual Claim Detected', why: 'BBC News is an established news organization. HTTPS alone does not prove trustworthiness. Individual articles must be verified separately.', category: 'Legitimate' },
    { url: 'https://rbil-payment-refund.xyz/login', origin: 'Inconclusive', infoCheck: 'False / Contradicted', why: 'A domain impersonating RBI (Reserve Bank of India) with a refund scam pattern. The .xyz domain and "rbil" misspelling are phishing indicators.', category: 'Phishing' },
    { url: 'https://www.factcheck.org', origin: 'Inconclusive', infoCheck: 'No Factual Claim Detected', why: 'An established fact-checking organization. HTTPS alone does not prove trustworthiness. Specific claims must be verified individually.', category: 'Legitimate' },
  ],
];

const TEXT_EXAMPLES = TEXT_EXAMPLE_SETS.flat();
const IMAGE_EXAMPLES = IMAGE_EXAMPLE_SETS.flat();
const AUDIO_EXAMPLES = AUDIO_EXAMPLE_SETS.flat();
const MIC_EXAMPLES = MIC_EXAMPLE_SETS.flat();
const CAMERA_EXAMPLES = CAMERA_EXAMPLE_SETS.flat();
const LINK_EXAMPLES = LINK_EXAMPLE_SETS.flat();

function getSetIndex(key: string, totalSets: number): number {
  const stored = localStorage.getItem(key);
  let idx = stored ? parseInt(stored, 10) : 0;
  if (isNaN(idx)) idx = 0;
  idx = (idx + 1) % totalSets;
  localStorage.setItem(key, String(idx));
  return idx;
}

export function getTextExamples(): TextExample[] {
  return TEXT_EXAMPLE_SETS[getSetIndex('vaani_text_ex_set', TEXT_EXAMPLE_SETS.length)];
}

export function getImageExamples(): ImageExample[] {
  return IMAGE_EXAMPLE_SETS[getSetIndex('vaani_image_ex_set', IMAGE_EXAMPLE_SETS.length)];
}

export function getAudioExamples(): AudioExample[] {
  return AUDIO_EXAMPLE_SETS[getSetIndex('vaani_audio_ex_set', AUDIO_EXAMPLE_SETS.length)];
}

export function getMicExamples(): MicExample[] {
  return MIC_EXAMPLE_SETS[getSetIndex('vaani_mic_ex_set', MIC_EXAMPLE_SETS.length)];
}

export function getCameraExamples(): CameraExample[] {
  return CAMERA_EXAMPLE_SETS[getSetIndex('vaani_camera_ex_set', CAMERA_EXAMPLE_SETS.length)];
}

export function getLinkExamples(): LinkExample[] {
  return LINK_EXAMPLE_SETS[getSetIndex('vaani_link_ex_set', LINK_EXAMPLE_SETS.length)];
}

export { TEXT_EXAMPLES, IMAGE_EXAMPLES, AUDIO_EXAMPLES, MIC_EXAMPLES, CAMERA_EXAMPLES, LINK_EXAMPLES };
