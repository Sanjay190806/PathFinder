// Generated 184-day placement calendar plan
export interface PlacementDayPlan {
  date: string;
  day: number;
  phase: string;
  title: string;
  focus: string;
  tasks: string[];
  output: string;
  leetcode: any[];
  placementPrep?: {
    type: string;
    details: string;
    what: string;
    connect_project: string;
  };
}

export const PLACEMENT_PLAN_DATA: PlacementDayPlan[] = [
  {
    "date": "2026-07-01",
    "day": 1,
    "phase": "Foundation Lock",
    "title": "Arrays Basics",
    "focus": "Learn array declaration, traversal, indexing, input/output, min/max, sum, average.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Arrays drill: traversal, index handling, edge cases, dry run with 3 examples.",
      "Solve: max/min, second largest, rotate/reverse, prefix or two-pointer problem."
    ],
    "output": "Completed Arrays Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1920,
        "name": "Build Array from Permutation",
        "difficulty": "Easy",
        "pattern": "Array Simulation",
        "why": "It strengthens indexing and direct array construction for today's array basics."
      },
      {
        "id": 1929,
        "name": "Concatenation of Array",
        "difficulty": "Easy",
        "pattern": "Array Construction",
        "why": "It fits array traversal and output-building practice."
      },
      {
        "id": 88,
        "name": "Merge Sorted Array",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It adds a practical sorted-array merge challenge after basic traversal."
      }
    ],
    "placementPrep": {
      "type": "CS Core & SQL",
      "details": "Practice SQL subqueries or DBMS ACID properties related to data indexing. Concept: Linear Regression Cost Function",
      "what": "\u2022 Understand prediction error and squared loss\n\u2022 Derive why MSE penalizes larger errors\n\u2022 Write the cost function in your notes",
      "connect_project": "CareSync risk scoring can use regression-style error thinking for continuous vitals."
    }
  },
  {
    "date": "2026-07-02",
    "day": 2,
    "phase": "Foundation Lock",
    "title": "Array Frequency",
    "focus": "Practice counting frequency, duplicates, missing number, and simple HashMap support.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Arrays drill: traversal, index handling, edge cases, dry run with 3 examples.",
      "Solve: max/min, second largest, rotate/reverse, prefix or two-pointer problem."
    ],
    "output": "Completed Array Frequency notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1,
        "name": "Two Sum",
        "difficulty": "Easy",
        "pattern": "HashMap Lookup",
        "why": "It uses value-to-index lookup to avoid brute-force pair checking."
      },
      {
        "id": 217,
        "name": "Contains Duplicate",
        "difficulty": "Easy",
        "pattern": "HashSet Frequency",
        "why": "It directly checks duplicate detection using frequency/set thinking."
      },
      {
        "id": 169,
        "name": "Majority Element",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It trains majority counting and frequency-based reasoning."
      }
    ],
    "placementPrep": {
      "type": "CS Core & SQL",
      "details": "Practice SQL subqueries or DBMS ACID properties related to data indexing. Concept: Gradient Descent Intuition",
      "what": "\u2022 Understand slope direction and learning rate\n\u2022 Compare batch vs stochastic intuition\n\u2022 Sketch how weights update",
      "connect_project": "Gradient descent intuition helps explain how ML models optimize care-risk predictions."
    }
  },
  {
    "date": "2026-07-03",
    "day": 3,
    "phase": "Foundation Lock",
    "title": "Prefix Sum",
    "focus": "Learn range sum, running sum, equilibrium index, and subarray sum intuition.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Prefix Sum notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1480,
        "name": "Running Sum of 1d Array",
        "difficulty": "Easy",
        "pattern": "Prefix Sum",
        "why": "It is the cleanest starting point for cumulative array sums."
      },
      {
        "id": 724,
        "name": "Find Pivot Index",
        "difficulty": "Easy",
        "pattern": "Prefix Sum",
        "why": "It uses left/right accumulated sums to detect balance points."
      },
      {
        "id": 303,
        "name": "Range Sum Query - Immutable",
        "difficulty": "Easy",
        "pattern": "Prefix Sum Precomputation",
        "why": "It shows why prefix arrays make repeated range queries fast."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: MSE and RMSE",
      "what": "\u2022 Know when to use MSE vs RMSE\n\u2022 Calculate both on a small example\n\u2022 Explain sensitivity to outliers",
      "connect_project": "RMSE can describe prediction error for vitals like heart rate or temperature."
    }
  },
  {
    "date": "2026-07-04",
    "day": 4,
    "phase": "Foundation Lock",
    "title": "Two Pointers",
    "focus": "Learn pair sum, reverse array, remove duplicates, sorted array movement.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 283,
        "name": "Move Zeroes",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It uses slow/fast pointers to compact non-zero values."
      },
      {
        "id": 26,
        "name": "Remove Duplicates from Sorted Array",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It fits in-place duplicate removal in a sorted array."
      },
      {
        "id": 977,
        "name": "Squares of a Sorted Array",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It uses both ends of a sorted array to build the answer efficiently."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Train/Test Split Deep Dive",
      "what": "\u2022 Learn why leakage is dangerous\n\u2022 Use random_state consistently\n\u2022 Understand test set as unseen patients",
      "connect_project": "CareSync should evaluate models on unseen patient-like records."
    }
  },
  {
    "date": "2026-07-05",
    "day": 5,
    "phase": "Foundation Lock",
    "title": "Sliding Window Intro",
    "focus": "Learn fixed-size window, maximum sum k-size subarray, vowels/count window.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 643,
        "name": "Maximum Average Subarray I",
        "difficulty": "Easy",
        "pattern": "Fixed Sliding Window",
        "why": "It is the standard fixed-window sum problem."
      },
      {
        "id": 1343,
        "name": "Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold",
        "difficulty": "Medium",
        "pattern": "Fixed Sliding Window",
        "why": "It extends fixed-window sums into threshold counting."
      },
      {
        "id": 2090,
        "name": "K Radius Subarray Averages",
        "difficulty": "Medium",
        "pattern": "Prefix Sum / Sliding Window",
        "why": "It reinforces window averages with boundary handling."
      }
    ]
  },
  {
    "date": "2026-07-06",
    "day": 6,
    "phase": "Foundation Lock",
    "title": "Kadane + Subarrays",
    "focus": "Learn maximum subarray, negative values, brute force vs optimized.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Kadane + Subarrays notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 53,
        "name": "Maximum Subarray",
        "difficulty": "Medium",
        "pattern": "Kadane's Algorithm",
        "why": "It is the core maximum subarray problem for today's topic."
      },
      {
        "id": 918,
        "name": "Maximum Sum Circular Subarray",
        "difficulty": "Medium",
        "pattern": "Kadane's Algorithm",
        "why": "It extends Kadane's idea to circular arrays."
      }
    ],
    "placementPrep": {
      "type": "CS Core & SQL",
      "details": "Practice SQL subqueries or DBMS ACID properties related to data indexing. Concept: Linear Regression Mini Practice",
      "what": "\u2022 Train a LinearRegression model on a small dataset\n\u2022 Report RMSE\n\u2022 Explain coefficients in plain English",
      "connect_project": "Coefficient explanation helps make CareSync risk signals more interpretable."
    }
  },
  {
    "date": "2026-07-07",
    "day": 7,
    "phase": "Foundation Lock",
    "title": "Matrix Basics",
    "focus": "Learn 2D arrays, row/column traversal, diagonal traversal, transpose.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Matrix Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1672,
        "name": "Richest Customer Wealth",
        "difficulty": "Easy",
        "pattern": "Matrix Traversal",
        "why": "It practices row-wise traversal and summation."
      },
      {
        "id": 566,
        "name": "Reshape the Matrix",
        "difficulty": "Easy",
        "pattern": "Matrix Simulation",
        "why": "It tests row/column index conversion."
      },
      {
        "id": 2373,
        "name": "Largest Local Values in a Matrix",
        "difficulty": "Easy",
        "pattern": "Matrix Window",
        "why": "It adds local 3x3 scanning on a matrix."
      }
    ],
    "placementPrep": {
      "type": "CS Core & SQL",
      "details": "Practice SQL subqueries or DBMS ACID properties related to data indexing. Concept: Linear Regression Cost Function",
      "what": "\u2022 Understand prediction error and squared loss\n\u2022 Derive why MSE penalizes larger errors\n\u2022 Write the cost function in your notes",
      "connect_project": "CareSync risk scoring can use regression-style error thinking for continuous vitals."
    }
  },
  {
    "date": "2026-07-08",
    "day": 8,
    "phase": "Foundation Lock",
    "title": "Strings Basics",
    "focus": "Learn charAt, StringBuilder, reverse, palindrome, vowels/consonants.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "String drill: char frequency, StringBuilder, palindrome/anagram cases.",
      "Solve: reverse words, first non-repeating character, anagram/frequency problem."
    ],
    "output": "Completed Strings Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 344,
        "name": "Reverse String",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It practices in-place character swapping."
      },
      {
        "id": 541,
        "name": "Reverse String II",
        "difficulty": "Easy",
        "pattern": "String Simulation",
        "why": "It adds controlled segment reversal."
      },
      {
        "id": 557,
        "name": "Reverse Words in a String III",
        "difficulty": "Easy",
        "pattern": "String Traversal",
        "why": "It reinforces word-level character reversal."
      }
    ],
    "placementPrep": {
      "type": "Interview Preparation",
      "details": "Practice explaining project architecture choices and system scalability. Concept: Binary Classification Thresholds",
      "what": "\u2022 Study threshold 0.5 and custom thresholds\n\u2022 Understand false positives vs false negatives\n\u2022 Write threshold tradeoff examples",
      "connect_project": "CareSync must tune thresholds carefully to avoid missed critical alerts."
    }
  },
  {
    "date": "2026-07-09",
    "day": 9,
    "phase": "Foundation Lock",
    "title": "String Frequency",
    "focus": "Learn anagram, character count, first non-repeating char.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "String drill: char frequency, StringBuilder, palindrome/anagram cases.",
      "Solve: reverse words, first non-repeating character, anagram/frequency problem."
    ],
    "output": "Completed String Frequency notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 242,
        "name": "Valid Anagram",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It directly uses character frequency comparison."
      },
      {
        "id": 387,
        "name": "First Unique Character in a String",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It finds uniqueness after counting characters."
      },
      {
        "id": 383,
        "name": "Ransom Note",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It checks whether one string can supply characters for another."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Precision and Recall",
      "what": "\u2022 Define TP/FP/FN/TN\n\u2022 Calculate precision and recall manually\n\u2022 Know when recall matters more",
      "connect_project": "CareSync critical alerts usually prioritize recall to catch dangerous cases."
    }
  },
  {
    "date": "2026-07-10",
    "day": 10,
    "phase": "Foundation Lock",
    "title": "OOP Basics",
    "focus": "Learn class, object, constructor, this keyword, encapsulation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed OOP Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 88,
        "name": "Merge Sorted Array",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It gives a practical array problem while OOP remains the theory focus."
      },
      {
        "id": 242,
        "name": "Valid Anagram",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It keeps string frequency fresh on a Java theory day."
      },
      {
        "id": 283,
        "name": "Move Zeroes",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It reinforces clean in-place array logic."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: F1 Score",
      "what": "\u2022 Understand harmonic mean\n\u2022 Compare F1 with accuracy\n\u2022 Use classification_report",
      "connect_project": "F1 helps evaluate balanced performance for CareSync warning/critical detection."
    }
  },
  {
    "date": "2026-07-11",
    "day": 11,
    "phase": "Foundation Lock",
    "title": "SQL Basics",
    "focus": "Learn SELECT, WHERE, ORDER BY, LIMIT, simple filters.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "SQL: solve 3 queries using SELECT/WHERE/GROUP BY/JOIN based on topic.",
      "Write one interview answer in your notes.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 595,
        "name": "Big Countries",
        "difficulty": "Easy",
        "pattern": "SQL Filtering",
        "why": "It practices basic SELECT and WHERE filtering."
      },
      {
        "id": 1757,
        "name": "Recyclable and Low Fat Products",
        "difficulty": "Easy",
        "pattern": "SQL Filtering",
        "why": "It reinforces multi-condition WHERE clauses."
      },
      {
        "id": 183,
        "name": "Customers Who Never Order",
        "difficulty": "Easy",
        "pattern": "SQL Left Join",
        "why": "It introduces basic anti-join thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: ROC-AUC Basics",
      "what": "\u2022 Understand ROC curve axes\n\u2022 Know AUC interpretation\n\u2022 Compare threshold-independent evaluation",
      "connect_project": "ROC-AUC can compare CareSync classifiers across alert thresholds."
    }
  },
  {
    "date": "2026-07-12",
    "day": 12,
    "phase": "Foundation Lock",
    "title": "Aptitude Basics",
    "focus": "Learn percentage, ratio, averages, number basics.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 724,
        "name": "Find Pivot Index",
        "difficulty": "Easy",
        "pattern": "Prefix Sum",
        "why": "It revisits a likely weak area from the week: balancing array sums."
      },
      {
        "id": 242,
        "name": "Valid Anagram",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It revisits string frequency without heavy cognitive load."
      }
    ]
  },
  {
    "date": "2026-07-13",
    "day": 13,
    "phase": "Foundation Lock",
    "title": "Arrays Basics",
    "focus": "Learn array declaration, traversal, indexing, input/output, min/max, sum, average.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Arrays drill: traversal, index handling, edge cases, dry run with 3 examples.",
      "Solve: max/min, second largest, rotate/reverse, prefix or two-pointer problem."
    ],
    "output": "Completed Arrays Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1920,
        "name": "Build Array from Permutation",
        "difficulty": "Easy",
        "pattern": "Array Simulation",
        "why": "It strengthens indexing and direct array construction for today's array basics."
      },
      {
        "id": 1929,
        "name": "Concatenation of Array",
        "difficulty": "Easy",
        "pattern": "Array Construction",
        "why": "It fits array traversal and output-building practice."
      },
      {
        "id": 88,
        "name": "Merge Sorted Array",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It adds a practical sorted-array merge challenge after basic traversal."
      }
    ],
    "placementPrep": {
      "type": "CS Core & SQL",
      "details": "Practice SQL subqueries or DBMS ACID properties related to data indexing. Concept: Logistic Regression Sigmoid",
      "what": "\u2022 Understand sigmoid output as probability\n\u2022 Know binary classification setup\n\u2022 Compare regression vs classification",
      "connect_project": "Patient risk can be framed as stable vs warning classification."
    }
  },
  {
    "date": "2026-07-14",
    "day": 14,
    "phase": "Foundation Lock",
    "title": "Array Frequency",
    "focus": "Practice counting frequency, duplicates, missing number, and simple HashMap support.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Arrays drill: traversal, index handling, edge cases, dry run with 3 examples.",
      "Solve: max/min, second largest, rotate/reverse, prefix or two-pointer problem."
    ],
    "output": "Completed Array Frequency notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1,
        "name": "Two Sum",
        "difficulty": "Easy",
        "pattern": "HashMap Lookup",
        "why": "It uses value-to-index lookup to avoid brute-force pair checking."
      },
      {
        "id": 217,
        "name": "Contains Duplicate",
        "difficulty": "Easy",
        "pattern": "HashSet Frequency",
        "why": "It directly checks duplicate detection using frequency/set thinking."
      },
      {
        "id": 169,
        "name": "Majority Element",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It trains majority counting and frequency-based reasoning."
      }
    ],
    "placementPrep": {
      "type": "Interview Preparation",
      "details": "Practice explaining project architecture choices and system scalability. Concept: Binary Classification Thresholds",
      "what": "\u2022 Study threshold 0.5 and custom thresholds\n\u2022 Understand false positives vs false negatives\n\u2022 Write threshold tradeoff examples",
      "connect_project": "CareSync must tune thresholds carefully to avoid missed critical alerts."
    }
  },
  {
    "date": "2026-07-15",
    "day": 15,
    "phase": "Foundation Lock",
    "title": "Prefix Sum",
    "focus": "Learn range sum, running sum, equilibrium index, and subarray sum intuition.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Prefix Sum notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1480,
        "name": "Running Sum of 1d Array",
        "difficulty": "Easy",
        "pattern": "Prefix Sum",
        "why": "It is the cleanest starting point for cumulative array sums."
      },
      {
        "id": 724,
        "name": "Find Pivot Index",
        "difficulty": "Easy",
        "pattern": "Prefix Sum",
        "why": "It uses left/right accumulated sums to detect balance points."
      },
      {
        "id": 303,
        "name": "Range Sum Query - Immutable",
        "difficulty": "Easy",
        "pattern": "Prefix Sum Precomputation",
        "why": "It shows why prefix arrays make repeated range queries fast."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Entropy and Information Gain",
      "what": "\u2022 Understand entropy as disorder\n\u2022 Compare entropy with Gini\n\u2022 Write one example split",
      "connect_project": "Information gain helps explain why certain vitals separate risk groups."
    }
  },
  {
    "date": "2026-07-16",
    "day": 16,
    "phase": "Foundation Lock",
    "title": "Two Pointers",
    "focus": "Learn pair sum, reverse array, remove duplicates, sorted array movement.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Two Pointers notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 283,
        "name": "Move Zeroes",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It uses slow/fast pointers to compact non-zero values."
      },
      {
        "id": 26,
        "name": "Remove Duplicates from Sorted Array",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It fits in-place duplicate removal in a sorted array."
      },
      {
        "id": 977,
        "name": "Squares of a Sorted Array",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It uses both ends of a sorted array to build the answer efficiently."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: max_depth Tuning",
      "what": "\u2022 Train shallow vs deep tree\n\u2022 Compare train/test score\n\u2022 Write overfitting observation",
      "connect_project": "Depth control avoids CareSync overreacting to noise."
    }
  },
  {
    "date": "2026-07-17",
    "day": 17,
    "phase": "Foundation Lock",
    "title": "Sliding Window Intro",
    "focus": "Learn fixed-size window, maximum sum k-size subarray, vowels/count window.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Sliding Window Intro notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 643,
        "name": "Maximum Average Subarray I",
        "difficulty": "Easy",
        "pattern": "Fixed Sliding Window",
        "why": "It is the standard fixed-window sum problem."
      },
      {
        "id": 1343,
        "name": "Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold",
        "difficulty": "Medium",
        "pattern": "Fixed Sliding Window",
        "why": "It extends fixed-window sums into threshold counting."
      },
      {
        "id": 2090,
        "name": "K Radius Subarray Averages",
        "difficulty": "Medium",
        "pattern": "Prefix Sum / Sliding Window",
        "why": "It reinforces window averages with boundary handling."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Feature Importance",
      "what": "\u2022 Read feature_importances_\n\u2022 Rank top features\n\u2022 Explain limitations",
      "connect_project": "CareSync can show which vital contributed most to risk."
    }
  },
  {
    "date": "2026-07-18",
    "day": 18,
    "phase": "Foundation Lock",
    "title": "Kadane + Subarrays",
    "focus": "Learn maximum subarray, negative values, brute force vs optimized.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 53,
        "name": "Maximum Subarray",
        "difficulty": "Medium",
        "pattern": "Kadane's Algorithm",
        "why": "It is the core maximum subarray problem for today's topic."
      },
      {
        "id": 918,
        "name": "Maximum Sum Circular Subarray",
        "difficulty": "Medium",
        "pattern": "Kadane's Algorithm",
        "why": "It extends Kadane's idea to circular arrays."
      }
    ],
    "placementPrep": {
      "type": "Interview Preparation",
      "details": "Practice explaining project architecture choices and system scalability. Concept: Decision Tree Mini Practice",
      "what": "\u2022 Train a tree\n\u2022 Tune max_depth\n\u2022 Explain one prediction path",
      "connect_project": "Prediction paths can become CareSync explainability text."
    }
  },
  {
    "date": "2026-07-19",
    "day": 19,
    "phase": "Foundation Lock",
    "title": "Matrix Basics",
    "focus": "Learn 2D arrays, row/column traversal, diagonal traversal, transpose.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 1672,
        "name": "Richest Customer Wealth",
        "difficulty": "Easy",
        "pattern": "Matrix Traversal",
        "why": "It practices row-wise traversal and summation."
      },
      {
        "id": 566,
        "name": "Reshape the Matrix",
        "difficulty": "Easy",
        "pattern": "Matrix Simulation",
        "why": "It tests row/column index conversion."
      },
      {
        "id": 2373,
        "name": "Largest Local Values in a Matrix",
        "difficulty": "Easy",
        "pattern": "Matrix Window",
        "why": "It adds local 3x3 scanning on a matrix."
      }
    ]
  },
  {
    "date": "2026-07-20",
    "day": 20,
    "phase": "Foundation Lock",
    "title": "Strings Basics",
    "focus": "Learn charAt, StringBuilder, reverse, palindrome, vowels/consonants.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "String drill: char frequency, StringBuilder, palindrome/anagram cases.",
      "Solve: reverse words, first non-repeating character, anagram/frequency problem."
    ],
    "output": "Completed Strings Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 344,
        "name": "Reverse String",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It practices in-place character swapping."
      },
      {
        "id": 541,
        "name": "Reverse String II",
        "difficulty": "Easy",
        "pattern": "String Simulation",
        "why": "It adds controlled segment reversal."
      },
      {
        "id": 557,
        "name": "Reverse Words in a String III",
        "difficulty": "Easy",
        "pattern": "String Traversal",
        "why": "It reinforces word-level character reversal."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Gini Impurity",
      "what": "\u2022 Define purity\n\u2022 Calculate Gini on a tiny split\n\u2022 Compare cleaner vs noisier split",
      "connect_project": "Gini can explain how a model separates stable vs risky patient states."
    }
  },
  {
    "date": "2026-07-21",
    "day": 21,
    "phase": "Foundation Lock",
    "title": "String Frequency",
    "focus": "Learn anagram, character count, first non-repeating char.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "String drill: char frequency, StringBuilder, palindrome/anagram cases.",
      "Solve: reverse words, first non-repeating character, anagram/frequency problem."
    ],
    "output": "Completed String Frequency notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 242,
        "name": "Valid Anagram",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It directly uses character frequency comparison."
      },
      {
        "id": 387,
        "name": "First Unique Character in a String",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It finds uniqueness after counting characters."
      },
      {
        "id": 383,
        "name": "Ransom Note",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It checks whether one string can supply characters for another."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Entropy and Information Gain",
      "what": "\u2022 Understand entropy as disorder\n\u2022 Compare entropy with Gini\n\u2022 Write one example split",
      "connect_project": "Information gain helps explain why certain vitals separate risk groups."
    }
  },
  {
    "date": "2026-07-22",
    "day": 22,
    "phase": "Foundation Lock",
    "title": "OOP Basics",
    "focus": "Learn class, object, constructor, this keyword, encapsulation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed OOP Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 88,
        "name": "Merge Sorted Array",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It gives a practical array problem while OOP remains the theory focus."
      },
      {
        "id": 242,
        "name": "Valid Anagram",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It keeps string frequency fresh on a Java theory day."
      },
      {
        "id": 283,
        "name": "Move Zeroes",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It reinforces clean in-place array logic."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: n_estimators",
      "what": "\u2022 Know what number of trees controls\n\u2022 Try small vs larger forest\n\u2022 Observe score stability",
      "connect_project": "More trees can improve stability in patient risk detection."
    }
  },
  {
    "date": "2026-07-23",
    "day": 23,
    "phase": "Foundation Lock",
    "title": "SQL Basics",
    "focus": "Learn SELECT, WHERE, ORDER BY, LIMIT, simple filters.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "SQL: solve 3 queries using SELECT/WHERE/GROUP BY/JOIN based on topic.",
      "Write one interview answer in your notes."
    ],
    "output": "Completed SQL Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 595,
        "name": "Big Countries",
        "difficulty": "Easy",
        "pattern": "SQL Filtering",
        "why": "It practices basic SELECT and WHERE filtering."
      },
      {
        "id": 1757,
        "name": "Recyclable and Low Fat Products",
        "difficulty": "Easy",
        "pattern": "SQL Filtering",
        "why": "It reinforces multi-condition WHERE clauses."
      },
      {
        "id": 183,
        "name": "Customers Who Never Order",
        "difficulty": "Easy",
        "pattern": "SQL Left Join",
        "why": "It introduces basic anti-join thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: OOB Score",
      "what": "\u2022 Understand out-of-bag validation\n\u2022 Know when it is useful\n\u2022 Enable oob_score once",
      "connect_project": "OOB can estimate model quality without a separate validation split."
    }
  },
  {
    "date": "2026-07-24",
    "day": 24,
    "phase": "Foundation Lock",
    "title": "Aptitude Basics",
    "focus": "Learn percentage, ratio, averages, number basics.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Aptitude Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 724,
        "name": "Find Pivot Index",
        "difficulty": "Easy",
        "pattern": "Prefix Sum",
        "why": "It revisits a likely weak area from the week: balancing array sums."
      },
      {
        "id": 242,
        "name": "Valid Anagram",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It revisits string frequency without heavy cognitive load."
      }
    ],
    "placementPrep": {
      "type": "Interview Preparation",
      "details": "Practice explaining project architecture choices and system scalability. Concept: Random Forest Feature Importance",
      "what": "\u2022 Compare feature importance with decision tree\n\u2022 Rank vitals\n\u2022 Write one caveat",
      "connect_project": "CareSync can explain which vitals drive risk score."
    }
  },
  {
    "date": "2026-07-25",
    "day": 25,
    "phase": "Foundation Lock",
    "title": "Arrays Basics",
    "focus": "Learn array declaration, traversal, indexing, input/output, min/max, sum, average.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Arrays drill: traversal, index handling, edge cases, dry run with 3 examples.",
      "Solve: max/min, second largest, rotate/reverse, prefix or two-pointer problem.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 1920,
        "name": "Build Array from Permutation",
        "difficulty": "Easy",
        "pattern": "Array Simulation",
        "why": "It strengthens indexing and direct array construction for today's array basics."
      },
      {
        "id": 1929,
        "name": "Concatenation of Array",
        "difficulty": "Easy",
        "pattern": "Array Construction",
        "why": "It fits array traversal and output-building practice."
      },
      {
        "id": 88,
        "name": "Merge Sorted Array",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It adds a practical sorted-array merge challenge after basic traversal."
      }
    ],
    "placementPrep": {
      "type": "Interview Preparation",
      "details": "Practice explaining project architecture choices and system scalability. Concept: Random Forest Mini Practice",
      "what": "\u2022 Train RandomForestClassifier\n\u2022 Tune n_estimators/max_depth\n\u2022 Print classification report",
      "connect_project": "A forest model can support robust risk tier prediction."
    }
  },
  {
    "date": "2026-07-26",
    "day": 26,
    "phase": "Foundation Lock",
    "title": "Array Frequency",
    "focus": "Practice counting frequency, duplicates, missing number, and simple HashMap support.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 1,
        "name": "Two Sum",
        "difficulty": "Easy",
        "pattern": "HashMap Lookup",
        "why": "It uses value-to-index lookup to avoid brute-force pair checking."
      },
      {
        "id": 217,
        "name": "Contains Duplicate",
        "difficulty": "Easy",
        "pattern": "HashSet Frequency",
        "why": "It directly checks duplicate detection using frequency/set thinking."
      },
      {
        "id": 169,
        "name": "Majority Element",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It trains majority counting and frequency-based reasoning."
      }
    ]
  },
  {
    "date": "2026-07-27",
    "day": 27,
    "phase": "Foundation Lock",
    "title": "Prefix Sum",
    "focus": "Learn range sum, running sum, equilibrium index, and subarray sum intuition.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Prefix Sum notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1480,
        "name": "Running Sum of 1d Array",
        "difficulty": "Easy",
        "pattern": "Prefix Sum",
        "why": "It is the cleanest starting point for cumulative array sums."
      },
      {
        "id": 724,
        "name": "Find Pivot Index",
        "difficulty": "Easy",
        "pattern": "Prefix Sum",
        "why": "It uses left/right accumulated sums to detect balance points."
      },
      {
        "id": 303,
        "name": "Range Sum Query - Immutable",
        "difficulty": "Easy",
        "pattern": "Prefix Sum Precomputation",
        "why": "It shows why prefix arrays make repeated range queries fast."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: StratifiedKFold",
      "what": "\u2022 Understand class distribution preservation\n\u2022 Use it for classification\n\u2022 Compare with KFold",
      "connect_project": "Risk tiers may be imbalanced, so stratification matters."
    }
  },
  {
    "date": "2026-07-28",
    "day": 28,
    "phase": "Foundation Lock",
    "title": "Two Pointers",
    "focus": "Learn pair sum, reverse array, remove duplicates, sorted array movement.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Two Pointers notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 283,
        "name": "Move Zeroes",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It uses slow/fast pointers to compact non-zero values."
      },
      {
        "id": 26,
        "name": "Remove Duplicates from Sorted Array",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It fits in-place duplicate removal in a sorted array."
      },
      {
        "id": 977,
        "name": "Squares of a Sorted Array",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It uses both ends of a sorted array to build the answer efficiently."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Cross-Validation Score Analysis",
      "what": "\u2022 Interpret mean score\n\u2022 Interpret score variance\n\u2022 Write when CV is unreliable",
      "connect_project": "CV stability helps justify CareSync model choices."
    }
  },
  {
    "date": "2026-07-29",
    "day": 29,
    "phase": "Foundation Lock",
    "title": "Sliding Window Intro",
    "focus": "Learn fixed-size window, maximum sum k-size subarray, vowels/count window.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Sliding Window Intro notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 643,
        "name": "Maximum Average Subarray I",
        "difficulty": "Easy",
        "pattern": "Fixed Sliding Window",
        "why": "It is the standard fixed-window sum problem."
      },
      {
        "id": 1343,
        "name": "Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold",
        "difficulty": "Medium",
        "pattern": "Fixed Sliding Window",
        "why": "It extends fixed-window sums into threshold counting."
      },
      {
        "id": 2090,
        "name": "K Radius Subarray Averages",
        "difficulty": "Medium",
        "pattern": "Prefix Sum / Sliding Window",
        "why": "It reinforces window averages with boundary handling."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Validation Strategy Summary",
      "what": "\u2022 Decide train/validation/test roles\n\u2022 Avoid data leakage\n\u2022 Write one evaluation plan",
      "connect_project": "CareSync needs a clean validation plan before deployment."
    }
  },
  {
    "date": "2026-07-30",
    "day": 30,
    "phase": "Foundation Lock",
    "title": "Kadane + Subarrays",
    "focus": "Learn maximum subarray, negative values, brute force vs optimized.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Kadane + Subarrays notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 53,
        "name": "Maximum Subarray",
        "difficulty": "Medium",
        "pattern": "Kadane's Algorithm",
        "why": "It is the core maximum subarray problem for today's topic."
      },
      {
        "id": 918,
        "name": "Maximum Sum Circular Subarray",
        "difficulty": "Medium",
        "pattern": "Kadane's Algorithm",
        "why": "It extends Kadane's idea to circular arrays."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: July ML Review",
      "what": "\u2022 Summarize supervised ML concepts\n\u2022 List 5 interview answers\n\u2022 Connect one model to CareSync",
      "connect_project": "This consolidates CareSync supervised-risk modeling options."
    }
  },
  {
    "date": "2026-07-31",
    "day": 31,
    "phase": "Foundation Lock",
    "title": "Matrix Basics",
    "focus": "Learn 2D arrays, row/column traversal, diagonal traversal, transpose.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Matrix Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1672,
        "name": "Richest Customer Wealth",
        "difficulty": "Easy",
        "pattern": "Matrix Traversal",
        "why": "It practices row-wise traversal and summation."
      },
      {
        "id": 566,
        "name": "Reshape the Matrix",
        "difficulty": "Easy",
        "pattern": "Matrix Simulation",
        "why": "It tests row/column index conversion."
      },
      {
        "id": 2373,
        "name": "Largest Local Values in a Matrix",
        "difficulty": "Easy",
        "pattern": "Matrix Window",
        "why": "It adds local 3x3 scanning on a matrix."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: KFold Cross-Validation",
      "what": "\u2022 Understand fold splitting\n\u2022 Use cross_val_score\n\u2022 Report mean and std",
      "connect_project": "Cross-validation checks whether CareSync models generalize across patient samples."
    }
  },
  {
    "date": "2026-08-01",
    "day": 32,
    "phase": "Coding Strength",
    "title": "HashMap Pattern",
    "focus": "Learn frequency map, two sum, duplicates, majority element.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 1,
        "name": "Two Sum",
        "difficulty": "Easy",
        "pattern": "HashMap Lookup",
        "why": "It is the base HashMap lookup problem."
      },
      {
        "id": 49,
        "name": "Group Anagrams",
        "difficulty": "Medium",
        "pattern": "HashMap Grouping",
        "why": "It groups strings using frequency/signature keys."
      },
      {
        "id": 128,
        "name": "Longest Consecutive Sequence",
        "difficulty": "Medium",
        "pattern": "HashSet Sequence",
        "why": "It uses set lookup to detect sequence starts efficiently."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: GridSearchCV",
      "what": "\u2022 Define parameter grid\n\u2022 Run GridSearchCV\n\u2022 Read best_params_",
      "connect_project": "CareSync model tuning can improve alert performance."
    }
  },
  {
    "date": "2026-08-02",
    "day": 33,
    "phase": "Coding Strength",
    "title": "Sorting",
    "focus": "Learn selection/insertion/merge concept, comparator basics, sorting arrays.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 912,
        "name": "Sort an Array",
        "difficulty": "Medium",
        "pattern": "Sorting",
        "why": "It forces understanding of actual sorting behavior beyond library calls."
      },
      {
        "id": 75,
        "name": "Sort Colors",
        "difficulty": "Medium",
        "pattern": "Dutch National Flag",
        "why": "It trains in-place multi-pointer sorting."
      },
      {
        "id": 56,
        "name": "Merge Intervals",
        "difficulty": "Medium",
        "pattern": "Sorting + Intervals",
        "why": "It uses sorting as the entry point to interval merging."
      }
    ]
  },
  {
    "date": "2026-08-03",
    "day": 34,
    "phase": "Coding Strength",
    "title": "Binary Search",
    "focus": "Learn search in sorted array, lower bound, upper bound, answer-space intro.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Binary Search notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 704,
        "name": "Binary Search",
        "difficulty": "Easy",
        "pattern": "Binary Search",
        "why": "It is the core low/mid/high template."
      },
      {
        "id": 35,
        "name": "Search Insert Position",
        "difficulty": "Easy",
        "pattern": "Binary Search",
        "why": "It extends search to insertion boundary logic."
      },
      {
        "id": 374,
        "name": "Guess Number Higher or Lower",
        "difficulty": "Easy",
        "pattern": "Binary Search",
        "why": "It reinforces narrowing the answer range."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Hyperparameter vs Parameter",
      "what": "\u2022 Separate learned weights from chosen settings\n\u2022 List model hyperparameters\n\u2022 Write examples for tree/forest",
      "connect_project": "This helps explain CareSync model configuration choices."
    }
  },
  {
    "date": "2026-08-04",
    "day": 35,
    "phase": "Coding Strength",
    "title": "Recursion Basics",
    "focus": "Learn recursion tree, base case, factorial, power, array recursion.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Recursion Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 206,
        "name": "Reverse Linked List",
        "difficulty": "Easy",
        "pattern": "Recursion",
        "why": "It can be solved recursively and builds pointer-call intuition."
      },
      {
        "id": 21,
        "name": "Merge Two Sorted Lists",
        "difficulty": "Easy",
        "pattern": "Recursion / Linked List",
        "why": "It shows recursive merging of two structures."
      },
      {
        "id": 509,
        "name": "Fibonacci Number",
        "difficulty": "Easy",
        "pattern": "Recursion / DP",
        "why": "It is the simplest recursion-to-DP bridge."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Validation Curves",
      "what": "\u2022 Understand performance across hyperparameter values\n\u2022 Spot overfitting zones\n\u2022 Use validation_curve conceptually",
      "connect_project": "Validation curves can justify CareSync max_depth or contamination settings."
    }
  },
  {
    "date": "2026-08-05",
    "day": 36,
    "phase": "Coding Strength",
    "title": "Linked List",
    "focus": "Learn node structure, traversal, insert/delete, reverse linked list.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Linked List notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 206,
        "name": "Reverse Linked List",
        "difficulty": "Easy",
        "pattern": "Linked List Pointers",
        "why": "It is the must-know linked-list pointer reversal problem."
      },
      {
        "id": 21,
        "name": "Merge Two Sorted Lists",
        "difficulty": "Easy",
        "pattern": "Linked List Merge",
        "why": "It practices pointer movement across two lists."
      },
      {
        "id": 83,
        "name": "Remove Duplicates from Sorted List",
        "difficulty": "Easy",
        "pattern": "Linked List Traversal",
        "why": "It reinforces traversal and duplicate skipping."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Tuning Mini Practice",
      "what": "\u2022 Tune one RandomForest\n\u2022 Compare before/after score\n\u2022 Save best model notes",
      "connect_project": "This can become a CareSync tuning story in interviews."
    }
  },
  {
    "date": "2026-08-06",
    "day": 37,
    "phase": "Coding Strength",
    "title": "Stack",
    "focus": "Learn LIFO, valid parentheses, next greater element.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Stack notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 20,
        "name": "Valid Parentheses",
        "difficulty": "Easy",
        "pattern": "Stack",
        "why": "It is the core stack matching problem."
      },
      {
        "id": 155,
        "name": "Min Stack",
        "difficulty": "Medium",
        "pattern": "Design Stack",
        "why": "It adds state tracking while preserving stack operations."
      },
      {
        "id": 232,
        "name": "Implement Queue using Stacks",
        "difficulty": "Easy",
        "pattern": "Stack Design",
        "why": "It tests stack behavior through data-structure design."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Hyperparameter Review",
      "what": "\u2022 Summarize grid vs randomized search\n\u2022 Write 3 interview answers\n\u2022 List tuning mistakes",
      "connect_project": "Cleaner tuning means stronger CareSync demo credibility."
    }
  },
  {
    "date": "2026-08-07",
    "day": 38,
    "phase": "Coding Strength",
    "title": "Queue",
    "focus": "Learn FIFO, circular queue idea, BFS intro.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Queue notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 232,
        "name": "Implement Queue using Stacks",
        "difficulty": "Easy",
        "pattern": "Queue Design",
        "why": "It simulates queue behavior using stacks."
      },
      {
        "id": 225,
        "name": "Implement Stack using Queues",
        "difficulty": "Easy",
        "pattern": "Queue Design",
        "why": "It reverses the design idea using queues."
      },
      {
        "id": 933,
        "name": "Number of Recent Calls",
        "difficulty": "Easy",
        "pattern": "Queue",
        "why": "It uses a queue to maintain a recent time window."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: GridSearchCV",
      "what": "\u2022 Define parameter grid\n\u2022 Run GridSearchCV\n\u2022 Read best_params_",
      "connect_project": "CareSync model tuning can improve alert performance."
    }
  },
  {
    "date": "2026-08-08",
    "day": 39,
    "phase": "Coding Strength",
    "title": "Trees Basics",
    "focus": "Learn traversal, height, count nodes, level order.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 104,
        "name": "Maximum Depth of Binary Tree",
        "difficulty": "Easy",
        "pattern": "DFS Tree Traversal",
        "why": "It is the base depth calculation problem."
      },
      {
        "id": 226,
        "name": "Invert Binary Tree",
        "difficulty": "Easy",
        "pattern": "Tree Recursion",
        "why": "It practices recursive swapping of children."
      },
      {
        "id": 144,
        "name": "Binary Tree Preorder Traversal",
        "difficulty": "Easy",
        "pattern": "Tree Traversal",
        "why": "It reinforces preorder traversal structure."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: OneHotEncoder",
      "what": "\u2022 Encode nominal categories\n\u2022 Handle unknown categories\n\u2022 Compare with label encoding",
      "connect_project": "Patient context fields can be encoded for CareSync models."
    }
  },
  {
    "date": "2026-08-09",
    "day": 40,
    "phase": "Coding Strength",
    "title": "Basic DP",
    "focus": "Learn fibonacci, climbing stairs, memoization vs tabulation.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 509,
        "name": "Fibonacci Number",
        "difficulty": "Easy",
        "pattern": "Dynamic Programming",
        "why": "It introduces recurrence and memoization/tabulation."
      },
      {
        "id": 70,
        "name": "Climbing Stairs",
        "difficulty": "Easy",
        "pattern": "Dynamic Programming",
        "why": "It is the standard one-dimensional DP starter."
      },
      {
        "id": 746,
        "name": "Min Cost Climbing Stairs",
        "difficulty": "Easy",
        "pattern": "Dynamic Programming",
        "why": "It adds cost minimization to the stairs pattern."
      }
    ]
  },
  {
    "date": "2026-08-10",
    "day": 41,
    "phase": "Coding Strength",
    "title": "HashMap Pattern",
    "focus": "Learn frequency map, two sum, duplicates, majority element.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed HashMap Pattern notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1,
        "name": "Two Sum",
        "difficulty": "Easy",
        "pattern": "HashMap Lookup",
        "why": "It is the base HashMap lookup problem."
      },
      {
        "id": 49,
        "name": "Group Anagrams",
        "difficulty": "Medium",
        "pattern": "HashMap Grouping",
        "why": "It groups strings using frequency/signature keys."
      },
      {
        "id": 128,
        "name": "Longest Consecutive Sequence",
        "difficulty": "Medium",
        "pattern": "HashSet Sequence",
        "why": "It uses set lookup to detect sequence starts efficiently."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: MinMaxScaler",
      "what": "\u2022 Understand 0-1 scaling\n\u2022 Compare with StandardScaler\n\u2022 Know outlier sensitivity",
      "connect_project": "CareSync vitals normalization can use scaling for dashboards/models."
    }
  },
  {
    "date": "2026-08-11",
    "day": 42,
    "phase": "Coding Strength",
    "title": "Sorting",
    "focus": "Learn selection/insertion/merge concept, comparator basics, sorting arrays.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Sorting notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 912,
        "name": "Sort an Array",
        "difficulty": "Medium",
        "pattern": "Sorting",
        "why": "It forces understanding of actual sorting behavior beyond library calls."
      },
      {
        "id": 75,
        "name": "Sort Colors",
        "difficulty": "Medium",
        "pattern": "Dutch National Flag",
        "why": "It trains in-place multi-pointer sorting."
      },
      {
        "id": 56,
        "name": "Merge Intervals",
        "difficulty": "Medium",
        "pattern": "Sorting + Intervals",
        "why": "It uses sorting as the entry point to interval merging."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Handling Nulls",
      "what": "\u2022 Know drop vs impute\n\u2022 Use SimpleImputer\n\u2022 Avoid data leakage",
      "connect_project": "Medical device streams may have missing vitals."
    }
  },
  {
    "date": "2026-08-12",
    "day": 43,
    "phase": "Coding Strength",
    "title": "Binary Search",
    "focus": "Learn search in sorted array, lower bound, upper bound, answer-space intro.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Binary Search notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 704,
        "name": "Binary Search",
        "difficulty": "Easy",
        "pattern": "Binary Search",
        "why": "It is the core low/mid/high template."
      },
      {
        "id": 35,
        "name": "Search Insert Position",
        "difficulty": "Easy",
        "pattern": "Binary Search",
        "why": "It extends search to insertion boundary logic."
      },
      {
        "id": 374,
        "name": "Guess Number Higher or Lower",
        "difficulty": "Easy",
        "pattern": "Binary Search",
        "why": "It reinforces narrowing the answer range."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Feature Engineering Practice",
      "what": "\u2022 Build preprocessing steps\n\u2022 Encode/scale a small dataset\n\u2022 Write leakage prevention note",
      "connect_project": "CareSync needs robust preprocessing before risk scoring."
    }
  },
  {
    "date": "2026-08-13",
    "day": 44,
    "phase": "Coding Strength",
    "title": "Recursion Basics",
    "focus": "Learn recursion tree, base case, factorial, power, array recursion.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Recursion Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 206,
        "name": "Reverse Linked List",
        "difficulty": "Easy",
        "pattern": "Recursion",
        "why": "It can be solved recursively and builds pointer-call intuition."
      },
      {
        "id": 21,
        "name": "Merge Two Sorted Lists",
        "difficulty": "Easy",
        "pattern": "Recursion / Linked List",
        "why": "It shows recursive merging of two structures."
      },
      {
        "id": 509,
        "name": "Fibonacci Number",
        "difficulty": "Easy",
        "pattern": "Recursion / DP",
        "why": "It is the simplest recursion-to-DP bridge."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Label Encoding",
      "what": "\u2022 Know ordinal risk problem\n\u2022 Use only for ordered categories\n\u2022 Avoid misuse",
      "connect_project": "Clinical categories must be encoded carefully."
    }
  },
  {
    "date": "2026-08-14",
    "day": 45,
    "phase": "Coding Strength",
    "title": "Linked List",
    "focus": "Learn node structure, traversal, insert/delete, reverse linked list.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Linked List notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 206,
        "name": "Reverse Linked List",
        "difficulty": "Easy",
        "pattern": "Linked List Pointers",
        "why": "It is the must-know linked-list pointer reversal problem."
      },
      {
        "id": 21,
        "name": "Merge Two Sorted Lists",
        "difficulty": "Easy",
        "pattern": "Linked List Merge",
        "why": "It practices pointer movement across two lists."
      },
      {
        "id": 83,
        "name": "Remove Duplicates from Sorted List",
        "difficulty": "Easy",
        "pattern": "Linked List Traversal",
        "why": "It reinforces traversal and duplicate skipping."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: OneHotEncoder",
      "what": "\u2022 Encode nominal categories\n\u2022 Handle unknown categories\n\u2022 Compare with label encoding",
      "connect_project": "Patient context fields can be encoded for CareSync models."
    }
  },
  {
    "date": "2026-08-15",
    "day": 46,
    "phase": "Coding Strength",
    "title": "Stack",
    "focus": "Learn LIFO, valid parentheses, next greater element.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 20,
        "name": "Valid Parentheses",
        "difficulty": "Easy",
        "pattern": "Stack",
        "why": "It is the core stack matching problem."
      },
      {
        "id": 155,
        "name": "Min Stack",
        "difficulty": "Medium",
        "pattern": "Design Stack",
        "why": "It adds state tracking while preserving stack operations."
      },
      {
        "id": 232,
        "name": "Implement Queue using Stacks",
        "difficulty": "Easy",
        "pattern": "Stack Design",
        "why": "It tests stack behavior through data-structure design."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Silhouette Score",
      "what": "\u2022 Understand cohesion/separation\n\u2022 Use silhouette_score\n\u2022 Compare k values",
      "connect_project": "Silhouette can evaluate patient pattern clusters."
    }
  },
  {
    "date": "2026-08-16",
    "day": 47,
    "phase": "Coding Strength",
    "title": "Queue",
    "focus": "Learn FIFO, circular queue idea, BFS intro.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 232,
        "name": "Implement Queue using Stacks",
        "difficulty": "Easy",
        "pattern": "Queue Design",
        "why": "It simulates queue behavior using stacks."
      },
      {
        "id": 225,
        "name": "Implement Stack using Queues",
        "difficulty": "Easy",
        "pattern": "Queue Design",
        "why": "It reverses the design idea using queues."
      },
      {
        "id": 933,
        "name": "Number of Recent Calls",
        "difficulty": "Easy",
        "pattern": "Queue",
        "why": "It uses a queue to maintain a recent time window."
      }
    ]
  },
  {
    "date": "2026-08-17",
    "day": 48,
    "phase": "Coding Strength",
    "title": "Trees Basics",
    "focus": "Learn traversal, height, count nodes, level order.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Trees Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 104,
        "name": "Maximum Depth of Binary Tree",
        "difficulty": "Easy",
        "pattern": "DFS Tree Traversal",
        "why": "It is the base depth calculation problem."
      },
      {
        "id": 226,
        "name": "Invert Binary Tree",
        "difficulty": "Easy",
        "pattern": "Tree Recursion",
        "why": "It practices recursive swapping of children."
      },
      {
        "id": 144,
        "name": "Binary Tree Preorder Traversal",
        "difficulty": "Easy",
        "pattern": "Tree Traversal",
        "why": "It reinforces preorder traversal structure."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: KMeans Mini Practice",
      "what": "\u2022 Run KMeans\n\u2022 Try 3 k values\n\u2022 Write cluster observations",
      "connect_project": "Patient vitals can be explored with clustering."
    }
  },
  {
    "date": "2026-08-18",
    "day": 49,
    "phase": "Coding Strength",
    "title": "Basic DP",
    "focus": "Learn fibonacci, climbing stairs, memoization vs tabulation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Basic DP notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 509,
        "name": "Fibonacci Number",
        "difficulty": "Easy",
        "pattern": "Dynamic Programming",
        "why": "It introduces recurrence and memoization/tabulation."
      },
      {
        "id": 70,
        "name": "Climbing Stairs",
        "difficulty": "Easy",
        "pattern": "Dynamic Programming",
        "why": "It is the standard one-dimensional DP starter."
      },
      {
        "id": 746,
        "name": "Min Cost Climbing Stairs",
        "difficulty": "Easy",
        "pattern": "Dynamic Programming",
        "why": "It adds cost minimization to the stairs pattern."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Unsupervised Review",
      "what": "\u2022 Summarize clustering use cases\n\u2022 List risks\n\u2022 Connect to exploratory analysis",
      "connect_project": "CareSync can use clustering for exploratory patient-state analysis."
    }
  },
  {
    "date": "2026-08-19",
    "day": 50,
    "phase": "Coding Strength",
    "title": "HashMap Pattern",
    "focus": "Learn frequency map, two sum, duplicates, majority element.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed HashMap Pattern notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1,
        "name": "Two Sum",
        "difficulty": "Easy",
        "pattern": "HashMap Lookup",
        "why": "It is the base HashMap lookup problem."
      },
      {
        "id": 49,
        "name": "Group Anagrams",
        "difficulty": "Medium",
        "pattern": "HashMap Grouping",
        "why": "It groups strings using frequency/signature keys."
      },
      {
        "id": 128,
        "name": "Longest Consecutive Sequence",
        "difficulty": "Medium",
        "pattern": "HashSet Sequence",
        "why": "It uses set lookup to detect sequence starts efficiently."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: KMeans Clustering",
      "what": "\u2022 Understand centroids\n\u2022 Fit/predict clusters\n\u2022 Interpret cluster labels carefully",
      "connect_project": "CareSync could cluster patient states or vital patterns."
    }
  },
  {
    "date": "2026-08-20",
    "day": 51,
    "phase": "Coding Strength",
    "title": "Sorting",
    "focus": "Learn selection/insertion/merge concept, comparator basics, sorting arrays.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Sorting notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 912,
        "name": "Sort an Array",
        "difficulty": "Medium",
        "pattern": "Sorting",
        "why": "It forces understanding of actual sorting behavior beyond library calls."
      },
      {
        "id": 75,
        "name": "Sort Colors",
        "difficulty": "Medium",
        "pattern": "Dutch National Flag",
        "why": "It trains in-place multi-pointer sorting."
      },
      {
        "id": 56,
        "name": "Merge Intervals",
        "difficulty": "Medium",
        "pattern": "Sorting + Intervals",
        "why": "It uses sorting as the entry point to interval merging."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Elbow Method",
      "what": "\u2022 Plot inertia idea\n\u2022 Choose k carefully\n\u2022 Know limitations",
      "connect_project": "Cluster count can help group patient risk behavior."
    }
  },
  {
    "date": "2026-08-21",
    "day": 52,
    "phase": "Coding Strength",
    "title": "Binary Search",
    "focus": "Learn search in sorted array, lower bound, upper bound, answer-space intro.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Binary Search notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 704,
        "name": "Binary Search",
        "difficulty": "Easy",
        "pattern": "Binary Search",
        "why": "It is the core low/mid/high template."
      },
      {
        "id": 35,
        "name": "Search Insert Position",
        "difficulty": "Easy",
        "pattern": "Binary Search",
        "why": "It extends search to insertion boundary logic."
      },
      {
        "id": 374,
        "name": "Guess Number Higher or Lower",
        "difficulty": "Easy",
        "pattern": "Binary Search",
        "why": "It reinforces narrowing the answer range."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Silhouette Score",
      "what": "\u2022 Understand cohesion/separation\n\u2022 Use silhouette_score\n\u2022 Compare k values",
      "connect_project": "Silhouette can evaluate patient pattern clusters."
    }
  },
  {
    "date": "2026-08-22",
    "day": 53,
    "phase": "Coding Strength",
    "title": "Recursion Basics",
    "focus": "Learn recursion tree, base case, factorial, power, array recursion.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 206,
        "name": "Reverse Linked List",
        "difficulty": "Easy",
        "pattern": "Recursion",
        "why": "It can be solved recursively and builds pointer-call intuition."
      },
      {
        "id": 21,
        "name": "Merge Two Sorted Lists",
        "difficulty": "Easy",
        "pattern": "Recursion / Linked List",
        "why": "It shows recursive merging of two structures."
      },
      {
        "id": 509,
        "name": "Fibonacci Number",
        "difficulty": "Easy",
        "pattern": "Recursion / DP",
        "why": "It is the simplest recursion-to-DP bridge."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Anomaly Score Interpretation",
      "what": "\u2022 Read decision_function\n\u2022 Separate score from label\n\u2022 Write dashboard-friendly explanation",
      "connect_project": "CareSync should explain why a reading is abnormal."
    }
  },
  {
    "date": "2026-08-23",
    "day": 54,
    "phase": "Coding Strength",
    "title": "Linked List",
    "focus": "Learn node structure, traversal, insert/delete, reverse linked list.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 206,
        "name": "Reverse Linked List",
        "difficulty": "Easy",
        "pattern": "Linked List Pointers",
        "why": "It is the must-know linked-list pointer reversal problem."
      },
      {
        "id": 21,
        "name": "Merge Two Sorted Lists",
        "difficulty": "Easy",
        "pattern": "Linked List Merge",
        "why": "It practices pointer movement across two lists."
      },
      {
        "id": 83,
        "name": "Remove Duplicates from Sorted List",
        "difficulty": "Easy",
        "pattern": "Linked List Traversal",
        "why": "It reinforces traversal and duplicate skipping."
      }
    ]
  },
  {
    "date": "2026-08-24",
    "day": 55,
    "phase": "Coding Strength",
    "title": "Stack",
    "focus": "Learn LIFO, valid parentheses, next greater element.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Stack notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 20,
        "name": "Valid Parentheses",
        "difficulty": "Easy",
        "pattern": "Stack",
        "why": "It is the core stack matching problem."
      },
      {
        "id": 155,
        "name": "Min Stack",
        "difficulty": "Medium",
        "pattern": "Design Stack",
        "why": "It adds state tracking while preserving stack operations."
      },
      {
        "id": 232,
        "name": "Implement Queue using Stacks",
        "difficulty": "Easy",
        "pattern": "Stack Design",
        "why": "It tests stack behavior through data-structure design."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Anomaly Detection Mini Practice",
      "what": "\u2022 Train IsolationForest\n\u2022 Create normal/abnormal samples\n\u2022 Print anomaly results",
      "connect_project": "This improves CareSync model depth."
    }
  },
  {
    "date": "2026-08-25",
    "day": 56,
    "phase": "Coding Strength",
    "title": "Queue",
    "focus": "Learn FIFO, circular queue idea, BFS intro.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Queue notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 232,
        "name": "Implement Queue using Stacks",
        "difficulty": "Easy",
        "pattern": "Queue Design",
        "why": "It simulates queue behavior using stacks."
      },
      {
        "id": 225,
        "name": "Implement Stack using Queues",
        "difficulty": "Easy",
        "pattern": "Queue Design",
        "why": "It reverses the design idea using queues."
      },
      {
        "id": 933,
        "name": "Number of Recent Calls",
        "difficulty": "Easy",
        "pattern": "Queue",
        "why": "It uses a queue to maintain a recent time window."
      }
    ],
    "placementPrep": {
      "type": "Interview Preparation",
      "details": "Practice explaining project architecture choices and system scalability. Concept: Isolation Forest",
      "what": "\u2022 Understand random isolation idea\n\u2022 Fit anomaly detector\n\u2022 Interpret anomaly scores",
      "connect_project": "This directly powers CareSync anomaly detection."
    }
  },
  {
    "date": "2026-08-26",
    "day": 57,
    "phase": "Coding Strength",
    "title": "Trees Basics",
    "focus": "Learn traversal, height, count nodes, level order.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Trees Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 104,
        "name": "Maximum Depth of Binary Tree",
        "difficulty": "Easy",
        "pattern": "DFS Tree Traversal",
        "why": "It is the base depth calculation problem."
      },
      {
        "id": 226,
        "name": "Invert Binary Tree",
        "difficulty": "Easy",
        "pattern": "Tree Recursion",
        "why": "It practices recursive swapping of children."
      },
      {
        "id": 144,
        "name": "Binary Tree Preorder Traversal",
        "difficulty": "Easy",
        "pattern": "Tree Traversal",
        "why": "It reinforces preorder traversal structure."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Z-score Anomaly Detection",
      "what": "\u2022 Calculate z-score\n\u2022 Choose threshold carefully\n\u2022 Compare with Isolation Forest",
      "connect_project": "Z-score can detect vitals far from a patient baseline."
    }
  },
  {
    "date": "2026-08-27",
    "day": 58,
    "phase": "Coding Strength",
    "title": "Basic DP",
    "focus": "Learn fibonacci, climbing stairs, memoization vs tabulation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Basic DP notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 509,
        "name": "Fibonacci Number",
        "difficulty": "Easy",
        "pattern": "Dynamic Programming",
        "why": "It introduces recurrence and memoization/tabulation."
      },
      {
        "id": 70,
        "name": "Climbing Stairs",
        "difficulty": "Easy",
        "pattern": "Dynamic Programming",
        "why": "It is the standard one-dimensional DP starter."
      },
      {
        "id": 746,
        "name": "Min Cost Climbing Stairs",
        "difficulty": "Easy",
        "pattern": "Dynamic Programming",
        "why": "It adds cost minimization to the stairs pattern."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: contamination Parameter",
      "what": "\u2022 Understand expected anomaly fraction\n\u2022 Test different contamination values\n\u2022 Avoid over-alerting",
      "connect_project": "CareSync alert volume depends on contamination/risk thresholds."
    }
  },
  {
    "date": "2026-08-28",
    "day": 59,
    "phase": "Coding Strength",
    "title": "HashMap Pattern",
    "focus": "Learn frequency map, two sum, duplicates, majority element.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed HashMap Pattern notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1,
        "name": "Two Sum",
        "difficulty": "Easy",
        "pattern": "HashMap Lookup",
        "why": "It is the base HashMap lookup problem."
      },
      {
        "id": 49,
        "name": "Group Anagrams",
        "difficulty": "Medium",
        "pattern": "HashMap Grouping",
        "why": "It groups strings using frequency/signature keys."
      },
      {
        "id": 128,
        "name": "Longest Consecutive Sequence",
        "difficulty": "Medium",
        "pattern": "HashSet Sequence",
        "why": "It uses set lookup to detect sequence starts efficiently."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Anomaly Score Interpretation",
      "what": "\u2022 Read decision_function\n\u2022 Separate score from label\n\u2022 Write dashboard-friendly explanation",
      "connect_project": "CareSync should explain why a reading is abnormal."
    }
  },
  {
    "date": "2026-08-29",
    "day": 60,
    "phase": "Coding Strength",
    "title": "Sorting",
    "focus": "Learn selection/insertion/merge concept, comparator basics, sorting arrays.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 912,
        "name": "Sort an Array",
        "difficulty": "Medium",
        "pattern": "Sorting",
        "why": "It forces understanding of actual sorting behavior beyond library calls."
      },
      {
        "id": 75,
        "name": "Sort Colors",
        "difficulty": "Medium",
        "pattern": "Dutch National Flag",
        "why": "It trains in-place multi-pointer sorting."
      },
      {
        "id": 56,
        "name": "Merge Intervals",
        "difficulty": "Medium",
        "pattern": "Sorting + Intervals",
        "why": "It uses sorting as the entry point to interval merging."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: ColumnTransformer",
      "what": "\u2022 Apply different transforms to columns\n\u2022 Combine numeric/categorical preprocessing\n\u2022 Use with Pipeline",
      "connect_project": "CareSync can transform vitals and context fields separately."
    }
  },
  {
    "date": "2026-08-30",
    "day": 61,
    "phase": "Coding Strength",
    "title": "Binary Search",
    "focus": "Learn search in sorted array, lower bound, upper bound, answer-space intro.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 704,
        "name": "Binary Search",
        "difficulty": "Easy",
        "pattern": "Binary Search",
        "why": "It is the core low/mid/high template."
      },
      {
        "id": 35,
        "name": "Search Insert Position",
        "difficulty": "Easy",
        "pattern": "Binary Search",
        "why": "It extends search to insertion boundary logic."
      },
      {
        "id": 374,
        "name": "Guess Number Higher or Lower",
        "difficulty": "Easy",
        "pattern": "Binary Search",
        "why": "It reinforces narrowing the answer range."
      }
    ]
  },
  {
    "date": "2026-08-31",
    "day": 62,
    "phase": "Coding Strength",
    "title": "Recursion Basics",
    "focus": "Learn recursion tree, base case, factorial, power, array recursion.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Recursion Basics notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 206,
        "name": "Reverse Linked List",
        "difficulty": "Easy",
        "pattern": "Recursion",
        "why": "It can be solved recursively and builds pointer-call intuition."
      },
      {
        "id": 21,
        "name": "Merge Two Sorted Lists",
        "difficulty": "Easy",
        "pattern": "Recursion / Linked List",
        "why": "It shows recursive merging of two structures."
      },
      {
        "id": 509,
        "name": "Fibonacci Number",
        "difficulty": "Easy",
        "pattern": "Recursion / DP",
        "why": "It is the simplest recursion-to-DP bridge."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: sklearn Pipeline",
      "what": "\u2022 Understand sequential preprocessing + model\n\u2022 Build a simple Pipeline\n\u2022 Avoid leakage",
      "connect_project": "CareSync preprocessing and model can be packaged cleanly."
    }
  },
  {
    "date": "2026-09-01",
    "day": 63,
    "phase": "Placement Core",
    "title": "Aptitude Full Syllabus",
    "focus": "Practice time/work, speed/distance, profit/loss, SI/CI, probability basics.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Aptitude Full Syllabus notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 121,
        "name": "Best Time to Buy and Sell Stock",
        "difficulty": "Easy",
        "pattern": "One Pass Array",
        "why": "It keeps array optimization warm during aptitude-heavy days."
      },
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It refreshes a common medium string pattern."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Confusion Matrix",
      "what": "\u2022 Read TP, FP, TN, FN\n\u2022 Create confusion_matrix\n\u2022 Explain false alarms",
      "connect_project": "CareSync false negatives can be clinically risky."
    }
  },
  {
    "date": "2026-09-02",
    "day": 64,
    "phase": "Placement Core",
    "title": "DBMS",
    "focus": "Learn keys, normalization, joins, group by, having, ACID, indexes.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "SQL: solve 3 queries using SELECT/WHERE/GROUP BY/JOIN based on topic.",
      "Write one interview answer in your notes."
    ],
    "output": "Completed DBMS notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1757,
        "name": "Recyclable and Low Fat Products",
        "difficulty": "Easy",
        "pattern": "SQL Filtering",
        "why": "It reinforces SELECT and WHERE on DBMS days."
      },
      {
        "id": 595,
        "name": "Big Countries",
        "difficulty": "Easy",
        "pattern": "SQL Filtering",
        "why": "It trains basic filtering and projection."
      },
      {
        "id": 182,
        "name": "Duplicate Emails",
        "difficulty": "Easy",
        "pattern": "SQL Group By",
        "why": "It directly connects grouping to duplicate detection."
      }
    ],
    "placementPrep": {
      "type": "Interview Preparation",
      "details": "Practice explaining project architecture choices and system scalability. Concept: classification_report",
      "what": "\u2022 Read precision/recall/F1\n\u2022 Compare per-class metrics\n\u2022 Spot weak class",
      "connect_project": "Risk tier reporting needs class-level metrics."
    }
  },
  {
    "date": "2026-09-03",
    "day": 65,
    "phase": "Placement Core",
    "title": "OS",
    "focus": "Learn process/thread, scheduling, deadlock, paging, memory management.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed OS notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It tests window growth/shrink with a set/map."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Precision-Recall Curve",
      "what": "\u2022 Understand PR tradeoff\n\u2022 Know imbalanced-data usefulness\n\u2022 Compare with ROC",
      "connect_project": "CareSync may prioritize recall for critical patients."
    }
  },
  {
    "date": "2026-09-04",
    "day": 66,
    "phase": "Placement Core",
    "title": "Computer Networks",
    "focus": "Learn OSI, TCP/UDP, HTTP/HTTPS, DNS, IP, client-server.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Computer Networks notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 560,
        "name": "Subarray Sum Equals K",
        "difficulty": "Medium",
        "pattern": "Prefix Sum + HashMap",
        "why": "It combines prefix sums with frequency maps."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: AUC Deep Dive",
      "what": "\u2022 Interpret AUC\n\u2022 Know limitations\n\u2022 Compare models using AUC",
      "connect_project": "AUC helps compare CareSync classifiers."
    }
  },
  {
    "date": "2026-09-05",
    "day": 67,
    "phase": "Placement Core",
    "title": "Java MCQs",
    "focus": "Practice OOP, collections, exception handling, static/final, interface/abstract.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 102,
        "name": "Binary Tree Level Order Traversal",
        "difficulty": "Medium",
        "pattern": "BFS",
        "why": "It reinforces queue-based tree traversal."
      }
    ],
    "placementPrep": {
      "type": "Interview Preparation",
      "details": "Practice explaining project architecture choices and system scalability. Concept: Evaluation Summary",
      "what": "\u2022 Pick metrics for each problem type\n\u2022 Write 5 metric definitions\n\u2022 Explain one tradeoff",
      "connect_project": "CareSync needs metrics aligned to patient safety."
    }
  },
  {
    "date": "2026-09-06",
    "day": 68,
    "phase": "Placement Core",
    "title": "Coding Mock",
    "focus": "Take a timed easy-medium coding mock and review errors.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 54,
        "name": "Spiral Matrix",
        "difficulty": "Medium",
        "pattern": "Matrix Simulation",
        "why": "It tests careful matrix boundary logic."
      },
      {
        "id": 33,
        "name": "Search in Rotated Sorted Array",
        "difficulty": "Medium",
        "pattern": "Binary Search",
        "why": "It tests binary search with rotated conditions."
      }
    ]
  },
  {
    "date": "2026-09-07",
    "day": 69,
    "phase": "Placement Core",
    "title": "Aptitude Full Syllabus",
    "focus": "Practice time/work, speed/distance, profit/loss, SI/CI, probability basics.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Aptitude Full Syllabus notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 121,
        "name": "Best Time to Buy and Sell Stock",
        "difficulty": "Easy",
        "pattern": "One Pass Array",
        "why": "It keeps array optimization warm during aptitude-heavy days."
      },
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It refreshes a common medium string pattern."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Confusion Matrix",
      "what": "\u2022 Read TP, FP, TN, FN\n\u2022 Create confusion_matrix\n\u2022 Explain false alarms",
      "connect_project": "CareSync false negatives can be clinically risky."
    }
  },
  {
    "date": "2026-09-08",
    "day": 70,
    "phase": "Placement Core",
    "title": "DBMS",
    "focus": "Learn keys, normalization, joins, group by, having, ACID, indexes.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "SQL: solve 3 queries using SELECT/WHERE/GROUP BY/JOIN based on topic.",
      "Write one interview answer in your notes."
    ],
    "output": "Completed DBMS notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1757,
        "name": "Recyclable and Low Fat Products",
        "difficulty": "Easy",
        "pattern": "SQL Filtering",
        "why": "It reinforces SELECT and WHERE on DBMS days."
      },
      {
        "id": 595,
        "name": "Big Countries",
        "difficulty": "Easy",
        "pattern": "SQL Filtering",
        "why": "It trains basic filtering and projection."
      },
      {
        "id": 182,
        "name": "Duplicate Emails",
        "difficulty": "Easy",
        "pattern": "SQL Group By",
        "why": "It directly connects grouping to duplicate detection."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Stopwords",
      "what": "\u2022 Know why common words can be removed\n\u2022 Understand when not to remove\n\u2022 Try a small example",
      "connect_project": "Review how this applies to CareSync/SmartEdu."
    }
  },
  {
    "date": "2026-09-09",
    "day": 71,
    "phase": "Placement Core",
    "title": "OS",
    "focus": "Learn process/thread, scheduling, deadlock, paging, memory management.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed OS notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 15,
        "name": "3Sum",
        "difficulty": "Medium",
        "pattern": "Sorting + Two Pointers",
        "why": "It strengthens sorted two-pointer reasoning."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: TF-IDF Vectorizer",
      "what": "\u2022 Understand term frequency and inverse document frequency\n\u2022 Use TfidfVectorizer\n\u2022 Inspect feature names",
      "connect_project": "Review how this applies to CareSync/SmartEdu."
    }
  },
  {
    "date": "2026-09-10",
    "day": 72,
    "phase": "Placement Core",
    "title": "Computer Networks",
    "focus": "Learn OSI, TCP/UDP, HTTP/HTTPS, DNS, IP, client-server.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Computer Networks notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 238,
        "name": "Product of Array Except Self",
        "difficulty": "Medium",
        "pattern": "Prefix Product",
        "why": "It revisits array transformation with optimized space thinking."
      }
    ],
    "placementPrep": {
      "type": "Interview Preparation",
      "details": "Practice explaining project architecture choices and system scalability. Concept: Basic Text Classification",
      "what": "\u2022 Build TF-IDF + classifier\n\u2022 Evaluate classification report\n\u2022 Avoid leakage",
      "connect_project": "Review how this applies to CareSync/SmartEdu."
    }
  },
  {
    "date": "2026-09-11",
    "day": 73,
    "phase": "Placement Core",
    "title": "Java MCQs",
    "focus": "Practice OOP, collections, exception handling, static/final, interface/abstract.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Java MCQs notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It tests window growth/shrink with a set/map."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: NLP Pipeline",
      "what": "\u2022 Combine vectorizer and classifier\n\u2022 Use Pipeline\n\u2022 Test predict on new text",
      "connect_project": "Review how this applies to CareSync/SmartEdu."
    }
  },
  {
    "date": "2026-09-12",
    "day": 74,
    "phase": "Placement Core",
    "title": "Coding Mock",
    "focus": "Take a timed easy-medium coding mock and review errors.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It tests window growth/shrink with a set/map."
      },
      {
        "id": 560,
        "name": "Subarray Sum Equals K",
        "difficulty": "Medium",
        "pattern": "Prefix Sum + HashMap",
        "why": "It combines prefix sums with frequency maps."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: NLP Review",
      "what": "\u2022 Summarize tokenization, stopwords, TF-IDF\n\u2022 Write 3 interview answers\n\u2022 List limitations",
      "connect_project": "Review how this applies to CareSync/SmartEdu."
    }
  },
  {
    "date": "2026-09-13",
    "day": 75,
    "phase": "Placement Core",
    "title": "Aptitude Full Syllabus",
    "focus": "Practice time/work, speed/distance, profit/loss, SI/CI, probability basics.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 121,
        "name": "Best Time to Buy and Sell Stock",
        "difficulty": "Easy",
        "pattern": "One Pass Array",
        "why": "It keeps array optimization warm during aptitude-heavy days."
      },
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It refreshes a common medium string pattern."
      }
    ]
  },
  {
    "date": "2026-09-14",
    "day": 76,
    "phase": "Placement Core",
    "title": "DBMS",
    "focus": "Learn keys, normalization, joins, group by, having, ACID, indexes.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "SQL: solve 3 queries using SELECT/WHERE/GROUP BY/JOIN based on topic.",
      "Write one interview answer in your notes."
    ],
    "output": "Completed DBMS notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 1757,
        "name": "Recyclable and Low Fat Products",
        "difficulty": "Easy",
        "pattern": "SQL Filtering",
        "why": "It reinforces SELECT and WHERE on DBMS days."
      },
      {
        "id": 595,
        "name": "Big Countries",
        "difficulty": "Easy",
        "pattern": "SQL Filtering",
        "why": "It trains basic filtering and projection."
      },
      {
        "id": 182,
        "name": "Duplicate Emails",
        "difficulty": "Easy",
        "pattern": "SQL Group By",
        "why": "It directly connects grouping to duplicate detection."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Stopwords",
      "what": "\u2022 Know why common words can be removed\n\u2022 Understand when not to remove\n\u2022 Try a small example",
      "connect_project": "Review how this applies to CareSync/SmartEdu."
    }
  },
  {
    "date": "2026-09-15",
    "day": 77,
    "phase": "Placement Core",
    "title": "OS",
    "focus": "Learn process/thread, scheduling, deadlock, paging, memory management.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed OS notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 347,
        "name": "Top K Frequent Elements",
        "difficulty": "Medium",
        "pattern": "HashMap + Heap",
        "why": "It connects frequency counting with priority selection."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: XGBoost Basics",
      "what": "\u2022 Know XGBClassifier purpose\n\u2022 Understand n_estimators/max_depth\n\u2022 Avoid overfitting",
      "connect_project": "XGBoost can be a strong baseline for CareSync tabular vitals."
    }
  },
  {
    "date": "2026-09-16",
    "day": 78,
    "phase": "Placement Core",
    "title": "Computer Networks",
    "focus": "Learn OSI, TCP/UDP, HTTP/HTTPS, DNS, IP, client-server.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Computer Networks notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 200,
        "name": "Number of Islands",
        "difficulty": "Medium",
        "pattern": "DFS / BFS Grid",
        "why": "It practices grid traversal and connected components."
      }
    ],
    "placementPrep": {
      "type": "Interview Preparation",
      "details": "Practice explaining project architecture choices and system scalability. Concept: Boosting Evaluation",
      "what": "\u2022 Compare boosted model with Random Forest\n\u2022 Use classification_report\n\u2022 Record tradeoffs",
      "connect_project": "Model comparison can strengthen CareSync README."
    }
  },
  {
    "date": "2026-09-17",
    "day": 79,
    "phase": "Placement Core",
    "title": "Java MCQs",
    "focus": "Practice OOP, collections, exception handling, static/final, interface/abstract.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Java MCQs notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 15,
        "name": "3Sum",
        "difficulty": "Medium",
        "pattern": "Sorting + Two Pointers",
        "why": "It strengthens sorted two-pointer reasoning."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Feature Importance in Boosting",
      "what": "\u2022 Read importance carefully\n\u2022 Compare with permutation importance\n\u2022 Explain top vitals",
      "connect_project": "CareSync can show important vitals behind risk predictions."
    }
  },
  {
    "date": "2026-09-18",
    "day": 80,
    "phase": "Placement Core",
    "title": "Coding Mock",
    "focus": "Take a timed easy-medium coding mock and review errors.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Coding Mock notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 102,
        "name": "Binary Tree Level Order Traversal",
        "difficulty": "Medium",
        "pattern": "BFS",
        "why": "It reinforces queue-based tree traversal."
      },
      {
        "id": 198,
        "name": "House Robber",
        "difficulty": "Medium",
        "pattern": "Dynamic Programming",
        "why": "It trains state transition thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Boosting Mini Practice",
      "what": "\u2022 Train one boosted classifier\n\u2022 Tune one parameter\n\u2022 Write comparison notes",
      "connect_project": "Adds a strong ML model option to CareSync."
    }
  },
  {
    "date": "2026-09-19",
    "day": 81,
    "phase": "Placement Core",
    "title": "Aptitude Full Syllabus",
    "focus": "Practice time/work, speed/distance, profit/loss, SI/CI, probability basics.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 121,
        "name": "Best Time to Buy and Sell Stock",
        "difficulty": "Easy",
        "pattern": "One Pass Array",
        "why": "It keeps array optimization warm during aptitude-heavy days."
      },
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It refreshes a common medium string pattern."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Boosting vs Bagging",
      "what": "\u2022 Compare sequential vs parallel ensemble\n\u2022 Know error correction idea\n\u2022 List examples",
      "connect_project": "Boosting can improve CareSync risk classifiers if data quality is strong."
    }
  },
  {
    "date": "2026-09-20",
    "day": 82,
    "phase": "Placement Core",
    "title": "DBMS",
    "focus": "Learn keys, normalization, joins, group by, having, ACID, indexes.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 1757,
        "name": "Recyclable and Low Fat Products",
        "difficulty": "Easy",
        "pattern": "SQL Filtering",
        "why": "It reinforces SELECT and WHERE on DBMS days."
      },
      {
        "id": 595,
        "name": "Big Countries",
        "difficulty": "Easy",
        "pattern": "SQL Filtering",
        "why": "It trains basic filtering and projection."
      },
      {
        "id": 182,
        "name": "Duplicate Emails",
        "difficulty": "Easy",
        "pattern": "SQL Group By",
        "why": "It directly connects grouping to duplicate detection."
      }
    ]
  },
  {
    "date": "2026-09-21",
    "day": 83,
    "phase": "Placement Core",
    "title": "OS",
    "focus": "Learn process/thread, scheduling, deadlock, paging, memory management.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed OS notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 102,
        "name": "Binary Tree Level Order Traversal",
        "difficulty": "Medium",
        "pattern": "BFS",
        "why": "It reinforces queue-based tree traversal."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: XGBoost Basics",
      "what": "\u2022 Know XGBClassifier purpose\n\u2022 Understand n_estimators/max_depth\n\u2022 Avoid overfitting",
      "connect_project": "XGBoost can be a strong baseline for CareSync tabular vitals."
    }
  },
  {
    "date": "2026-09-22",
    "day": 84,
    "phase": "Placement Core",
    "title": "Computer Networks",
    "focus": "Learn OSI, TCP/UDP, HTTP/HTTPS, DNS, IP, client-server.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Computer Networks notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 198,
        "name": "House Robber",
        "difficulty": "Medium",
        "pattern": "Dynamic Programming",
        "why": "It trains state transition thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: pickle Basics and Risks",
      "what": "\u2022 Know pickle purpose\n\u2022 Understand security risk\n\u2022 Use trusted files only",
      "connect_project": "CareSync should load only trusted model artifacts."
    }
  },
  {
    "date": "2026-09-23",
    "day": 85,
    "phase": "Placement Core",
    "title": "Java MCQs",
    "focus": "Practice OOP, collections, exception handling, static/final, interface/abstract.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Java MCQs notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 347,
        "name": "Top K Frequent Elements",
        "difficulty": "Medium",
        "pattern": "HashMap + Heap",
        "why": "It connects frequency counting with priority selection."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Model Versioning Idea",
      "what": "\u2022 Name model files clearly\n\u2022 Track metrics with version\n\u2022 Avoid overwriting blindly",
      "connect_project": "CareSync needs traceable model versions."
    }
  },
  {
    "date": "2026-09-24",
    "day": 86,
    "phase": "Placement Core",
    "title": "Coding Mock",
    "focus": "Take a timed easy-medium coding mock and review errors.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Coding Mock notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 347,
        "name": "Top K Frequent Elements",
        "difficulty": "Medium",
        "pattern": "HashMap + Heap",
        "why": "It connects frequency counting with priority selection."
      },
      {
        "id": 200,
        "name": "Number of Islands",
        "difficulty": "Medium",
        "pattern": "DFS / BFS Grid",
        "why": "It practices grid traversal and connected components."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Saved Model API Flow",
      "what": "\u2022 Draw request to model prediction path\n\u2022 Plan input schema\n\u2022 Plan output JSON",
      "connect_project": "This prepares CareSync model serving."
    }
  },
  {
    "date": "2026-09-25",
    "day": 87,
    "phase": "Placement Core",
    "title": "Aptitude Full Syllabus",
    "focus": "Practice time/work, speed/distance, profit/loss, SI/CI, probability basics.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Aptitude Full Syllabus notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 121,
        "name": "Best Time to Buy and Sell Stock",
        "difficulty": "Easy",
        "pattern": "One Pass Array",
        "why": "It keeps array optimization warm during aptitude-heavy days."
      },
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It refreshes a common medium string pattern."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Persistence Mini Practice",
      "what": "\u2022 Save model with joblib\n\u2022 Reload and predict\n\u2022 Document steps",
      "connect_project": "CareSync can ship saved anomaly/risk models."
    }
  },
  {
    "date": "2026-09-26",
    "day": 88,
    "phase": "Placement Core",
    "title": "DBMS",
    "focus": "Learn keys, normalization, joins, group by, having, ACID, indexes.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "SQL: solve 3 queries using SELECT/WHERE/GROUP BY/JOIN based on topic.",
      "Write one interview answer in your notes.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 1757,
        "name": "Recyclable and Low Fat Products",
        "difficulty": "Easy",
        "pattern": "SQL Filtering",
        "why": "It reinforces SELECT and WHERE on DBMS days."
      },
      {
        "id": 595,
        "name": "Big Countries",
        "difficulty": "Easy",
        "pattern": "SQL Filtering",
        "why": "It trains basic filtering and projection."
      },
      {
        "id": 182,
        "name": "Duplicate Emails",
        "difficulty": "Easy",
        "pattern": "SQL Group By",
        "why": "It directly connects grouping to duplicate detection."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: joblib Model Saving",
      "what": "\u2022 Save sklearn model\n\u2022 Load model\n\u2022 Predict after loading",
      "connect_project": "CareSync API can load a saved model at startup."
    }
  },
  {
    "date": "2026-09-27",
    "day": 89,
    "phase": "Placement Core",
    "title": "OS",
    "focus": "Learn process/thread, scheduling, deadlock, paging, memory management.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It tests window growth/shrink with a set/map."
      }
    ]
  },
  {
    "date": "2026-09-28",
    "day": 90,
    "phase": "Placement Core",
    "title": "Computer Networks",
    "focus": "Learn OSI, TCP/UDP, HTTP/HTTPS, DNS, IP, client-server.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Computer Networks notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 560,
        "name": "Subarray Sum Equals K",
        "difficulty": "Medium",
        "pattern": "Prefix Sum + HashMap",
        "why": "It combines prefix sums with frequency maps."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Model Versioning Idea",
      "what": "\u2022 Name model files clearly\n\u2022 Track metrics with version\n\u2022 Avoid overwriting blindly",
      "connect_project": "CareSync needs traceable model versions."
    }
  },
  {
    "date": "2026-09-29",
    "day": 91,
    "phase": "Placement Core",
    "title": "Java MCQs",
    "focus": "Practice OOP, collections, exception handling, static/final, interface/abstract.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Java MCQs notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 102,
        "name": "Binary Tree Level Order Traversal",
        "difficulty": "Medium",
        "pattern": "BFS",
        "why": "It reinforces queue-based tree traversal."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Saved Model API Flow",
      "what": "\u2022 Draw request to model prediction path\n\u2022 Plan input schema\n\u2022 Plan output JSON",
      "connect_project": "This prepares CareSync model serving."
    }
  },
  {
    "date": "2026-09-30",
    "day": 92,
    "phase": "Placement Core",
    "title": "Coding Mock",
    "focus": "Take a timed easy-medium coding mock and review errors.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Coding Mock notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 15,
        "name": "3Sum",
        "difficulty": "Medium",
        "pattern": "Sorting + Two Pointers",
        "why": "It strengthens sorted two-pointer reasoning."
      },
      {
        "id": 238,
        "name": "Product of Array Except Self",
        "difficulty": "Medium",
        "pattern": "Prefix Product",
        "why": "It revisits array transformation with optimized space thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Persistence Mini Practice",
      "what": "\u2022 Save model with joblib\n\u2022 Reload and predict\n\u2022 Document steps",
      "connect_project": "CareSync can ship saved anomaly/risk models."
    }
  },
  {
    "date": "2026-10-01",
    "day": 93,
    "phase": "Project + Interview Mode",
    "title": "CareSync README",
    "focus": "Improve README, problem statement, architecture, setup, screenshots.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement."
    ],
    "output": "Completed CareSync README notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 347,
        "name": "Top K Frequent Elements",
        "difficulty": "Medium",
        "pattern": "HashMap + Heap",
        "why": "It connects frequency counting with priority selection."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: FastAPI App Basics",
      "what": "\u2022 Create app object\n\u2022 Write GET endpoint\n\u2022 Run with uvicorn",
      "connect_project": "CareSync backend can expose health/risk endpoints."
    }
  },
  {
    "date": "2026-10-02",
    "day": 94,
    "phase": "Project + Interview Mode",
    "title": "CareSync Backend",
    "focus": "Improve FastAPI/API docs, risk endpoint explanation, requirements file.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement."
    ],
    "output": "Completed CareSync Backend notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 200,
        "name": "Number of Islands",
        "difficulty": "Medium",
        "pattern": "DFS / BFS Grid",
        "why": "It practices grid traversal and connected components."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Pydantic Models",
      "what": "\u2022 Define request schema\n\u2022 Validate data types\n\u2022 Return structured response",
      "connect_project": "CareSync vitals input needs validation."
    }
  },
  {
    "date": "2026-10-03",
    "day": 95,
    "phase": "Project + Interview Mode",
    "title": "CareSync ML",
    "focus": "Explain anomaly detection, risk score, threshold rules, baseline comparison.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 15,
        "name": "3Sum",
        "difficulty": "Medium",
        "pattern": "Sorting + Two Pointers",
        "why": "It strengthens sorted two-pointer reasoning."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Request and Response Flow",
      "what": "\u2022 Understand JSON body\n\u2022 Return dict response\n\u2022 Test with Swagger UI",
      "connect_project": "CareSync dashboard can call prediction endpoints."
    }
  },
  {
    "date": "2026-10-04",
    "day": 96,
    "phase": "Project + Interview Mode",
    "title": "GitHub Cleanup",
    "focus": "Remove junk files, add .gitignore, .env.example, clean structure.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 238,
        "name": "Product of Array Except Self",
        "difficulty": "Medium",
        "pattern": "Prefix Product",
        "why": "It revisits array transformation with optimized space thinking."
      }
    ]
  },
  {
    "date": "2026-10-05",
    "day": 97,
    "phase": "Project + Interview Mode",
    "title": "Testing + CI",
    "focus": "Add tests, run test command, add GitHub Actions if suitable.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Testing + CI notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It tests window growth/shrink with a set/map."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: FastAPI Error Handling",
      "what": "\u2022 Raise HTTPException\n\u2022 Return useful errors\n\u2022 Handle invalid vitals",
      "connect_project": "CareSync needs safe errors for bad patient readings."
    }
  },
  {
    "date": "2026-10-06",
    "day": 98,
    "phase": "Project + Interview Mode",
    "title": "Resume + LinkedIn",
    "focus": "Improve resume bullets, project pitch, LinkedIn profile/project post.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Resume + LinkedIn notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 560,
        "name": "Subarray Sum Equals K",
        "difficulty": "Medium",
        "pattern": "Prefix Sum + HashMap",
        "why": "It combines prefix sums with frequency maps."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: FastAPI Mini Practice",
      "what": "\u2022 Build 2 endpoints\n\u2022 Test Swagger\n\u2022 Write README usage",
      "connect_project": "This improves CareSync backend readiness."
    }
  },
  {
    "date": "2026-10-07",
    "day": 99,
    "phase": "Project + Interview Mode",
    "title": "Project Mock",
    "focus": "Practice 2-minute and 5-minute CareSync AI explanation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Project Mock notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 102,
        "name": "Binary Tree Level Order Traversal",
        "difficulty": "Medium",
        "pattern": "BFS",
        "why": "It reinforces queue-based tree traversal."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: FastAPI App Basics",
      "what": "\u2022 Create app object\n\u2022 Write GET endpoint\n\u2022 Run with uvicorn",
      "connect_project": "CareSync backend can expose health/risk endpoints."
    }
  },
  {
    "date": "2026-10-08",
    "day": 100,
    "phase": "Project + Interview Mode",
    "title": "CareSync README",
    "focus": "Improve README, problem statement, architecture, setup, screenshots.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement."
    ],
    "output": "Completed CareSync README notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 198,
        "name": "House Robber",
        "difficulty": "Medium",
        "pattern": "Dynamic Programming",
        "why": "It trains state transition thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Prediction Endpoint",
      "what": "\u2022 Create /predict endpoint\n\u2022 Accept vitals JSON\n\u2022 Return prediction + score",
      "connect_project": "This is core to CareSync AI serving."
    }
  },
  {
    "date": "2026-10-09",
    "day": 101,
    "phase": "Project + Interview Mode",
    "title": "CareSync Backend",
    "focus": "Improve FastAPI/API docs, risk endpoint explanation, requirements file.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement."
    ],
    "output": "Completed CareSync Backend notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 347,
        "name": "Top K Frequent Elements",
        "difficulty": "Medium",
        "pattern": "HashMap + Heap",
        "why": "It connects frequency counting with priority selection."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Input Validation for ML",
      "what": "\u2022 Validate ranges\n\u2022 Reject impossible vitals\n\u2022 Return clear errors",
      "connect_project": "CareSync must reject unsafe/invalid vitals."
    }
  },
  {
    "date": "2026-10-10",
    "day": 102,
    "phase": "Project + Interview Mode",
    "title": "CareSync ML",
    "focus": "Explain anomaly detection, risk score, threshold rules, baseline comparison.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 200,
        "name": "Number of Islands",
        "difficulty": "Medium",
        "pattern": "DFS / BFS Grid",
        "why": "It practices grid traversal and connected components."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: API Response Schema",
      "what": "\u2022 Return risk tier\n\u2022 Return risk score\n\u2022 Return explanation",
      "connect_project": "CareSync dashboard needs consistent response fields."
    }
  },
  {
    "date": "2026-10-11",
    "day": 103,
    "phase": "Project + Interview Mode",
    "title": "GitHub Cleanup",
    "focus": "Remove junk files, add .gitignore, .env.example, clean structure.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 15,
        "name": "3Sum",
        "difficulty": "Medium",
        "pattern": "Sorting + Two Pointers",
        "why": "It strengthens sorted two-pointer reasoning."
      }
    ]
  },
  {
    "date": "2026-10-12",
    "day": 104,
    "phase": "Project + Interview Mode",
    "title": "Testing + CI",
    "focus": "Add tests, run test command, add GitHub Actions if suitable.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Testing + CI notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 238,
        "name": "Product of Array Except Self",
        "difficulty": "Medium",
        "pattern": "Prefix Product",
        "why": "It revisits array transformation with optimized space thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: FastAPI + ML Mini Practice",
      "what": "\u2022 Serve one sklearn model\n\u2022 Test with JSON\n\u2022 Add README endpoint docs",
      "connect_project": "Directly upgrades CareSync demo quality."
    }
  },
  {
    "date": "2026-10-13",
    "day": 105,
    "phase": "Project + Interview Mode",
    "title": "Resume + LinkedIn",
    "focus": "Improve resume bullets, project pitch, LinkedIn profile/project post.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Resume + LinkedIn notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It tests window growth/shrink with a set/map."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Load Saved Model in API",
      "what": "\u2022 Load joblib model once\n\u2022 Avoid loading per request\n\u2022 Predict from endpoint",
      "connect_project": "CareSync can load anomaly/risk model at startup."
    }
  },
  {
    "date": "2026-10-14",
    "day": 106,
    "phase": "Project + Interview Mode",
    "title": "Project Mock",
    "focus": "Practice 2-minute and 5-minute CareSync AI explanation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Project Mock notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 560,
        "name": "Subarray Sum Equals K",
        "difficulty": "Medium",
        "pattern": "Prefix Sum + HashMap",
        "why": "It combines prefix sums with frequency maps."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Prediction Endpoint",
      "what": "\u2022 Create /predict endpoint\n\u2022 Accept vitals JSON\n\u2022 Return prediction + score",
      "connect_project": "This is core to CareSync AI serving."
    }
  },
  {
    "date": "2026-10-15",
    "day": 107,
    "phase": "Project + Interview Mode",
    "title": "CareSync README",
    "focus": "Improve README, problem statement, architecture, setup, screenshots.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement."
    ],
    "output": "Completed CareSync README notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 102,
        "name": "Binary Tree Level Order Traversal",
        "difficulty": "Medium",
        "pattern": "BFS",
        "why": "It reinforces queue-based tree traversal."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Run Docker Container",
      "what": "\u2022 Map ports\n\u2022 Pass env variables\n\u2022 Check logs",
      "connect_project": "CareSync API can run consistently on another machine."
    }
  },
  {
    "date": "2026-10-16",
    "day": 108,
    "phase": "Project + Interview Mode",
    "title": "CareSync Backend",
    "focus": "Improve FastAPI/API docs, risk endpoint explanation, requirements file.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement."
    ],
    "output": "Completed CareSync Backend notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 198,
        "name": "House Robber",
        "difficulty": "Medium",
        "pattern": "Dynamic Programming",
        "why": "It trains state transition thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: requirements.txt in Docker",
      "what": "\u2022 Pin dependencies\n\u2022 Install before copy source\n\u2022 Understand cache",
      "connect_project": "CareSync dependency setup becomes cleaner."
    }
  },
  {
    "date": "2026-10-17",
    "day": 109,
    "phase": "Project + Interview Mode",
    "title": "CareSync ML",
    "focus": "Explain anomaly detection, risk score, threshold rules, baseline comparison.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 347,
        "name": "Top K Frequent Elements",
        "difficulty": "Medium",
        "pattern": "HashMap + Heap",
        "why": "It connects frequency counting with priority selection."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Docker Debugging",
      "what": "\u2022 Read container logs\n\u2022 Fix port issues\n\u2022 Rebuild after changes",
      "connect_project": "Helps avoid demo-day environment failures."
    }
  },
  {
    "date": "2026-10-18",
    "day": 110,
    "phase": "Project + Interview Mode",
    "title": "GitHub Cleanup",
    "focus": "Remove junk files, add .gitignore, .env.example, clean structure.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 200,
        "name": "Number of Islands",
        "difficulty": "Medium",
        "pattern": "DFS / BFS Grid",
        "why": "It practices grid traversal and connected components."
      }
    ]
  },
  {
    "date": "2026-10-19",
    "day": 111,
    "phase": "Project + Interview Mode",
    "title": "Testing + CI",
    "focus": "Add tests, run test command, add GitHub Actions if suitable.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Testing + CI notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 15,
        "name": "3Sum",
        "difficulty": "Medium",
        "pattern": "Sorting + Two Pointers",
        "why": "It strengthens sorted two-pointer reasoning."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Dockerfile Basics",
      "what": "\u2022 Understand FROM, WORKDIR, COPY, RUN, CMD\n\u2022 Write simple Dockerfile\n\u2022 Avoid huge images",
      "connect_project": "CareSync can become easier to run in a container."
    }
  },
  {
    "date": "2026-10-20",
    "day": 112,
    "phase": "Project + Interview Mode",
    "title": "Resume + LinkedIn",
    "focus": "Improve resume bullets, project pitch, LinkedIn profile/project post.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Resume + LinkedIn notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 238,
        "name": "Product of Array Except Self",
        "difficulty": "Medium",
        "pattern": "Prefix Product",
        "why": "It revisits array transformation with optimized space thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Build Docker Image",
      "what": "\u2022 Run docker build\n\u2022 Tag image\n\u2022 Understand image layers",
      "connect_project": "CareSync demo can be packaged repeatably."
    }
  },
  {
    "date": "2026-10-21",
    "day": 113,
    "phase": "Project + Interview Mode",
    "title": "Project Mock",
    "focus": "Practice 2-minute and 5-minute CareSync AI explanation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Project Mock notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It tests window growth/shrink with a set/map."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Run Docker Container",
      "what": "\u2022 Map ports\n\u2022 Pass env variables\n\u2022 Check logs",
      "connect_project": "CareSync API can run consistently on another machine."
    }
  },
  {
    "date": "2026-10-22",
    "day": 114,
    "phase": "Project + Interview Mode",
    "title": "CareSync README",
    "focus": "Improve README, problem statement, architecture, setup, screenshots.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement."
    ],
    "output": "Completed CareSync README notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 560,
        "name": "Subarray Sum Equals K",
        "difficulty": "Medium",
        "pattern": "Prefix Sum + HashMap",
        "why": "It combines prefix sums with frequency maps."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Secrets and CI Safety",
      "what": "\u2022 Avoid committing secrets\n\u2022 Use env vars\n\u2022 Understand GitHub secrets",
      "connect_project": "CareSync must not leak keys or patient-like data."
    }
  },
  {
    "date": "2026-10-23",
    "day": 115,
    "phase": "Project + Interview Mode",
    "title": "CareSync Backend",
    "focus": "Improve FastAPI/API docs, risk endpoint explanation, requirements file.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement."
    ],
    "output": "Completed CareSync Backend notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 102,
        "name": "Binary Tree Level Order Traversal",
        "difficulty": "Medium",
        "pattern": "BFS",
        "why": "It reinforces queue-based tree traversal."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: CI Mini Practice",
      "what": "\u2022 Create one workflow\n\u2022 Run on push\n\u2022 Fix one failing test",
      "connect_project": "This makes CareSync look professional."
    }
  },
  {
    "date": "2026-10-24",
    "day": 116,
    "phase": "Project + Interview Mode",
    "title": "CareSync ML",
    "focus": "Explain anomaly detection, risk score, threshold rules, baseline comparison.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 198,
        "name": "House Robber",
        "difficulty": "Medium",
        "pattern": "Dynamic Programming",
        "why": "It trains state transition thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Deployment Foundations Review",
      "what": "\u2022 Summarize FastAPI, Docker, CI\n\u2022 Write project deployment story\n\u2022 Add one README section",
      "connect_project": "CareSync interview story becomes stronger."
    }
  },
  {
    "date": "2026-10-25",
    "day": 117,
    "phase": "Project + Interview Mode",
    "title": "GitHub Cleanup",
    "focus": "Remove junk files, add .gitignore, .env.example, clean structure.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 347,
        "name": "Top K Frequent Elements",
        "difficulty": "Medium",
        "pattern": "HashMap + Heap",
        "why": "It connects frequency counting with priority selection."
      }
    ]
  },
  {
    "date": "2026-10-26",
    "day": 118,
    "phase": "Project + Interview Mode",
    "title": "Testing + CI",
    "focus": "Add tests, run test command, add GitHub Actions if suitable.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Testing + CI notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 200,
        "name": "Number of Islands",
        "difficulty": "Medium",
        "pattern": "DFS / BFS Grid",
        "why": "It practices grid traversal and connected components."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: CI for Python Tests",
      "what": "\u2022 Install dependencies\n\u2022 Run pytest\n\u2022 Fail build on test error",
      "connect_project": "CareSync repo becomes recruiter-ready."
    }
  },
  {
    "date": "2026-10-27",
    "day": 119,
    "phase": "Project + Interview Mode",
    "title": "Resume + LinkedIn",
    "focus": "Improve resume bullets, project pitch, LinkedIn profile/project post.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Resume + LinkedIn notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 15,
        "name": "3Sum",
        "difficulty": "Medium",
        "pattern": "Sorting + Two Pointers",
        "why": "It strengthens sorted two-pointer reasoning."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Lint/Test Workflow",
      "what": "\u2022 Add simple lint idea\n\u2022 Run tests\n\u2022 Keep workflow minimal",
      "connect_project": "Cleaner CI improves CareSync engineering quality."
    }
  },
  {
    "date": "2026-10-28",
    "day": 120,
    "phase": "Project + Interview Mode",
    "title": "Project Mock",
    "focus": "Practice 2-minute and 5-minute CareSync AI explanation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Project Mock notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 238,
        "name": "Product of Array Except Self",
        "difficulty": "Medium",
        "pattern": "Prefix Product",
        "why": "It revisits array transformation with optimized space thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Secrets and CI Safety",
      "what": "\u2022 Avoid committing secrets\n\u2022 Use env vars\n\u2022 Understand GitHub secrets",
      "connect_project": "CareSync must not leak keys or patient-like data."
    }
  },
  {
    "date": "2026-10-29",
    "day": 121,
    "phase": "Project + Interview Mode",
    "title": "CareSync README",
    "focus": "Improve README, problem statement, architecture, setup, screenshots.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement."
    ],
    "output": "Completed CareSync README notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It tests window growth/shrink with a set/map."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: CI Mini Practice",
      "what": "\u2022 Create one workflow\n\u2022 Run on push\n\u2022 Fix one failing test",
      "connect_project": "This makes CareSync look professional."
    }
  },
  {
    "date": "2026-10-30",
    "day": 122,
    "phase": "Project + Interview Mode",
    "title": "CareSync Backend",
    "focus": "Improve FastAPI/API docs, risk endpoint explanation, requirements file.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement."
    ],
    "output": "Completed CareSync Backend notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 560,
        "name": "Subarray Sum Equals K",
        "difficulty": "Medium",
        "pattern": "Prefix Sum + HashMap",
        "why": "It combines prefix sums with frequency maps."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Deployment Foundations Review",
      "what": "\u2022 Summarize FastAPI, Docker, CI\n\u2022 Write project deployment story\n\u2022 Add one README section",
      "connect_project": "CareSync interview story becomes stronger."
    }
  },
  {
    "date": "2026-10-31",
    "day": 123,
    "phase": "Project + Interview Mode",
    "title": "CareSync ML",
    "focus": "Explain anomaly detection, risk score, threshold rules, baseline comparison.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CareSync AI: make one visible GitHub/project improvement.",
      "Write one interview explanation bullet for today\u2019s project improvement.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 102,
        "name": "Binary Tree Level Order Traversal",
        "difficulty": "Medium",
        "pattern": "BFS",
        "why": "It reinforces queue-based tree traversal."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: GitHub Actions Basics",
      "what": "\u2022 Understand workflow YAML\n\u2022 Know trigger on push\n\u2022 Run basic job",
      "connect_project": "CareSync can run tests automatically."
    }
  },
  {
    "date": "2026-11-01",
    "day": 124,
    "phase": "Company-Specific Prep",
    "title": "Zoho Coding",
    "focus": "Practice strings, arrays, matrix, recursion, pattern programming, Java console logic.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 409,
        "name": "Longest Palindrome",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It matches Zoho-style straightforward character logic."
      },
      {
        "id": 14,
        "name": "Longest Common Prefix",
        "difficulty": "Easy",
        "pattern": "String Comparison",
        "why": "It trains clean string comparison logic."
      },
      {
        "id": 412,
        "name": "Fizz Buzz",
        "difficulty": "Easy",
        "pattern": "Simulation",
        "why": "It reinforces simple conditional logic under speed."
      }
    ]
  },
  {
    "date": "2026-11-02",
    "day": 125,
    "phase": "Company-Specific Prep",
    "title": "Accenture Prep",
    "focus": "Aptitude + verbal + coding basics + communication.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Accenture Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 205,
        "name": "Isomorphic Strings",
        "difficulty": "Easy",
        "pattern": "HashMap Mapping",
        "why": "It tests mapping consistency between strings."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Tokens",
      "what": "\u2022 Understand tokenization\n\u2022 Compare word/subword tokens\n\u2022 Know context length idea",
      "connect_project": "Review how this applies to CareSync/SmartEdu."
    }
  },
  {
    "date": "2026-11-03",
    "day": 126,
    "phase": "Company-Specific Prep",
    "title": "HCLTech Prep",
    "focus": "CS fundamentals + Java/OOP + project explanation + HR.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed HCLTech Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 219,
        "name": "Contains Duplicate II",
        "difficulty": "Easy",
        "pattern": "HashMap Index Tracking",
        "why": "It extends duplicate checking with distance."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Embeddings",
      "what": "\u2022 Understand vector representation\n\u2022 Know similarity idea\n\u2022 Try cosine similarity conceptually",
      "connect_project": "Embeddings can represent medical notes or patient context for retrieval."
    }
  },
  {
    "date": "2026-11-04",
    "day": 127,
    "phase": "Company-Specific Prep",
    "title": "Wipro Prep",
    "focus": "Aptitude + Java/OOP + SQL/DBMS + HR.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Wipro Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 228,
        "name": "Summary Ranges",
        "difficulty": "Easy",
        "pattern": "Array Traversal",
        "why": "It practices range grouping."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Prompt Engineering Basics",
      "what": "\u2022 Write clear task/instructions/context\n\u2022 Use examples\n\u2022 Avoid vague prompts",
      "connect_project": "CareSync explanations could use structured prompts if LLM features are added."
    }
  },
  {
    "date": "2026-11-05",
    "day": 128,
    "phase": "Company-Specific Prep",
    "title": "Cognizant/Capgemini Prep",
    "focus": "Coding + aptitude + SQL + communication mocks.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Cognizant/Capgemini Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 350,
        "name": "Intersection of Two Arrays II",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It is data-oriented frequency practice."
      }
    ],
    "placementPrep": {
      "type": "Project & CareSync AI",
      "details": "Refactor mock clinical API endpoints or review FastAPI documentation. Concept: LLM Limitations",
      "what": "\u2022 Understand hallucination\n\u2022 Know why verification matters\n\u2022 List safety rules",
      "connect_project": "Healthcare AI must avoid unsupported claims."
    }
  },
  {
    "date": "2026-11-06",
    "day": 129,
    "phase": "Company-Specific Prep",
    "title": "Analytics Company Prep",
    "focus": "Python, SQL, ML metrics, case thinking, project explanation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Analytics Company Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 49,
        "name": "Group Anagrams",
        "difficulty": "Medium",
        "pattern": "HashMap Grouping",
        "why": "It matches data-oriented grouping and bucketing thinking."
      }
    ],
    "placementPrep": {
      "type": "Project & CareSync AI",
      "details": "Refactor mock clinical API endpoints or review FastAPI documentation. Concept: LLM Basics Practice",
      "what": "\u2022 Explain transformer/tokens/embeddings\n\u2022 Write 3 safe prompts\n\u2022 List hallucination controls",
      "connect_project": "Adds safe GenAI awareness to CareSync."
    }
  },
  {
    "date": "2026-11-07",
    "day": 130,
    "phase": "Company-Specific Prep",
    "title": "HR Mock",
    "focus": "Tell me about yourself, strengths, weakness, why company, relocation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 121,
        "name": "Best Time to Buy and Sell Stock",
        "difficulty": "Easy",
        "pattern": "One Pass Array",
        "why": "It trains min-so-far and max-profit logic."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Transformer Big Picture",
      "what": "\u2022 Understand attention-based architecture\n\u2022 Know encoder/decoder idea\n\u2022 Avoid math overload",
      "connect_project": "Review how this applies to CareSync/SmartEdu."
    }
  },
  {
    "date": "2026-11-08",
    "day": 131,
    "phase": "Company-Specific Prep",
    "title": "Zoho Coding",
    "focus": "Practice strings, arrays, matrix, recursion, pattern programming, Java console logic.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 409,
        "name": "Longest Palindrome",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It matches Zoho-style straightforward character logic."
      },
      {
        "id": 14,
        "name": "Longest Common Prefix",
        "difficulty": "Easy",
        "pattern": "String Comparison",
        "why": "It trains clean string comparison logic."
      },
      {
        "id": 412,
        "name": "Fizz Buzz",
        "difficulty": "Easy",
        "pattern": "Simulation",
        "why": "It reinforces simple conditional logic under speed."
      }
    ]
  },
  {
    "date": "2026-11-09",
    "day": 132,
    "phase": "Company-Specific Prep",
    "title": "Accenture Prep",
    "focus": "Aptitude + verbal + coding basics + communication.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Accenture Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 13,
        "name": "Roman to Integer",
        "difficulty": "Easy",
        "pattern": "String Traversal",
        "why": "It is a light logic problem for service-company preparation."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Retriever",
      "what": "\u2022 Understand top-k retrieval\n\u2022 Know relevance scoring\n\u2022 Check retrieved chunks",
      "connect_project": "CareSync should retrieve relevant clinical notes before answering."
    }
  },
  {
    "date": "2026-11-10",
    "day": 133,
    "phase": "Company-Specific Prep",
    "title": "HCLTech Prep",
    "focus": "CS fundamentals + Java/OOP + project explanation + HR.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed HCLTech Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 121,
        "name": "Best Time to Buy and Sell Stock",
        "difficulty": "Easy",
        "pattern": "One Pass Array",
        "why": "It trains min-so-far and max-profit logic."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Chunking",
      "what": "\u2022 Understand document splitting\n\u2022 Choose chunk size\n\u2022 Avoid losing context",
      "connect_project": "CareSync documents/guidelines need good chunking."
    }
  },
  {
    "date": "2026-11-11",
    "day": 134,
    "phase": "Company-Specific Prep",
    "title": "Wipro Prep",
    "focus": "Aptitude + Java/OOP + SQL/DBMS + HR.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Wipro Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 125,
        "name": "Valid Palindrome",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It keeps string pointer logic sharp."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Embedding Model Choice",
      "what": "\u2022 Know local vs API embeddings\n\u2022 Compare quality/cost\n\u2022 Record model choice",
      "connect_project": "CareSync RAG needs reliable embeddings for medical knowledge."
    }
  },
  {
    "date": "2026-11-12",
    "day": 135,
    "phase": "Company-Specific Prep",
    "title": "Cognizant/Capgemini Prep",
    "focus": "Coding + aptitude + SQL + communication mocks.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Cognizant/Capgemini Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 136,
        "name": "Single Number",
        "difficulty": "Easy",
        "pattern": "Bit Manipulation",
        "why": "It is a clean easy problem for interview warm-up."
      }
    ],
    "placementPrep": {
      "type": "Project & CareSync AI",
      "details": "Refactor mock clinical API endpoints or review FastAPI documentation. Concept: RAG Review",
      "what": "\u2022 Draw full RAG flow\n\u2022 Write limitations\n\u2022 List evaluation checks",
      "connect_project": "RAG could support CareSync explanation assistant safely."
    }
  },
  {
    "date": "2026-11-13",
    "day": 136,
    "phase": "Company-Specific Prep",
    "title": "Analytics Company Prep",
    "focus": "Python, SQL, ML metrics, case thinking, project explanation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Analytics Company Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 347,
        "name": "Top K Frequent Elements",
        "difficulty": "Medium",
        "pattern": "Frequency + Heap",
        "why": "It connects frequency analysis with ranking."
      }
    ],
    "placementPrep": {
      "type": "Project & CareSync AI",
      "details": "Refactor mock clinical API endpoints or review FastAPI documentation. Concept: RAG Architecture",
      "what": "\u2022 Understand retriever + generator\n\u2022 Know why RAG reduces hallucination\n\u2022 Draw pipeline",
      "connect_project": "CareSync could retrieve patient guidelines before generating explanations."
    }
  },
  {
    "date": "2026-11-14",
    "day": 137,
    "phase": "Company-Specific Prep",
    "title": "HR Mock",
    "focus": "Tell me about yourself, strengths, weakness, why company, relocation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 409,
        "name": "Longest Palindrome",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It is straightforward string-count logic."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Vector Store",
      "what": "\u2022 Understand storing embeddings\n\u2022 Know similarity search\n\u2022 Compare simple vector DB options",
      "connect_project": "CareSync knowledge base could use vector search."
    }
  },
  {
    "date": "2026-11-15",
    "day": 138,
    "phase": "Company-Specific Prep",
    "title": "Zoho Coding",
    "focus": "Practice strings, arrays, matrix, recursion, pattern programming, Java console logic.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 409,
        "name": "Longest Palindrome",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It matches Zoho-style straightforward character logic."
      },
      {
        "id": 14,
        "name": "Longest Common Prefix",
        "difficulty": "Easy",
        "pattern": "String Comparison",
        "why": "It trains clean string comparison logic."
      },
      {
        "id": 412,
        "name": "Fizz Buzz",
        "difficulty": "Easy",
        "pattern": "Simulation",
        "why": "It reinforces simple conditional logic under speed."
      }
    ]
  },
  {
    "date": "2026-11-16",
    "day": 139,
    "phase": "Company-Specific Prep",
    "title": "Accenture Prep",
    "focus": "Aptitude + verbal + coding basics + communication.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Accenture Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 350,
        "name": "Intersection of Two Arrays II",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It is data-oriented frequency practice."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Querying Documents",
      "what": "\u2022 Run similarity search\n\u2022 Check top-k results\n\u2022 Reject irrelevant results",
      "connect_project": "CareSync assistant must verify retrieved context."
    }
  },
  {
    "date": "2026-11-17",
    "day": 140,
    "phase": "Company-Specific Prep",
    "title": "HCLTech Prep",
    "focus": "CS fundamentals + Java/OOP + project explanation + HR.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed HCLTech Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 409,
        "name": "Longest Palindrome",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It is straightforward string-count logic."
      }
    ],
    "placementPrep": {
      "type": "Project & CareSync AI",
      "details": "Refactor mock clinical API endpoints or review FastAPI documentation. Concept: Simple RAG Chain",
      "what": "\u2022 Connect retriever to response generation\n\u2022 Keep answer grounded\n\u2022 Add source checking",
      "connect_project": "Could become a CareSync clinical explanation feature."
    }
  },
  {
    "date": "2026-11-18",
    "day": 141,
    "phase": "Company-Specific Prep",
    "title": "Wipro Prep",
    "focus": "Aptitude + Java/OOP + SQL/DBMS + HR.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Wipro Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 14,
        "name": "Longest Common Prefix",
        "difficulty": "Easy",
        "pattern": "String Comparison",
        "why": "It practices comparing multiple strings."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: LangChain Mini Practice",
      "what": "\u2022 Build tiny RAG over notes\n\u2022 Ask 3 queries\n\u2022 Inspect retrieved chunks",
      "connect_project": "This gives CareSync a future GenAI extension."
    }
  },
  {
    "date": "2026-11-19",
    "day": 142,
    "phase": "Company-Specific Prep",
    "title": "Cognizant/Capgemini Prep",
    "focus": "Coding + aptitude + SQL + communication mocks.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Cognizant/Capgemini Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 412,
        "name": "Fizz Buzz",
        "difficulty": "Easy",
        "pattern": "Simulation",
        "why": "It is a light HR/mock-day logic problem."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: LangChain Document Loading",
      "what": "\u2022 Load a local text/PDF conceptually\n\u2022 Inspect documents\n\u2022 Understand metadata",
      "connect_project": "CareSync can load hospital policy or vitals guidelines."
    }
  },
  {
    "date": "2026-11-20",
    "day": 143,
    "phase": "Company-Specific Prep",
    "title": "Analytics Company Prep",
    "focus": "Python, SQL, ML metrics, case thinking, project explanation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Analytics Company Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 56,
        "name": "Merge Intervals",
        "difficulty": "Medium",
        "pattern": "Sorting + Intervals",
        "why": "It fits sorting and consolidation of records."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Text Splitting",
      "what": "\u2022 Use RecursiveCharacterTextSplitter\n\u2022 Set chunk size/overlap\n\u2022 Inspect chunks",
      "connect_project": "Guideline chunks need overlap for safe retrieval."
    }
  },
  {
    "date": "2026-11-21",
    "day": 144,
    "phase": "Company-Specific Prep",
    "title": "HR Mock",
    "focus": "Tell me about yourself, strengths, weakness, why company, relocation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 205,
        "name": "Isomorphic Strings",
        "difficulty": "Easy",
        "pattern": "HashMap Mapping",
        "why": "It tests mapping consistency between strings."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Embedding Documents",
      "what": "\u2022 Create embeddings\n\u2022 Store vectors\n\u2022 Understand batch embedding",
      "connect_project": "CareSync knowledge chunks can become searchable vectors."
    }
  },
  {
    "date": "2026-11-22",
    "day": 145,
    "phase": "Company-Specific Prep",
    "title": "Zoho Coding",
    "focus": "Practice strings, arrays, matrix, recursion, pattern programming, Java console logic.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 409,
        "name": "Longest Palindrome",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It matches Zoho-style straightforward character logic."
      },
      {
        "id": 14,
        "name": "Longest Common Prefix",
        "difficulty": "Easy",
        "pattern": "String Comparison",
        "why": "It trains clean string comparison logic."
      },
      {
        "id": 412,
        "name": "Fizz Buzz",
        "difficulty": "Easy",
        "pattern": "Simulation",
        "why": "It reinforces simple conditional logic under speed."
      }
    ]
  },
  {
    "date": "2026-11-23",
    "day": 146,
    "phase": "Company-Specific Prep",
    "title": "Accenture Prep",
    "focus": "Aptitude + verbal + coding basics + communication.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Accenture Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 136,
        "name": "Single Number",
        "difficulty": "Easy",
        "pattern": "Bit Manipulation",
        "why": "It is a clean easy problem for interview warm-up."
      }
    ],
    "placementPrep": {
      "type": "Project & CareSync AI",
      "details": "Refactor mock clinical API endpoints or review FastAPI documentation. Concept: LLM Safety for Healthcare",
      "what": "\u2022 Avoid diagnosis claims\n\u2022 Use human-in-loop\n\u2022 Cite retrieved context",
      "connect_project": "CareSync must position AI as decision support, not doctor replacement."
    }
  },
  {
    "date": "2026-11-24",
    "day": 147,
    "phase": "Company-Specific Prep",
    "title": "HCLTech Prep",
    "focus": "CS fundamentals + Java/OOP + project explanation + HR.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed HCLTech Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 205,
        "name": "Isomorphic Strings",
        "difficulty": "Easy",
        "pattern": "HashMap Mapping",
        "why": "It tests mapping consistency between strings."
      }
    ],
    "placementPrep": {
      "type": "Project & CareSync AI",
      "details": "Refactor mock clinical API endpoints or review FastAPI documentation. Concept: LLM/RAG November Review",
      "what": "\u2022 Summarize LLM, embeddings, RAG\n\u2022 Write 5 interview answers\n\u2022 List CareSync extension idea",
      "connect_project": "Prepares an honest GenAI story for CareSync."
    }
  },
  {
    "date": "2026-11-25",
    "day": 148,
    "phase": "Company-Specific Prep",
    "title": "Wipro Prep",
    "focus": "Aptitude + Java/OOP + SQL/DBMS + HR.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Wipro Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 219,
        "name": "Contains Duplicate II",
        "difficulty": "Easy",
        "pattern": "HashMap Index Tracking",
        "why": "It extends duplicate checking with distance."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: OpenAI API Basics",
      "what": "\u2022 Understand API call structure\n\u2022 Know model/input/output\n\u2022 Keep keys safe",
      "connect_project": "Review how this applies to CareSync/SmartEdu."
    }
  },
  {
    "date": "2026-11-26",
    "day": 149,
    "phase": "Company-Specific Prep",
    "title": "Cognizant/Capgemini Prep",
    "focus": "Coding + aptitude + SQL + communication mocks.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Cognizant/Capgemini Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 228,
        "name": "Summary Ranges",
        "difficulty": "Easy",
        "pattern": "Array Traversal",
        "why": "It practices range grouping."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Hugging Face Inference",
      "what": "\u2022 Understand hosted inference idea\n\u2022 Try pipeline conceptually\n\u2022 Compare local vs API",
      "connect_project": "Review how this applies to CareSync/SmartEdu."
    }
  },
  {
    "date": "2026-11-27",
    "day": 150,
    "phase": "Company-Specific Prep",
    "title": "Analytics Company Prep",
    "focus": "Python, SQL, ML metrics, case thinking, project explanation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Analytics Company Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 49,
        "name": "Group Anagrams",
        "difficulty": "Medium",
        "pattern": "HashMap Grouping",
        "why": "It matches data-oriented grouping and bucketing thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: System Prompts",
      "what": "\u2022 Define assistant behavior\n\u2022 Set boundaries\n\u2022 Add safety constraints",
      "connect_project": "CareSync assistant must follow strict medical safety boundaries."
    }
  },
  {
    "date": "2026-11-28",
    "day": 151,
    "phase": "Company-Specific Prep",
    "title": "HR Mock",
    "focus": "Tell me about yourself, strengths, weakness, why company, relocation.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 13,
        "name": "Roman to Integer",
        "difficulty": "Easy",
        "pattern": "String Traversal",
        "why": "It is a light logic problem for service-company preparation."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: API Cost and Latency",
      "what": "\u2022 Understand token cost idea\n\u2022 Measure response time\n\u2022 Choose when not to use LLM",
      "connect_project": "CareSync should not depend on slow AI for critical alerts."
    }
  },
  {
    "date": "2026-11-29",
    "day": 152,
    "phase": "Company-Specific Prep",
    "title": "Zoho Coding",
    "focus": "Practice strings, arrays, matrix, recursion, pattern programming, Java console logic.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 409,
        "name": "Longest Palindrome",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It matches Zoho-style straightforward character logic."
      },
      {
        "id": 14,
        "name": "Longest Common Prefix",
        "difficulty": "Easy",
        "pattern": "String Comparison",
        "why": "It trains clean string comparison logic."
      },
      {
        "id": 412,
        "name": "Fizz Buzz",
        "difficulty": "Easy",
        "pattern": "Simulation",
        "why": "It reinforces simple conditional logic under speed."
      }
    ]
  },
  {
    "date": "2026-11-30",
    "day": 153,
    "phase": "Company-Specific Prep",
    "title": "Accenture Prep",
    "focus": "Aptitude + verbal + coding basics + communication.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Accenture Prep notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 412,
        "name": "Fizz Buzz",
        "difficulty": "Easy",
        "pattern": "Simulation",
        "why": "It is a light HR/mock-day logic problem."
      }
    ],
    "placementPrep": {
      "type": "Project & CareSync AI",
      "details": "Refactor mock clinical API endpoints or review FastAPI documentation. Concept: LLM/RAG November Review",
      "what": "\u2022 Summarize LLM, embeddings, RAG\n\u2022 Write 5 interview answers\n\u2022 List CareSync extension idea",
      "connect_project": "Prepares an honest GenAI story for CareSync."
    }
  },
  {
    "date": "2026-12-01",
    "day": 154,
    "phase": "Offer Mode",
    "title": "Applications",
    "focus": "Apply to companies, track referrals, update resume for each role.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Applications notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 102,
        "name": "Binary Tree Level Order Traversal",
        "difficulty": "Medium",
        "pattern": "BFS",
        "why": "It reinforces queue-based tree traversal."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: MLflow Tracking",
      "what": "\u2022 Understand experiment tracking\n\u2022 Log params/metrics\n\u2022 Compare runs",
      "connect_project": "CareSync model experiments can be tracked cleanly."
    }
  },
  {
    "date": "2026-12-02",
    "day": 155,
    "phase": "Offer Mode",
    "title": "Mock Interview",
    "focus": "Do technical + HR mock; record mistakes and improve answers.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Mock Interview notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 121,
        "name": "Best Time to Buy and Sell Stock",
        "difficulty": "Easy",
        "pattern": "One Pass Array",
        "why": "It trains min-so-far and max-profit logic."
      },
      {
        "id": 347,
        "name": "Top K Frequent Elements",
        "difficulty": "Medium",
        "pattern": "HashMap + Heap",
        "why": "It connects frequency counting with priority selection."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: MLflow Artifacts",
      "what": "\u2022 Log model artifacts\n\u2022 Store plots/files\n\u2022 Know run organization",
      "connect_project": "CareSync can store model reports and metrics."
    }
  },
  {
    "date": "2026-12-03",
    "day": 156,
    "phase": "Offer Mode",
    "title": "Revision Sprint",
    "focus": "Revise DSA patterns, SQL, OOP, DBMS, OS, CN.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Revision Sprint notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 15,
        "name": "3Sum",
        "difficulty": "Medium",
        "pattern": "Sorting + Two Pointers",
        "why": "It strengthens sorted two-pointer reasoning."
      },
      {
        "id": 238,
        "name": "Product of Array Except Self",
        "difficulty": "Medium",
        "pattern": "Prefix Product",
        "why": "It revisits array transformation with optimized space thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Model Registry Idea",
      "what": "\u2022 Understand staging/production versions\n\u2022 Know approval flow\n\u2022 Avoid overwriting models",
      "connect_project": "CareSync can version risk models safely."
    }
  },
  {
    "date": "2026-12-04",
    "day": 157,
    "phase": "Offer Mode",
    "title": "Zoho Final Drill",
    "focus": "Timed Java coding: arrays, strings, recursion, matrix, console app.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Zoho Final Drill notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 283,
        "name": "Move Zeroes",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It revisits in-place array movement."
      },
      {
        "id": 242,
        "name": "Valid Anagram",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It revisits frequency logic."
      },
      {
        "id": 78,
        "name": "Subsets",
        "difficulty": "Medium",
        "pattern": "Backtracking",
        "why": "It trains recursive subset generation."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Experiment Naming",
      "what": "\u2022 Name runs clearly\n\u2022 Record dataset/version\n\u2022 Write comparison notes",
      "connect_project": "Better tracking strengthens CareSync interview explanation."
    }
  },
  {
    "date": "2026-12-05",
    "day": 158,
    "phase": "Offer Mode",
    "title": "AI/ML Final Drill",
    "focus": "Revise ML algorithms, metrics, FastAPI, RAG basics, CareSync AI.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "AI/ML: revise one ML concept with formula/intuition/use case.",
      "Connect the concept to CareSync AI in 3 lines.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 102,
        "name": "Binary Tree Level Order Traversal",
        "difficulty": "Medium",
        "pattern": "BFS",
        "why": "It reinforces queue-based tree traversal."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: MLOps Monitoring Intro",
      "what": "\u2022 Understand data drift\n\u2022 Understand model drift\n\u2022 List monitoring signals",
      "connect_project": "CareSync needs monitoring for changing patient data patterns."
    }
  },
  {
    "date": "2026-12-06",
    "day": 159,
    "phase": "Offer Mode",
    "title": "Company Research",
    "focus": "Prepare why company + role fit for target companies.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 412,
        "name": "Fizz Buzz",
        "difficulty": "Easy",
        "pattern": "Simulation",
        "why": "It is a light HR/mock-day logic problem."
      }
    ]
  },
  {
    "date": "2026-12-07",
    "day": 160,
    "phase": "Offer Mode",
    "title": "Offer Mode Review",
    "focus": "Review progress, fill weak gaps, apply more.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Offer Mode Review notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 200,
        "name": "Number of Islands",
        "difficulty": "Medium",
        "pattern": "DFS / BFS Grid",
        "why": "It practices grid traversal and connected components."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: MLflow Tracking",
      "what": "\u2022 Understand experiment tracking\n\u2022 Log params/metrics\n\u2022 Compare runs",
      "connect_project": "CareSync model experiments can be tracked cleanly."
    }
  },
  {
    "date": "2026-12-08",
    "day": 161,
    "phase": "Offer Mode",
    "title": "Applications",
    "focus": "Apply to companies, track referrals, update resume for each role.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Applications notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 560,
        "name": "Subarray Sum Equals K",
        "difficulty": "Medium",
        "pattern": "Prefix Sum + HashMap",
        "why": "It combines prefix sums with frequency maps."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Risk Score Explanation",
      "what": "\u2022 Write risk score formula\n\u2022 Separate ML score and rules\n\u2022 Explain alert tiers",
      "connect_project": "Risk scoring is the heart of CareSync AI."
    }
  },
  {
    "date": "2026-12-09",
    "day": 162,
    "phase": "Offer Mode",
    "title": "Mock Interview",
    "focus": "Do technical + HR mock; record mistakes and improve answers.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Mock Interview notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 409,
        "name": "Longest Palindrome",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It is straightforward string-count logic."
      },
      {
        "id": 198,
        "name": "House Robber",
        "difficulty": "Medium",
        "pattern": "Dynamic Programming",
        "why": "It trains state transition thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Baseline Comparison",
      "what": "\u2022 Define patient baseline\n\u2022 Compare current vitals vs baseline\n\u2022 Explain personalization",
      "connect_project": "Baseline personalization is a strong CareSync feature."
    }
  },
  {
    "date": "2026-12-10",
    "day": 163,
    "phase": "Offer Mode",
    "title": "Revision Sprint",
    "focus": "Revise DSA patterns, SQL, OOP, DBMS, OS, CN.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Revision Sprint notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 200,
        "name": "Number of Islands",
        "difficulty": "Medium",
        "pattern": "DFS / BFS Grid",
        "why": "It practices grid traversal and connected components."
      },
      {
        "id": 15,
        "name": "3Sum",
        "difficulty": "Medium",
        "pattern": "Sorting + Two Pointers",
        "why": "It strengthens sorted two-pointer reasoning."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Model Explanation Text",
      "what": "\u2022 Write simple explanation templates\n\u2022 Avoid unsupported claims\n\u2022 Show contributing vitals",
      "connect_project": "CareSync dashboard should explain why a patient is flagged."
    }
  },
  {
    "date": "2026-12-11",
    "day": 164,
    "phase": "Offer Mode",
    "title": "Zoho Final Drill",
    "focus": "Timed Java coding: arrays, strings, recursion, matrix, console app.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Zoho Final Drill notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 566,
        "name": "Reshape the Matrix",
        "difficulty": "Easy",
        "pattern": "Matrix Simulation",
        "why": "It revisits matrix indexing."
      },
      {
        "id": 387,
        "name": "First Unique Character in a String",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It practices uniqueness detection."
      },
      {
        "id": 59,
        "name": "Spiral Matrix II",
        "difficulty": "Medium",
        "pattern": "Matrix Simulation",
        "why": "It strengthens matrix construction logic."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: CareSync Demo Script",
      "what": "\u2022 Prepare 2-minute pitch\n\u2022 Prepare technical architecture pitch\n\u2022 Prepare failure/limitation answer",
      "connect_project": "Strong demo script improves interview impact."
    }
  },
  {
    "date": "2026-12-12",
    "day": 165,
    "phase": "Offer Mode",
    "title": "AI/ML Final Drill",
    "focus": "Revise ML algorithms, metrics, FastAPI, RAG basics, CareSync AI.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "AI/ML: revise one ML concept with formula/intuition/use case.",
      "Connect the concept to CareSync AI in 3 lines.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 560,
        "name": "Subarray Sum Equals K",
        "difficulty": "Medium",
        "pattern": "Prefix Sum + HashMap",
        "why": "It combines prefix sums with frequency maps."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: CareSync Polish Review",
      "what": "\u2022 Update README\n\u2022 Check screenshots\n\u2022 Write future improvements",
      "connect_project": "This converts CareSync into flagship proof."
    }
  },
  {
    "date": "2026-12-13",
    "day": 166,
    "phase": "Offer Mode",
    "title": "Company Research",
    "focus": "Prepare why company + role fit for target companies.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 228,
        "name": "Summary Ranges",
        "difficulty": "Easy",
        "pattern": "Array Traversal",
        "why": "It practices range grouping."
      }
    ]
  },
  {
    "date": "2026-12-14",
    "day": 167,
    "phase": "Offer Mode",
    "title": "Offer Mode Review",
    "focus": "Review progress, fill weak gaps, apply more.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Offer Mode Review notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 347,
        "name": "Top K Frequent Elements",
        "difficulty": "Medium",
        "pattern": "HashMap + Heap",
        "why": "It connects frequency counting with priority selection."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Risk Score Explanation",
      "what": "\u2022 Write risk score formula\n\u2022 Separate ML score and rules\n\u2022 Explain alert tiers",
      "connect_project": "Risk scoring is the heart of CareSync AI."
    }
  },
  {
    "date": "2026-12-15",
    "day": 168,
    "phase": "Offer Mode",
    "title": "Applications",
    "focus": "Apply to companies, track referrals, update resume for each role.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Applications notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It tests window growth/shrink with a set/map."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: L1 vs L2",
      "what": "\u2022 Know sparsity vs weight shrinkage\n\u2022 Compare Ridge/Lasso\n\u2022 Write interview answer",
      "connect_project": "Feature selection may help interpret CareSync signals."
    }
  },
  {
    "date": "2026-12-16",
    "day": 169,
    "phase": "Offer Mode",
    "title": "Mock Interview",
    "focus": "Do technical + HR mock; record mistakes and improve answers.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Mock Interview notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 205,
        "name": "Isomorphic Strings",
        "difficulty": "Easy",
        "pattern": "HashMap Mapping",
        "why": "It tests mapping consistency between strings."
      },
      {
        "id": 102,
        "name": "Binary Tree Level Order Traversal",
        "difficulty": "Medium",
        "pattern": "BFS",
        "why": "It reinforces queue-based tree traversal."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Dropout",
      "what": "\u2022 Understand neural net regularization\n\u2022 Know training vs inference behavior\n\u2022 Avoid overclaiming",
      "connect_project": "Review how this applies to CareSync/SmartEdu."
    }
  },
  {
    "date": "2026-12-17",
    "day": 170,
    "phase": "Offer Mode",
    "title": "Revision Sprint",
    "focus": "Revise DSA patterns, SQL, OOP, DBMS, OS, CN.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Revision Sprint notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 347,
        "name": "Top K Frequent Elements",
        "difficulty": "Medium",
        "pattern": "HashMap + Heap",
        "why": "It connects frequency counting with priority selection."
      },
      {
        "id": 200,
        "name": "Number of Islands",
        "difficulty": "Medium",
        "pattern": "DFS / BFS Grid",
        "why": "It practices grid traversal and connected components."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Train/Validation/Test Interview Answer",
      "what": "\u2022 Explain all three sets\n\u2022 Mention leakage\n\u2022 Give project example",
      "connect_project": "CareSync evaluation should mention unseen patient-like data."
    }
  },
  {
    "date": "2026-12-18",
    "day": 171,
    "phase": "Offer Mode",
    "title": "Zoho Final Drill",
    "focus": "Timed Java coding: arrays, strings, recursion, matrix, console app.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Zoho Final Drill notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 409,
        "name": "Longest Palindrome",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It fits Zoho-style string frequency logic."
      },
      {
        "id": 14,
        "name": "Longest Common Prefix",
        "difficulty": "Easy",
        "pattern": "String Comparison",
        "why": "It practices multi-string comparison."
      },
      {
        "id": 54,
        "name": "Spiral Matrix",
        "difficulty": "Medium",
        "pattern": "Matrix Simulation",
        "why": "It adds Zoho-style matrix boundary practice."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: ML Interview Practice",
      "what": "\u2022 Answer 5 ML questions aloud\n\u2022 Write weak answers\n\u2022 Revise with examples",
      "connect_project": "Prepares CareSync and ML role interviews."
    }
  },
  {
    "date": "2026-12-19",
    "day": 172,
    "phase": "Offer Mode",
    "title": "AI/ML Final Drill",
    "focus": "Revise ML algorithms, metrics, FastAPI, RAG basics, CareSync AI.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "AI/ML: revise one ML concept with formula/intuition/use case.",
      "Connect the concept to CareSync AI in 3 lines.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It tests window growth/shrink with a set/map."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Bias and Variance",
      "what": "\u2022 Explain high bias vs high variance\n\u2022 Connect to train/test scores\n\u2022 Give one fix each",
      "connect_project": "CareSync model quality depends on generalization."
    }
  },
  {
    "date": "2026-12-20",
    "day": 173,
    "phase": "Offer Mode",
    "title": "Company Research",
    "focus": "Prepare why company + role fit for target companies.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 125,
        "name": "Valid Palindrome",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It keeps string pointer logic sharp."
      }
    ]
  },
  {
    "date": "2026-12-21",
    "day": 174,
    "phase": "Offer Mode",
    "title": "Offer Mode Review",
    "focus": "Review progress, fill weak gaps, apply more.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Offer Mode Review notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 198,
        "name": "House Robber",
        "difficulty": "Medium",
        "pattern": "Dynamic Programming",
        "why": "It trains state transition thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: L1 vs L2",
      "what": "\u2022 Know sparsity vs weight shrinkage\n\u2022 Compare Ridge/Lasso\n\u2022 Write interview answer",
      "connect_project": "Feature selection may help interpret CareSync signals."
    }
  },
  {
    "date": "2026-12-22",
    "day": 175,
    "phase": "Offer Mode",
    "title": "Applications",
    "focus": "Apply to companies, track referrals, update resume for each role.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Applications notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 238,
        "name": "Product of Array Except Self",
        "difficulty": "Medium",
        "pattern": "Prefix Product",
        "why": "It revisits array transformation with optimized space thinking."
      }
    ],
    "placementPrep": {
      "type": "Project & CareSync AI",
      "details": "Refactor mock clinical API endpoints or review FastAPI documentation. Concept: RAG/LLM Final Revision",
      "what": "\u2022 Explain embeddings\n\u2022 Explain retriever\n\u2022 Explain hallucination controls",
      "connect_project": "CareSync future extension can be described safely."
    }
  },
  {
    "date": "2026-12-23",
    "day": 176,
    "phase": "Offer Mode",
    "title": "Mock Interview",
    "focus": "Do technical + HR mock; record mistakes and improve answers.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Mock Interview notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 13,
        "name": "Roman to Integer",
        "difficulty": "Easy",
        "pattern": "String Traversal",
        "why": "It is a light logic problem for service-company preparation."
      },
      {
        "id": 560,
        "name": "Subarray Sum Equals K",
        "difficulty": "Medium",
        "pattern": "Prefix Sum + HashMap",
        "why": "It combines prefix sums with frequency maps."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: MLOps Final Revision",
      "what": "\u2022 Explain tracking\n\u2022 Explain drift\n\u2022 Explain model versioning",
      "connect_project": "Shows you understand production ML beyond notebooks."
    }
  },
  {
    "date": "2026-12-24",
    "day": 177,
    "phase": "Offer Mode",
    "title": "Revision Sprint",
    "focus": "Revise DSA patterns, SQL, OOP, DBMS, OS, CN.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Revision Sprint notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 198,
        "name": "House Robber",
        "difficulty": "Medium",
        "pattern": "Dynamic Programming",
        "why": "It trains state transition thinking."
      },
      {
        "id": 347,
        "name": "Top K Frequent Elements",
        "difficulty": "Medium",
        "pattern": "HashMap + Heap",
        "why": "It connects frequency counting with priority selection."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Final Interview ML Drill",
      "what": "\u2022 Answer 5 questions\n\u2022 Record mistakes\n\u2022 Revise weak concepts",
      "connect_project": "This locks your AI/ML interview readiness."
    }
  },
  {
    "date": "2026-12-25",
    "day": 178,
    "phase": "Offer Mode",
    "title": "Zoho Final Drill",
    "focus": "Timed Java coding: arrays, strings, recursion, matrix, console app.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Zoho Final Drill notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 412,
        "name": "Fizz Buzz",
        "difficulty": "Easy",
        "pattern": "Simulation",
        "why": "It warms up condition handling."
      },
      {
        "id": 125,
        "name": "Valid Palindrome",
        "difficulty": "Easy",
        "pattern": "Two Pointers",
        "why": "It reinforces string pointer checks."
      },
      {
        "id": 46,
        "name": "Permutations",
        "difficulty": "Medium",
        "pattern": "Backtracking",
        "why": "It trains recursion for Zoho final drill."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Final ML Summary",
      "what": "\u2022 Summarize supervised/unsupervised/deployment/MLOps\n\u2022 Create one-page cheat sheet\n\u2022 Mark weak topics",
      "connect_project": "Final CareSync pitch should connect model, API, and monitoring."
    }
  },
  {
    "date": "2026-12-26",
    "day": 179,
    "phase": "Offer Mode",
    "title": "AI/ML Final Drill",
    "focus": "Revise ML algorithms, metrics, FastAPI, RAG basics, CareSync AI.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "AI/ML: revise one ML concept with formula/intuition/use case.",
      "Connect the concept to CareSync AI in 3 lines.",
      "Saturday mini-boss: 60-minute coding/aptitude mixed test."
    ],
    "output": "Mini-boss completed: timed coding + aptitude + one interview explanation.",
    "leetcode": [
      {
        "id": 238,
        "name": "Product of Array Except Self",
        "difficulty": "Medium",
        "pattern": "Prefix Product",
        "why": "It revisits array transformation with optimized space thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Top 5 ML Q&A",
      "what": "\u2022 Prepare bias/variance answer\n\u2022 Prepare metrics answer\n\u2022 Prepare deployment answer",
      "connect_project": "These answers support AI/ML interviews."
    }
  },
  {
    "date": "2026-12-27",
    "day": 180,
    "phase": "Offer Mode",
    "title": "Company Research",
    "focus": "Prepare why company + role fit for target companies.",
    "tasks": [
      "Weekly review: total XP, SkillRack, LeetCode, SQL, aptitude, mocks, project work.",
      "Recover weak areas from the week.",
      "Do one light revision set; do not burn out.",
      "Plan next week\u2019s boss challenge."
    ],
    "output": "Weekly review completed + next week mission written.",
    "leetcode": [
      {
        "id": 14,
        "name": "Longest Common Prefix",
        "difficulty": "Easy",
        "pattern": "String Comparison",
        "why": "It practices comparing multiple strings."
      }
    ]
  },
  {
    "date": "2026-12-28",
    "day": 181,
    "phase": "Offer Mode",
    "title": "Offer Mode Review",
    "focus": "Review progress, fill weak gaps, apply more.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Offer Mode Review notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 102,
        "name": "Binary Tree Level Order Traversal",
        "difficulty": "Medium",
        "pattern": "BFS",
        "why": "It reinforces queue-based tree traversal."
      }
    ],
    "placementPrep": {
      "type": "Project & CareSync AI",
      "details": "Refactor mock clinical API endpoints or review FastAPI documentation. Concept: RAG/LLM Final Revision",
      "what": "\u2022 Explain embeddings\n\u2022 Explain retriever\n\u2022 Explain hallucination controls",
      "connect_project": "CareSync future extension can be described safely."
    }
  },
  {
    "date": "2026-12-29",
    "day": 182,
    "phase": "Offer Mode",
    "title": "Applications",
    "focus": "Apply to companies, track referrals, update resume for each role.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Applications notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 15,
        "name": "3Sum",
        "difficulty": "Medium",
        "pattern": "Sorting + Two Pointers",
        "why": "It strengthens sorted two-pointer reasoning."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: MLOps Final Revision",
      "what": "\u2022 Explain tracking\n\u2022 Explain drift\n\u2022 Explain model versioning",
      "connect_project": "Shows you understand production ML beyond notebooks."
    }
  },
  {
    "date": "2026-12-30",
    "day": 183,
    "phase": "Offer Mode",
    "title": "Mock Interview",
    "focus": "Do technical + HR mock; record mistakes and improve answers.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "Take a timed practice round or mock question set.",
      "Write mistakes + recovery action in weekly review."
    ],
    "output": "Completed Mock Interview notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 350,
        "name": "Intersection of Two Arrays II",
        "difficulty": "Easy",
        "pattern": "Frequency Counting",
        "why": "It is data-oriented frequency practice."
      },
      {
        "id": 3,
        "name": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "pattern": "Sliding Window",
        "why": "It tests window growth/shrink with a set/map."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Final Interview ML Drill",
      "what": "\u2022 Answer 5 questions\n\u2022 Record mistakes\n\u2022 Revise weak concepts",
      "connect_project": "This locks your AI/ML interview readiness."
    }
  },
  {
    "date": "2026-12-31",
    "day": 184,
    "phase": "Offer Mode",
    "title": "Revision Sprint",
    "focus": "Revise DSA patterns, SQL, OOP, DBMS, OS, CN.",
    "tasks": [
      "SkillRack: 10 problems minimum; focus on logic and clean Java implementation.",
      "LeetCode Java: 1 problem minimum; write pattern name and why it fits before code.",
      "Aptitude: 30 minutes; revise formula + solve timed questions.",
      "CS/SQL/project alternate: 30 minutes focused work.",
      "Write 3 bullet notes for interview revision."
    ],
    "output": "Completed Revision Sprint notes + daily coding + aptitude log.",
    "leetcode": [
      {
        "id": 102,
        "name": "Binary Tree Level Order Traversal",
        "difficulty": "Medium",
        "pattern": "BFS",
        "why": "It reinforces queue-based tree traversal."
      },
      {
        "id": 198,
        "name": "House Robber",
        "difficulty": "Medium",
        "pattern": "Dynamic Programming",
        "why": "It trains state transition thinking."
      }
    ],
    "placementPrep": {
      "type": "Resume & Branding",
      "details": "Optimize resume sections, ATS keywords, or GitHub README. Concept: Final ML Summary",
      "what": "\u2022 Summarize supervised/unsupervised/deployment/MLOps\n\u2022 Create one-page cheat sheet\n\u2022 Mark weak topics",
      "connect_project": "Final CareSync pitch should connect model, API, and monitoring."
    }
  }
];
