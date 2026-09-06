export interface GermanGrammarTopic {
  id: string;
  title: string;
  explanation: string;
  example: string;
}

export const GERMAN_GRAMMAR: GermanGrammarTopic[] = [
  {
    id: 'articles',
    title: 'der / die / das',
    explanation: 'German nouns use grammatical gender, so the article is part of the word memory set.',
    example: 'der Student, die Stadt, das Buch'
  },
  {
    id: 'present-tense',
    title: 'Simple present tense',
    explanation: 'Use the present tense for habits, routines, and everyday facts.',
    example: 'Ich lerne jeden Tag Deutsch.'
  },
  {
    id: 'modal-verbs',
    title: 'Modal verbs',
    explanation: 'Modal verbs help express ability, need, and desire.',
    example: 'Ich kann heute lernen.'
  },
  {
    id: 'nominative',
    title: 'Nominative case',
    explanation: 'The nominative case is used for the subject of the sentence.',
    example: 'Der Student lernt.'
  }
];
