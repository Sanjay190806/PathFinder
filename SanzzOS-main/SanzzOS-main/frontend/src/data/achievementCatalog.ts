import { Achievement, AchievementCategory, AchievementRarity } from '../types/achievements';

const createBadge = (
  id: string,
  title: string,
  desc: string,
  cat: AchievementCategory,
  rar: AchievementRarity,
  target: number,
  xp: number,
  hint?: string
): Achievement => ({
  id,
  title,
  description: desc,
  category: cat,
  rarity: rar,
  progressCurrent: 0,
  progressTarget: target,
  xpReward: xp,
  nextHint: hint || `Solve tasks related to ${cat} to unlock.`
});

export const ACHIEVEMENT_CATALOG: Achievement[] = [
  // 1. Daily Discipline (1-10)
  createBadge('daily_1', 'First Boot', 'Launch the Career OS workspace for the first time.', 'daily', 'common', 1, 50, 'Log in once.'),
  createBadge('daily_2', 'First Blood', 'Complete your very first daily planner mission.', 'daily', 'common', 1, 50, 'Complete any 1 task.'),
  createBadge('daily_3', 'Triple Spark', 'Log progress on 3 consecutive days.', 'daily', 'common', 3, 100, 'Keep a 3-day active streak.'),
  createBadge('daily_4', 'Week of Fire', 'Achieve a 7-day daily activity streak.', 'daily', 'uncommon', 7, 200, 'Keep a 7-day active streak.'),
  createBadge('daily_5', 'Fortnight Master', 'Achieve a 14-day daily activity streak.', 'daily', 'rare', 14, 400, 'Keep a 14-day active streak.'),
  createBadge('daily_6', 'Monthly Grind', 'Achieve a 30-day daily activity streak.', 'daily', 'epic', 30, 800, 'Keep a 30-day active streak.'),
  createBadge('daily_7', 'Sustained Beast', 'Achieve a 60-day daily activity streak.', 'daily', 'legendary', 60, 1500, 'Keep a 60-day active streak.'),
  createBadge('daily_8', 'Century Grit', 'Achieve a 100-day daily activity streak.', 'daily', 'mythic', 100, 3000, 'Keep a 100-day active streak.'),
  createBadge('daily_9', 'Half-Year Trek', 'Keep the placement preparation active for 180 days.', 'daily', 'mythic', 180, 5000, 'Keep a 180-day active streak.'),
  createBadge('daily_10', 'No-Zero Rescue', 'Trigger and complete a no-zero-day rescue mission.', 'daily', 'uncommon', 1, 100, 'Log a 15-minute low energy study task.'),

  // 2. DSA Tracker (11-25)
  createBadge('dsa_1', 'DSA Initiate', 'Log your first solved LeetCode coding problem.', 'dsa', 'common', 1, 50, 'Solve 1 DSA problem.'),
  createBadge('dsa_2', 'Stack Builder', 'Solve 5 LeetCode coding problems.', 'dsa', 'common', 5, 100, 'Solve 5 DSA problems.'),
  createBadge('dsa_3', 'Pattern Explorer', 'Solve 10 LeetCode coding problems.', 'dsa', 'common', 10, 150, 'Solve 10 DSA problems.'),
  createBadge('dsa_4', 'Queue Survivor', 'Solve 25 LeetCode coding problems.', 'dsa', 'uncommon', 25, 300, 'Solve 25 DSA problems.'),
  createBadge('dsa_5', 'Recursion Rookie', 'Solve 50 LeetCode coding problems.', 'dsa', 'rare', 50, 600, 'Solve 50 DSA problems.'),
  createBadge('dsa_6', 'Algorithmic Knight', 'Solve 100 LeetCode coding problems.', 'dsa', 'epic', 100, 1200, 'Solve 100 DSA problems.'),
  createBadge('dsa_7', 'Array Pioneer', 'Solve 10 array-based data structure problems.', 'dsa', 'common', 10, 100, 'Solve 10 Array questions.'),
  createBadge('dsa_8', 'String Weaver', 'Solve 10 string manipulation problems.', 'dsa', 'common', 10, 100, 'Solve 10 String questions.'),
  createBadge('dsa_9', 'HashMap Tactician', 'Solve 10 dictionary/hashmap pattern problems.', 'dsa', 'uncommon', 10, 150, 'Solve 10 Hashmap questions.'),
  createBadge('dsa_10', 'Double Pointer', 'Solve 5 two-pointer sliding window problems.', 'dsa', 'uncommon', 5, 150, 'Solve 5 Two-Pointer questions.'),
  createBadge('dsa_11', 'Binary Navigator', 'Solve 5 binary search query problems.', 'dsa', 'uncommon', 5, 200, 'Solve 5 Binary Search questions.'),
  createBadge('dsa_12', 'Linked List Sage', 'Solve 5 list linking or loop-detection problems.', 'dsa', 'rare', 5, 200, 'Solve 5 Linked List questions.'),
  createBadge('dsa_13', 'Stack Operative', 'Solve 5 stack validation or queue buffer problems.', 'dsa', 'rare', 5, 200, 'Solve 5 Stack questions.'),
  createBadge('dsa_14', 'Backtracking Hero', 'Solve 3 recursive backtracking search problems.', 'dsa', 'epic', 3, 300, 'Solve 3 Backtracking questions.'),
  createBadge('dsa_15', 'Dynamic Explorer', 'Solve 5 dynamic programming optimization problems.', 'dsa', 'legendary', 5, 500, 'Solve 5 DP questions.'),

  // 3. SkillRack (26-30)
  createBadge('sr_1', 'SkillRack Starter', 'Complete your first daily test on SkillRack.', 'skillrack', 'common', 1, 50),
  createBadge('sr_2', 'SkillRack Scholar', 'Complete 10 daily tests on SkillRack.', 'skillrack', 'uncommon', 10, 150),
  createBadge('sr_3', 'Rack Gladiator', 'Complete 50 daily tests on SkillRack.', 'skillrack', 'rare', 50, 500),
  createBadge('sr_4', 'Test Overlord', 'Complete 100 daily tests on SkillRack.', 'skillrack', 'epic', 100, 1000),
  createBadge('sr_5', 'Unbroken Skill', 'Complete SkillRack challenges on 5 consecutive days.', 'skillrack', 'rare', 5, 300),

  // 4. SQL (31-40)
  createBadge('sql_1', 'SQL Starter', 'Execute and log your first relational database query.', 'sql', 'common', 1, 50),
  createBadge('sql_2', 'Projectionist', 'Solve 10 SELECT projection questions.', 'sql', 'common', 10, 100),
  createBadge('sql_3', 'Filter Warrior', 'Solve 10 queries using complex WHERE conditions.', 'sql', 'common', 10, 100),
  createBadge('sql_4', 'Aggregation Mage', 'Solve 10 queries using GROUP BY and HAVING clauses.', 'sql', 'uncommon', 10, 150),
  createBadge('sql_5', 'Join Explorer', 'Solve 10 multi-table relational JOIN queries.', 'sql', 'uncommon', 10, 200),
  createBadge('sql_6', 'Join Specialist', 'Solve 25 multi-table relational JOIN queries.', 'sql', 'rare', 25, 400),
  createBadge('sql_7', 'Subquery Cadet', 'Solve 5 nested query or subquery problems.', 'sql', 'rare', 5, 300),
  createBadge('sql_8', 'Window Observer', 'Solve 5 window function analytical queries.', 'sql', 'epic', 5, 400),
  createBadge('sql_9', 'DB Specialist', 'Solve 50 SQL queries inside the workspace database.', 'sql', 'epic', 50, 800),
  createBadge('sql_10', 'Relational Sage', 'Solve 100 SQL queries inside the workspace database.', 'sql', 'legendary', 100, 1500),

  // 5. Aptitude (41-48)
  createBadge('apt_1', 'Quant Initiate', 'Log your first quantitative aptitude practice log.', 'aptitude', 'common', 1, 50),
  createBadge('apt_2', 'Rate Master', 'Solve 10 percentage calculation problems.', 'aptitude', 'common', 10, 100),
  createBadge('apt_3', 'Margin Builder', 'Solve 10 cost margin / profit & loss problems.', 'aptitude', 'common', 10, 100),
  createBadge('apt_4', 'Time Worker', 'Solve 10 time & work scheduling problems.', 'aptitude', 'uncommon', 10, 150),
  createBadge('apt_5', 'Interest Analyst', 'Solve 10 compound interest financial problems.', 'aptitude', 'uncommon', 10, 150),
  createBadge('apt_6', 'Aptitude Grinder', 'Solve 25 cumulative aptitude evaluation questions.', 'aptitude', 'rare', 25, 300),
  createBadge('apt_7', 'Math Magician', 'Solve 100 cumulative aptitude evaluation questions.', 'aptitude', 'epic', 100, 1000),
  createBadge('apt_8', 'Aptitude Hero', 'Complete a full mock quantitative test set.', 'aptitude', 'rare', 1, 200),

  // 6. Learning OS (49-58)
  createBadge('learn_1', 'Study Session', 'Log your first learning revision block.', 'learning', 'common', 1, 50),
  createBadge('learn_2', 'Study Hour', 'Accumulate 5 hours of total revision logging.', 'learning', 'common', 5, 100),
  createBadge('learn_3', 'Deep Focus', 'Accumulate 10 hours of total revision logging.', 'learning', 'uncommon', 10, 200),
  createBadge('learn_4', 'Intellectual Grid', 'Accumulate 25 hours of total revision logging.', 'learning', 'rare', 25, 500),
  createBadge('learn_5', 'Master Scholar', 'Accumulate 50 hours of total revision logging.', 'learning', 'epic', 50, 1000),
  createBadge('learn_6', 'Revision Check', 'Complete your first revision topic deck.', 'learning', 'common', 1, 50),
  createBadge('learn_7', 'Weakness Hunter', 'Revise a topic classified as a Weak Skill.', 'learning', 'uncommon', 1, 100),
  createBadge('learn_8', 'Quarter Master', 'Achieve an average mastery score of 25%.', 'learning', 'uncommon', 25, 200),
  createBadge('learn_9', 'Halfway Scholar', 'Achieve an average mastery score of 50%.', 'learning', 'rare', 50, 400),
  createBadge('learn_10', 'Expert Scholar', 'Achieve an average mastery score of 75%.', 'learning', 'epic', 75, 800),

  // 7. German (59-68)
  createBadge('de_1', 'Guten Tag', 'Complete your first German language lesson.', 'german', 'common', 1, 50),
  createBadge('de_2', 'A1 Speaker', 'Accumulate 5 completed German grammar lessons.', 'german', 'uncommon', 5, 150),
  createBadge('de_3', 'German Habit', 'Practice German speaking on 7 consecutive days.', 'german', 'rare', 7, 300),
  createBadge('de_4', 'First Talker', 'Record your first microphone speaking capture.', 'german', 'common', 1, 50),
  createBadge('de_5', 'Talker Habits', 'Record 10 speaking capture checks.', 'german', 'uncommon', 10, 200),
  createBadge('de_6', 'Listener', 'Log your first German audio listening session.', 'german', 'common', 1, 50),
  createBadge('de_7', 'Ear Training', 'Accumulate 60 minutes of listening logs.', 'german', 'uncommon', 60, 200),
  createBadge('de_8', 'Linguist Level 1', 'Accumulate 100 total German XP.', 'german', 'common', 100, 100),
  createBadge('de_9', 'Linguist Level 2', 'Accumulate 500 total German XP.', 'german', 'rare', 500, 400),
  createBadge('de_10', 'Polyglot', 'Log speaking practice after a 3-day inactivity break.', 'german', 'uncommon', 1, 100),

  // 8. Projects (69-78)
  createBadge('proj_1', 'Project Born', 'Register your first repository project log.', 'projects', 'common', 1, 50),
  createBadge('proj_2', 'Health Sync Builder', 'Complete milestone targets for CareSync AI.', 'projects', 'uncommon', 1, 100),
  createBadge('proj_3', 'Edu Tech Builder', 'Complete milestone targets for SmartEdu AI.', 'projects', 'uncommon', 1, 100),
  createBadge('proj_4', 'Self builder', 'Complete milestone targets for Sanju Career OS.', 'projects', 'uncommon', 1, 100),
  createBadge('proj_5', 'Milestone Slayer', 'Resolve and close your first project milestone.', 'projects', 'common', 1, 50),
  createBadge('proj_6', 'Debugger', 'Mark your first registered project bug as fixed.', 'projects', 'common', 1, 50),
  createBadge('proj_7', 'New Version', 'Publish and register your first project release.', 'projects', 'uncommon', 1, 100),
  createBadge('proj_8', 'README Hero', 'Improve README scores to 80% for your flagship project.', 'projects', 'rare', 80, 200),
  createBadge('proj_9', 'Deploy Ready', 'Log a live deployment link for CareSync AI.', 'projects', 'rare', 1, 200),
  createBadge('proj_10', 'Showcase Candidate', 'Prepare 3 portfolio-ready projects inside the log.', 'projects', 'epic', 3, 500),

  // 9. Resume (79-87)
  createBadge('res_1', 'Resume Draft', 'Scan your first resume draft inside the studio.', 'resume', 'common', 1, 50),
  createBadge('res_2', 'ATS Spark', 'Pass a resume checklist score of 25%.', 'resume', 'common', 25, 100),
  createBadge('res_3', 'ATS Balance', 'Pass a resume checklist score of 50%.', 'resume', 'uncommon', 50, 200),
  createBadge('res_4', 'ATS Stronghold', 'Pass a resume checklist score of 75%.', 'resume', 'rare', 75, 450),
  createBadge('res_5', 'ATS Candidate', 'Achieve a 100% compliant resume checklist status.', 'resume', 'epic', 100, 800),
  createBadge('res_6', 'STAR Teller', 'Add your first STAR project description bullet point.', 'resume', 'common', 1, 50),
  createBadge('res_7', 'Keyword Matcher', 'Optimize keywords for the Product Analyst track.', 'resume', 'uncommon', 1, 100),
  createBadge('res_8', 'Target Tailor', 'Create a company-tailored resume variant.', 'resume', 'rare', 1, 150),
  createBadge('res_9', 'Final Check', 'Submit your final resume for diagnostic ATS verification.', 'resume', 'rare', 1, 200),

  // 10. Placement (88-98)
  createBadge('place_1', 'First Target', 'Add your first target placement company.', 'placement', 'common', 1, 50),
  createBadge('place_2', 'Application Pipeline', 'Track your first active job application details.', 'placement', 'common', 1, 50),
  createBadge('place_3', 'OA Stage', 'Update an application status to Online Assessment.', 'placement', 'uncommon', 1, 100),
  createBadge('place_4', 'Interview Stage', 'Update an application status to Interview round.', 'placement', 'rare', 1, 200),
  createBadge('place_5', 'Zoho Aspirant', 'Prepare study notes specifically for Zoho guidelines.', 'placement', 'uncommon', 1, 100),
  createBadge('place_6', 'Analytics Aspirant', 'Prepare study notes for Fractal or Tiger Analytics.', 'placement', 'uncommon', 1, 100),
  createBadge('place_7', 'Service Consultant', 'Prepare notes for Accenture or Capgemini target guidelines.', 'placement', 'uncommon', 1, 100),
  createBadge('place_8', 'Quarter Ready', 'Achieve a placement readiness index of 25%.', 'placement', 'uncommon', 25, 200),
  createBadge('place_9', 'Halfway Prepared', 'Achieve a placement readiness index of 50%.', 'placement', 'rare', 50, 400),
  createBadge('place_10', 'Placement Specialist', 'Achieve a placement readiness index of 75%.', 'placement', 'epic', 75, 800),
  createBadge('place_11', 'Commander Complete', 'Unlock Offer Ready status on the dashboard.', 'placement', 'legendary', 1, 1500),

  // 11. Interview / STAR (99-107)
  createBadge('int_1', 'STAR Story', 'Write and save your first behavior story card.', 'interview', 'common', 1, 50),
  createBadge('int_2', 'STAR Master', 'Write STAR stories for all 3 flagship projects.', 'interview', 'uncommon', 3, 200),
  createBadge('int_3', 'CareSync Described', 'Document architectural answers for CareSync AI.', 'interview', 'rare', 1, 100),
  createBadge('int_4', 'SmartEdu Described', 'Document architectural answers for SmartEdu AI.', 'interview', 'rare', 1, 100),
  createBadge('int_5', 'Tracker Described', 'Document architectural answers for Sanju Career OS.', 'interview', 'rare', 1, 100),
  createBadge('int_6', 'HR Ready', 'Log answers for common non-technical behavior checks.', 'interview', 'common', 1, 50),
  createBadge('int_7', 'Silver Speaker', 'Achieve a self-rated communication confidence of 3/5.', 'interview', 'uncommon', 3, 100),
  createBadge('int_8', 'Gold Speaker', 'Achieve a self-rated communication confidence of 4/5.', 'interview', 'rare', 4, 250),
  createBadge('int_9', 'Dojo Session', 'Log your first completed mock technical interview.', 'interview', 'epic', 1, 500),

  // 12. Comeback / Hidden (108-115)
  createBadge('cb_1', 'Phoenix Rise', 'Log study details after being inactive for 3 days.', 'comeback', 'uncommon', 1, 100),
  createBadge('cb_2', 'Unbroken Spirit', 'Log study details after being inactive for 7 days.', 'comeback', 'rare', 1, 250),
  createBadge('cb_3', 'Flame Saver', 'Rebuild a broken daily activity streak from scratch.', 'comeback', 'uncommon', 1, 100),
  createBadge('cb_4', 'Aura Sparkle', 'Complete 3 daily missions in a single day.', 'comeback', 'rare', 3, 200),
  createBadge('cb_5', 'Midnight Savior', 'Log study activity between 11 PM and 2 AM.', 'comeback', 'rare', 1, 150),
  createBadge('cb_6', 'Sunrise Sentinel', 'Log study activity between 5 AM and 8 AM.', 'comeback', 'rare', 1, 150),
  createBadge('cb_7', 'Weekend Commander', 'Log study progress on both Saturday and Sunday.', 'comeback', 'uncommon', 2, 200),
  createBadge('cb_8', 'Iron Consistency', 'Complete all daily planner tasks for a whole week.', 'comeback', 'epic', 7, 500),

  // 13. AI / Smart Planner (116-120)
  createBadge('ai_1', 'Commander Plan', 'Generate your first smart daily planner agenda.', 'ai_planner', 'common', 1, 50),
  createBadge('ai_2', 'Operational Sync', 'Complete 5 smart generated planner tasks.', 'ai_planner', 'uncommon', 5, 150),
  createBadge('ai_3', 'Brain Refresh', 'Trigger an AI Brain review recommendation sweep.', 'ai_planner', 'common', 1, 50),
  createBadge('ai_4', 'Follow Advice', 'Complete a task explicitly marked by the study mentor.', 'ai_planner', 'uncommon', 1, 100),
  createBadge('ai_5', 'Commanding Review', 'Execute a weekly summary compilation.', 'ai_planner', 'rare', 1, 200)
];
