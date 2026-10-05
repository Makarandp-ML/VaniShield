export interface TickerItem {
  category: 'AI_SAFETY' | 'FAKE_NEWS' | 'DEEPFAKE' | 'CYBERCRIME';
  text: string;
  source?: string;
  url?: string;
}

const FALLBACK_ITEMS: TickerItem[] = [
  { category: 'AI_SAFETY', text: 'Live AI Safety Updates currently unavailable.' },
  { category: 'FAKE_NEWS', text: 'Live AI Safety Updates currently unavailable.' },
  { category: 'DEEPFAKE', text: 'Live AI Safety Updates currently unavailable.' },
  { category: 'CYBERCRIME', text: 'Live AI Safety Updates currently unavailable.' },
];

export { FALLBACK_ITEMS };
