const femaleVoiceHints = [
  'zira',
  'samantha',
  'aria',
  'jenny',
  'natasha',
  'susan',
  'victoria',
  'karen',
  'female',
  'woman',
  'girl',
  'google uk english female',
  'google us english'
];

const cleanForSpeech = (text: string) =>
  text.replace(/[*#`_\-]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

export function pickShaylaVoice(lang: string): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return undefined;

  const normalizedLang = lang.toLowerCase();
  const languageMatches = voices.filter((voice) => voice.lang.toLowerCase().startsWith(normalizedLang.split('-')[0]));
  const candidates = languageMatches.length ? languageMatches : voices;

  return candidates.find((voice) => {
    const label = `${voice.name} ${voice.voiceURI}`.toLowerCase();
    return femaleVoiceHints.some((hint) => label.includes(hint));
  }) || languageMatches[0] || voices[0];
}

export function getShaylaVoiceName(lang = 'en-US'): string {
  return pickShaylaVoice(lang)?.name || 'Browser default voice';
}

export function speakShaylaText(text: string): string {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return 'Speech not supported';
  }

  window.speechSynthesis.cancel();
  const cleanText = cleanForSpeech(text);
  const isGerman = /^(hallo|guten|ja|nein|ich|ist|wie|was|und|auf)/i.test(cleanText) || cleanText.includes('bitte') || cleanText.includes('danke');
  const lang = isGerman ? 'de-DE' : 'en-US';
  const utterance = new SpeechSynthesisUtterance(cleanText);
  const voice = pickShaylaVoice(lang);

  utterance.lang = lang;
  utterance.pitch = isGerman ? 1.08 : 1.18;
  utterance.rate = isGerman ? 0.98 : 0.96;
  utterance.volume = 1;
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
  return voice?.name || 'Browser default voice';
}
