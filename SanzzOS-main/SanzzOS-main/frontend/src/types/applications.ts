export type CareerApplicationStatus = 'Wishlist' | 'Applied' | 'OA' | 'Interview' | 'HR' | 'Offer' | 'Rejected' | 'Ghosted';

export type ApplicationPriority = 'Low' | 'Medium' | 'High' | 'Dream';

export type ApplicationSource = 'Company Site' | 'LinkedIn' | 'Referral' | 'Naukri' | 'Indeed' | 'Campus' | 'Email' | 'Other';

export type ApplicationWorkMode = 'Remote' | 'Hybrid' | 'On-site' | 'Flexible' | '';

export interface ApplicationTimelineEvent {
  id: string;
  date: string;
  type: CareerApplicationStatus | 'Note' | 'Follow-up' | 'Resume' | 'JD Review';
  title: string;
  note?: string;
}

export interface ApplicationRound {
  id: string;
  type: 'OA' | 'Technical' | 'HR' | 'Managerial' | 'Assignment' | 'Other';
  date: string;
  status: 'Planned' | 'Completed' | 'Passed' | 'Failed' | 'Waiting';
  notes?: string;
}

export interface CareerApplication {
  id: string;
  company: string;
  role: string;
  date: string;
  status: CareerApplicationStatus;
  salary: string;
  source?: ApplicationSource;
  jobUrl?: string;
  deadline?: string;
  resumeVersion?: string;
  jdText?: string;
  jdKeywords?: string[];
  referralContact?: string;
  nextFollowUpDate?: string;
  priority?: ApplicationPriority;
  location?: string;
  workMode?: ApplicationWorkMode;
  notes?: string;
  risk?: 'Low' | 'Medium' | 'High';
  timeline?: ApplicationTimelineEvent[];
  rounds?: ApplicationRound[];
  lastUpdatedAt?: string;
}
