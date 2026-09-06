export interface ScheduleItem {
  readonly id: string;
  readonly label: string;
  readonly emoji: string;
  readonly time: string;
  readonly unit: string;
  readonly target: number;
  readonly color: string;
}

export const SCHEDULE: readonly ScheduleItem[] = [
  {id:'leetcode', label:'LeetCode', emoji:'💻', time:'4:30–5:30 AM', unit:'problems', target:2, color:'#F97316'},
  {id:'skillrack', label:'SkillRack', emoji:'⚡', time:'6:00–6:30 PM', unit:'problems', target:10, color:'#3B82F6'},
  {id:'aptitude', label:'Aptitude (IndiaBix)', emoji:'🧮', time:'6:30–7:00 PM', unit:'questions', target:30, color:'#8B5CF6'},
  {id:'sql', label:'SQL Practice', emoji:'🗄️', time:'Evening', unit:'queries', target:5, color:'#06B6D4'},
  {id:'cscore', label:'CS Core', emoji:'🧠', time:'Evening', unit:'topics', target:1, color:'#10B981'},
  {id:'german', label:'German (Duolingo + Book)', emoji:'🇩🇪', time:'Bus time', unit:'minutes', target:20, color:'#10B981'},
  {id:'project', label:'Project Work', emoji:'🚀', time:'Flexible', unit:'minutes', target:30, color:'#EAB308'},
  {id:'resume', label:'Resume / Career', emoji:'📄', time:'Flexible', unit:'minutes', target:15, color:'#F43F5E'},
];
