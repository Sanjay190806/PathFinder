import { GermanLessonData, GermanLevel, GermanQuizQuestionType } from '../types/german';

const makeVocab = (
  id: string,
  german: string,
  english: string,
  pronunciationHint: string,
  exampleGerman: string,
  exampleEnglish: string,
  category: string
) => ({
  id,
  word: german,
  meaning: english,
  pronunciationHint,
  exampleSentence: exampleGerman,
  german,
  english,
  exampleGerman,
  exampleEnglish,
  category
});

const quiz = (
  type: GermanQuizQuestionType,
  question: string,
  options: string[],
  answer: string,
  explanation: string
) => ({ type, question, options, answer, explanation });

const fullLessons: Omit<GermanLessonData, 'locked' | 'completed' | 'notes' | 'lastPracticed'>[] = [
  {
    id: 'german-1',
    order: 1,
    title: 'Greetings',
    level: 'A1 Beginner',
    objective: 'Greet people politely and close a simple conversation.',
    vocabulary: [
      makeVocab('l1-v1', 'Hallo', 'Hello', 'hah-loh', 'Hallo, ich bin Sanju.', 'Hello, I am Sanju.', 'Greetings'),
      makeVocab('l1-v2', 'Guten Morgen', 'Good morning', 'goo-ten mor-gen', 'Guten Morgen, Frau Weber.', 'Good morning, Ms. Weber.', 'Greetings'),
      makeVocab('l1-v3', 'Tschuess', 'Bye', 'choos', 'Tschuess, bis morgen.', 'Bye, see you tomorrow.', 'Greetings')
    ],
    grammar: [
      { title: 'Formal and casual greetings', explanation: 'Use Hallo with anyone. Use Guten Morgen before noon and Guten Abend in the evening.', examples: ['Hallo, Sanju.', 'Guten Abend, Shayla.'] }
    ],
    examples: [
      { german: 'Hallo! Wie geht es dir?', english: 'Hello! How are you?', pronunciationHint: 'vee gate es deer' },
      { german: 'Mir geht es gut, danke.', english: 'I am doing well, thanks.', pronunciationHint: 'meer gate es goot' }
    ],
    quiz: [
      quiz('german_to_english', 'What does "Guten Morgen" mean?', ['Good night', 'Good morning', 'Goodbye'], 'Good morning', 'Morgen means morning.'),
      quiz('english_to_german', 'Choose "Bye" in German.', ['Hallo', 'Danke', 'Tschuess'], 'Tschuess', 'Tschuess is the casual goodbye.')
    ],
    cultureTip: 'In German, a clear greeting is normal before asking for help.',
    xpReward: 30,
    estimatedMinutes: 15,
    xp: 30,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-2',
    order: 2,
    title: 'Introducing yourself',
    level: 'A1 Beginner',
    objective: 'Say your name, where you are from, and what you study.',
    vocabulary: [
      makeVocab('l2-v1', 'Ich heisse', 'My name is', 'ikh high-seh', 'Ich heisse Sanju.', 'My name is Sanju.', 'Identity'),
      makeVocab('l2-v2', 'Ich komme aus', 'I come from', 'ikh kom-meh ous', 'Ich komme aus Indien.', 'I come from India.', 'Identity'),
      makeVocab('l2-v3', 'Ich studiere', 'I study', 'ikh shtoo-dee-reh', 'Ich studiere ECE.', 'I study ECE.', 'College')
    ],
    grammar: [
      { title: 'Ich + verb', explanation: 'For ich, many regular verbs end with -e: komme, studiere, lerne.', examples: ['Ich komme aus Indien.', 'Ich lerne Deutsch.'] }
    ],
    examples: [
      { german: 'Ich heisse Sanju. Ich komme aus Indien.', english: 'My name is Sanju. I come from India.', pronunciationHint: 'ikh high-seh san-joo' },
      { german: 'Ich studiere Elektronik.', english: 'I study electronics.', pronunciationHint: 'ikh shtoo-dee-reh' }
    ],
    quiz: [
      quiz('fill_blank', 'Ich ____ Sanju.', ['heisse', 'bist', 'sind'], 'heisse', 'Use heisse with ich for "my name is".'),
      quiz('english_to_german', 'I come from India.', ['Ich komme aus Indien.', 'Ich bin Indien.', 'Ich habe Indien.'], 'Ich komme aus Indien.', 'Komme aus means come from.')
    ],
    cultureTip: 'Germans often introduce name and role simply: Ich bin Student.',
    xpReward: 30,
    estimatedMinutes: 18,
    xp: 30,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-3',
    order: 3,
    title: 'Numbers 1-20',
    level: 'A1 Beginner',
    objective: 'Understand and say numbers from one to twenty.',
    vocabulary: [
      makeVocab('l3-v1', 'eins', 'one', 'ines', 'Ich habe eins.', 'I have one.', 'Numbers'),
      makeVocab('l3-v2', 'zehn', 'ten', 'tsayn', 'Ich habe zehn Minuten.', 'I have ten minutes.', 'Numbers'),
      makeVocab('l3-v3', 'zwanzig', 'twenty', 'tsvan-tsikh', 'Zwanzig Minuten Deutsch.', 'Twenty minutes of German.', 'Numbers')
    ],
    grammar: [
      { title: 'Numbers as fixed words', explanation: 'Numbers do not change in basic counting. Practice saying them aloud in small groups.', examples: ['eins, zwei, drei', 'elf, zwoelf, dreizehn'] }
    ],
    examples: [
      { german: 'Ich habe zwei Aufgaben.', english: 'I have two tasks.', pronunciationHint: 'tsvai' },
      { german: 'Heute lerne ich zwanzig Minuten.', english: 'Today I study for twenty minutes.', pronunciationHint: 'tsvan-tsikh' }
    ],
    quiz: [
      quiz('german_to_english', 'What does "zwanzig" mean?', ['twelve', 'twenty', 'two'], 'twenty', 'Zwanzig means twenty.'),
      quiz('english_to_german', 'Choose "ten".', ['zehn', 'zwei', 'zwanzig'], 'zehn', 'Zehn is ten.')
    ],
    xpReward: 30,
    estimatedMinutes: 15,
    xp: 30,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-4',
    order: 4,
    title: 'Days of the week',
    level: 'A1 Beginner',
    objective: 'Name weekdays and talk about today or tomorrow.',
    vocabulary: [
      makeVocab('l4-v1', 'Montag', 'Monday', 'mohn-tahk', 'Am Montag lerne ich Deutsch.', 'On Monday I learn German.', 'Time'),
      makeVocab('l4-v2', 'heute', 'today', 'hoy-teh', 'Heute ist Montag.', 'Today is Monday.', 'Time'),
      makeVocab('l4-v3', 'morgen', 'tomorrow', 'mor-gen', 'Morgen habe ich Unterricht.', 'Tomorrow I have class.', 'Time')
    ],
    grammar: [
      { title: 'Am + day', explanation: 'Use am before a weekday when you mean on that day.', examples: ['Am Dienstag lerne ich Java.', 'Am Freitag habe ich Zeit.'] }
    ],
    examples: [
      { german: 'Heute ist Mittwoch.', english: 'Today is Wednesday.' },
      { german: 'Am Sonntag ruhe ich mich aus.', english: 'On Sunday I rest.' }
    ],
    quiz: [
      quiz('fill_blank', '____ Montag lerne ich Deutsch.', ['Am', 'Ich', 'Der'], 'Am', 'Use am before weekdays.'),
      quiz('german_to_english', 'What does "heute" mean?', ['today', 'tomorrow', 'week'], 'today', 'Heute means today.')
    ],
    xpReward: 30,
    estimatedMinutes: 16,
    xp: 30,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-5',
    order: 5,
    title: 'Basic verbs: sein, haben',
    level: 'A1 Beginner',
    objective: 'Use ich bin and ich habe in simple sentences.',
    vocabulary: [
      makeVocab('l5-v1', 'sein', 'to be', 'zine', 'Ich bin Student.', 'I am a student.', 'Verbs'),
      makeVocab('l5-v2', 'haben', 'to have', 'hah-ben', 'Ich habe Zeit.', 'I have time.', 'Verbs'),
      makeVocab('l5-v3', 'Zeit', 'time', 'tsite', 'Ich habe heute Zeit.', 'I have time today.', 'Daily Life')
    ],
    grammar: [
      { title: 'Irregular basics', explanation: 'Sein and haben are irregular. Memorize: ich bin, du bist, ich habe, du hast.', examples: ['Ich bin bereit.', 'Ich habe eine Frage.'] }
    ],
    examples: [
      { german: 'Ich bin Student.', english: 'I am a student.' },
      { german: 'Ich habe eine Frage.', english: 'I have a question.' }
    ],
    quiz: [
      quiz('fill_blank', 'Ich ____ Student.', ['bin', 'habe', 'bist'], 'bin', 'Use bin with ich for "am".'),
      quiz('fill_blank', 'Ich ____ eine Frage.', ['habe', 'bin', 'ist'], 'habe', 'Use habe for "have".')
    ],
    xpReward: 35,
    estimatedMinutes: 20,
    xp: 35,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-6',
    order: 6,
    title: 'Family',
    level: 'A1 Strong',
    objective: 'Talk about family members with simple articles.',
    vocabulary: [
      makeVocab('l6-v1', 'die Mutter', 'the mother', 'dee moot-ter', 'Meine Mutter ist nett.', 'My mother is kind.', 'Family'),
      makeVocab('l6-v2', 'der Vater', 'the father', 'der fah-ter', 'Mein Vater arbeitet.', 'My father works.', 'Family'),
      makeVocab('l6-v3', 'die Schwester', 'the sister', 'dee shves-ter', 'Meine Schwester lernt.', 'My sister studies.', 'Family')
    ],
    grammar: [
      { title: 'Mein / meine', explanation: 'Use mein with der/das words and meine with die words.', examples: ['mein Vater', 'meine Mutter', 'meine Schwester'] }
    ],
    examples: [
      { german: 'Das ist mein Bruder.', english: 'That is my brother.' },
      { german: 'Meine Familie ist in Indien.', english: 'My family is in India.' }
    ],
    quiz: [
      quiz('article_choice', 'Choose the correct article: ____ Mutter', ['der', 'die', 'das'], 'die', 'Mutter uses die.'),
      quiz('fill_blank', '____ Vater ist nett.', ['Mein', 'Meine', 'Der die'], 'Mein', 'Vater is masculine, so use mein.')
    ],
    xpReward: 35,
    estimatedMinutes: 18,
    xp: 35,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-7',
    order: 7,
    title: 'College vocabulary',
    level: 'A1 Strong',
    objective: 'Describe your college life and study routine.',
    vocabulary: [
      makeVocab('l7-v1', 'die Hochschule', 'college/university', 'dee hoakh-shoo-leh', 'Meine Hochschule ist in Chennai.', 'My college is in Chennai.', 'College'),
      makeVocab('l7-v2', 'der Kurs', 'the course', 'der koers', 'Der Kurs ist interessant.', 'The course is interesting.', 'College'),
      makeVocab('l7-v3', 'die Pruefung', 'the exam', 'dee prue-fung', 'Die Pruefung ist morgen.', 'The exam is tomorrow.', 'College')
    ],
    grammar: [
      { title: 'Simple adjective position', explanation: 'In basic A1 sentences, adjectives often come after ist: Der Kurs ist schwer.', examples: ['Die Aufgabe ist wichtig.', 'Der Kurs ist interessant.'] }
    ],
    examples: [
      { german: 'Ich studiere an der Hochschule.', english: 'I study at the college.' },
      { german: 'Die Pruefung ist wichtig.', english: 'The exam is important.' }
    ],
    quiz: [
      quiz('german_to_english', 'What is "die Pruefung"?', ['project', 'exam', 'classroom'], 'exam', 'Pruefung means exam.'),
      quiz('fill_blank', 'Der Kurs ____ interessant.', ['ist', 'bin', 'habe'], 'ist', 'Use ist for he/she/it or a noun.')
    ],
    xpReward: 35,
    estimatedMinutes: 20,
    xp: 35,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-8',
    order: 8,
    title: 'Time expressions',
    level: 'A1 Strong',
    objective: 'Talk about time blocks and study plans.',
    vocabulary: [
      makeVocab('l8-v1', 'um acht Uhr', 'at eight o clock', 'oom akht oor', 'Ich lerne um acht Uhr.', 'I study at eight o clock.', 'Time'),
      makeVocab('l8-v2', 'jeden Tag', 'every day', 'yay-den tahk', 'Ich lerne jeden Tag.', 'I learn every day.', 'Time'),
      makeVocab('l8-v3', 'spaeter', 'later', 'shpay-ter', 'Ich mache das spaeter.', 'I will do that later.', 'Time')
    ],
    grammar: [
      { title: 'Um + clock time', explanation: 'Use um before a specific clock time.', examples: ['um sieben Uhr', 'um zehn Uhr'] }
    ],
    examples: [
      { german: 'Ich lerne jeden Tag Deutsch.', english: 'I learn German every day.' },
      { german: 'Um neun Uhr mache ich DSA.', english: 'At nine o clock I do DSA.' }
    ],
    quiz: [
      quiz('fill_blank', 'Ich lerne ____ acht Uhr.', ['um', 'am', 'ich'], 'um', 'Specific time uses um.'),
      quiz('german_to_english', 'What does "jeden Tag" mean?', ['every day', 'today', 'late'], 'every day', 'Jeden Tag means every day.')
    ],
    xpReward: 35,
    estimatedMinutes: 17,
    xp: 35,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-9',
    order: 9,
    title: 'Food basics',
    level: 'A1 Strong',
    objective: 'Order simple food and say what you like.',
    vocabulary: [
      makeVocab('l9-v1', 'das Wasser', 'the water', 'das vah-ser', 'Ich trinke Wasser.', 'I drink water.', 'Food'),
      makeVocab('l9-v2', 'der Reis', 'the rice', 'der rice', 'Ich esse Reis.', 'I eat rice.', 'Food'),
      makeVocab('l9-v3', 'ich moechte', 'I would like', 'ikh moekh-teh', 'Ich moechte Wasser.', 'I would like water.', 'Food')
    ],
    grammar: [
      { title: 'Ich moechte', explanation: 'Use ich moechte to request something politely.', examples: ['Ich moechte Tee.', 'Ich moechte Reis.'] }
    ],
    examples: [
      { german: 'Ich moechte einen Kaffee.', english: 'I would like a coffee.' },
      { german: 'Das Essen ist gut.', english: 'The food is good.' }
    ],
    quiz: [
      quiz('german_to_english', 'What does "ich moechte" mean?', ['I have', 'I would like', 'I am'], 'I would like', 'It is the polite request phrase.'),
      quiz('article_choice', 'Choose the article: ____ Wasser', ['der', 'die', 'das'], 'das', 'Wasser uses das.')
    ],
    xpReward: 35,
    estimatedMinutes: 20,
    xp: 35,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-10',
    order: 10,
    title: 'Travel basics',
    level: 'A1 Strong',
    objective: 'Ask where a place is and understand simple travel words.',
    vocabulary: [
      makeVocab('l10-v1', 'der Bahnhof', 'the train station', 'der bahn-hof', 'Wo ist der Bahnhof?', 'Where is the train station?', 'Travel'),
      makeVocab('l10-v2', 'die Stadt', 'the city', 'dee shtat', 'Die Stadt ist gross.', 'The city is big.', 'Travel'),
      makeVocab('l10-v3', 'links', 'left', 'links', 'Der Bahnhof ist links.', 'The station is on the left.', 'Travel')
    ],
    grammar: [
      { title: 'Wo ist ...?', explanation: 'Use Wo ist plus the place to ask where something is.', examples: ['Wo ist der Bahnhof?', 'Wo ist die Hochschule?'] }
    ],
    examples: [
      { german: 'Entschuldigung, wo ist der Bahnhof?', english: 'Excuse me, where is the train station?' },
      { german: 'Gehen Sie rechts.', english: 'Go right.' }
    ],
    quiz: [
      quiz('fill_blank', '____ ist der Bahnhof?', ['Wo', 'Was', 'Wer'], 'Wo', 'Wo means where.'),
      quiz('german_to_english', 'What does "links" mean?', ['right', 'left', 'straight'], 'left', 'Links means left.')
    ],
    cultureTip: 'Say Entschuldigung before asking a stranger for directions.',
    xpReward: 40,
    estimatedMinutes: 22,
    xp: 40,
    vocabularyCount: 3,
    quizScore: 0
  }
];

const extraFullLessons: Omit<GermanLessonData, 'locked' | 'completed' | 'notes' | 'lastPracticed'>[] = [
  {
    id: 'german-1', // Will map dynamically below
    order: 11,
    title: 'German articles der/die/das',
    level: 'A1 Beginner',
    objective: 'Learn masculine, feminine, and neuter articles for common nouns.',
    vocabulary: [
      makeVocab('l11-v1', 'der Mann', 'the man', 'der mahn', 'Der Mann lernt Deutsch.', 'The man learns German.', 'Nouns'),
      makeVocab('l11-v2', 'die Frau', 'the woman', 'dee frow', 'Die Frau lernt Java.', 'The woman learns Java.', 'Nouns'),
      makeVocab('l11-v3', 'das Kind', 'the child', 'das kint', 'Das Kind schlaeft.', 'The child is sleeping.', 'Nouns')
    ],
    grammar: [
      { title: 'Noun Gender', explanation: 'German nouns have three genders: masculine (der), feminine (die), and neuter (das). Learn the article with the noun!', examples: ['der Mann (masculine)', 'die Frau (feminine)', 'das Kind (neuter)'] }
    ],
    examples: [
      { german: 'Der Mann ist ein Student.', english: 'The man is a student.', pronunciationHint: 'der mahn ist ine shtoo-dent' },
      { german: 'Die Frau lernt jeden Tag.', english: 'The woman studies every day.', pronunciationHint: 'dee frow lairnt' }
    ],
    quiz: [
      quiz('article_choice', 'Choose the article: ____ Frau', ['der', 'die', 'das'], 'die', 'Frau is feminine (die).'),
      quiz('article_choice', 'Choose the article: ____ Mann', ['der', 'die', 'das'], 'der', 'Mann is masculine (der).')
    ],
    xpReward: 40,
    estimatedMinutes: 18,
    xp: 40,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-2',
    order: 12,
    title: 'Nominative case intro',
    level: 'A1 Beginner',
    objective: 'Understand and use the subject case (Nominative) in simple sentences.',
    vocabulary: [
      makeVocab('l12-v1', 'wer', 'who', 'vair', 'Wer ist das Kind?', 'Who is the child?', 'Questions'),
      makeVocab('l12-v2', 'was', 'what', 'vas', 'Was ist das?', 'What is that?', 'Questions'),
      makeVocab('l12-v3', 'ein / eine', 'a / an', 'ine / eye-neh', 'Ein Mann und eine Frau.', 'A man and a woman.', 'Articles')
    ],
    grammar: [
      { title: 'The Nominative Subject', explanation: 'Nominative represents the subject doing the action. Articles are: der/die/das (definite) and ein/eine/ein (indefinite).', examples: ['Ein Mann lernt.', 'Die Frau singt.', 'Das Kind spielt.'] }
    ],
    examples: [
      { german: 'Wer lernt heute Java?', english: 'Who is learning Java today?', pronunciationHint: 'vair lairnt hoy-teh' },
      { german: 'Das ist eine Pruefung.', english: 'That is an exam.', pronunciationHint: 'das ist eye-neh prue-fung' }
    ],
    quiz: [
      quiz('fill_blank', '____ Mann ist hier.', ['Ein', 'Eine', 'Eines'], 'Ein', 'Mann is masculine, so use indefinite "ein".'),
      quiz('german_to_english', 'What is the nominative case?', ['The direct object', 'The subject of the sentence', 'Prepositional object'], 'The subject of the sentence', 'Nominative is who/what is performing the action.')
    ],
    xpReward: 40,
    estimatedMinutes: 20,
    xp: 40,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-3',
    order: 13,
    title: 'Common questions',
    level: 'A1 Beginner',
    objective: 'Ask simple questions using W-words.',
    vocabulary: [
      makeVocab('l13-v1', 'wie', 'how', 'vee', 'Wie heissen Sie?', 'What is your name? (formal)', 'Questions'),
      makeVocab('l13-v2', 'wo', 'where', 'voh', 'Wo wohnen Sie?', 'Where do you live?', 'Questions'),
      makeVocab('l13-v3', 'warum', 'why', 'vah-rum', 'Warum lernst du Deutsch?', 'Why are you learning German?', 'Questions')
    ],
    grammar: [
      { title: 'W-Questions structure', explanation: 'In W-questions, the question word goes first, followed immediately by the verb in position 2.', examples: ['Wie geht es dir?', 'Wo ist der Bahnhof?', 'Was machst du?'] }
    ],
    examples: [
      { german: 'Wo wohnst du, Sanju?', english: 'Where do you live, Sanju?', pronunciationHint: 'voh vohnst doo' },
      { german: 'Wie heisst deine Hochschule?', english: 'What is the name of your college?', pronunciationHint: 'vee heisst' }
    ],
    quiz: [
      quiz('fill_blank', '____ alt bist du?', ['Wie', 'Wo', 'Was'], 'Wie', 'Wie alt bist du? means How old are you?'),
      quiz('fill_blank', '____ wohnst du?', ['Wo', 'Wie', 'Wer'], 'Wo', 'Wo means where.')
    ],
    xpReward: 40,
    estimatedMinutes: 16,
    xp: 40,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-4',
    order: 14,
    title: 'Daily routine',
    level: 'A1 Beginner',
    objective: 'Describe your daily routine in simple German.',
    vocabulary: [
      makeVocab('l14-v1', 'aufstehen', 'to stand up / wake up', 'owf-shtayn', 'Ich stehe um sieben Uhr auf.', 'I wake up at seven o clock.', 'Daily Life'),
      makeVocab('l14-v2', 'schlafen', 'to sleep', 'shlah-fen', 'Ich schlafe gut.', 'I sleep well.', 'Daily Life'),
      makeVocab('l14-v3', 'arbeiten', 'to work', 'ahr-bye-ten', 'Ich arbeite heute.', 'I am working today.', 'Daily Life')
    ],
    grammar: [
      { title: 'Separable Verbs Intro', explanation: 'Verbs like aufstehen split up: "auf" goes to the very end of the sentence while the base verb conjugations stay in position 2.', examples: ['Ich stehe auf.', 'Er steht um acht Uhr auf.'] }
    ],
    examples: [
      { german: 'Am Montag arbeite ich viel.', english: 'On Monday I work a lot.', pronunciationHint: 'ahr-bye-teh' },
      { german: 'Wann stehst du auf?', english: 'When do you wake up?', pronunciationHint: 'owf' }
    ],
    quiz: [
      quiz('fill_blank', 'Ich stehe um sechs Uhr ____.', ['auf', 'an', 'zu'], 'auf', 'Aufstehen splits; auf goes to the end.'),
      quiz('german_to_english', 'What does "arbeiten" mean?', ['to play', 'to sleep', 'to work'], 'to work', 'Arbeiten means to work.')
    ],
    xpReward: 40,
    estimatedMinutes: 18,
    xp: 40,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-5',
    order: 15,
    title: 'Simple present tense',
    level: 'A1 Beginner',
    objective: 'Conjugate regular verbs in present tense.',
    vocabulary: [
      makeVocab('l15-v1', 'gehen', 'to go', 'gayn', 'Ich gehe zum College.', 'I am going to college.', 'Verbs'),
      makeVocab('l15-v2', 'kommen', 'to come', 'kom-men', 'Ich komme aus Indien.', 'I come from India.', 'Verbs'),
      makeVocab('l15-v3', 'machen', 'to do / make', 'makh-en', 'Ich mache Java DSA.', 'I am doing Java DSA.', 'Verbs')
    ],
    grammar: [
      { title: 'Regular Verb Conjugation', explanation: 'Conjugation endings for regular verbs: ich (-e), du (-st), er/sie/es (-t), wir (-en), ihr (-t), sie/Sie (-en).', examples: ['ich lerne, du lernst, er lernt', 'wir lernen, ihr lernt, sie lernen'] }
    ],
    examples: [
      { german: 'Du gehst nach Hause.', english: 'You are going home.', pronunciationHint: 'gayst' },
      { german: 'Wir machen ein Projekt.', english: 'We are doing a project.', pronunciationHint: 'makh-en' }
    ],
    quiz: [
      quiz('fill_blank', 'Du ____ Deutsch.', ['lernst', 'lerne', 'lernt'], 'lernst', 'Use -st ending for du.'),
      quiz('fill_blank', 'Wir ____ Kaffee.', ['trinken', 'trinkst', 'trinkt'], 'trinken', 'Use -en ending for wir.')
    ],
    xpReward: 40,
    estimatedMinutes: 18,
    xp: 40,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-6',
    order: 16,
    title: 'Modal verbs intro',
    level: 'A1 Strong',
    objective: 'Express ability (können) and necessity (müssen) in simple sentences.',
    vocabulary: [
      makeVocab('l16-v1', 'koennen', 'can / to be able to', 'koen-nen', 'Ich kann Deutsch sprechen.', 'I can speak German.', 'Verbs'),
      makeVocab('l16-v2', 'muessen', 'must / to have to', 'mues-sen', 'Ich muss heute lernen.', 'I have to study today.', 'Verbs'),
      makeVocab('l16-v3', 'wollen', 'to want', 'vol-len', 'Ich will das machen.', 'I want to do that.', 'Verbs')
    ],
    grammar: [
      { title: 'Modal Verbs Structure', explanation: 'Modal verb is conjugated in position 2, and the secondary verb (in infinitive form) is pushed to the very end of the sentence.', examples: ['Ich kann Java codieren.', 'Du musst die Pruefung schreiben.'] }
    ],
    examples: [
      { german: 'Ich kann heute nicht kommen.', english: 'I cannot come today.', pronunciationHint: 'kahn' },
      { german: 'Sanju muss eine Aufgabe machen.', english: 'Sanju has to complete a task.', pronunciationHint: 'moost' }
    ],
    quiz: [
      quiz('fill_blank', 'Ich ____ Deutsch sprechen.', ['kann', 'kannst', 'koennen'], 'kann', 'Ich form of koennen is irregular: kann.'),
      quiz('german_to_english', 'Where does the main verb go when using a modal verb?', ['At the beginning', 'Immediately after the modal verb', 'At the very end of the sentence'], 'At the very end of the sentence', 'Secondary verb goes in infinitive format at the end.')
    ],
    xpReward: 40,
    estimatedMinutes: 20,
    xp: 40,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-7',
    order: 17,
    title: 'Pronouns',
    level: 'A1 Strong',
    objective: 'Understand personal pronouns for addressing individuals and groups.',
    vocabulary: [
      makeVocab('l17-v1', 'wir', 'we', 'veer', 'Wir lernen gemeinsam.', 'We study together.', 'Pronouns'),
      makeVocab('l17-v2', 'ihr', 'y all / you (plural)', 'eer', 'Ihr lernt Java.', 'Y all are learning Java.', 'Pronouns'),
      makeVocab('l17-v3', 'Sie', 'you (formal)', 'zee', 'Wie heissen Sie?', 'What is your name? (formal)', 'Pronouns')
    ],
    grammar: [
      { title: 'Addressing groups', explanation: 'Use "ihr" for multiple friends/peers. Use capitalized "Sie" for formal addresses (professors, strangers).', examples: ['Wie geht es euch? (informal plural)', 'Wie geht es Ihnen? (formal)'] }
    ],
    examples: [
      { german: 'Wir sind bereit.', english: 'We are ready.', pronunciationHint: 'veer zint' },
      { german: 'Woher kommen Sie?', english: 'Where do you come from? (formal)', pronunciationHint: 'zee' }
    ],
    quiz: [
      quiz('fill_blank', '____ sind bereit.', ['Wir', 'Ihr', 'Du'], 'Wir', 'Wir matches sind.'),
      quiz('german_to_english', 'Which pronoun is used for formal polite address?', ['du', 'ihr', 'Sie'], 'Sie', 'Sie (always capitalized) is formal you.')
    ],
    xpReward: 40,
    estimatedMinutes: 15,
    xp: 40,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-8',
    order: 18,
    title: 'Common adjectives',
    level: 'A1 Strong',
    objective: 'Describe things and tasks using common adjectives.',
    vocabulary: [
      makeVocab('l18-v1', 'gross', 'big / tall', 'groas', 'Die Aufgabe ist gross.', 'The task is big.', 'Adjectives'),
      makeVocab('l18-v2', 'klein', 'small', 'kline', 'Das Zimmer ist klein.', 'The room is small.', 'Adjectives'),
      makeVocab('l18-v3', 'gut', 'good', 'goot', 'Das ist gut.', 'That is good.', 'Adjectives')
    ],
    grammar: [
      { title: 'Adjectives after sein', explanation: 'Adjectives do not change their endings when placed after the verb "sein" (ist / sind).', examples: ['Der Kurs ist schwer.', 'Die Aufgaben sind leicht.'] }
    ],
    examples: [
      { german: 'Das Projekt ist gross.', english: 'The project is big.' },
      { german: 'Mein Laptop ist gut.', english: 'My laptop is good.' }
    ],
    quiz: [
      quiz('german_to_english', 'What is the opposite of "gross"?', ['klein', 'gut', 'schwer'], 'klein', 'Klein means small, opposite of gross.'),
      quiz('german_to_english', 'What does "gut" mean?', ['bad', 'good', 'tall'], 'good', 'Gut means good.')
    ],
    xpReward: 40,
    estimatedMinutes: 15,
    xp: 40,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-9',
    order: 19,
    title: 'Places in city',
    level: 'A2 Beginner',
    objective: 'Identify common buildings and places in a town.',
    vocabulary: [
      makeVocab('l19-v1', 'der Supermarkt', 'the supermarket', 'der zoo-per-markt', 'Wo ist der Supermarkt?', 'Where is the supermarket?', 'Town'),
      makeVocab('l19-v2', 'der Park', 'the park', 'der park', 'Der Park ist gross.', 'The park is big.', 'Town'),
      makeVocab('l19-v3', 'die Apotheke', 'the pharmacy', 'dee ah-po-tay-keh', 'Die Apotheke ist links.', 'The pharmacy is on the left.', 'Town')
    ],
    grammar: [
      { title: 'Location direction', explanation: 'Use "in" for "in/inside" or "zu" for "to". In + Dative is used for location: "im Park" (in the park).', examples: ['Ich bin im Park.', 'Ich gehe zum Supermarkt.'] }
    ],
    examples: [
      { german: 'Wo ist der Supermarkt?', english: 'Where is the supermarket?' },
      { german: 'Ich muss zur Apotheke.', english: 'I have to go to the pharmacy.' }
    ],
    quiz: [
      quiz('german_to_english', 'What does "Supermarkt" mean?', ['supermarket', 'school', 'hospital'], 'supermarket', 'Supermarkt is supermarket.'),
      quiz('article_choice', 'Choose the article: ____ Apotheke', ['der', 'die', 'das'], 'die', 'Apotheke is feminine (die).')
    ],
    xpReward: 40,
    estimatedMinutes: 20,
    xp: 40,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-10', // Will map dynamically below
    order: 20,
    title: 'Directions',
    level: 'A2 Beginner',
    objective: 'Navigate through a city using simple direction cues.',
    vocabulary: [
      makeVocab('l20-v1', 'geradeaus', 'straight ahead', 'geh-rah-deh-ows', 'Gehen Sie geradeaus.', 'Go straight ahead.', 'Travel'),
      makeVocab('l20-v2', 'rechts', 'right', 'rekhts', 'Der Park ist rechts.', 'The park is on the right.', 'Travel'),
      makeVocab('l20-v3', 'links', 'left', 'links', 'Die Apotheke ist links.', 'The pharmacy is on the left.', 'Travel')
    ],
    grammar: [
      { title: 'Biegen Sie ... ab', explanation: 'To command a turn: use "Biegen Sie [direction] ab" (from the separable verb abbiegen).', examples: ['Biegen Sie links ab.', 'Gehen Sie geradeaus.'] }
    ],
    examples: [
      { german: 'Gehen Sie geradeaus und dann rechts.', english: 'Go straight ahead and then right.' },
      { german: 'Wo ist links?', english: 'Where is left?' }
    ],
    quiz: [
      quiz('german_to_english', 'What does "geradeaus" mean?', ['left', 'right', 'straight ahead'], 'straight ahead', 'Geradeaus means straight ahead.'),
      quiz('fill_blank', 'Biegen Sie ____ ab.', ['links', 'geradeaus', 'unter'], 'links', 'Use links for left (or rechts for right) before ab.')
    ],
    xpReward: 40,
    estimatedMinutes: 20,
    xp: 40,
    vocabularyCount: 3,
    quizScore: 0
  }
];

const placeholderTitles = [
  'Tech vocabulary',
  'Career vocabulary',
  'Study vocabulary',
  'Germany culture basics',
  'Simple conversations',
  'Listening practice placeholder',
  'Speaking practice placeholder',
  'Writing practice',
  'Revision A1',
  'A1 checkpoint quiz'
];

const makePlaceholderLesson = (index: number): Omit<GermanLessonData, 'locked' | 'completed' | 'notes' | 'lastPracticed'> => {
  const order = index + 21;
  const level: GermanLevel = order <= 25 ? 'A2 Beginner' : 'A2 Strong';
  const title = placeholderTitles[index] || `German lesson ${order}`;
  return {
    id: `german-${order}`,
    order,
    title,
    level,
    objective: `Build practical ${title.toLowerCase()} language with A1/A2 sentence patterns.`,
    vocabulary: [
      makeVocab(`l${order}-v1`, 'lernen', 'to learn', 'lair-nen', 'Ich lerne Deutsch.', 'I learn German.', title),
      makeVocab(`l${order}-v2`, 'wichtig', 'important', 'vikh-tikh', 'Das ist wichtig.', 'That is important.', title),
      makeVocab(`l${order}-v3`, 'heute', 'today', 'hoy-teh', 'Heute uebe ich.', 'Today I practice.', title)
    ],
    grammar: [
      { title: `${title} sentence frame`, explanation: 'Use short subject-verb-object sentences first. Accuracy beats fancy grammar.', examples: ['Ich lerne heute.', 'Das ist wichtig.'] }
    ],
    examples: [
      { german: 'Ich uebe jeden Tag ein bisschen.', english: 'I practice a little every day.' },
      { german: 'Kannst du das bitte wiederholen?', english: 'Can you please repeat that?' }
    ],
    quiz: [
      quiz('german_to_english', 'What does "wichtig" mean?', ['important', 'late', 'easy'], 'important', 'Wichtig means important.'),
      quiz('fill_blank', 'Ich ____ Deutsch.', ['lerne', 'bist', 'sind'], 'lerne', 'Use lerne with ich.')
    ],
    cultureTip: 'In A2 conversations, simple correct sentences are stronger than memorized long lines.',
    xpReward: order <= 25 ? 40 : 45,
    estimatedMinutes: 20,
    xp: order <= 25 ? 40 : 45,
    vocabularyCount: 3,
    quizScore: 0
  };
};

export const GERMAN_LESSONS: GermanLessonData[] = [
  ...fullLessons,
  ...extraFullLessons,
  ...Array.from({ length: 10 }, (_, index) => makePlaceholderLesson(index))
].map((lesson, index) => ({
  ...lesson,
  id: `german-${index + 1}`,
  locked: index > 0,
  completed: false,
  notes: '',
  lastPracticed: null
}));
