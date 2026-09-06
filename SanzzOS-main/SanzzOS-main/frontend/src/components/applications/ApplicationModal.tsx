import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useCareerStore } from '../../app/store/useCareerStore';
import {
  APPLICATION_PRIORITY_OPTIONS,
  APPLICATION_SOURCE_OPTIONS,
  APPLICATION_STATUSES,
  createTimelineEvent,
  extractKeywords,
} from '../../utils/applicationCrmUtils';
import { ApplicationPriority, ApplicationSource, CareerApplicationStatus, ApplicationWorkMode } from '../../types';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose }) => {
  const addApplication = useCareerStore((s) => s.addApplication);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<CareerApplicationStatus>("Applied");
  const [salary, setSalary] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState<ApplicationSource>('Other');
  const [priority, setPriority] = useState<ApplicationPriority>('Medium');
  const [jobUrl, setJobUrl] = useState("");
  const [deadline, setDeadline] = useState("");
  const [resumeVersion, setResumeVersion] = useState("");
  const [referralContact, setReferralContact] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<ApplicationWorkMode>("");
  const [jdText, setJdText] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!company.trim() || !role.trim()) {
      alert("Please fill in company name and role");
      return;
    }

    addApplication({
      id: `app_${Date.now()}`,
      company,
      role,
      status,
      salary,
      date,
      source,
      priority,
      jobUrl,
      deadline,
      resumeVersion,
      referralContact,
      nextFollowUpDate,
      location,
      workMode,
      jdText,
      jdKeywords: jdText ? extractKeywords(jdText) : [],
      notes,
      risk: priority === 'Dream' ? 'Medium' : 'Low',
      rounds: [],
      timeline: [
        createTimelineEvent(status, `${status} - ${company}`, role),
        ...(jdText ? [createTimelineEvent('JD Review', 'Job description keywords captured', extractKeywords(jdText, 8).join(', '))] : [])
      ],
      lastUpdatedAt: new Date().toISOString()
    });
    
    // Clear and close
    setCompany("");
    setRole("");
    setStatus("Applied");
    setSalary("");
    setSource('Other');
    setPriority('Medium');
    setJobUrl("");
    setDeadline("");
    setResumeVersion("");
    setReferralContact("");
    setNextFollowUpDate("");
    setLocation("");
    setWorkMode("");
    setJdText("");
    setNotes("");
    onClose();
  };

  const statusOptions = APPLICATION_STATUSES.map((item) => ({ value: item, label: item }));
  const sourceOptions = APPLICATION_SOURCE_OPTIONS.map((item) => ({ value: item, label: item }));
  const priorityOptions = APPLICATION_PRIORITY_OPTIONS.map((item) => ({ value: item, label: item }));
  const workModeOptions = [
    { value: '', label: 'Not specified' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'On-site', label: 'On-site' },
    { value: 'Flexible', label: 'Flexible' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none px-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 border border-border-subtle bg-bgSurface/95">
        <h3 className="font-bold text-sm text-textPrimary uppercase tracking-wider mb-4">Add Job Application</h3>
        
        <div className="grid gap-4 lg:grid-cols-2">
          <Input label="Company Name" placeholder="e.g. Google" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Input label="Role / Title" placeholder="e.g. SWE Intern" value={role} onChange={(e) => setRole(e.target.value)} />
          
          <Select
            label="Application Stage"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as CareerApplicationStatus)}
          />
          <Select label="Priority" options={priorityOptions} value={priority} onChange={(e) => setPriority(e.target.value as ApplicationPriority)} />
          <Select label="Source" options={sourceOptions} value={source} onChange={(e) => setSource(e.target.value as ApplicationSource)} />
          <Select label="Work Mode" options={workModeOptions} value={workMode} onChange={(e) => setWorkMode(e.target.value as ApplicationWorkMode)} />

          <Input label="Salary / CTC" placeholder="e.g. 15 LPA" value={salary} onChange={(e) => setSalary(e.target.value)} />
          <Input label="Date applied" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <Input label="Next follow-up" type="date" value={nextFollowUpDate} onChange={(e) => setNextFollowUpDate(e.target.value)} />
          <Input label="Job URL" placeholder="https://..." value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} />
          <Input label="Resume Version" placeholder="e.g. ATS v2 - backend" value={resumeVersion} onChange={(e) => setResumeVersion(e.target.value)} />
          <Input label="Referral Contact" placeholder="Name / email / LinkedIn" value={referralContact} onChange={(e) => setReferralContact(e.target.value)} />
          <Input label="Location" placeholder="Bangalore / Chennai / Remote" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-textSecondary pl-1">Job Description</span>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="min-h-[140px] rounded-2xl border border-border-subtle bg-white/[0.03] px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBlue/35"
              placeholder="Paste JD here for keyword extraction"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-textSecondary pl-1">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[140px] rounded-2xl border border-border-subtle bg-white/[0.03] px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBlue/35"
              placeholder="Referral plan, prep notes, recruiter details"
            />
          </label>
        </div>

        {jdText && (
          <div className="mt-4 rounded-2xl border border-border-subtle bg-bgCard/40 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Extracted JD Keywords</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {extractKeywords(jdText, 12).map((keyword) => (
                <span key={keyword} className="rounded-full border border-border-subtle px-2 py-1 text-[10px] text-textSecondary">{keyword}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-border-subtle/50 mt-5">
          <Button onClick={handleCreate} className="flex-1 rounded-xl">Add Application</Button>
          <Button onClick={onClose} variant="ghost" className="px-4 border border-border-subtle rounded-xl">Cancel</Button>
        </div>
      </Card>
    </div>
  );
};
