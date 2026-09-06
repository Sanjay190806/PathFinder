export const DEFAULT_PLACEMENT_COMPANIES = [
  'Zoho',
  'HCLTech',
  'Accenture',
  'Wipro',
  'Cognizant',
  'Capgemini',
  'Infosys',
  'TCS',
  'Fractal Analytics',
  'Tiger Analytics',
  'Quantiphi',
  'Mu Sigma'
].map((name, index) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  name,
  type: index >= 8 ? 'Analytics' : index === 0 ? 'Product' : 'Service',
  priority: index === 0 || index === 2 || index >= 8 ? 'high' : 'medium'
}));

export function getPlacementReadiness() {
  return {
    score: 52,
    resumeScore: 55,
    companyPrepScore: 50,
    interviewScore: 35,
    oaScore: 25,
    nextAction: 'Use the frontend Placement OS local workspace for live tracking.'
  };
}
