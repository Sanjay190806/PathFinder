export const DAILY_180_QUOTES = Array.from({ length: 180 }, (_, index) => {
  const day = index + 1;
  const themes = [
    'Show up before confidence arrives.',
    'One focused block beats a day of wishing.',
    'Your future self needs evidence, not excuses.',
    'Small wins compound into placement readiness.',
    'Today is a vote for the engineer you are becoming.',
    'Do the next problem with full attention.',
    'Discipline is quiet, but its results are loud.',
    'A weak day still counts when you refuse zero.',
    'Clarity comes after action.',
    'Practice until the pattern feels familiar.'
  ];
  return {
    day,
    quote: themes[index % themes.length],
    mission: `Day ${day}: protect one meaningful study block and log the proof.`
  };
});

export const SUNDAY_REAL_PERSON_STORIES = [
  {
    person: 'Katherine Johnson',
    field: 'Mathematician',
    story: 'Katherine Johnson built trust through accuracy. Her calculations helped NASA missions because she repeatedly proved her work under pressure, one precise solution at a time.',
    takeaway: 'Make your preparation so reliable that pressure has less room to scare you.'
  },
  {
    person: 'Dr. A. P. J. Abdul Kalam',
    field: 'Scientist and teacher',
    story: 'A. P. J. Abdul Kalam grew from a modest background into a scientist by staying curious, disciplined, and deeply committed to learning from every stage of his journey.',
    takeaway: 'Your background is context, not a ceiling.'
  },
  {
    person: 'Mary Kom',
    field: 'Boxer',
    story: 'Mary Kom returned to elite boxing after major life changes and kept winning by rebuilding rhythm, strength, and belief through repeated training.',
    takeaway: 'Comebacks are built in ordinary sessions before anyone applauds.'
  },
  {
    person: 'Sundar Pichai',
    field: 'Technology leader',
    story: 'Sundar Pichai advanced by combining technical depth with calm communication, showing that clear thinking can become leadership over time.',
    takeaway: 'Build skill, then learn to explain it simply.'
  },
  {
    person: 'Kalpana Chawla',
    field: 'Astronaut',
    story: 'Kalpana Chawla pursued aerospace with persistence across countries, systems, and exams, turning a childhood fascination into disciplined technical work.',
    takeaway: 'Big dreams need small systems that survive every week.'
  },
  {
    person: 'Satya Nadella',
    field: 'Technology leader',
    story: 'Satya Nadella shifted Microsoft culture by emphasizing learning, empathy, and long-term thinking, not only technical execution.',
    takeaway: 'A growth mindset is not a slogan; it is how you respond after gaps appear.'
  },
  {
    person: 'Sudha Murty',
    field: 'Engineer and author',
    story: 'Sudha Murty entered engineering spaces where few women were present and kept proving her capability through persistence, work quality, and service.',
    takeaway: 'Let your work become your argument.'
  },
  {
    person: 'N. R. Narayana Murthy',
    field: 'Entrepreneur',
    story: 'Narayana Murthy helped build Infosys with patience, ethics, and long-term discipline, turning a small start into a durable institution.',
    takeaway: 'Consistency plus values can outlast quick shortcuts.'
  }
];
