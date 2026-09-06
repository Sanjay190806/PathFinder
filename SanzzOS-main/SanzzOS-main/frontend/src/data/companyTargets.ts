export interface CompanyTarget {
  readonly companyName: string;
  readonly rolePattern: string;
  readonly diffPattern: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  readonly keyFocus: readonly string[];
}

export const COMPANY_TARGETS: readonly CompanyTarget[] = [
  { companyName: "TCS", rolePattern: "Ninja / Digital", diffPattern: "Easy", keyFocus: ["Arrays", "Basic Hashing", "Aptitude Systems"] },
  { companyName: "Infosys", rolePattern: "System Engineer", diffPattern: "Medium", keyFocus: ["Strings", "Two Pointers", "CS Core Fundamentals"] },
  { companyName: "Wipro", rolePattern: "Elite / Turbo", diffPattern: "Medium", keyFocus: ["Arrays", "Linked Lists", "SQL Joins"] },
  { companyName: "Accenture", rolePattern: "ASE / FASE", diffPattern: "Easy", keyFocus: ["CS Fundamentals", "DBMS Normalisation", "Aptitude Quant"] },
  { companyName: "Cognizant", rolePattern: "GenC / GenC Elevate", diffPattern: "Medium", keyFocus: ["Binary Search", "Trees Traversal", "DBMS concepts"] }
];
