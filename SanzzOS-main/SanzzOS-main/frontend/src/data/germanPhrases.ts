export interface GermanPhraseOfTheDay {
  phrase: string;
  meaning: string;
  pronunciationHint: string;
  context: string;
}

export const GERMAN_PHRASES: GermanPhraseOfTheDay[] = [
  {
    phrase: 'Ich lerne jeden Tag ein bisschen Deutsch.',
    meaning: 'I learn a little German every day.',
    pronunciationHint: 'ikh lehr-neh yeh-den tahk ain bish-chen doych',
    context: 'A perfect daily accountability phrase for steady progress.'
  },
  {
    phrase: 'Kleine Schritte, großer Fortschritt.',
    meaning: 'Small steps, big progress.',
    pronunciationHint: 'kly-nuh shrit-uh, gro-ser fort-shrit',
    context: 'Great mindset phrase for consistency.'
  },
  {
    phrase: 'Du schaffst das.',
    meaning: 'You can do it.',
    pronunciationHint: 'doo shahfst dahs',
    context: 'Short motivation for study sessions.'
  }
];
