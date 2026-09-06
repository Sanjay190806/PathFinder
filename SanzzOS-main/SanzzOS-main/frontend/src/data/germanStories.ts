export interface GermanStory {
  id: string;
  title: string;
  level: 'A1' | 'A2';
  german: string;
  english: string;
  vocabularyHighlights: string[];
  comprehensionQuestions: string[];
}

export const GERMAN_STORIES: GermanStory[] = [
  {
    id: 'story-1',
    title: 'Sanju goes to college',
    level: 'A1',
    german: 'Sanju geht jeden Morgen zur Hochschule. Er lernt Java, Deutsch und DSA. Danach trinkt er Tee und beginnt mit dem Unterricht.',
    english: 'Sanju goes to college every morning. He studies Java, German, and DSA. After that, he drinks tea and starts class.',
    vocabularyHighlights: ['jeden Morgen', 'Hochschule', 'Unterricht'],
    comprehensionQuestions: ['Where does Sanju go?', 'What does he study?', 'What does he drink after studying?']
  },
  {
    id: 'story-2',
    title: 'A day in Chennai',
    level: 'A1',
    german: 'In Chennai ist es warm. Sanju geht durch die Stadt, besucht ein Cafe und arbeitet an seinem Projekt.',
    english: 'In Chennai it is warm. Sanju walks through the city, visits a cafe, and works on his project.',
    vocabularyHighlights: ['warm', 'Stadt', 'Projekt'],
    comprehensionQuestions: ['How is the weather?', 'Where does Sanju go?', 'What is he working on?']
  },
  {
    id: 'story-3',
    title: 'Learning German every day',
    level: 'A1',
    german: 'Jeden Tag lernt Sanju ein bisschen Deutsch. Er wiederholt Woerter, hoert kurze Saetze und spricht laut.',
    english: 'Every day Sanju learns a little German. He repeats words, listens to short sentences, and speaks aloud.',
    vocabularyHighlights: ['jeden Tag', 'wiederholt', 'laut'],
    comprehensionQuestions: ['How often does he learn?', 'What does he repeat?', 'How does he practice speaking?']
  },
  {
    id: 'story-4',
    title: 'Preparing for interview',
    level: 'A2',
    german: 'Sanju bereitet sich auf ein Interview vor. Er sagt seinen Namen, beschreibt sein Studium und erklaert sein Projekt kurz.',
    english: 'Sanju prepares for an interview. He says his name, describes his studies, and explains his project briefly.',
    vocabularyHighlights: ['bereitet sich vor', 'Studium', 'erklaert'],
    comprehensionQuestions: ['What is Sanju preparing for?', 'What does he describe?', 'How does he explain his project?']
  },
  {
    id: 'story-5',
    title: 'Buying food',
    level: 'A1',
    german: 'Im Laden moechte Sanju Wasser und Reis kaufen. Er sagt bitte und danke. Der Verkaeufer laechelt.',
    english: 'In the shop Sanju wants to buy water and rice. He says please and thank you. The seller smiles.',
    vocabularyHighlights: ['Laden', 'kaufen', 'Verkaeufer'],
    comprehensionQuestions: ['What does Sanju want to buy?', 'What polite words does he use?', 'How does the seller react?']
  },
  {
    id: 'story-6',
    title: 'At the train station',
    level: 'A1',
    german: 'Sanju ist am Bahnhof. Er fragt: Wo ist der Zug? Eine Person zeigt nach links und sagt, dass er bald kommt.',
    english: 'Sanju is at the train station. He asks: Where is the train? A person points left and says it is coming soon.',
    vocabularyHighlights: ['Bahnhof', 'Zug', 'links'],
    comprehensionQuestions: ['Where is Sanju?', 'What does he ask?', 'Which direction is shown?']
  },
  {
    id: 'story-7',
    title: 'Talking about family',
    level: 'A1',
    german: 'Sanju spricht ueber seine Familie. Seine Mutter ist nett, sein Vater arbeitet, und seine Schwester lernt auch.',
    english: 'Sanju talks about his family. His mother is kind, his father works, and his sister studies too.',
    vocabularyHighlights: ['Familie', 'Mutter', 'Schwester'],
    comprehensionQuestions: ['Who is kind?', 'Who works?', 'Who studies too?']
  },
  {
    id: 'story-8',
    title: 'My project',
    level: 'A2',
    german: 'Sanju erklaert sein Projekt. Es hilft Menschen, Aufgaben zu planen, Fortschritt zu sehen und konzentriert zu bleiben.',
    english: 'Sanju explains his project. It helps people plan tasks, see progress, and stay focused.',
    vocabularyHighlights: ['erklaert', 'Fortschritt', 'konzentriert'],
    comprehensionQuestions: ['What does the project help with?', 'What can users see?', 'What should users stay?']
  },
  {
    id: 'story-9',
    title: 'My career goal',
    level: 'A2',
    german: 'Sanju hat ein klares Ziel. Er moechte als Software Engineer arbeiten, gute Interviews bestehen und in Deutschland besser sprechen.',
    english: 'Sanju has a clear goal. He wants to work as a Software Engineer, pass good interviews, and speak better in Germany.',
    vocabularyHighlights: ['Ziel', 'arbeiten', 'bestehen'],
    comprehensionQuestions: ['What is Sanju’s goal?', 'What kind of job does he want?', 'Where does he want to speak better?']
  },
  {
    id: 'story-10',
    title: 'A short German introduction',
    level: 'A1',
    german: 'Hallo, ich heisse Sanju. Ich komme aus Indien. Ich studiere ECE und lerne jeden Tag Deutsch.',
    english: 'Hello, my name is Sanju. I come from India. I study ECE and learn German every day.',
    vocabularyHighlights: ['heisse', 'komme aus', 'studiere'],
    comprehensionQuestions: ['What is his name?', 'Where is he from?', 'What does he study?']
  }
];

